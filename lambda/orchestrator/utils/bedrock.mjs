/**
 * BharatVani — Bedrock AI Client
 * Single-call intent detection + response generation
 */

import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { detectLiveDataNeed, fetchLiveData } from './apiServices.mjs';

const bedrockClient = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || 'ap-south-1'
});

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'ap-south-1'
});

const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-5-sonnet-20241022-v2:0';
const KB_BUCKET = process.env.KB_BUCKET || 'bharatvani-knowledge-base';

// Cache for system prompt and knowledge base
let cachedSystemPrompt = null;
let cachedSchemes = null;
let cachedMandiPrices = null;
let cachedFarmingTips = null;

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
 * Build the full prompt with context
 */
async function buildPrompt(userText, conversationHistory, language, liveData = '') {
    const systemPrompt = loadSystemPrompt();
    const schemes = await loadSchemes();

    // Inject ONLY scheme names — not full details (saves tokens, speeds up response)
    const schemeNames = Object.values(schemes).map(s =>
        `${s.name} (${s.hindi_name})`
    ).join(', ');

    // Replace placeholders in system prompt
    let finalPrompt = systemPrompt
        .replace('{SCHEME_CONTEXT}', `\nAvailable schemes: ${schemeNames}`)
        .replace('{AGRICULTURE_CONTEXT}', '\nCrop prices and farming tips available on demand.');

    // Inject live data if available
    if (liveData) {
        finalPrompt += `\n\nLIVE DATA (use this to answer accurately):\n${liveData}`;
    }

    // Add last 6 conversation turns for context
    const recentHistory = conversationHistory.slice(-6);
    if (recentHistory.length > 0) {
        const historyText = recentHistory.map(h =>
            `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text}`
        ).join('\n');
        finalPrompt += `\n\nRecent conversation:\n${historyText}`;
    }

    finalPrompt += `\nLanguage: ${language}`;

    return finalPrompt;
}

/**
 * Call Bedrock with the user's message — single call for intent + response
 */
export async function callBedrock(userText, conversationHistory = [], language = 'hi-IN') {
    // Detect if query needs real-time data
    const liveDataNeeds = detectLiveDataNeed(userText);
    let liveData = '';
    if (liveDataNeeds.length > 0) {
        console.log('Live data needed:', liveDataNeeds.map(n => n.type).join(', '));
        liveData = await fetchLiveData(liveDataNeeds);
        console.log('Live data fetched:', liveData.substring(0, 100));
    }

    const systemPrompt = await buildPrompt(userText, conversationHistory, language, liveData);

    const payload = {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: liveData ? 400 : 200,  // More tokens when we have live data to process
        temperature: 0.5,
        system: systemPrompt,
        messages: [
            {
                role: 'user',
                content: [{ type: 'text', text: userText }]
            }
        ]
    };

    console.log('Calling Bedrock with model:', MODEL_ID);

    try {
        const command = new InvokeModelCommand({
            modelId: MODEL_ID,
            contentType: 'application/json',
            accept: 'application/json',
            body: JSON.stringify(payload)
        });

        const response = await bedrockClient.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));

        // Get plain text response — no JSON parsing needed
        const textContent = responseBody.content?.[0]?.text || '';
        console.log('Bedrock raw response:', textContent);

        // Return simple response object
        return {
            intent: 'general',
            response_text: textContent.trim() || 'Maaf kijiye, kripya dobara boliye.',
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
