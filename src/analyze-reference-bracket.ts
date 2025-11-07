import { google } from 'googleapis';
import * as path from 'path';

/**
 * Analyze the reference sheet structure to understand correct bracket format
 * Reference: https://docs.google.com/spreadsheets/d/1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o/edit
 */

const REFERENCE_SHEET_ID = '1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o';

async function analyzeReferenceSheet() {
  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  console.log('📊 Analyzing reference sheet structure...\n');
  console.log('Reference: https://docs.google.com/spreadsheets/d/' + REFERENCE_SHEET_ID + '/edit\n');

  try {
    // Get metadata
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId: REFERENCE_SHEET_ID
    });

    console.log('Sheet title:', metadata.data.properties?.title);
    console.log('Tabs:', metadata.data.sheets?.map(s => s.properties?.title).join(', '));
    console.log('');

    // Read sample data from different sections
    console.log('=== BRACKET STRUCTURE SAMPLES ===\n');

    // Row 1 - Headers
    const row1 = await sheets.spreadsheets.values.get({
      spreadsheetId: REFERENCE_SHEET_ID,
      range: 'Bracket!A1:Z1',
    });
    console.log('Row 1 (Headers):');
    console.log(row1.data.values?.[0]?.map((v, i) => `  ${String.fromCharCode(65 + i)}: ${v || '(empty)'}`).join('\n'));
    console.log('');

    // Round 1 Match 1 (rows 2-3)
    const r1m1 = await sheets.spreadsheets.values.get({
      spreadsheetId: REFERENCE_SHEET_ID,
      range: 'Bracket!A2:E3',
    });
    console.log('Round 1 Match 1 (A2:E3):');
    r1m1.data.values?.forEach((row, idx) => {
      console.log('  Row ' + (idx + 2) + ': ' + row.map((v, i) => `${String.fromCharCode(65 + i)}="${v}"`).join(' | '));
    });
    console.log('');

    // Round 2 Match 1 (rows 4-5)
    const r2m1 = await sheets.spreadsheets.values.get({
      spreadsheetId: REFERENCE_SHEET_ID,
      range: 'Bracket!D4:E5',
    });
    console.log('Round 2 Match 1 (D4:E5):');
    r2m1.data.values?.forEach((row, idx) => {
      console.log('  Row ' + (idx + 4) + ': ' + row.map((v, i) => `${String.fromCharCode(68 + i)}="${v}"`).join(' | '));
    });
    console.log('');

    // Region header (row 17)
    const region1 = await sheets.spreadsheets.values.get({
      spreadsheetId: REFERENCE_SHEET_ID,
      range: 'Bracket!C17:E17',
    });
    console.log('Region header (C17:E17):');
    console.log('  ' + region1.data.values?.[0]?.map((v, i) => `${String.fromCharCode(67 + i)}="${v}"`).join(' | '));
    console.log('');

    // Championship section
    const champ = await sheets.spreadsheets.values.get({
      spreadsheetId: REFERENCE_SHEET_ID,
      range: 'Bracket!M15:O20',
    });
    console.log('Championship area (M15:O20):');
    champ.data.values?.forEach((row, idx) => {
      console.log('  Row ' + (idx + 15) + ': ' + (row?.map((v, i) => `${String.fromCharCode(77 + i)}="${v || ''}"`).join(' | ') || '(empty)'));
    });
    console.log('');

    // Get detailed grid data for formatting analysis
    console.log('=== DETAILED FORMATTING ANALYSIS ===\n');

    const gridData = await sheets.spreadsheets.get({
      spreadsheetId: REFERENCE_SHEET_ID,
      ranges: ['Bracket!A1:E5'],
      includeGridData: true,
    });

    const bracketSheet = gridData.data.sheets?.find(s => s.properties?.title === 'Bracket');
    const rows = bracketSheet?.data?.[0]?.rowData || [];

    console.log('Checking first 5 rows for merges and formatting:\n');

    for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
      const row = rows[rowIdx];
      if (!row.values) continue;

      for (let colIdx = 0; colIdx < Math.min(5, row.values.length); colIdx++) {
        const cell = row.values[colIdx];
        const cellRef = String.fromCharCode(65 + colIdx) + (rowIdx + 1);

        const effectiveValue = cell.effectiveValue?.stringValue ||
                             cell.effectiveValue?.numberValue ||
                             cell.effectiveValue?.boolValue?.toString() || '';
        const formula = cell.userEnteredValue?.formulaValue || '';
        const isCheckbox = cell.dataValidation?.condition?.type === 'BOOLEAN';

        if (effectiveValue || formula || isCheckbox) {
          console.log(`${cellRef}:`);
          if (effectiveValue) console.log(`  Value: "${effectiveValue}"`);
          if (formula) console.log(`  Formula: ${formula.substring(0, 50)}...`);
          if (isCheckbox) console.log(`  Type: CHECKBOX`);
          console.log('');
        }
      }
    }

  } catch (error) {
    console.error('Error analyzing sheet:', error);
    throw error;
  }
}

analyzeReferenceSheet()
  .then(() => {
    console.log('\n✅ Analysis complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Analysis failed:', error.message);
    process.exit(1);
  });
