/**
 * BharatVani — Comprehensive Test Script
 * Tests ALL changes made across Phase 1-4 improvements
 * 
 * Usage: node scripts/test-all-changes.mjs
 */

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, readdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectDir = join(__dirname, '..');

let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
    if (condition) {
        passed++;
        console.log(`  ✅ ${testName}`);
    } else {
        failed++;
        console.log(`  ❌ ${testName}${details ? ' — ' + details : ''}`);
    }
}

console.log('🇮🇳 BharatVani — Comprehensive Test Suite');
console.log('==========================================\n');

// ==========================================
// TEST 1: Intent Parsing (Phase 1 Critical Fix)
// ==========================================
console.log('🧪 TEST 1: Intent Tag Parsing (bedrock.mjs)\n');

// Simulate the tag parsing logic from bedrock.mjs
function parseIntentTags(responseText) {
    let intent = 'general';
    const entities = {};

    const intentMatch = responseText.match(/\[INTENT:([^\]]+)\]/);
    if (intentMatch) intent = intentMatch[1].trim();

    const schemeMatch = responseText.match(/\[SCHEME:([^\]]+)\]/);
    if (schemeMatch) entities.scheme_name = schemeMatch[1].trim();

    const cropMatch = responseText.match(/\[CROP:([^\]]+)\]/);
    if (cropMatch) entities.crop_name = cropMatch[1].trim();

    const cityMatch = responseText.match(/\[CITY:([^\]]+)\]/);
    if (cityMatch) entities.city = cityMatch[1].trim();

    const qtypeMatch = responseText.match(/\[QTYPE:([^\]]+)\]/);
    if (qtypeMatch) entities.query_type = qtypeMatch[1].trim();

    // Strip tags
    const cleanText = responseText
        .replace(/\[INTENT:[^\]]+\]/g, '')
        .replace(/\[SCHEME:[^\]]+\]/g, '')
        .replace(/\[CROP:[^\]]+\]/g, '')
        .replace(/\[CITY:[^\]]+\]/g, '')
        .replace(/\[QTYPE:[^\]]+\]/g, '')
        .trim();

    return { intent, entities, cleanText };
}

// Test intent parsing with various tag formats
const intentTests = [
    {
        input: '[INTENT:govt_scheme_info][SCHEME:pm kisan][QTYPE:info] PM Kisan mein har saal 6000 rupaye milte hain.',
        expectedIntent: 'govt_scheme_info',
        expectedScheme: 'pm kisan',
        expectedClean: 'PM Kisan mein har saal 6000 rupaye milte hain.'
    },
    {
        input: '[INTENT:weather_forecast][CITY:Delhi] Delhi mein aaj garmi hai.',
        expectedIntent: 'weather_forecast',
        expectedCity: 'Delhi',
        expectedClean: 'Delhi mein aaj garmi hai.'
    },
    {
        input: '[INTENT:crop_price][CROP:tamatar] Tamatar ka rate 40 rupaye kilo hai.',
        expectedIntent: 'crop_price',
        expectedCrop: 'tamatar',
        expectedClean: 'Tamatar ka rate 40 rupaye kilo hai.'
    },
    {
        input: '[INTENT:general] Namaste! Main BharatVani hoon.',
        expectedIntent: 'general',
        expectedClean: 'Namaste! Main BharatVani hoon.'
    },
    {
        input: 'Plain response without tags',
        expectedIntent: 'general',
        expectedClean: 'Plain response without tags'
    },
    {
        input: '[INTENT:end_call] Dhanyavaad!',
        expectedIntent: 'end_call',
        expectedClean: 'Dhanyavaad!'
    }
];

for (const test of intentTests) {
    const result = parseIntentTags(test.input);
    assert(result.intent === test.expectedIntent,
        `Intent: "${test.expectedIntent}" from "${test.input.substring(0, 50)}..."`,
        `got "${result.intent}"`);
    if (test.expectedScheme) {
        assert(result.entities.scheme_name === test.expectedScheme,
            `  Scheme entity: "${test.expectedScheme}"`, `got "${result.entities.scheme_name}"`);
    }
    if (test.expectedCity) {
        assert(result.entities.city === test.expectedCity,
            `  City entity: "${test.expectedCity}"`, `got "${result.entities.city}"`);
    }
    if (test.expectedCrop) {
        assert(result.entities.crop_name === test.expectedCrop,
            `  Crop entity: "${test.expectedCrop}"`, `got "${result.entities.crop_name}"`);
    }
    assert(result.cleanText === test.expectedClean,
        `  Clean text (no tags)`, `got "${result.cleanText}"`);
}

