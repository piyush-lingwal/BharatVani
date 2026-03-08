/**
 * BharatVani — Twilio Voice Handler (Optimized)
 * Uses Twilio's built-in Polly TTS — no S3 upload needed
 * Now uses the shared processUserQuery() pipeline for consistent responses
 */

import { processUserQuery } from '../utils/pipeline.mjs';
import { createSession, getSession, updateSession } from '../utils/session.mjs';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Language to Voice Mapping
const LANGUAGE_VOICES = {
    'hi-IN': 'Polly.Aditi',
    'en-IN': 'Polly.Raveena',
    'ta-IN': 'Polly.Aditi',
    'te-IN': 'Polly.Aditi',
    'bn-IN': 'Polly.Aditi',
    'mr-IN': 'Polly.Aditi'
};

const DTMF_TO_LANG = {
    '1': 'hi-IN',
    '2': 'en-IN',
    '3': 'ta-IN',
    '4': 'te-IN',
    '5': 'bn-IN',
    '6': 'mr-IN'
};

// Load messages — search multiple paths for compatibility
let messages = null;
function getMessages() {
    if (messages) return messages;
    const searchPaths = [
        join(__dirname, '..', 'knowledge-base', 'system'),         // Lambda: handlers/../knowledge-base
        join(__dirname, '..', '..', 'knowledge-base', 'system'),   // Local dev: handlers/../../knowledge-base
        join(__dirname, '..', '..', '..', 'knowledge-base', 'system'), // Deep local
        join('/var/task', 'knowledge-base', 'system')              // Lambda absolute
    ];
    for (const dir of searchPaths) {
        try {
            messages = JSON.parse(readFileSync(join(dir, 'welcome_messages.json'), 'utf8'));
            console.log('Loaded messages from:', dir);
            return messages;
        } catch (e) { continue; }
    }
    console.warn('Could not load welcome_messages.json from any path');
    messages = { welcome: {}, nudge: {}, goodbye: {} };
    return messages;
}

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
 * Build a <Say> tag with proper language and voice for Twilio
 * Twilio's language attribute on <Say> tells Polly which phoneme rules to use
 */
function sayTag(text, language = 'hi-IN') {
    const voice = LANGUAGE_VOICES[language] || 'Polly.Aditi';
    return `<Say language="${language}" voice="${voice}">${escapeXml(text)}</Say>`;
}

/**
 * Build optimized <Gather> tag with language settings
 */
function gatherTag(sessionId, prompt, language = 'hi-IN') {
    const voice = LANGUAGE_VOICES[language] || 'Polly.Aditi';
    // Only apply Hindi hints if language is Hindi
    const hintsAttr = language === 'hi-IN' ? `hints="${HINDI_HINTS}" ` : '';

    return `<Gather input="speech dtmf" language="${language}" speechTimeout="auto" timeout="8" action="/voice/gather?sessionId=${sessionId}" method="POST" ${hintsAttr}profanityFilter="false" enhanced="true">
    <Say language="${language}" voice="${voice}">${escapeXml(prompt)}</Say>
</Gather>`;
}


/**
 * Handle incoming call — prompt for language selection
 */
export async function handleIncoming(params) {
    const phoneNumber = params.From || params.Caller || '+unknown';
    console.log('Twilio incoming call from:', phoneNumber);

    // Create session
    const { session } = await createSession(phoneNumber);
    const sessionId = session.session_id;

    // Ask for language selection
    return twiml(`
    <Gather numDigits="1" action="/voice/language?sessionId=${sessionId}" method="POST" timeout="10">
        <Say language="hi-IN" voice="Polly.Aditi">Bharat Vani mein aapka swagat hai. Hindi ke liye 1 dabayein.</Say>
        <Say language="en-IN" voice="Polly.Raveena">For English, press 2.</Say>
        <Say language="ta-IN" voice="Polly.Aditi">Tamil aaha 3 azhuthavum.</Say>
        <Say language="te-IN" voice="Polly.Aditi">Telugu kosam 4 nokkandi.</Say>
        <Say language="bn-IN" voice="Polly.Aditi">Bangla janar jonno 5 chapun.</Say>
        <Say language="mr-IN" voice="Polly.Aditi">Marathi sathi 6 dabba.</Say>
    </Gather>
    <Redirect method="POST">/voice/incoming</Redirect>
`);
}

/**
 * Handle language selection and play welcome message
 */
