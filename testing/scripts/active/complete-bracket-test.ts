import { execSync } from 'child_process';
import * as path from 'path';

/**
 * COMPLETE BRACKET GENERATION AND FORMATTING
 *
 * This script generates a perfectly formatted bracket using ONLY scripts - no external sheet dependencies.
 * All formulas, formatting rules, and data are generated from code.
 *
 * Workflow:
 * 1. Clear sheet completely (clear-sheet.ts)
 * 2. Apply ALL formatting from extracted rules (apply-formatting-standalone.ts) - 1995 cells, 460 borders, 16 merges
 * 3. Populate data with formulas (populate-test-sheet --skip-region-formatting)
 * 4. Fix championship cell and autosize columns (fix-test-sheet.ts)
 *
 * All formatting rules extracted from source sheet and codified in apply-formatting-standalone.ts.
 * All formulas come from generate-bracket.ts.
 * No external sheet references required during generation.
 *
 * Usage: npm run complete-bracket-test <sheet-id>
 * Example: npm run complete-bracket-test 1oInaAH5nZbFCwLnTKmbT5uYO2haFGkBCfPMDBSrmD6M
 */

const SHEET_ID = process.argv[2];

if (!SHEET_ID) {
  console.error('❌ Error: Sheet ID is required');
  console.error('Usage: npm run complete-bracket-test <sheet-id>');
  process.exit(1);
}

console.log('═══════════════════════════════════════════════════════════');
console.log('  🎨 COMPLETE BRACKET GENERATION');
console.log('═══════════════════════════════════════════════════════════');
console.log(`Sheet ID: ${SHEET_ID}\n`);

try {
  console.log('Step 1/4: Clearing sheet...');
  execSync(`npx ts-node testing/scripts/active/clear-sheet.ts ${SHEET_ID}`, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '../../..')
  });

  console.log('\nStep 2/4: Applying formatting from codified rules...');
  console.log('  Source: apply-formatting-standalone.ts (extracted from source sheet)');
  console.log('  Applying: 1995 cells, 460 borders, 16 merges, championship + winner formatting\n');
  execSync(`npx ts-node testing/scripts/active/apply-formatting-standalone.ts ${SHEET_ID}`, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '../../..')
  });

  console.log('\nStep 3/4: Populating data with formulas...');
  console.log('  Using --skip-region-formatting to preserve applied formatting\n');
  execSync(`npm run populate-test-sheet ${SHEET_ID} -- --skip-region-formatting`, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '../../..')
  });

  console.log('\nStep 4/4: Fixing championship cell and autosizing...');
  execSync(`npx ts-node testing/scripts/active/fix-test-sheet.ts ${SHEET_ID}`, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '../../..')
  });

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  ✅ BRACKET GENERATION COMPLETE!');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`\n🔗 View: https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`);
  console.log('\n📊 Summary:');
  console.log('  - Sheet cleared');
  console.log('  - Formatting applied from codified rules (1995 cells, 460 borders, 16 merges, championship + winner)');
  console.log('  - Data populated (136 formulas, 126 checkboxes, 64 participants)');
  console.log('  - Championship formula and columns autosized');
  console.log('  - Column X used for Round 3 names (no conflicts with AB)');
  console.log('\n✅ Result: Perfect bracket generated entirely from scripts!');
  console.log('💡 All formulas from generate-bracket.ts');
  console.log('💡 All formatting from apply-formatting-standalone.ts (extracted rules)');
  console.log('💡 No external sheet dependencies required');
  console.log('🎉 Ready for simulation or use!\n');

} catch (error: any) {
  console.error('\n❌ ERROR:', error.message);
  process.exit(1);
}
