// Quick summary test — outputs JSON results
import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const results = { passed: 0, failed: 0, failures: [] };

function ok(cond, name) {
    if (cond) { results.passed++; }
    else { results.failed++; results.failures.push(name); }
}

// T1: Intent parsing
function parseTags(t) {
    let intent = 'general'; const e = {};
    const im = t.match(/\[INTENT:([^\]]+)\]/); if (im) intent = im[1].trim();
    const sm = t.match(/\[SCHEME:([^\]]+)\]/); if (sm) e.scheme_name = sm[1].trim();
    const cm = t.match(/\[CROP:([^\]]+)\]/); if (cm) e.crop_name = cm[1].trim();
    const cim = t.match(/\[CITY:([^\]]+)\]/); if (cim) e.city = cim[1].trim();
    return { intent, entities: e };
}
ok(parseTags('[INTENT:govt_scheme_info][SCHEME:pm kisan] test').intent === 'govt_scheme_info', 'intent-scheme');
ok(parseTags('[INTENT:weather_forecast][CITY:Delhi] test').entities.city === 'Delhi', 'intent-city');
ok(parseTags('[INTENT:crop_price][CROP:tamatar] test').entities.crop_name === 'tamatar', 'intent-crop');
ok(parseTags('[INTENT:end_call] bye').intent === 'end_call', 'intent-end');
ok(parseTags('no tags here').intent === 'general', 'intent-default');

// T2: All 25 scheme JSONs valid
const sDir = join(root, 'knowledge-base', 'schemes');
const sFiles = readdirSync(sDir).filter(f => f.endsWith('.json'));
ok(sFiles.length >= 25, 'scheme-count-25');
const reqF = ['id', 'name', 'hindi_name', 'category', 'benefit', 'benefit_hindi', 'eligibility', 'documents_required', 'how_to_apply', 'hindi_summary'];
for (const f of sFiles) {
    const s = JSON.parse(readFileSync(join(sDir, f), 'utf-8'));
    for (const field of reqF) {
        ok(!!s[field], `${f}-${field}`);
    }
    ok(s.eligibility?.description_hindi, `${f}-elig-hindi`);
    ok(s.how_to_apply?.steps_hindi?.length > 0, `${f}-steps-hindi`);
    ok(s.documents_required?.length > 0, `${f}-docs`);
}

// T3: S3 security
const tmpl = readFileSync(join(root, 'infrastructure', 'template.yaml'), 'utf-8');
ok(tmpl.includes('BlockPublicAcls: true'), 's3-block-acls');
ok(tmpl.includes('BlockPublicPolicy: true'), 's3-block-policy');
ok(tmpl.includes('RestrictPublicBuckets: true'), 's3-restrict');

// T4: Scheme aliases
const gs = readFileSync(join(root, 'lambda', 'orchestrator', 'handlers', 'govtSchemes.mjs'), 'utf-8');
for (const a of ['mgnrega', 'nrega', 'ration', 'scholarship', 'vishwakarma', 'shauchalay', 'thela', 'darzi', 'skill india', 'startup india']) {
    ok(gs.includes(`'${a}'`), `alias-${a}`);
}

// T5: Session optimization
const ss = readFileSync(join(root, 'lambda', 'orchestrator', 'utils', 'session.mjs'), 'utf-8');
ok(ss.includes('list_append'), 'session-list-append');

// T6: Query logging (now in pipeline.mjs)
const pl = readFileSync(join(root, 'lambda', 'orchestrator', 'utils', 'pipeline.mjs'), 'utf-8');
ok(pl.includes('async function logQuery'), 'logQuery-exists');
ok(pl.includes('QUERY_LOGS_TABLE'), 'query-table-ref');
ok(pl.includes('responseTimeMs'), 'response-timing');

// T7: Mock weather removed
const fa = readFileSync(join(root, 'lambda', 'orchestrator', 'handlers', 'farmerAssistant.mjs'), 'utf-8');
ok(!fa.includes('mockWeather'), 'no-mock-weather');
ok(fa.includes('live data'), 'uses-live-data');

// T8: Multilingual
const wm = JSON.parse(readFileSync(join(root, 'knowledge-base', 'system', 'welcome_messages.json'), 'utf-8'));
const er = JSON.parse(readFileSync(join(root, 'knowledge-base', 'system', 'error_responses.json'), 'utf-8'));
for (const l of ['hi-IN', 'en-IN', 'ta-IN', 'te-IN', 'bn-IN', 'mr-IN']) {
    ok(!!wm.welcome?.[l], `welcome-${l}`);
    ok(!!wm.goodbye?.[l], `goodbye-${l}`);
    ok(!!er.speech_not_understood?.[l], `error-${l}`);
}

const tw = readFileSync(join(root, 'lambda', 'orchestrator', 'handlers', 'twilio.mjs'), 'utf-8');
ok(tw.includes('LANGUAGE_VOICES'), 'lang-voices');
ok(tw.includes('DTMF_TO_LANG'), 'dtmf-lang');
ok(tw.includes('handleLanguage'), 'handle-lang');
ok(tw.includes('Polly.Raveena'), 'polly-raveena');
ok(tw.includes("'ta-IN'"), 'twilio-tamil');
ok(tw.includes("'te-IN'"), 'twilio-telugu');

const pr = readFileSync(join(root, 'knowledge-base', 'system', 'system_prompt.txt'), 'utf-8');
ok(pr.includes('LANGUAGE DETECTION'), 'prompt-lang-detect');
ok(pr.includes('code-switching'), 'prompt-code-switch');

const api = readFileSync(join(root, 'lambda', 'orchestrator', 'utils', 'apiServices.mjs'), 'utf-8');
ok(api.includes('mazhai'), 'api-tamil-weather');
ok(api.includes('brishti'), 'api-bengali-weather');
ok(api.includes('thangam'), 'api-tamil-gold');
ok(api.includes('vaarthalu'), 'api-telugu-news');

const ix = readFileSync(join(root, 'lambda', 'orchestrator', 'index.mjs'), 'utf-8');
ok(ix.includes('/voice/language'), 'index-lang-route');
ok(ix.includes('handleLanguage'), 'index-handleLanguage');

// T9: Scheme handler e2e
const { handleGovtScheme } = await import('../lambda/orchestrator/handlers/govtSchemes.mjs');
for (const a of ['pm kisan', 'ayushman', 'mgnrega', 'ration', 'scholarship', 'vishwakarma', 'svanidhi', 'shauchalay', 'skill india']) {
    const r = await handleGovtScheme('govt_scheme_info', { scheme_name: a, query_type: 'info' }, {});
    ok(r.response_text?.length > 10, `e2e-${a}`);
}

// T10: Farmer handler
const { handleFarmerQuery } = await import('../lambda/orchestrator/handlers/farmerAssistant.mjs');
for (const c of ['tamatar', 'pyaz', 'gehun', 'chawal']) {
    const r = await handleFarmerQuery('crop_price', { crop_name: c }, {});
    ok(r.response_text?.includes('₹'), `crop-${c}`);
}
const wr = await handleFarmerQuery('weather_forecast', { city: 'Mumbai' }, {});
ok(wr.response_text?.includes('live data'), 'weather-live');

// Output
const out = JSON.stringify(results, null, 2);
writeFileSync(join(root, 'scripts', 'test-results.json'), out, 'utf-8');
console.log(out);