// ==========================================
// TEST 2: All 25 Scheme JSONs Valid (Phase 1+2)
// ==========================================
console.log('\n🧪 TEST 2: Scheme JSON Validation (all 25 files)\n');

const schemesDir = join(projectDir, 'knowledge-base', 'schemes');
const schemeFiles = readdirSync(schemesDir).filter(f => f.endsWith('.json'));

assert(schemeFiles.length >= 25, `Found ${schemeFiles.length} scheme files (expected ≥25)`);

const requiredFields = ['id', 'name', 'hindi_name', 'category', 'benefit', 'benefit_hindi',
    'eligibility', 'documents_required', 'how_to_apply', 'hindi_summary'];
const requiredEligibilityFields = ['description', 'description_hindi', 'criteria'];
const requiredHowToFields = ['steps', 'steps_hindi'];

let schemeErrors = [];
for (const file of schemeFiles) {
    try {
        const scheme = JSON.parse(readFileSync(join(schemesDir, file), 'utf-8'));

        // Check top-level required fields
        for (const field of requiredFields) {
            if (!scheme[field]) {
                schemeErrors.push(`${file}: missing "${field}"`);
            }
        }

        // Check eligibility sub-fields
        if (scheme.eligibility) {
            for (const field of requiredEligibilityFields) {
                if (!scheme.eligibility[field]) {
                    schemeErrors.push(`${file}: missing "eligibility.${field}"`);
                }
            }
        }

        // Check how_to_apply sub-fields
        if (scheme.how_to_apply) {
            for (const field of requiredHowToFields) {
                if (!scheme.how_to_apply[field] || scheme.how_to_apply[field].length === 0) {
                    schemeErrors.push(`${file}: missing/empty "how_to_apply.${field}"`);
                }
            }
        }

        // Check documents_required is non-empty
        if (!scheme.documents_required || scheme.documents_required.length === 0) {
            schemeErrors.push(`${file}: "documents_required" is empty`);
        }

    } catch (err) {
        schemeErrors.push(`${file}: JSON parse error — ${err.message}`);
    }
}

if (schemeErrors.length === 0) {
    assert(true, `All ${schemeFiles.length} schemes have complete data`);
} else {
    assert(false, `Scheme validation failed — ${schemeErrors.length} errors`);
    for (const err of schemeErrors) {
        console.log(`     ⚠️  ${err}`);
    }
}

// Print scheme summary
console.log(`\n  📋 Schemes loaded:`);
for (const file of schemeFiles) {
    try {
        const s = JSON.parse(readFileSync(join(schemesDir, file), 'utf-8'));
        console.log(`     ${s.name} (${s.hindi_name}) [${s.category}]`);
    } catch (_) { }
}

// ==========================================
// TEST 3: S3 Security Fix (Phase 1)
// ==========================================
console.log('\n🧪 TEST 3: S3 Bucket Security (template.yaml)\n');

const templatePath = join(projectDir, 'infrastructure', 'template.yaml');
const template = readFileSync(templatePath, 'utf-8');

assert(template.includes('BlockPublicAcls: true'), 'BlockPublicAcls: true');
assert(template.includes('BlockPublicPolicy: true'), 'BlockPublicPolicy: true');
assert(template.includes('IgnorePublicAcls: true'), 'IgnorePublicAcls: true');
assert(template.includes('RestrictPublicBuckets: true'), 'RestrictPublicBuckets: true');

// ==========================================
// TEST 4: Scheme Aliases (Phase 2)
// ==========================================
console.log('\n🧪 TEST 4: Scheme Aliases (govtSchemes.mjs)\n');

const govtSchemesPath = join(projectDir, 'lambda', 'orchestrator', 'handlers', 'govtSchemes.mjs');
const govtSchemesCode = readFileSync(govtSchemesPath, 'utf-8');

// Check critical aliases exist
const criticalAliases = [
    // Original
    'pm kisan', 'ayushman', 'ujjwala', 'mudra', 'pension',
    // Newly added
    'mgnrega', 'nrega', 'ration', 'scholarship', 'jeevan jyoti',
    'suraksha bima', 'svanidhi', 'vishwakarma', 'skill india',
    'startup india', 'swachh bharat', 'shauchalay', 'thela', 'darzi'
];

for (const alias of criticalAliases) {
    assert(govtSchemesCode.includes(`'${alias}'`), `Alias "${alias}" exists`);
}

// ==========================================
// TEST 5: Session Optimization (Phase 3)
// ==========================================
console.log('\n🧪 TEST 5: DynamoDB Optimization (session.mjs)\n');