export async function handleLanguage(params, sessionId) {
    const digits = params.Digits || '1';
    const language = DTMF_TO_LANG[digits] || 'hi-IN';
    const voice = LANGUAGE_VOICES[language];

    console.log(`Language selected: ${language} for session ${sessionId}`);

    // Update session
    await updateSession(sessionId, { language: language });

    const msgs = getMessages();
    const welcomeText = msgs.welcome?.[language] || msgs.welcome?.['hi-IN'] || 'Namaste! Aap kya jaanna chahte hain?';

    return twiml(`
    ${gatherTag(sessionId, welcomeText, language)}
    <Say language="${language}" voice="${voice}">${msgs.goodbye?.[language] || 'Dhanyavaad!'}</Say>
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

    // Get session FIRST — needed for language in all paths
    const session = await getSession(sessionId);
    const language = session?.language || 'hi-IN';
    const voice = LANGUAGE_VOICES[language] || 'Polly.Aditi';
    const msgs = getMessages();

    // Handle DTMF fallback — language-aware
    if (digits && !speechResult) {
        const DTMF_QUERIES = {
            'hi-IN': { '1': 'sarkari yojana ke baare mein batao', '2': 'fasal ki keemat batao', '3': 'kheti ki salah do', '0': 'madad chahiye' },
            'en-IN': { '1': 'tell me about government schemes', '2': 'what are crop prices', '3': 'give farming advice', '0': 'I need help' },
            'ta-IN': { '1': 'arasu thittangal patriya sollunga', '2': 'payir vilai enna', '3': 'vivasaaya alosanai sollunga', '0': 'udavi venum' },
            'te-IN': { '1': 'sarkar padakamulu gurinchi cheppandi', '2': 'panta dharalu ennto cheppandi', '3': 'vyavasaya salahalu cheppandi', '0': 'sahaayam kaavali' },
            'bn-IN': { '1': 'sorkari projokti somporke bolun', '2': 'fosholer dam janan', '3': 'krishi poramorsho din', '0': 'sahaajyo chai' },
            'mr-IN': { '1': 'sarkari yojana baddal sanga', '2': 'pikache bhav sanga', '3': 'shetichi salah dya', '0': 'madad havi' }
        };
        const dtmfMap = DTMF_QUERIES[language] || DTMF_QUERIES['hi-IN'];
        const mappedText = dtmfMap[digits];
        if (mappedText) {
            return await processQuery(mappedText, sessionId, phoneNumber, language);
        }
    }

    // If no speech detected
    if (!speechResult || speechResult.trim() === '') {
        const nudgeText = msgs.nudge?.[language] || msgs.nudge?.['hi-IN'] || 'Kripya boliye.';
        const goodbyeText = msgs.goodbye?.[language] || 'Dhanyavaad!';
        return twiml(`
    ${gatherTag(sessionId, nudgeText, language)}
    ${sayTag(goodbyeText, language)}
`);
    }

    // Check for goodbye
    const endWords = ['bye', 'goodbye', 'alvida', 'dhanyavaad', 'thank you', 'bas', 'band karo', 'rakhiye', 'khatam', 'nandri', 'malli kaluddam', 'abot biday'];
    if (endWords.some(w => speechResult.toLowerCase().includes(w))) {
        const goodbyeText = msgs.goodbye?.[language] || 'Dhanyavaad!';
        return twiml(`
    ${sayTag(goodbyeText, language)}
    <Hangup/>
`);
    }

    return await processQuery(speechResult, sessionId, phoneNumber, language);
}

/**
 * Process user query through the SHARED pipeline and return TwiML
 * Now uses processUserQuery() — same Bedrock + intent routing + handlers as web chat
 */
async function processQuery(userText, sessionId, phoneNumber, language) {
    const voice = LANGUAGE_VOICES[language] || 'Polly.Aditi';
    const msgs = getMessages();
    const nudgeText = msgs.nudge?.[language] || 'Aur samajhne ke liye boliye.';

    try {
        // Use the shared processing pipeline — same as web chat
        const result = await processUserQuery(userText, sessionId, phoneNumber);
        const responseText = result.responseText || 'Maaf kijiye, mujhe samajh nahi aaya.';

        // Handle end_call intent
        if (result.isEndCall) {
            const goodbyeText = msgs.goodbye?.[language] || 'Dhanyavaad!';
            return twiml(`
    ${sayTag(goodbyeText, language)}
    <Hangup/>
`);
        }

        console.log('Twilio AI Response (via shared pipeline):', responseText.substring(0, 100));

        // Respond using Twilio's built-in Polly TTS
        return twiml(`
    ${sayTag(responseText, language)}
    ${gatherTag(sessionId, nudgeText, language)}
    ${sayTag(msgs.goodbye?.[language] || 'Dhanyavaad!', language)}
`);

    } catch (err) {
        console.error('Error processing query:', err);
        return twiml(`
    ${sayTag('Network problem. Please try again.', language)}
    ${gatherTag(sessionId, nudgeText, language)}
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
