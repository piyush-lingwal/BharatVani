/**
 * BharatVani — Bedrock AI Client
 * Single-call intent detection + response generation
 * Production: Exponential backoff retry on Bedrock throttling
 *
 * v2: Multi-turn messages, full scheme context, history summarization,
 *     user memory support, duplicate live-data fetch eliminated
 */

import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const bedrockClient = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || 'ap-south-1'
});

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'ap-south-1'
});

const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-5-haiku-20241022-v1:0';
const KB_BUCKET = process.env.KB_BUCKET || 'bharatvani-knowledge-base';

// Cache for system prompt and knowledge base (warm Lambda reuse)
let cachedSystemPrompt = null;
let cachedSchemes = null;
let cachedMandiPrices = null;
let cachedFarmingTips = null;

/**
 * Exponential backoff retry wrapper
 * Only retries on throttling/transient errors — fails fast on logic errors
 * @param {Function} fn      - async function to retry
 * @param {number} maxRetries - max attempts (default: 3)
 * @param {number} baseDelay  - base delay in ms (doubles each attempt)
 */
async function withRetry(fn, maxRetries = 3, baseDelay = 1000) {
    const RETRIABLE = [
        'ThrottlingException',
        'ServiceUnavailableException',
        'ProvisionedThroughputExceededException',
        'RequestLimitExceeded',
        'InternalServerException'
    ];
    let lastErr;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            lastErr = err;
            const errName = err.name || err.constructor?.name || '';
            const isRetriable = RETRIABLE.some(r => errName.includes(r)) ||
                (err.$metadata?.httpStatusCode === 429) ||
                (err.$metadata?.httpStatusCode >= 500);
            if (!isRetriable || attempt === maxRetries) {
                console.error(`Bedrock error (attempt ${attempt}/${maxRetries}):`, errName, err.message);
                throw err;
            }
            const delay = baseDelay * Math.pow(2, attempt - 1);
            console.warn(`Bedrock throttled (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
            await new Promise(r => setTimeout(r, delay));
        }
    }
    throw lastErr;
}

/**
 * Resolve knowledge base path — works both locally and in Lambda
 */
function getKBPath(...segments) {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    // Try local dev path first
    const localPath = join(__dirname, '..', '..', '..', 'knowledge-base', ...segments);
    try { readFileSync(localPath); return localPath; } catch (e) { /* ignore */ }
    // Try Lambda bundled path
    const lambdaPath = join('/var/task', 'knowledge-base', ...segments);
    try { readFileSync(lambdaPath); return lambdaPath; } catch (e) { /* ignore */ }
    // Try relative to task root
    const taskPath = join(process.cwd(), 'knowledge-base', ...segments);
    return taskPath;
}

/**
 * Load system prompt from local file (packaged with Lambda)
 */
function loadSystemPrompt() {
    if (cachedSystemPrompt) return cachedSystemPrompt;

    try {
        const promptPath = getKBPath('system', 'system_prompt.txt');
        cachedSystemPrompt = readFileSync(promptPath, 'utf-8');
        console.log('System prompt loaded successfully');
    } catch (err) {
        console.warn('Could not load system prompt file, using fallback:', err.message);
        // Fallback: minimal system prompt
        cachedSystemPrompt = 'You are BharatVani, a helpful AI voice assistant for Indian citizens. Respond in Hindi. Keep responses under 30 words. Always return JSON with intent, response_text, and entities fields.';
    }

    return cachedSystemPrompt;
}

/**
 * Load all scheme data from S3 (or local files)
 */
async function loadSchemes() {
    if (cachedSchemes) return cachedSchemes;

    const searchPaths = [
        join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'knowledge-base', 'schemes'),
        join('/var/task', 'knowledge-base', 'schemes'),
        join(process.cwd(), 'knowledge-base', 'schemes')
    ];

    for (const schemesDir of searchPaths) {
        try {
            const { readdirSync } = await import('fs');
            const files = readdirSync(schemesDir).filter(f => f.endsWith('.json'));
            if (files.length === 0) continue;

            cachedSchemes = {};
            for (const file of files) {
                const data = JSON.parse(readFileSync(join(schemesDir, file), 'utf-8'));
                cachedSchemes[data.id] = data;
            }
            console.log(`Loaded ${files.length} schemes from ${schemesDir}`);
            return cachedSchemes;
        } catch (err) {
            continue;
        }
    }

    console.warn('Could not load schemes from any path');
    cachedSchemes = {};
    return cachedSchemes;
}

/**
 * Load mandi prices
 */
async function loadMandiPrices() {
    if (cachedMandiPrices) return cachedMandiPrices;

    try {
        const pricesPath = getKBPath('agriculture', 'mandi_prices.json');
        cachedMandiPrices = JSON.parse(readFileSync(pricesPath, 'utf-8'));
        console.log('Mandi prices loaded successfully');
    } catch (err) {
        console.warn('Could not load mandi prices:', err.message);
        cachedMandiPrices = { prices: [] };
    }

    return cachedMandiPrices;
}

/**
 * Load farming tips
 */
async function loadFarmingTips() {
    if (cachedFarmingTips) return cachedFarmingTips;

    try {
        const tipsPath = getKBPath('agriculture', 'farming_tips.json');
        cachedFarmingTips = JSON.parse(readFileSync(tipsPath, 'utf-8'));
        console.log('Farming tips loaded successfully');
    } catch (err) {
        console.warn('Could not load farming tips:', err.message);
        cachedFarmingTips = { seasonal_tips: {}, general_tips: [] };
    }

    return cachedFarmingTips;
}

/**
 * Summarize older history turns (beyond the recent window)
 * Uses simple JS extraction — no LLM call to avoid latency
 */
function summarizeOlderHistory(history) {
    if (history.length <= 10) return '';
    const older = history.slice(0, -10);
    const topics = new Set();
    const userMessages = older.filter(h => h.role === 'user');

    for (const entry of userMessages) {
        if (entry.text && entry.text.length > 5) {
            // Extract first few meaningful words as topic summary
            const words = entry.text.replace(/[\[\]]/g, '').split(/\s+/).slice(0, 6).join(' ');
            topics.add(words);
        }
    }

    if (topics.size === 0) return '';
    return `\n\n[PREVIOUS CONVERSATION SUMMARY: User previously discussed ${topics.size} topic(s) including: ${[...topics].slice(0, 5).join('; ')}. Total ${older.length} earlier turns in this call.]`;
}

/**
 * Build the full system prompt with context
 * @param {string} userText - current user message
 * @param {Array} conversationHistory - full conversation history
 * @param {string} language - language code
 * @param {string} liveData - pre-fetched live data string (from pipeline)
 * @param {string} userContext - returning user context string
 */
async function buildPrompt(userText, conversationHistory, language, liveData = '', userContext = '') {
    const systemPrompt = loadSystemPrompt();
    const schemes = await loadSchemes();

    // Inject compact scheme summaries (name + benefit + helpline) — not just names
    const schemeSummaries = Object.values(schemes).map(s =>
        `• ${s.name} (${s.hindi_name}): ${s.benefit || ''}. Helpline: ${s.helpline || 'N/A'}`
    ).join('\n');

    // Replace placeholders in system prompt
    let finalPrompt = systemPrompt
        .replace('{SCHEME_CONTEXT}', `\nGOVERNMENT SCHEMES (use this data to answer accurately):\n${schemeSummaries}`)
        .replace('{AGRICULTURE_CONTEXT}', '\nCrop prices and farming tips available on demand.');

    // ═══ LANGUAGE ENFORCEMENT: Prepend language as the FIRST instruction ═══
    const LANGUAGE_NAMES = {
        'hi-IN': 'Hindi (Romanized)',
        'en-IN': 'English',
        'ta-IN': 'Tamil (Romanized)',
        'te-IN': 'Telugu (Romanized)',
        'bn-IN': 'Bengali (Romanized)',
        'mr-IN': 'Marathi (Romanized)'
    };
    const langName = LANGUAGE_NAMES[language] || 'Hindi (Romanized)';
    finalPrompt = `⚠️ MANDATORY: You MUST respond ENTIRELY in ${langName}. The user selected ${language} as their language. Do NOT use any other language. Every word of your response must be in ${langName}.\n\n${finalPrompt}`;

    // Inject returning user context
    if (userContext) {
        finalPrompt += `\n\n${userContext}`;
    }

    // Inject summary of older conversation turns (beyond the 10-turn window)
    const historySummary = summarizeOlderHistory(conversationHistory);
    if (historySummary) {
        finalPrompt += historySummary;
    }

    // Inject live data if available
    if (liveData) {
        finalPrompt += `\n\nLIVE DATA (use this to answer accurately):\n${liveData}`;
    }

    // Also append at end for reinforcement
    finalPrompt += `\n\n⚠️ REMINDER: Respond ONLY in ${langName} (${language}).`;

    return finalPrompt;
}

/**
 * Build proper Anthropic multi-turn messages array from conversation history
 * Ensures: starts with 'user', alternates roles, merges consecutive same-role messages
 */
function buildMessages(conversationHistory, currentUserText) {
    const messages = [];

    // Use last 10 turns for context (expanded from 6)
    const recent = conversationHistory.slice(-10);

    for (const entry of recent) {
        const role = entry.role === 'user' ? 'user' : 'assistant';
        const text = entry.text || '';
        if (!text.trim()) continue;

        // If same role as previous, merge (Anthropic requires alternation)
        if (messages.length > 0 && messages[messages.length - 1].role === role) {
            const prevContent = messages[messages.length - 1].content[0].text;
            messages[messages.length - 1].content[0].text = prevContent + '\n' + text;
        } else {
            messages.push({
                role,
                content: [{ type: 'text', text }]
            });
        }
    }

    // Add current user message
    if (messages.length > 0 && messages[messages.length - 1].role === 'user') {
        // Merge with last user message if it's the same role
        messages[messages.length - 1].content[0].text += '\n' + currentUserText;
    } else {
        messages.push({
            role: 'user',
            content: [{ type: 'text', text: currentUserText }]
        });
    }

    // Ensure first message is 'user' (Anthropic requirement)
    while (messages.length > 0 && messages[0].role !== 'user') {
        messages.shift();
    }

    // Edge case: if empty or no user message, add the current one
    if (messages.length === 0) {
        messages.push({
            role: 'user',
            content: [{ type: 'text', text: currentUserText }]
        });
    }

    return messages;
}

/**
 * Call Bedrock with the user's message — single call for intent + response
 *
 * @param {string} userText - the user's spoken/typed text
 * @param {Array} conversationHistory - conversation history array
 * @param {string} language - language code (e.g. 'hi-IN')
 * @param {string} liveData - pre-fetched live data string (from pipeline.mjs)
 * @param {string} userContext - returning user context string
 */
export async function callBedrock(userText, conversationHistory = [], language = 'hi-IN', liveData = '', userContext = '') {
    const systemPrompt = await buildPrompt(userText, conversationHistory, language, liveData, userContext);

    // Build proper multi-turn messages — inject language instruction into user message
    const LANGUAGE_NAMES = {
        'hi-IN': 'Hindi', 'en-IN': 'English', 'ta-IN': 'Tamil',
        'te-IN': 'Telugu', 'bn-IN': 'Bengali', 'mr-IN': 'Marathi'
    };
    const langName = LANGUAGE_NAMES[language] || 'Hindi';
    // Prepend language instruction to user text so Claude can't miss it
    const langPrefixedText = (language !== 'hi-IN')
        ? `[Respond in ${langName} ONLY] ${userText}`
        : userText;
    const messages = buildMessages(conversationHistory, langPrefixedText);

    const payload = {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: liveData ? 500 : 350,  // Increased for richer responses
        temperature: 0.5,
        system: systemPrompt,
        messages: messages
    };

    console.log('Calling Bedrock with model:', MODEL_ID, '| history turns:', conversationHistory.length, '| liveData:', !!liveData);

    try {
        const command = new InvokeModelCommand({
            modelId: MODEL_ID,
            contentType: 'application/json',
            accept: 'application/json',
            body: JSON.stringify(payload)
        });

        // Wrap with retry — handles Bedrock throttling gracefully
        const response = await withRetry(() => bedrockClient.send(command));
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));

        // Get plain text response
        const textContent = responseBody.content?.[0]?.text || '';
        console.log('Bedrock raw response:', textContent);

        // Parse intent tag from Claude's response: [INTENT:xxx]
        // SEARCH_NEEDED may appear BEFORE the intent tag
        const searchMatch = textContent.match(/\[SEARCH_NEEDED:([^\]]+)\]/);
        const searchQuery = searchMatch ? searchMatch[1].trim() : null;

        const intentMatch = textContent.match(/\[INTENT:(\w+)\]/);
        const intent = intentMatch ? intentMatch[1] : 'general';

        // Parse entity tags: [SCHEME:name] [CROP:name] [CITY:name]
        const schemeMatch = textContent.match(/\[SCHEME:([^\]]+)\]/);
        const cropMatch = textContent.match(/\[CROP:([^\]]+)\]/);
        const cityMatch = textContent.match(/\[CITY:([^\]]+)\]/);
        const queryTypeMatch = textContent.match(/\[QTYPE:([^\]]+)\]/);

        // Strip all tags from the response text
        const cleanText = textContent
            .replace(/\[SEARCH_NEEDED:[^\]]+\]/g, '')
            .replace(/\[INTENT:\w+\]/g, '')
            .replace(/\[SCHEME:[^\]]+\]/g, '')
            .replace(/\[CROP:[^\]]+\]/g, '')
            .replace(/\[CITY:[^\]]+\]/g, '')
            .replace(/\[QTYPE:[^\]]+\]/g, '')
            .trim();

        console.log('Parsed intent:', intent, '| scheme:', schemeMatch?.[1], '| crop:', cropMatch?.[1]);

        // Build entities object
        const entities = {};
        if (schemeMatch) entities.scheme_name = schemeMatch[1];
        if (cropMatch) entities.crop_name = cropMatch[1];
        if (cityMatch) entities.city = cityMatch[1];
        if (queryTypeMatch) entities.query_type = queryTypeMatch[1];

        return {
            intent: intent,
            response_text: cleanText || 'Maaf kijiye, kripya dobara boliye.',
            entities: entities,
            searchQuery: searchQuery,  // null if no search needed
            follow_up: null,
            sms_content: null
        };

    } catch (err) {
        console.error('Bedrock call failed:', err.name, err.message, JSON.stringify(err.$metadata || {}));
        return {
            intent: 'error',
            response_text: 'Maaf kijiye, thodi der mein dobara try karein.',
            follow_up: null,
            sms_content: null
        };
    }
}

/**
 * Get detailed scheme data for deep queries
 */
export async function getSchemeDetails(schemeId) {
    const schemes = await loadSchemes();
    return schemes[schemeId] || null;
}
