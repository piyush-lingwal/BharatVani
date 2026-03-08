/**
 * BharatVani — Shared Processing Pipeline
 * Used by BOTH Twilio voice AND web chat for consistent responses
 *
 * This module exists to break the circular import between index.mjs ↔ twilio.mjs
 * All query processing (Bedrock + intent routing + handlers + live data) lives here.
 *
 * v2: Parallelized operations, user memory, single live-data orchestration point
 */

import { createSession, getSession, updateSession, addToHistory, getUser, upsertUser } from './session.mjs';
import { callBedrock } from './bedrock.mjs';
import { detectLiveDataNeed, getWeather, getNews, getGoldPrice, searchWeb } from './apiServices.mjs';
import { handleGovtScheme } from '../handlers/govtSchemes.mjs';
import { handleFarmerQuery } from '../handlers/farmerAssistant.mjs';
import { sendConfirmationSMS } from './sms.mjs';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

// Query logging client
const _logClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const QUERY_LOGS_TABLE = process.env.QUERY_LOGS_TABLE || '';

/**
 * Log user query to QueryLogsTable for analytics (fire-and-forget)
 */
async function logQuery(sessionId, userText, intent, language, responseTimeMs, liveDataUsed) {
    if (!QUERY_LOGS_TABLE) return;
    try {
        await _logClient.send(new PutCommand({
            TableName: QUERY_LOGS_TABLE,
            Item: {
                query_id: randomUUID(),
                timestamp: new Date().toISOString(),
                session_id: sessionId,
                query_text: userText,
                intent: intent || 'unknown',
                language: language || 'hi-IN',
                response_time_ms: responseTimeMs,
                live_data_used: liveDataUsed || false,
                ttl: Math.floor(Date.now() / 1000) + (90 * 86400) // 90 day retention
            }
        }));
    } catch (err) {
        console.warn('Query log write failed (non-fatal):', err.message);
    }
}

function getModuleFromIntent(intent) {
    const map = {
        'govt_scheme_info': 'govt_schemes',
        'govt_scheme_eligibility': 'govt_schemes',
        'crop_price': 'farmer_assistant',
        'weather_forecast': 'farmer_assistant',
        'farming_advice': 'farmer_assistant',
        'general': 'general',
        'end_call': 'system'
    };
    return map[intent] || 'general';
}

/**
 * Fetch live data if the user's message needs it
 * Returns the live data string, or empty string if none needed
 */
async function fetchLiveDataIfNeeded(userText) {
    try {
        const needs = detectLiveDataNeed(userText);
        if (needs.length === 0) return '';

        const liveResults = await Promise.allSettled(
            needs.map(async (need) => {
                switch (need.type) {
                    case 'weather': return await getWeather(need.city);
                    case 'news': return await getNews();
                    case 'gold': return await getGoldPrice();
                    case 'web_search': return await searchWeb(need.query);
                    default: return '';
                }
            })
        );
        return liveResults
            .filter(r => r.status === 'fulfilled' && r.value)
            .map(r => r.value)
            .join('\n');
    } catch (err) {
        console.warn('Live data fetch error (non-fatal):', err.message);
        return '';
    }
}

/**
 * Build user context string for returning callers
 * @param {string} phoneNumber - caller's phone number
 * @returns {string} context string or empty
 */
async function buildUserContext(phoneNumber) {
    if (!phoneNumber || phoneNumber === 'web-user' || phoneNumber === '+910000000000') {
        return '';
    }
    try {
        const user = await getUser(phoneNumber);
        if (!user || !user.total_calls || user.total_calls < 1) return '';

        const parts = [`[RETURNING USER: Called ${user.total_calls} time(s) before.`];
        if (user.language_preference) parts.push(`Preferred language: ${user.language_preference}.`);
        if (user.last_topics && user.last_topics.length > 0) {
            parts.push(`Previously asked about: ${user.last_topics.slice(0, 3).join(', ')}.`);
        }
        if (user.name) parts.push(`Name: ${user.name}.`);
        parts.push('Greet them warmly as a returning caller.]');
        return parts.join(' ');
    } catch (err) {
        console.warn('User context fetch error (non-fatal):', err.message);
        return '';
    }
}

/**
 * Update user profile after processing a query (fire-and-forget)
 */
async function updateUserProfile(phoneNumber, intent, language) {
    if (!phoneNumber || phoneNumber === 'web-user' || phoneNumber === '+910000000000') return;
    try {
        const user = await getUser(phoneNumber);
        const totalCalls = (user?.total_calls || 0) + (user ? 0 : 1); // increment only on first query of session
        const lastTopics = user?.last_topics || [];

        // Add current intent to topics (keep last 5, no duplicates)
        const intentLabel = getModuleFromIntent(intent);
        if (intentLabel !== 'general' && intentLabel !== 'system') {
            if (!lastTopics.includes(intentLabel)) {
                lastTopics.unshift(intentLabel);
            }
        }

        await upsertUser(phoneNumber, {
            total_calls: totalCalls || 1,
            last_topics: lastTopics.slice(0, 5),
            language_preference: language,
            last_call_at: new Date().toISOString()
        });
    } catch (err) {
        console.warn('User profile update error (non-fatal):', err.message);
    }
}