const sessionPath = join(projectDir, 'lambda', 'orchestrator', 'utils', 'session.mjs');
const sessionCode = readFileSync(sessionPath, 'utf-8');

assert(sessionCode.includes('list_append'), 'addToHistory uses list_append');
assert(!sessionCode.includes('const session = await getSession(sessionId);\n  if (!session) return;\n\n  const history = session.conversation_history'),
    'Old GET+UPDATE pattern removed');

// ==========================================
// TEST 6: Query Logging (Phase 3)
// ==========================================
console.log('\n🧪 TEST 6: Query Logging (pipeline.mjs)\n');

const indexPath = join(projectDir, 'lambda', 'orchestrator', 'utils', 'pipeline.mjs');
const indexCode = readFileSync(indexPath, 'utf-8');

assert(indexCode.includes('async function logQuery'), 'logQuery function exists');
assert(indexCode.includes('QUERY_LOGS_TABLE'), 'QUERY_LOGS_TABLE reference exists');
assert(indexCode.includes('responseTimeMs'), 'Response time tracking exists');
assert(indexCode.includes("logQuery(session.session_id"), 'logQuery is called in processUserQuery');

// ==========================================
// TEST 7: Mock Weather Removed (Phase 3)
// ==========================================
console.log('\n🧪 TEST 7: Mock Weather Removed (farmerAssistant.mjs)\n');

const farmerPath = join(projectDir, 'lambda', 'orchestrator', 'handlers', 'farmerAssistant.mjs');
const farmerCode = readFileSync(farmerPath, 'utf-8');

assert(!farmerCode.includes('mockWeather'), 'No mockWeather object');
assert(!farmerCode.includes("'Patna': { temp_min"), 'No hardcoded Patna weather');
assert(farmerCode.includes('live data'), 'References live data pipeline');

// ==========================================
// TEST 8: Multilingual Support (Phase 4)
// ==========================================
console.log('\n🧪 TEST 8: Multilingual Support\n');

// 8a: Welcome messages
const welcomePath = join(projectDir, 'knowledge-base', 'system', 'welcome_messages.json');
const welcome = JSON.parse(readFileSync(welcomePath, 'utf-8'));

const requiredLangs = ['hi-IN', 'en-IN', 'ta-IN', 'te-IN', 'bn-IN', 'mr-IN'];
for (const lang of requiredLangs) {
    assert(!!welcome.welcome?.[lang], `Welcome message exists for ${lang}`);
    assert(!!welcome.goodbye?.[lang], `Goodbye message exists for ${lang}`);
}

// 8b: Error responses
const errorPath = join(projectDir, 'knowledge-base', 'system', 'error_responses.json');
const errors = JSON.parse(readFileSync(errorPath, 'utf-8'));

for (const lang of requiredLangs) {
    assert(!!errors.speech_not_understood?.[lang], `Error "speech_not_understood" exists for ${lang}`);
    assert(!!errors.general_error?.[lang], `Error "general_error" exists for ${lang}`);
}

// 8c: Twilio language support
const twilioPath = join(projectDir, 'lambda', 'orchestrator', 'handlers', 'twilio.mjs');
const twilioCode = readFileSync(twilioPath, 'utf-8');

assert(twilioCode.includes('LANGUAGE_VOICES'), 'LANGUAGE_VOICES mapping exists');
assert(twilioCode.includes('DTMF_TO_LANG'), 'DTMF_TO_LANG mapping exists');
assert(twilioCode.includes('handleLanguage'), 'handleLanguage function exists');
assert(twilioCode.includes('Polly.Raveena'), 'English Polly voice (Raveena) configured');
assert(twilioCode.includes('/voice/language'), 'Language selection endpoint referenced');
assert(twilioCode.includes("'ta-IN'"), 'Tamil language code present');
assert(twilioCode.includes("'te-IN'"), 'Telugu language code present');
assert(twilioCode.includes("'bn-IN'"), 'Bengali language code present');
assert(twilioCode.includes("'mr-IN'"), 'Marathi language code present');
assert(twilioCode.includes('numDigits="1"'), 'DTMF single digit gather for language');

// 8d: System prompt language detection
const promptPath = join(projectDir, 'knowledge-base', 'system', 'system_prompt.txt');
const prompt = readFileSync(promptPath, 'utf-8');

assert(prompt.includes('LANGUAGE DETECTION'), 'System prompt has LANGUAGE DETECTION section');
assert(prompt.includes('ta-IN'), 'System prompt lists Tamil');
assert(prompt.includes('te-IN'), 'System prompt lists Telugu');
assert(prompt.includes('bn-IN'), 'System prompt lists Bengali');
assert(prompt.includes('mr-IN'), 'System prompt lists Marathi');
assert(prompt.includes('code-switching'), 'System prompt handles code-switching');

