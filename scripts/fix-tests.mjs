import { readFileSync, writeFileSync } from 'fs';

const path = 'e:/BharatVani/scripts/test-all-changes.mjs';
let code = readFileSync(path, 'utf-8');

// Undo the previous bad patch of TEST 8f (remove the duplicate const indexCode)
code = code.replace(
    "// 8f: Index.mjs language route\nconst indexPath8f = join(projectDir, 'lambda', 'orchestrator', 'index.mjs');\nconst indexCode = readFileSync(indexPath8f, 'utf-8');",
    "// 8f: Index.mjs language route\nconst indexCode8f = readFileSync(join(projectDir, 'lambda', 'orchestrator', 'index.mjs'), 'utf-8');"
);

// Fix TEST 8f to use indexCode8f instead of indexCode
code = code.replace(
    "assert(indexCode.includes('/voice/language'), 'index.mjs routes /voice/language');",
    "assert(indexCode8f.includes('/voice/language'), 'index.mjs routes /voice/language');"
);
code = code.replace(
    "assert(indexCode.includes('handleLanguage'), 'index.mjs imports handleLanguage');",
    "assert(indexCode8f.includes('handleLanguage'), 'index.mjs imports handleLanguage');"
);

writeFileSync(path, code);
console.log('Done! Fixed duplicate const indexCode.');