/**
 * SHARED CORE PIPELINE — Used by Twilio voice, web chat, AND Connect
 * Handles: Live data fetch → Bedrock call → Intent routing → Handlers → History → Logging
 *
 * v2 improvements:
 *   - Single point for live data fetching (no duplication with bedrock.mjs)
 *   - Parallelized: history write + live data fetch run concurrently
 *   - Post-response ops (logging, history, session update) run in parallel
 *   - User memory: returning callers get personalized context
 *
 * @param {string} userText   — the user's spoken/typed text
 * @param {string} sessionId  — DynamoDB session ID (can be null → new session created)
 * @param {string} phoneNumber — phone number or 'web-user'
 * @returns {{ responseText, intent, entities, smsContent, isEndCall, language }}
 */
export async function processUserQuery(userText, sessionId, phoneNumber) {
    // Load or create session
    let session = sessionId ? await getSession(sessionId) : null;
    if (!session) {
        const result = await createSession(phoneNumber);
        session = result.session;
        sessionId = session.session_id;
    }

    const language = session.language || 'hi-IN';

    // ─── PARALLEL PHASE 1: Add user message to history + fetch live data + get user context ───
    const [, liveContext, userContext] = await Promise.all([
        addToHistory(session.session_id, 'user', userText),
        fetchLiveDataIfNeeded(userText),
        buildUserContext(phoneNumber)
    ]);

    const liveDataUsed = liveContext.length > 0;

    // ─── Call Bedrock — SINGLE CALL for intent detection + response ───
    // Live data and user context are passed IN (not re-fetched by bedrock.mjs)
    const history = session.conversation_history || [];
    const startTime = Date.now();
    let aiResponse = await callBedrock(
        liveContext ? `${userText}\n\n[LIVE DATA]:\n${liveContext}` : userText,
        history,
        language,
        liveContext,   // passed to bedrock for prompt building
        userContext     // returning user context
    );

    // ─── SMART HYBRID SEARCH: If Claude says it needs real-time data ───
    // Claude outputs [SEARCH_NEEDED:query] when it can't answer from its knowledge
    // We fetch Tavily with Claude's optimized query, then make a SECOND call with results
    if (aiResponse.searchQuery && !liveDataUsed) {
        console.log('🔍 SMART SEARCH triggered by Claude:', aiResponse.searchQuery);
        try {
            const searchResult = await searchWeb(aiResponse.searchQuery);
            if (searchResult && searchResult.length > 20) {
                console.log('🔍 Search result received, making second Bedrock call...');
                // Second call: same user text but with search results as live data
                aiResponse = await callBedrock(
                    `${userText}\n\n[LIVE DATA FROM SEARCH]:\n${searchResult}`,
                    history,
                    language,
                    searchResult,
                    userContext
                );
                console.log('🔍 Smart search complete — response with real-time data');
            } else {
                console.log('🔍 Search returned no useful results, using original response');
            }
        } catch (err) {
            console.error('🔍 Smart search failed (using original response):', err.message);
            // Fall through — use the original response
        }
    }

    const responseTimeMs = Date.now() - startTime;

    console.log('Pipeline AI Response:', JSON.stringify(aiResponse, null, 2));

    // ─── Route based on intent — use dedicated handlers for richer responses ───
    let finalResponse = aiResponse;
    const intent = aiResponse.intent;
    const entities = aiResponse.entities || {};

    if (intent === 'govt_scheme_info' || intent === 'govt_scheme_eligibility') {
        const schemeResult = await handleGovtScheme(intent, entities, session);
        if (schemeResult.response_text) {
            finalResponse.response_text = schemeResult.response_text;
        }
        if (schemeResult.sms_content) {
            finalResponse.sms_content = schemeResult.sms_content;
        }
    } else if (intent === 'crop_price' || intent === 'weather_forecast' || intent === 'farming_advice') {
        const farmResult = await handleFarmerQuery(intent, entities, session);
        if (farmResult.response_text) {
            finalResponse.response_text = farmResult.response_text;
        }
        if (farmResult.sms_content) {
            finalResponse.sms_content = farmResult.sms_content;
        }
    }

    // ─── Send SMS if there's content (skip for web/test users) ───
    if (finalResponse.sms_content && phoneNumber && phoneNumber !== '+910000000000' && phoneNumber !== 'web-user') {
        sendConfirmationSMS(phoneNumber, finalResponse.sms_content)
            .catch(err => console.warn('SMS send failed:', err.message));
    }

    // ─── PARALLEL PHASE 2: Post-response ops (all fire-and-forget) ───
    Promise.allSettled([
        addToHistory(session.session_id, 'assistant', finalResponse.response_text),
        logQuery(session.session_id, userText, intent, language, responseTimeMs, liveDataUsed),
        updateSession(session.session_id, {
            current_intent: intent,
            current_module: getModuleFromIntent(intent),
            language: language,
            turn_count: (session.turn_count || 0) + 1
        }),
        updateUserProfile(phoneNumber, intent, language)
    ]).catch(err => console.warn('Post-processing error:', err));

    // Build the response text (use follow_up if present)
    let responseText = finalResponse.response_text;
    if (finalResponse.follow_up) {
        responseText += ` ${finalResponse.follow_up}`;
    }

    return {
        responseText,
        intent,
        entities,
        smsContent: finalResponse.sms_content || null,
        isEndCall: intent === 'end_call',
        language
    };
}
