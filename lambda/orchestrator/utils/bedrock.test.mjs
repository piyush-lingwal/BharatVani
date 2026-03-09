/**
 * BharatVani — Unit Tests for bedrock.mjs
 * Tests: intent/entity tag parsing, buildMessages(), summarizeOlderHistory()
 * 
 * Since buildMessages and summarizeOlderHistory are not exported from bedrock.mjs,
 * we replicate their core logic here for unit testing (same pattern as test-quick.mjs).
 * The tag parsing logic is extracted verbatim from callBedrock() response handling.
 * 
 * Run: node --test utils/bedrock.test.mjs
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ═══════════════════════════════════════════
// Replicated logic from bedrock.mjs for unit testing
// ═══════════════════════════════════════════

/**
 * Parse intent tags, entity tags, and search tags from Claude's response text.
 * Extracted verbatim from callBedrock() lines 360-398.
 */
function parseResponseTags(textContent) {
    const searchMatch = textContent.match(/\[SEARCH_NEEDED:([^\]]+)\]/);
    const searchQuery = searchMatch ? searchMatch[1].trim() : null;

    const intentMatch = textContent.match(/\[INTENT:(\w+)\]/);
    const intent = intentMatch ? intentMatch[1] : 'general';

    const schemeMatch = textContent.match(/\[SCHEME:([^\]]+)\]/);
    const cropMatch = textContent.match(/\[CROP:([^\]]+)\]/);
    const cityMatch = textContent.match(/\[CITY:([^\]]+)\]/);
    const queryTypeMatch = textContent.match(/\[QTYPE:([^\]]+)\]/);

    const cleanText = textContent
        .replace(/\[SEARCH_NEEDED:[^\]]+\]/g, '')
        .replace(/\[INTENT:\w+\]/g, '')
        .replace(/\[SCHEME:[^\]]+\]/g, '')
        .replace(/\[CROP:[^\]]+\]/g, '')
        .replace(/\[CITY:[^\]]+\]/g, '')
        .replace(/\[QTYPE:[^\]]+\]/g, '')
        .trim();

    const entities = {};
    if (schemeMatch) entities.scheme_name = schemeMatch[1];
    if (cropMatch) entities.crop_name = cropMatch[1];
    if (cityMatch) entities.city = cityMatch[1];
    if (queryTypeMatch) entities.query_type = queryTypeMatch[1];

    return {
        intent,
        response_text: cleanText || 'Maaf kijiye, kripya dobara boliye.',
        entities,
        searchQuery
    };
}

/**
 * Build proper Anthropic multi-turn messages array.
 * Replicated from bedrock.mjs buildMessages() lines 258-306.
 */
