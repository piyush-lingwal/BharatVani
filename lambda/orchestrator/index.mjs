/**
 * BharatVani — Main Lambda Orchestrator
 * Single Lambda that handles the full voice→AI→voice pipeline
 *
 * Supports TWO modes:
 *   1. Twilio: API Gateway → THIS LAMBDA (returns TwiML)
 *   2. Direct: Test events / Connect (returns JSON)
 */

import { createSession, getSession, updateSession, addToHistory } from './utils/session.mjs';
import { sendOTP, verifyOTP, sendConfirmationSMS, generateOTP } from './utils/sms.mjs';
import { handleIncoming, handleGather, handleLanguage } from './handlers/twilio.mjs';
import { processUserQuery } from './utils/pipeline.mjs';
import { parse } from 'querystring';

// Load welcome/error messages
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));


let welcomeMessages = null;
let errorResponses = null;

function loadMessages() {
    const searchPaths = [
        join(__dirname, '..', '..', 'knowledge-base', 'system'),
        join(__dirname, 'knowledge-base', 'system'),
        join('/var/task', 'knowledge-base', 'system')
    ];

    if (!welcomeMessages) {
        for (const dir of searchPaths) {
            try {
                welcomeMessages = JSON.parse(readFileSync(join(dir, 'welcome_messages.json'), 'utf-8'));
                break;
            } catch (e) { continue; }
        }
        if (!welcomeMessages) welcomeMessages = { welcome: { 'hi-IN': 'Namaste! BharatVani mein aapka swagat hai.' } };
    }
    if (!errorResponses) {
        for (const dir of searchPaths) {
            try {
                errorResponses = JSON.parse(readFileSync(join(dir, 'error_responses.json'), 'utf-8'));
                break;
            } catch (e) { continue; }
        }
        if (!errorResponses) errorResponses = { general_error: { 'hi-IN': 'Kuch gadbad ho gayi. Kripya dobara try karein.' } };
    }
}

/**
 * Main Lambda handler
 * Event structure from Amazon Connect:
 * {
 *   "Details": {
 *     "ContactData": {
 *       "CustomerEndpoint": { "Address": "+919876543210" },
 *       "ContactId": "contact-uuid",
 *       "Attributes": { "sessionId": "...", "userText": "..." }
 *     },
 *     "Parameters": {
 *       "action": "NEW_CALL" | "USER_INPUT" | "END_CALL",
 *       "userText": "...",
 *       "sessionId": "..."
 *     }
 *   }
 * }
 */
export async function handler(event) {
    console.log('BharatVani Event:', JSON.stringify(event, null, 2));

    loadMessages();

    // ========================================
    // MODE 1: API Gateway (Twilio voice + Web Chat)
    // ========================================
    if (event.requestContext && (event.httpMethod || event.requestContext.http)) {
        return await handleApiGateway(event);
    }

    // ========================================
    // MODE 2: Direct invocation (test/Connect)
    // ========================================
    try {
        const contactData = event.Details?.ContactData || {};
        const params = event.Details?.Parameters || event;

        const action = params.action || 'USER_INPUT';
        const phoneNumber = contactData.CustomerEndpoint?.Address || params.phoneNumber || '+910000000000';
        const userText = params.userText || '';
        const sessionId = contactData.Attributes?.sessionId || params.sessionId || null;

        switch (action) {
            case 'NEW_CALL':
                return await handleNewCall(phoneNumber);

            case 'USER_INPUT':
                return await handleUserInput(sessionId, phoneNumber, userText);

            case 'END_CALL':
                return await handleEndCall(sessionId);

            default:
                return buildConnectResponse('Kuch gadbad ho gayi.', 'hi-IN', null, 'continue');
        }

    } catch (error) {
        console.error('Handler error:', error);
        return buildConnectResponse(
            errorResponses?.general_error?.['hi-IN'] || 'Kuch gadbad ho gayi. Kripya dobara call karein.',
            'hi-IN',
            null,
            'continue'
        );
    }
}

/**
 * Handle all API Gateway requests (Twilio voice + Web Chat)
 */
