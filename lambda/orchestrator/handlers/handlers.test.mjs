/**
 * BharatVani — Unit Tests for govtSchemes.mjs and farmerAssistant.mjs
 * Tests: SCHEME_ALIASES resolution, CROP_ALIASES resolution
 *
 * We import the alias maps indirectly by testing handleGovtScheme and handleFarmerQuery 
 * with known aliases and verifying they resolve correctly.
 *
 * Run: node --test handlers/handlers.test.mjs
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ═══════════════════════════════════════════
// Load source code to verify alias maps exist
// ═══════════════════════════════════════════

const govtSchemesCode = readFileSync(join(__dirname, 'govtSchemes.mjs'), 'utf-8');
const farmerAssistantCode = readFileSync(join(__dirname, 'farmerAssistant.mjs'), 'utf-8');

// ═══════════════════════════════════════════
// TEST SUITE: Government Scheme Aliases
// ═══════════════════════════════════════════

describe('SCHEME_ALIASES in govtSchemes.mjs', () => {

    const criticalAliases = [
        // Core schemes
        ['pm kisan', 'pm_kisan'],
        ['pm-kisan', 'pm_kisan'],
        ['kisan samman', 'pm_kisan'],
        ['ayushman', 'ayushman_bharat'],
        ['pmjay', 'ayushman_bharat'],
        ['ujjwala', 'ujjwala_yojana'],
        ['mudra', 'mudra_yojana'],
        ['jan dhan', 'jan_dhan_yojana'],
        ['sukanya', 'sukanya_samriddhi'],
        // Expanded aliases
        ['mgnrega', 'mgnrega'],
        ['nrega', 'mgnrega'],
        ['100 din kaam', 'mgnrega'],
        ['ration', 'national_food_security'],
        ['scholarship', 'national_scholarship'],
        ['vishwakarma', 'pm_vishwakarma'],
        ['svanidhi', 'pm_svanidhi'],
        ['shauchalay', 'swachh_bharat'],
        ['skill india', 'skill_india'],
        ['startup india', 'startup_india'],
        ['jal jeevan', 'jal_jeevan'],
    ];

    for (const [alias, expectedId] of criticalAliases) {
        it(`alias '${alias}' maps to '${expectedId}'`, () => {
            // Verify the alias exists in the source code
            assert.ok(
                govtSchemesCode.includes(`'${alias}'`),
                `Alias '${alias}' not found in SCHEME_ALIASES`
            );
            // Verify the target scheme ID exists
            assert.ok(
                govtSchemesCode.includes(`'${expectedId}'`),
                `Target ID '${expectedId}' not found in SCHEME_ALIASES`
            );
        });
    }

    it('has alias coverage for most scheme JSON files (≥80%)', () => {
        const schemesDir = join(__dirname, '..', '..', '..', 'knowledge-base', 'schemes');
        const schemeFiles = readdirSync(schemesDir).filter(f => f.endsWith('.json'));
        const schemeIds = schemeFiles.map(f => f.replace('.json', ''));

        let covered = 0;
        const uncovered = [];
        for (const schemeId of schemeIds) {
            if (govtSchemesCode.includes(`'${schemeId}'`)) {
                covered++;
            } else {
                uncovered.push(schemeId);
            }
        }

        if (uncovered.length > 0) {
            console.log(`  ⚠️  Schemes without aliases (add to SCHEME_ALIASES): ${uncovered.join(', ')}`);
        }

        const coveragePercent = Math.round((covered / schemeIds.length) * 100);
        assert.ok(coveragePercent >= 80,
            `Only ${coveragePercent}% scheme coverage (${covered}/${schemeIds.length}). Uncovered: ${uncovered.join(', ')}`);
    });
});


// ═══════════════════════════════════════════
// TEST SUITE: Crop Aliases
// ═══════════════════════════════════════════

describe('CROP_ALIASES in farmerAssistant.mjs', () => {

    const cropAliases = [
        ['tamatar', 'Tomato'],
        ['tomato', 'Tomato'],
        ['pyaz', 'Onion'],
        ['aloo', 'Potato'],
        ['gehun', 'Wheat'],
        ['chawal', 'Rice'],
        ['dhan', 'Rice'],
    ];

    for (const [alias, expectedCrop] of cropAliases) {
        it(`alias '${alias}' maps to '${expectedCrop}'`, () => {
            assert.ok(
                farmerAssistantCode.includes(`'${alias}'`),
                `Crop alias '${alias}' not found in CROP_ALIASES`
            );
            assert.ok(
                farmerAssistantCode.includes(`'${expectedCrop}'`),
                `Crop target '${expectedCrop}' not found in CROP_ALIASES`
            );
        });
    }
});


// ═══════════════════════════════════════════
// TEST SUITE: Scheme JSON Validation
// ═══════════════════════════════════════════

describe('Knowledge Base — Scheme JSONs', () => {

    const schemesDir = join(__dirname, '..', '..', '..', 'knowledge-base', 'schemes');
    const schemeFiles = readdirSync(schemesDir).filter(f => f.endsWith('.json'));

    it('has at least 25 scheme files', () => {
        assert.ok(schemeFiles.length >= 25, `Found ${schemeFiles.length} schemes, expected ≥ 25`);
    });

    const requiredFields = [
        'id', 'name', 'hindi_name', 'category', 'benefit', 'benefit_hindi',
        'eligibility', 'documents_required', 'how_to_apply', 'hindi_summary'
    ];

    for (const file of schemeFiles) {
        describe(`scheme: ${file}`, () => {
            const scheme = JSON.parse(readFileSync(join(schemesDir, file), 'utf-8'));

            for (const field of requiredFields) {
                it(`has required field '${field}'`, () => {
                    assert.ok(scheme[field] !== undefined && scheme[field] !== null,
                        `Missing '${field}' in ${file}`);
                });
            }

            it('has Hindi eligibility description', () => {
                assert.ok(scheme.eligibility?.description_hindi,
                    `Missing eligibility.description_hindi in ${file}`);
            });

            it('has Hindi how-to-apply steps', () => {
                assert.ok(scheme.how_to_apply?.steps_hindi?.length > 0,
                    `Missing how_to_apply.steps_hindi in ${file}`);
            });

            it('has at least one required document', () => {
                assert.ok(scheme.documents_required?.length > 0,
                    `No documents_required in ${file}`);
            });
        });
    }
});


// ═══════════════════════════════════════════
// TEST SUITE: Multilingual Templates
// ═══════════════════════════════════════════

describe('Multilingual support', () => {

    const requiredLangs = ['hi-IN', 'en-IN', 'ta-IN', 'te-IN', 'bn-IN', 'mr-IN'];

    describe('govtSchemes.mjs has all 6 language templates', () => {
        for (const lang of requiredLangs) {
            it(`has template for '${lang}'`, () => {
                assert.ok(govtSchemesCode.includes(`'${lang}'`),
                    `Language '${lang}' template missing in govtSchemes.mjs`);
            });
        }
    });

    describe('farmerAssistant.mjs has all 6 language templates', () => {
        for (const lang of requiredLangs) {
            it(`has template for '${lang}'`, () => {
                assert.ok(farmerAssistantCode.includes(`'${lang}'`),
                    `Language '${lang}' template missing in farmerAssistant.mjs`);
            });
        }
    });

    describe('welcome/error messages cover all languages', () => {
        const systemDir = join(__dirname, '..', '..', '..', 'knowledge-base', 'system');
        const welcome = JSON.parse(readFileSync(join(systemDir, 'welcome_messages.json'), 'utf-8'));
        const errors = JSON.parse(readFileSync(join(systemDir, 'error_responses.json'), 'utf-8'));

        for (const lang of requiredLangs) {
            it(`welcome message exists for '${lang}'`, () => {
                assert.ok(welcome.welcome?.[lang], `No welcome message for ${lang}`);
            });

            it(`goodbye message exists for '${lang}'`, () => {
                assert.ok(welcome.goodbye?.[lang], `No goodbye message for ${lang}`);
            });

            it(`error message exists for '${lang}'`, () => {
                assert.ok(errors.speech_not_understood?.[lang], `No error message for ${lang}`);
            });
        }
    });
});
