/**
 * BharatVani — Twilio Voice Handler (Optimized)
 * Uses Twilio's built-in Polly TTS — no S3 upload needed
 */

import { callBedrock } from '../utils/bedrock.mjs';
import { createSession, getSession, updateSession } from '../utils/session.mjs';

// Expanded Hindi speech hints — rural vocabulary for better recognition
const HINDI_HINTS = [
    // Schemes
    'yojana', 'PM Kisan', 'Ayushman Bharat', 'Jan Dhan', 'Ujjwala',
    'mudra', 'pension', 'bima', 'awas', 'sukanya', 'ration', 'gas',
    'kisan samman nidhi', 'fasal bima', 'soil health', 'atal pension',
    // Crops & farming
    'gehu', 'gehun', 'chawal', 'dhan', 'makka', 'bajra', 'jowar',
    'sarson', 'chana', 'masoor', 'moong', 'arhar', 'soyabean',
    'tamatar', 'pyaaz', 'aloo', 'gobhi', 'mirchi', 'lauki', 'bhindi',
    'fasal', 'kheti', 'kisaan', 'mandi', 'keemat', 'rate', 'bhav',
    'buwai', 'katai', 'sinchai', 'khet', 'zameen', 'beej', 'khad', 'dawai',
    // Common rural phrases
    'paisa', 'paisa kab aayega', 'kist', 'kab milega',
    'dawa', 'ilaaj', 'hospital', 'doctor', 'beemar',
    'padhai', 'school', 'baccha', 'bacchi', 'beti',
    'ghar', 'ghar banwana', 'makaan',
    'loan', 'karz', 'bank', 'khaata',
    'aadhaar', 'ration card', 'voter card',
    // General
    'namaste', 'namaskar', 'haan', 'nahi', 'batao', 'bataaiye',
    'kya hai', 'kaise', 'kaise milega', 'kahan', 'kab',
    'madad', 'help', 'samajh', 'pata nahi',
    'sarkari', 'sarkar', 'labh', 'fayda',
    'dhanyavaad', 'shukriya', 'alvida', 'bas', 'theek hai',
    'accha', 'bilkul', 'zaroor', 'haan ji', 'nahi ji',
    'mausam', 'barish', 'garmi', 'sardi', 'thand',
    'chai', 'khana', 'paani', 'bijli', 'sadak'
].join(', ');

/**
 * Generate TwiML XML
 */
function twiml(content) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
${content}
</Response>`;
}

/**
 * Build optimized <Gather> tag with Hindi settings
 */
function gatherTag(sessionId, prompt) {
    return `<Gather input="speech dtmf" language="hi-IN" speechTimeout="auto" timeout="8" action="/voice/gather?sessionId=${sessionId}" method="POST" hints="${HINDI_HINTS}" profanityFilter="false" enhanced="true">
    <Say language="hi-IN" voice="Polly.Aditi">${prompt}</Say>
</Gather>`;
}

/**
 * Handle incoming call — greet and listen
 */
export async function handleIncoming(params) {
    const phoneNumber = params.From || params.Caller || '+unknown';
    console.log('Twilio incoming call from:', phoneNumber);

    // Create session
    const { session } = await createSession(phoneNumber);
    const sessionId = session.session_id;

    // Short, crisp welcome
    const welcomeText = 'Namaste! BharatVani mein aapka swagat hai. Aap mujhse sarkari yojana, fasal ki keemat, ya kheti ke baare mein pooch sakte hain.';

    return twiml(`
    <Say language="hi-IN" voice="Polly.Aditi">${welcomeText}</Say>
    ${gatherTag(sessionId, 'Boliye, main sun rahi hoon...')}
    <Say language="hi-IN" voice="Polly.Aditi">Koi baat nahi. Aap kabhi bhi dobara call kar sakte hain. Dhanyavaad!</Say>
`);
}

/**
 * Handle speech/DTMF input — process through AI and respond
 */
export async function handleGather(params, sessionId) {
    const speechResult = params.SpeechResult || '';
    const digits = params.Digits || '';
    const phoneNumber = params.From || params.Caller || '+unknown';
    const confidence = parseFloat(params.Confidence || '0');

    console.log(`Input received: speech="${speechResult}" digits="${digits}" confidence=${confidence} session=${sessionId}`);

    // Handle DTMF fallback
    if (digits && !speechResult) {
        const dtmfMap = {
            '1': 'sarkari yojana ke baare mein batao',
            '2': 'fasal ki keemat batao',
            '3': 'kheti ki salah do',
            '0': 'madad chahiye'
        };
        const mappedText = dtmfMap[digits];
        if (mappedText) {
            return await processQuery(mappedText, sessionId, phoneNumber);
        }
    }

    // If no speech detected
    if (!speechResult || speechResult.trim() === '') {
        return twiml(`
    ${gatherTag(sessionId, 'Maaf kijiye, mujhe sunai nahi diya. Kripya dobara boliye. Ya 1 dabaiye yojana ke liye, 2 dabaiye fasal keemat ke liye.')}
    <Say language="hi-IN" voice="Polly.Aditi">Dhanyavaad! Dobara call karein.</Say>
`);
    }

    // Check for goodbye
    const endWords = ['bye', 'goodbye', 'alvida', 'dhanyavaad', 'thank you', 'bas', 'band karo', 'rakhiye', 'khatam'];
    if (endWords.some(w => speechResult.toLowerCase().includes(w))) {
        return twiml(`
    <Say language="hi-IN" voice="Polly.Aditi">Dhanyavaad! BharatVani ko use karne ke liye shukriya. Jai Hind!</Say>
    <Hangup/>
`);
    }

    return await processQuery(speechResult, sessionId, phoneNumber);
}

/**
 * Process user query through Bedrock AI and return TwiML
 */
async function processQuery(userText, sessionId, phoneNumber) {
    try {
        // Get session history
        let session = await getSession(sessionId);
        const conversationHistory = session?.conversation_history || [];

        // Call Bedrock AI
        const aiResponse = await callBedrock(userText, conversationHistory, 'hi-IN');
        const responseText = aiResponse.response_text || 'Maaf kijiye, mujhe samajh nahi aaya.';

        console.log('AI Response:', responseText);

        // Update session history (non-blocking)
        if (session) {
            const updatedHistory = [
                ...conversationHistory,
                { role: 'user', text: userText },
                { role: 'assistant', text: responseText }
            ].slice(-6); // Keep last 6 turns only

            updateSession(sessionId, {
                conversation_history: updatedHistory,
                last_intent: aiResponse.intent,
                turn_count: (session.turn_count || 0) + 1
            }).catch(err => console.warn('Session update failed:', err.message));
        }

        // Respond using Twilio's built-in Polly TTS — NO S3 upload needed!
        return twiml(`
    <Say language="hi-IN" voice="Polly.Aditi">${escapeXml(responseText)}</Say>
    ${gatherTag(sessionId, 'Aur kuch poochna hai? Boliye ya 1 dabaiye yojana, 2 dabaiye keemat ke liye.')}
    <Say language="hi-IN" voice="Polly.Aditi">Dhanyavaad!</Say>
`);

    } catch (err) {
        console.error('Error processing query:', err);
        return twiml(`
    <Say language="hi-IN" voice="Polly.Aditi">Maaf kijiye, kuch problem ho gayi.</Say>
    ${gatherTag(sessionId, 'Kripya dobara boliye...')}
`);
    }
}

/**
 * Escape XML special characters in text
 */
function escapeXml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}