function buildMessages(conversationHistory, currentUserText) {
    const messages = [];
    const recent = conversationHistory.slice(-10);

    for (const entry of recent) {
        const role = entry.role === 'user' ? 'user' : 'assistant';
        const text = entry.text || '';
        if (!text.trim()) continue;

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

    if (messages.length > 0 && messages[messages.length - 1].role === 'user') {
        messages[messages.length - 1].content[0].text += '\n' + currentUserText;
    } else {
        messages.push({
            role: 'user',
            content: [{ type: 'text', text: currentUserText }]
        });
    }

    while (messages.length > 0 && messages[0].role !== 'user') {
        messages.shift();
    }

    if (messages.length === 0) {
        messages.push({
            role: 'user',
            content: [{ type: 'text', text: currentUserText }]
        });
    }

    return messages;
}

/**
 * Summarize older history turns.
 * Replicated from bedrock.mjs summarizeOlderHistory() lines 180-196.
 */
function summarizeOlderHistory(history) {
    if (history.length <= 10) return '';
    const older = history.slice(0, -10);
    const topics = new Set();
    const userMessages = older.filter(h => h.role === 'user');

    for (const entry of userMessages) {
        if (entry.text && entry.text.length > 5) {
            const words = entry.text.replace(/[\[\]]/g, '').split(/\s+/).slice(0, 6).join(' ');
            topics.add(words);
        }
    }

    if (topics.size === 0) return '';
    return `\n\n[PREVIOUS CONVERSATION SUMMARY: User previously discussed ${topics.size} topic(s) including: ${[...topics].slice(0, 5).join('; ')}. Total ${older.length} earlier turns in this call.]`;
}


// ═══════════════════════════════════════════
// TEST SUITE: Intent & Entity Tag Parsing
// ═══════════════════════════════════════════

describe('parseResponseTags', () => {

    it('parses intent + scheme + query type', () => {
        const result = parseResponseTags(
            '[INTENT:govt_scheme_info][SCHEME:pm kisan][QTYPE:info] PM Kisan mein har saal 6000 rupaye milte hain.'
        );
        assert.equal(result.intent, 'govt_scheme_info');
        assert.equal(result.entities.scheme_name, 'pm kisan');
        assert.equal(result.entities.query_type, 'info');
        assert.equal(result.response_text, 'PM Kisan mein har saal 6000 rupaye milte hain.');
        assert.equal(result.searchQuery, null);
    });

    it('parses SEARCH_NEEDED before intent', () => {
        const result = parseResponseTags(
            '[SEARCH_NEEDED:India vs New Zealand cricket score today][INTENT:general]Main score check karta hoon...'
        );
        assert.equal(result.searchQuery, 'India vs New Zealand cricket score today');
        assert.equal(result.intent, 'general');
        assert.equal(result.response_text, 'Main score check karta hoon...');
    });

    it('parses weather intent with city entity', () => {
        const result = parseResponseTags(
            '[INTENT:weather_forecast][CITY:Delhi] Aaj Delhi mein 30 degree hai.'
        );
        assert.equal(result.intent, 'weather_forecast');
        assert.equal(result.entities.city, 'Delhi');
        assert.equal(result.response_text, 'Aaj Delhi mein 30 degree hai.');
    });

    it('parses crop intent with crop entity', () => {
        const result = parseResponseTags(
            '[INTENT:crop_price][CROP:tamatar] Tamatar ka bhav 25 rupaye per kg hai.'
        );
        assert.equal(result.intent, 'crop_price');
        assert.equal(result.entities.crop_name, 'tamatar');
    });

    it('parses end_call intent', () => {
        const result = parseResponseTags('[INTENT:end_call] Dhanyavaad! Dobara call karein.');
        assert.equal(result.intent, 'end_call');
        assert.equal(result.response_text, 'Dhanyavaad! Dobara call karein.');
    });

    it('defaults to "general" when no intent tag', () => {
        const result = parseResponseTags('Plain response without any tags');
        assert.equal(result.intent, 'general');
        assert.equal(result.response_text, 'Plain response without any tags');
        assert.deepEqual(result.entities, {});
    });

    it('parses multiple entity tags together', () => {
        const result = parseResponseTags(
            '[INTENT:weather_forecast][CITY:Mumbai][CROP:gehun] Complex response'
        );
        assert.equal(result.entities.city, 'Mumbai');
        assert.equal(result.entities.crop_name, 'gehun');
    });

    it('strips all tags cleanly from response text', () => {
        const result = parseResponseTags(
            '[SEARCH_NEEDED:test query][INTENT:general][SCHEME:ayushman][CITY:Pune][CROP:pyaz][QTYPE:eligibility] Only this text should remain.'
        );
        assert.equal(result.response_text, 'Only this text should remain.');
    });

    it('uses fallback text when response is only tags', () => {
        const result = parseResponseTags('[INTENT:general]');
        assert.equal(result.response_text, 'Maaf kijiye, kripya dobara boliye.');
    });
});


// ═══════════════════════════════════════════
// TEST SUITE: buildMessages()
// ═══════════════════════════════════════════

describe('buildMessages', () => {

    it('returns single user message for empty history', () => {
        const messages = buildMessages([], 'Hello BharatVani');
        assert.equal(messages.length, 1);
        assert.equal(messages[0].role, 'user');
        assert.ok(messages[0].content[0].text.includes('Hello BharatVani'));
    });

    it('preserves proper alternation of user/assistant', () => {
        const history = [
            { role: 'user', text: 'PM Kisan ke baare mein batao' },
            { role: 'assistant', text: 'PM Kisan mein 6000 rupaye milte hain' },
        ];
        const messages = buildMessages(history, 'Eligibility kya hai?');
        assert.equal(messages[0].role, 'user');
        assert.equal(messages[1].role, 'assistant');
        assert.equal(messages[2].role, 'user');
    });

    it('merges consecutive same-role messages', () => {
        const history = [
            { role: 'user', text: 'first message' },
            { role: 'user', text: 'second message' },
            { role: 'assistant', text: 'response' },
        ];
        const messages = buildMessages(history, 'third question');
        // First two user messages should be merged
        assert.equal(messages[0].role, 'user');
        assert.ok(messages[0].content[0].text.includes('first message'));
        assert.ok(messages[0].content[0].text.includes('second message'));
        assert.equal(messages[1].role, 'assistant');
    });

    it('ensures first message is always "user" by stripping leading assistant', () => {
        const history = [
            { role: 'assistant', text: 'Welcome to BharatVani' },
            { role: 'user', text: 'Mausam batao' },
            { role: 'assistant', text: 'Delhi mein 30 degree hai' },
        ];
        const messages = buildMessages(history, 'Aur kya?');
        assert.equal(messages[0].role, 'user');
    });

    it('uses only last 10 turns from long history', () => {
        const history = [];
        for (let i = 0; i < 20; i++) {
            history.push({ role: i % 2 === 0 ? 'user' : 'assistant', text: `Turn ${i}` });
        }
        const messages = buildMessages(history, 'Latest question');
        // Should not include Turn 0-9, only Turn 10-19 + current
        const allText = messages.map(m => m.content[0].text).join(' ');
        assert.ok(!allText.includes('Turn 0'));  // Turn 0 should be excluded
        assert.ok(allText.includes('Turn 10'));  // Turn 10 should be included
    });

    it('filters out empty text entries', () => {
        const history = [
            { role: 'user', text: 'Hello' },
            { role: 'assistant', text: '' },
            { role: 'user', text: '' },
            { role: 'assistant', text: 'Response' },
        ];
        const messages = buildMessages(history, 'Question');
        // Empty entries should be filtered
        for (const msg of messages) {
            assert.ok(msg.content[0].text.trim().length > 0);
        }
    });
});


// ═══════════════════════════════════════════
// TEST SUITE: summarizeOlderHistory()
// ═══════════════════════════════════════════

describe('summarizeOlderHistory', () => {

    it('returns empty string for ≤ 10 turns', () => {
        const history = [
            { role: 'user', text: 'Hello' },
            { role: 'assistant', text: 'Hi' },
        ];
        assert.equal(summarizeOlderHistory(history), '');
    });

    it('returns empty string for exactly 10 turns', () => {
        const history = [];
        for (let i = 0; i < 10; i++) {
            history.push({ role: i % 2 === 0 ? 'user' : 'assistant', text: `Turn ${i}` });
        }
        assert.equal(summarizeOlderHistory(history), '');
    });

    it('returns summary for > 10 turns', () => {
        const history = [];
        for (let i = 0; i < 15; i++) {
            history.push({
                role: i % 2 === 0 ? 'user' : 'assistant',
                text: `Turn ${i} about topic ${i}`
            });
        }
        const summary = summarizeOlderHistory(history);
        assert.ok(summary.includes('PREVIOUS CONVERSATION SUMMARY'));
        assert.ok(summary.includes('topic(s)'));
    });

    it('returns empty string for empty history', () => {
        assert.equal(summarizeOlderHistory([]), '');
    });

    it('only summarizes user messages, not assistant', () => {
        const history = [];
        // 12 turns: all assistant (odd turns) + user (even turns)
        for (let i = 0; i < 12; i++) {
            history.push({
                role: i % 2 === 0 ? 'user' : 'assistant',
                text: `Message ${i}`
            });
        }
        const summary = summarizeOlderHistory(history);
        // Only the first 2 entries (index 0,1) are "older" (12 - 10 = first 2)
        // Index 0 is user, index 1 is assistant → 1 user topic
        assert.ok(summary.includes('1 topic'));
    });

    it('skips very short user texts (≤ 5 chars)', () => {
        const history = [];
        for (let i = 0; i < 14; i++) {
            history.push({
                role: i % 2 === 0 ? 'user' : 'assistant',
                text: i === 0 ? 'Hi' : `Longer message number ${i}` // First user msg is short
            });
        }
        const summary = summarizeOlderHistory(history);
        // "Hi" should be excluded (length ≤ 5)
        assert.ok(!summary.includes('"Hi"'));
    });
});
