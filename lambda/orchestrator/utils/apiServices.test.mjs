/**
 * BharatVani — Unit Tests for apiServices.mjs
 * Tests: detectLiveDataNeed(), extractCity() (indirectly via weather detection)
 * 
 * Run: node --test utils/apiServices.test.mjs
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { detectLiveDataNeed } from './apiServices.mjs';

// ═══════════════════════════════════════════
// TEST SUITE: detectLiveDataNeed()
// ═══════════════════════════════════════════

describe('detectLiveDataNeed', () => {

    // ── Weather Detection ──

    describe('weather keywords', () => {
        it('detects Hindi romanized weather query with city', () => {
            const needs = detectLiveDataNeed('Delhi mein mausam kaisa hai');
            assert.equal(needs.length, 1);
            assert.equal(needs[0].type, 'weather');
            assert.equal(needs[0].city, 'Delhi');
        });

        it('detects Devanagari weather keyword', () => {
            const needs = detectLiveDataNeed('दिल्ली में मौसम कैसा है');
            assert.equal(needs.length, 1);
            assert.equal(needs[0].type, 'weather');
            assert.equal(needs[0].city, 'Delhi');
        });

        it('detects "barish" keyword', () => {
            const needs = detectLiveDataNeed('Mumbai mein barish ho rahi hai kya');
            assert.equal(needs.length, 1);
            assert.equal(needs[0].type, 'weather');
            assert.equal(needs[0].city, 'Mumbai');
        });

        it('detects "thand" (cold) keyword', () => {
            const needs = detectLiveDataNeed('Shimla mein thand hai kya');
            assert.equal(needs.length, 1);
            assert.equal(needs[0].type, 'weather');
            assert.equal(needs[0].city, 'Shimla');
        });

        it('detects English "weather" keyword', () => {
            const needs = detectLiveDataNeed('What is the weather in Chennai');
            assert.equal(needs.length, 1);
            assert.equal(needs[0].type, 'weather');
            assert.equal(needs[0].city, 'Chennai');
        });

        it('detects Tamil weather keyword "mazhai"', () => {
            const needs = detectLiveDataNeed('mazhai varutha');
            assert.equal(needs.length, 1);
            assert.equal(needs[0].type, 'weather');
        });

        it('detects Bengali weather keyword "brishti"', () => {
            const needs = detectLiveDataNeed('aaj brishti hobe ki');
            assert.equal(needs.length, 1);
            assert.equal(needs[0].type, 'weather');
        });

        it('defaults city to Delhi when no city specified', () => {
            const needs = detectLiveDataNeed('mausam kaisa hai');
            assert.equal(needs.length, 1);
            assert.equal(needs[0].type, 'weather');
            assert.equal(needs[0].city, 'Delhi');
        });
    });

    // ── City Extraction (tested indirectly via weather) ──

    describe('city extraction via weather detection', () => {
        it('extracts Devanagari city name (पटना)', () => {
            const needs = detectLiveDataNeed('पटना में मौसम');
            assert.equal(needs[0].city, 'Patna');
        });

        it('extracts two-word city (nai dilli)', () => {
            const needs = detectLiveDataNeed('nai dilli mein mausam');
            assert.equal(needs[0].city, 'New Delhi');
        });

        it('extracts colloquial name (bambai → Mumbai)', () => {
            const needs = detectLiveDataNeed('bambai mein weather');
            assert.equal(needs[0].city, 'Mumbai');
        });

        it('extracts state name mapping (bihar → Patna)', () => {
            const needs = detectLiveDataNeed('bihar mein mausam');
            assert.equal(needs[0].city, 'Patna');
        });

        it('extracts Varanasi via alias "banaras"', () => {
            const needs = detectLiveDataNeed('banaras mein garmi');
            assert.equal(needs[0].city, 'Varanasi');
        });

        it('extracts Varanasi via alias "kashi"', () => {
            const needs = detectLiveDataNeed('kashi mein mausam');
            assert.equal(needs[0].city, 'Varanasi');
        });

        it('extracts Devanagari two-word city (नई दिल्ली)', () => {
            const needs = detectLiveDataNeed('नई दिल्ली में बारिश');
            assert.equal(needs[0].city, 'New Delhi');
        });
    });

    // ── News Detection ──

    describe('news keywords', () => {
        it('detects Hindi "khabar"', () => {
            const needs = detectLiveDataNeed('aaj ki khabar batao');
            assert.equal(needs.length, 1);
            assert.equal(needs[0].type, 'news');
        });

        it('detects Devanagari "समाचार"', () => {
            const needs = detectLiveDataNeed('आज का समाचार');
            assert.equal(needs.length, 1);
            assert.equal(needs[0].type, 'news');
        });

        it('detects English "news"', () => {
            const needs = detectLiveDataNeed('Tell me the latest news');
            assert.equal(needs.length, 1);
            assert.equal(needs[0].type, 'news');
        });

        it('detects Telugu "vaarthalu"', () => {
            const needs = detectLiveDataNeed('ee roju vaarthalu emi');
            assert.equal(needs.length, 1);
            assert.equal(needs[0].type, 'news');
        });
    });

    // ── Gold Detection ──

    describe('gold keywords', () => {
        it('detects "sone ka bhav"', () => {
            const needs = detectLiveDataNeed('aaj sone ka bhav kya hai');
            assert.equal(needs.length, 1);
            assert.equal(needs[0].type, 'gold');
        });

        it('detects Devanagari "सोना"', () => {
            const needs = detectLiveDataNeed('सोने की कीमत');
            assert.equal(needs.length, 1);
            assert.equal(needs[0].type, 'gold');
        });

        it('detects English "gold"', () => {
            const needs = detectLiveDataNeed('gold rate today');
            assert.equal(needs.length, 1);
            assert.equal(needs[0].type, 'gold');
        });

        it('detects Tamil "thangam"', () => {
            const needs = detectLiveDataNeed('thangam vilai enna');
            assert.equal(needs.length, 1);
            assert.equal(needs[0].type, 'gold');
        });

        it('does NOT detect gold when crop context present (fasal)', () => {
            const needs = detectLiveDataNeed('fasal ka sone jaisa bhav');
            // Should NOT be gold — 'fasal' should suppress gold detection
            const goldNeeds = needs.filter(n => n.type === 'gold');
            assert.equal(goldNeeds.length, 0);
        });
    });

    // ── Web Search Detection ──

    describe('web search keywords', () => {
        it('detects "petrol" price query', () => {
            const needs = detectLiveDataNeed('petrol ka rate kya hai');
            assert.ok(needs.some(n => n.type === 'web_search'));
        });

        it('detects cricket/sports query', () => {
            const needs = detectLiveDataNeed('ind vs aus match ka score');
            assert.ok(needs.some(n => n.type === 'web_search'));
        });

        it('detects train query', () => {
            const needs = detectLiveDataNeed('Delhi se Patna train kab aayegi');
            assert.ok(needs.some(n => n.type === 'web_search'));
        });

        it('detects "naukri" (job) query', () => {
            const needs = detectLiveDataNeed('sarkari naukri ki vacancy');
            assert.ok(needs.some(n => n.type === 'web_search'));
        });

        it('detects Devanagari "पेट्रोल"', () => {
            const needs = detectLiveDataNeed('पेट्रोल का दाम');
            assert.ok(needs.some(n => n.type === 'web_search'));
        });

        it('detects exam result query', () => {
            const needs = detectLiveDataNeed('UPSC result kab aayega');
            assert.ok(needs.some(n => n.type === 'web_search'));
        });
    });

    // ── No Match ──

    describe('no match cases', () => {
        it('returns empty for greeting', () => {
            const needs = detectLiveDataNeed('namaste kaise ho');
            assert.equal(needs.length, 0);
        });

        it('returns empty for general question', () => {
            const needs = detectLiveDataNeed('chai kaise banaate hain');
            assert.equal(needs.length, 0);
        });

        it('returns empty for empty string', () => {
            const needs = detectLiveDataNeed('');
            assert.equal(needs.length, 0);
        });
    });

    // ── Priority: weather/news/gold take precedence over web_search ──

    describe('API priority', () => {
        it('weather keywords do NOT also trigger web_search', () => {
            const needs = detectLiveDataNeed('Delhi mein mausam');
            assert.equal(needs.length, 1);
            assert.equal(needs[0].type, 'weather');
        });

        it('news keywords do NOT also trigger web_search', () => {
            const needs = detectLiveDataNeed('aaj ki khabar');
            assert.equal(needs.length, 1);
            assert.equal(needs[0].type, 'news');
        });
    });
});