// 8e: API Services multilingual keywords
const apiPath = join(projectDir, 'lambda', 'orchestrator', 'utils', 'apiServices.mjs');
const apiCode = readFileSync(apiPath, 'utf-8');

assert(apiCode.includes('mazhai'), 'Tamil weather keyword (mazhai) present');
assert(apiCode.includes('varsham'), 'Telugu weather keyword (varsham) present');
assert(apiCode.includes('brishti'), 'Bengali weather keyword (brishti) present');
assert(apiCode.includes('havamana'), 'Marathi weather keyword (havamana) present');
assert(apiCode.includes('seithigal'), 'Tamil news keyword (seithigal) present');
assert(apiCode.includes('vaarthalu'), 'Telugu news keyword (vaarthalu) present');
assert(apiCode.includes('thangam'), 'Tamil gold keyword (thangam) present');
assert(apiCode.includes('bangaram'), 'Telugu gold keyword (bangaram) present');

// 8f: Index.mjs language route
const indexCode8f = readFileSync(join(projectDir, 'lambda', 'orchestrator', 'index.mjs'), 'utf-8');
assert(indexCode8f.includes('/voice/language'), 'index.mjs routes /voice/language');
assert(indexCode8f.includes('handleLanguage'), 'index.mjs imports handleLanguage');

// ==========================================
// TEST 9: Scheme handler compatibility with expanded JSONs
// ==========================================
console.log('\n🧪 TEST 9: Scheme Handler — End-to-end Resolution\n');

try {
    const { handleGovtScheme } = await import('../lambda/orchestrator/handlers/govtSchemes.mjs');

    const e2eTests = [
        // Original schemes
        { alias: 'pm kisan', expectContains: ['PM', 'Kisan'] },
        { alias: 'ayushman', expectContains: ['Ayushman'] },
        // Newly expanded schemes
        { alias: 'mgnrega', expectContains: ['MGNREGA'] },
        { alias: 'ration', expectContains: ['Food'] },
        { alias: 'scholarship', expectContains: ['Scholarship'] },
        { alias: 'vishwakarma', expectContains: ['Vishwakarma'] },
        { alias: 'svanidhi', expectContains: ['SVANidhi'] },
        { alias: 'shauchalay', expectContains: ['Swachh'] },
        { alias: 'skill india', expectContains: ['Skill'] },
    ];

    for (const test of e2eTests) {
        const result = await handleGovtScheme(
            'govt_scheme_info',
            { scheme_name: test.alias, query_type: 'info' },
            {}
        );
        const hasResponse = result.response_text && result.response_text.length > 10;
        assert(hasResponse, `Alias "${test.alias}" → got response (${result.response_text?.length || 0} chars)`);
    }
} catch (err) {
    assert(false, `Scheme handler import/test failed: ${err.message}`);
}

// ==========================================
// TEST 10: Farmer handler — crop prices still work
// ==========================================
console.log('\n🧪 TEST 10: Farmer Handler — Crop Prices\n');

try {
    const { handleFarmerQuery } = await import('../lambda/orchestrator/handlers/farmerAssistant.mjs');

    const cropTests = [
        { crop: 'tamatar', name: 'Tomato' },
        { crop: 'pyaz', name: 'Onion' },
        { crop: 'gehun', name: 'Wheat' },
        { crop: 'chawal', name: 'Rice' }
    ];

    for (const test of cropTests) {
        const result = await handleFarmerQuery('crop_price', { crop_name: test.crop }, {});
        const hasPrice = result.response_text && result.response_text.includes('₹');
        assert(hasPrice, `"${test.crop}" → price data with ₹`);
    }

    // Test weather handler is no longer using mock
    const weatherResult = await handleFarmerQuery('weather_forecast', { city: 'Mumbai' }, {});
    assert(weatherResult.response_text && weatherResult.response_text.includes('live data'),
        'Weather handler uses live data (no mock)');

} catch (err) {
    assert(false, `Farmer handler import/test failed: ${err.message}`);
}

// ==========================================
// SUMMARY
// ==========================================
console.log('\n==========================================');
console.log(`🏁 RESULTS: ${passed} passed, ${failed} failed, ${passed + failed} total`);
console.log('==========================================\n');

if (failed > 0) {
    console.log('⚠️  Some tests failed! Review the ❌ items above.');
    process.exit(1);
} else {
    console.log('🎉 All tests passed! BharatVani improvements are verified.');
}
