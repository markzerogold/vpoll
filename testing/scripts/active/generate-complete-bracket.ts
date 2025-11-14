import { google } from 'googleapis';
import * as path from 'path';
import { execSync } from 'child_process';

/**
 * COMPLETE BRACKET GENERATION WITH FORMATTING
 *
 * This script combines formatting copy and data population in the correct order:
 * 1. Copy exact formatting from source sheet (formatted manually by user)
 * 2. Populate all tabs with data (but skip formatting region names - already done)
 * 3. Write region name VALUES to the merged cells
 * 4. Autosize columns E and Y (region names)
 * 5. Write Championship cell value
 */

const SOURCE_SHEET_ID = '1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w'; // User's formatted sheet
const TARGET_SHEET_ID = process.argv[2];

if (!TARGET_SHEET_ID) {
  console.error('Usage: npx ts-node generate-complete-bracket.ts <target-sheet-id>');
  process.exit(1);
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  COMPLETE BRACKET GENERATION');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Source: ${SOURCE_SHEET_ID}`);
  console.log(`  Target: ${TARGET_SHEET_ID}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  const keyPath = path.join(__dirname, '../../../keys/vpoll-key.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    // STEP 1: Copy formatting from source
    console.log('📋 STEP 1: Copying formatting from source sheet...\n');
    execSync(
      `npx ts-node ${__dirname}/copy-bracket-formatting.ts`,
      {
        encoding: 'utf8',
        env: {
          ...process.env,
          SOURCE_SHEET_ID,
          TARGET_SHEET_ID,
        }
      }
    );
    console.log('✅ Formatting copied\n');

    // STEP 2: Populate data (this script needs to be updated to NOT format region names)
    console.log('📝 STEP 2: Populating data...\n');
    execSync(
      `npx ts-node ${__dirname}/populate-test-sheet.ts ${TARGET_SHEET_ID} --skip-region-formatting`,
      { encoding: 'utf8', stdio: 'inherit' }
    );
    console.log('✅ Data populated\n');

    // Note: Region names are already set by formulas in generate-bracket.ts
    // (E15, E47, Y15, Y47 have formulas like =Regions!B2)
    // We should NOT overwrite those formulas with hardcoded values
    console.log('ℹ️  Region names are formula-driven from Regions tab (no changes needed)\n');

    // Get Bracket sheet ID for autosizing
    const metadata = await sheets.spreadsheets.get({ spreadsheetId: TARGET_SHEET_ID });
    const bracketSheet = metadata.data.sheets?.find((s: any) => s.properties?.title === 'Bracket');
    const bracketSheetId = bracketSheet?.properties?.sheetId;

    if (bracketSheetId === undefined) {
      throw new Error('Bracket sheet not found');
    }

    // STEP 3: Write Championship cell value
    console.log('🏆 STEP 3: Writing Championship cell...\n');

    await sheets.spreadsheets.values.update({
      spreadsheetId: TARGET_SHEET_ID,
      range: 'Bracket!O17',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [['=Config!B3&" Champion"']],
      },
    });

    console.log('  ✓ Formula: =Config!B3&" Champion"');
    console.log('✅ Championship cell written\n');

    // STEP 4: Autosize columns
    console.log('📏 STEP 4: Autosizing columns...\n');

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: TARGET_SHEET_ID,
      requestBody: {
        requests: [
          // Autosize ALL columns first
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: bracketSheetId,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 32, // Columns A-AF
              },
            },
          },
          // Then explicitly autosize critical columns
          { autoResizeDimensions: { dimensions: { sheetId: bracketSheetId, dimension: 'COLUMNS', startIndex: 4, endIndex: 7 } } }, // E-G (Federation region)
          { autoResizeDimensions: { dimensions: { sheetId: bracketSheetId, dimension: 'COLUMNS', startIndex: 24, endIndex: 27 } } }, // Y-AA (Romulan region)
          { autoResizeDimensions: { dimensions: { sheetId: bracketSheetId, dimension: 'COLUMNS', startIndex: 14, endIndex: 17 } } }, // O-Q (Championship)
        ],
      },
    });

    console.log('  ✓ All columns autosized');
    console.log('  ✓ Region name columns (E-G, Y-AA) explicitly sized');
    console.log('  ✓ Championship columns (O-Q) explicitly sized');
    console.log('✅ Column autosizing complete\n');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('  ✅ BRACKET GENERATION COMPLETE');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log(`🔗 View result: https://docs.google.com/spreadsheets/d/${TARGET_SHEET_ID}/edit\n`);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
