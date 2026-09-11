import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('===============================================================');
console.log('   WORKMOJO LANGUAGE SELECTOR UI TEST SUITE');
console.log('===============================================================\n');

let passCount = 0;
async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ PASS: ${name}`);
    passCount++;
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    console.error(err);
    process.exit(1);
  }
}

// 1. Check Language Configuration & Supported Languages
await test('Language config defines all 4 required languages with native names', async () => {
  const langConfigContent = fs.readFileSync(path.join(rootDir, 'src/config/languageConfig.ts'), 'utf-8');
  assert(langConfigContent.includes('en: {'), 'Should define en');
  assert(langConfigContent.includes('te: {'), 'Should define te');
  assert(langConfigContent.includes('hi: {'), 'Should define hi');
  assert(langConfigContent.includes('ta: {'), 'Should define ta');
  assert(langConfigContent.includes('తెలుగు'), 'Should include Telugu native script');
  assert(langConfigContent.includes('हिन्दी'), 'Should include Hindi native script');
  assert(langConfigContent.includes('தமிழ்'), 'Should include Tamil native script');
});

// 2. Check Translations for all 4 languages
await test('Translations file defines complete dictionary for all 4 languages', async () => {
  const transContent = fs.readFileSync(path.join(rootDir, 'src/data/translations.ts'), 'utf-8');
  assert(transContent.includes('en: {'), 'Translations must contain en');
  assert(transContent.includes('te: {'), 'Translations must contain te');
  assert(transContent.includes('hi: {'), 'Translations must contain hi');
  assert(transContent.includes('ta: {'), 'Translations must contain ta');
});

// 3. Inspect LanguageSelector component
await test('LanguageSelector component implements clean icon, accessibility, and checkmark', async () => {
  const selectorFile = fs.readFileSync(path.join(rootDir, 'src/components/common/LanguageSelector.tsx'), 'utf-8');
  
  // Icon imports
  assert(selectorFile.includes('Languages') || selectorFile.includes('Globe2'), 'Must use Languages or Globe2 icon');
  assert(selectorFile.includes('Check'), 'Must use Check icon for active language');

  // Accessibility attributes
  assert(selectorFile.includes('aria-label="Change language"'), 'Must include aria-label="Change language"');
  assert(selectorFile.includes('title="Change language"'), 'Must include title="Change language"');
  assert(selectorFile.includes('aria-haspopup="menu"'), 'Must specify aria-haspopup');
  assert(selectorFile.includes('aria-expanded='), 'Must indicate aria-expanded');
  assert(selectorFile.includes('role="menu"'), 'Dropdown must have role="menu"');
  assert(selectorFile.includes('role="menuitemradio"'), 'Options must have role="menuitemradio"');

  // Supported languages in dropdown
  assert(selectorFile.includes("'English'"), 'Includes English name');
  assert(selectorFile.includes("'తెలుగు'"), 'Includes Telugu native name');
  assert(selectorFile.includes("'हिन्दी'"), 'Includes Hindi native name');
  assert(selectorFile.includes("'தமிழ்'"), 'Includes Tamil native name');

  // Viewport collision protection
  assert(
    selectorFile.includes('screenLeftWhenRightAligned') || selectorFile.includes('setMenuStyle') || selectorFile.includes('max-w-['),
    'Must implement viewport boundary protection'
  );

  // Click outside and escape listeners
  assert(selectorFile.includes('handleClickOutside'), 'Must handle click outside');
  assert(selectorFile.includes("'Escape'"), 'Must handle Escape key');
});

// 4. Inspect Header component
await test('Header component uses LanguageSelector without visible text buttons', async () => {
  const headerFile = fs.readFileSync(path.join(rootDir, 'src/components/common/Header.tsx'), 'utf-8');
  
  // Must import and use LanguageSelector
  assert(headerFile.includes('LanguageSelector'), 'Header must import and render LanguageSelector');
  assert(headerFile.includes('<LanguageSelector'), 'Header must render <LanguageSelector');

  // Must NOT contain old inline language button map or raw labels
  assert(!headerFile.includes("languages.map(lang =>"), 'Header must not have inline text button map');
  assert(!headerFile.includes("{ code: 'en', label: 'EN' }"), 'Old languages array must be removed');
});

// 5. Inspect FloatingMojoAssistant component
await test('FloatingMojoAssistant uses LanguageSelector and removed text pills', async () => {
  const mojoFile = fs.readFileSync(path.join(rootDir, 'src/components/mojo/FloatingMojoAssistant.tsx'), 'utf-8');
  
  // Must import and use LanguageSelector
  assert(mojoFile.includes('LanguageSelector'), 'Mojo must import LanguageSelector');
  assert(mojoFile.includes('<LanguageSelector'), 'Mojo must render LanguageSelector in top controls');

  // Must not have the old language pills bar with text
  assert(!mojoFile.includes('<span>Language:</span>'), 'Must remove visible Language: label');
  assert(!mojoFile.includes('languagesList.map'), 'Must remove old languagesList map');

  // Action handling
  assert(mojoFile.includes("res.action?.type === 'CHANGE_LANGUAGE'"), 'Must handle CHANGE_LANGUAGE action');
  assert(mojoFile.includes('setIsLangSelectorOpen(true)'), 'Action button opens LanguageSelector modal/dropdown');
});

// 6. Inspect AuthFlow component
await test('AuthFlow uses clean LanguageSelector without text buttons', async () => {
  const authFile = fs.readFileSync(path.join(rootDir, 'src/screens/auth/AuthFlow.tsx'), 'utf-8');
  
  // Must import and use LanguageSelector
  assert(authFile.includes('LanguageSelector'), 'AuthFlow must import LanguageSelector');
  assert(authFile.includes('<LanguageSelector'), 'AuthFlow must render LanguageSelector');

  // Must not have the old Select Language text bar
  assert(!authFile.includes('<span>Select Language:</span>'), 'Must remove Select Language text');
  assert(!authFile.includes('languages.map(l =>'), 'Must remove inline text buttons from auth header');
});

console.log('\n===============================================================');
console.log(`   ALL LANGUAGE SELECTOR TESTS PASSED! (${passCount} / 6)`);
console.log('===============================================================\n');