async function handleApiGateway(event) {
    const CORS_HEADERS = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
    };

    try {
        const path = event.path || event.rawPath || event.requestContext?.http?.path || '';
        const method = event.httpMethod || event.requestContext?.http?.method || '';

        // Handle CORS preflight
        if (method === 'OPTIONS') {
            return { statusCode: 200, headers: CORS_HEADERS, body: '' };
        }

        const body = event.isBase64Encoded
            ? Buffer.from(event.body, 'base64').toString('utf-8')
            : (event.body || '');
        const queryParams = event.queryStringParameters || {};

        console.log('API Gateway path:', path, 'method:', method);

        // ---- Web Chat endpoint ----
        if (path.includes('/chat')) {
            let jsonBody;
            try {
                jsonBody = JSON.parse(body || '{}');
            } catch (parseErr) {
                return {
                    statusCode: 400,
                    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ error: 'Invalid JSON in request body' })
                };
            }
            return await handleWebChat(jsonBody, CORS_HEADERS);
        }

        // ---- Twilio Voice endpoints ----
        const params = parse(body);

        let twimlResponse;
        if (path.includes('/voice/incoming')) {
            twimlResponse = await handleIncoming(params);
        } else if (path.includes('/voice/language')) {
            const sessionId = queryParams.sessionId || '';
            twimlResponse = await handleLanguage(params, sessionId);
        } else if (path.includes('/voice/gather')) {
            const sessionId = queryParams.sessionId || '';
            twimlResponse = await handleGather(params, sessionId);
        } else {
            // Health check / default
            return {
                statusCode: 200,
                headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'ok', service: 'BharatVani' })
            };
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/xml' },
            body: twimlResponse
        };

    } catch (err) {
        console.error('API handler error:', err);
        return {
            statusCode: 200,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Maaf kijiye, kuch problem ho gayi.' })
        };
    }
}

/**
 * Handle web chat messages
 */
async function handleWebChat(body, corsHeaders) {
    const { message, sessionId: clientSessionId } = body;

    // ── Input validation ──
    if (message !== undefined && typeof message !== 'string') {
        return {
            statusCode: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'message must be a string' })
        };
    }
    const MAX_MESSAGE_LENGTH = 2000;
    if (message && message.length > MAX_MESSAGE_LENGTH) {
        return {
            statusCode: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: `Message too long (max ${MAX_MESSAGE_LENGTH} characters)` })
        };
    }

    // Start new session if needed
    let sessionId = clientSessionId;
    let session = null;

    if (sessionId) {
        session = await getSession(sessionId);
    }

    if (!session) {
        const result = await createSession('web-user');
        session = result.session;
        sessionId = session.session_id;
    }

    // If no message, return welcome
    if (!message || message.trim() === '') {
        return {
            statusCode: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                response: 'Namaste! Main BharatVani hoon. Aap mujhse kuch bhi pooch sakte hain — sarkari yojana, kheti, GK, ya koi bhi sawaal!',
                sessionId
            })
        };
    }

    console.log(`Web chat [${sessionId}]: "${message}"`);

    // Use the shared processing pipeline
    const result = await processUserQuery(message, sessionId, 'web-user');

    return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            response: result.responseText,
            intent: result.intent,
            sessionId
        })
    };
}

/**
 * Handle new incoming call — create session, greet user
 */
async function handleNewCall(phoneNumber) {
    console.log(`New call from: ${phoneNumber}`);

    const { session, user } = await createSession(phoneNumber);
    const language = user?.language_preference || 'hi-IN';

    // Choose welcome message
    const greeting = user
        ? welcomeMessages?.welcome_returning?.[language] || welcomeMessages?.welcome?.[language]
        : welcomeMessages?.welcome?.[language] || 'Namaste! BharatVani mein aapka swagat hai. Aap kya jaanna chahte hain?';

    return buildConnectResponse(greeting, language, session.session_id, 'continue');
}

/**
 * Handle user's spoken input — the core conversation loop (Connect/direct mode)
 */
async function handleUserInput(sessionId, phoneNumber, userText) {
    if (!userText || userText.trim() === '') {
        return buildConnectResponse(
            errorResponses?.speech_not_understood?.['hi-IN'] || 'Maaf kijiye, samajh nahi aaya. Kripya dobara bataiye.',
            'hi-IN',
            sessionId,
            'continue'
        );
    }

    console.log(`User input [${sessionId}]: "${userText}"`);

    const result = await processUserQuery(userText, sessionId, phoneNumber);

    if (result.isEndCall) {
        const goodbye = welcomeMessages?.goodbye?.[result.language] || 'Shukriya! Dobara call karein!';
        return buildConnectResponse(goodbye, result.language, sessionId, 'end');
    }

    return buildConnectResponse(result.responseText, result.language, sessionId, 'continue');
}

/**
 * Handle call end — cleanup session
 */
async function handleEndCall(sessionId) {
    if (sessionId) {
        const session = await getSession(sessionId);
        if (session) {
            await updateSession(sessionId, {
                ended_at: new Date().toISOString()
            });
            console.log(`Call ended: ${sessionId}, turns: ${session.conversation_history?.length || 0}`);
        }
    }

    return buildConnectResponse(null, 'hi-IN', sessionId, 'end');
}

/**
 * Build a response object for Amazon Connect
 */
function buildConnectResponse(responseText, language, sessionId, action) {
    return {
        statusCode: 200,
        response_text: responseText || '',
        language: language,
        session_id: sessionId,
        action: action, // 'continue' or 'end'
        // Amazon Connect specific attributes
        lambdaResult: {
            responseText: responseText || '',
            sessionId: sessionId,
            language: language,
            action: action
        }
    };
}
