/**
 * BharatVani — Shared Processing Pipeline
 * Used by BOTH Twilio voice AND web chat for consistent responses
 *
 * This module exists to break the circular import between index.mjs ↔ twilio.mjs
 * All query processing (Bedrock + intent routing + handlers + live data) lives here.
 */

import { createSession, getSession, updateSession, addToHistory } from './session.mjs';
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
 * SHARED CORE PIPELINE — Used by Twilio voice, web chat, AND Connect
 * Handles: Live data fetch → Bedrock call → Intent routing → Handlers → History → Logging
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

    // Add user's message to history
    await addToHistory(session.session_id, 'user', userText);

    // ─── Fetch live data if needed (weather, news, gold, web search) ───
    let liveContext = '';
    let liveDataUsed = false;
    try {
        const needs = detectLiveDataNeed(userText);
        if (needs.length > 0) {
            liveDataUsed = true;
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
            liveContext = liveResults
                .filter(r => r.status === 'fulfilled' && r.value)
                .map(r => r.value)
                .join('\n');
        }
    } catch (err) {
        console.warn('Live data fetch error (non-fatal):', err.message);
    }

    // ─── Call Bedrock — SINGLE CALL for intent detection + response ───
    const history = session.conversation_history || [];
    const startTime = Date.now();
    const aiResponse = await callBedrock(
        liveContext ? `${userText}\n\n[LIVE DATA]:\n${liveContext}` : userText,
        history,
        language
    );
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

    // ─── Log query for analytics (fire-and-forget) ───
    logQuery(session.session_id, userText, intent, language, responseTimeMs, liveDataUsed)
        .catch(err => console.warn('logQuery error:', err.message));

    // ─── Add AI response to history ───
    await addToHistory(session.session_id, 'assistant', finalResponse.response_text);

    // ─── Update session state (non-blocking) ───
    updateSession(session.session_id, {
        current_intent: intent,
        current_module: getModuleFromIntent(intent),
        language: language,
        turn_count: (session.turn_count || 0) + 1
    }).catch(err => console.warn('Session update failed:', err.message));

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
