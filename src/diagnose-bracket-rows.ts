import { google } from 'googleapis';
import * as path from 'path';

/**
 * Diagnostic script to check exact bracket structure in test sheet
 */

const TEST_SHEET_ID = '1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w';

async function diagnoseBracketRows() {
  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  console.log('🔍 Diagnosing bracket structure...\n');
  console.log(`Sheet: ${TEST_SHEET_ID}\n`);

  // Read Round 1 and Round 2 area (rows 1-20, columns A-F)
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: TEST_SHEET_ID,
    range: 'Bracket!A1:F20',
  });

  const values = response.data.values || [];

  console.log('=== BRACKET ROWS 1-20 (Columns A-F) ===\n');

  for (let rowIdx = 0; rowIdx < values.length; rowIdx++) {
    const row = values[rowIdx] || [];
    const rowNum = rowIdx + 1;

    console.log(`Row ${rowNum.toString().padStart(2, ' ')}:`,
      row.map((cell, colIdx) => {
        const col = String.fromCharCode(65 + colIdx); // A, B, C, D, E, F
        if (!cell || cell === '') return `${col}:(empty)`;
        return `${col}:${cell.toString().substring(0, 30)}`;
      }).join(' | ')
    );
  }

  console.log('\n=== ROUND 1 ANALYSIS ===\n');
  console.log('Expected Round 1 Match 1:');
  console.log('  Row 2: A=checkbox, B=participant formula');
  console.log('  Row 3: A=checkbox, B=participant formula\n');

  console.log('Actual Round 1 Match 1:');
  console.log(`  Row 2: A="${values[1]?.[0]}", B="${values[1]?.[1]}"`);
  console.log(`  Row 3: A="${values[2]?.[0]}", B="${values[2]?.[1]}"\n`);

  console.log('Expected Round 1 Match 2:');
  console.log('  Row 6: A=checkbox, B=participant formula');
  console.log('  Row 7: A=checkbox, B=participant formula\n');

  console.log('Actual Round 1 Match 2:');
  console.log(`  Row 6: A="${values[5]?.[0]}", B="${values[5]?.[1]}"`);
  console.log(`  Row 7: A="${values[6]?.[0]}", B="${values[6]?.[1]}"\n`);

  console.log('\n=== ROUND 2 ANALYSIS ===\n');
  console.log('Expected Round 2 Match 1:');
  console.log('  Row 4: D=checkbox, E=VLOOKUP formula for R1M1 winner');
  console.log('  Row 5: D=checkbox, E=VLOOKUP formula for R1M2 winner\n');

  console.log('Actual Round 2 Match 1:');
  console.log(`  Row 4: D="${values[3]?.[3]}", E="${values[3]?.[4]}"`);
  console.log(`  Row 5: D="${values[4]?.[3]}", E="${values[4]?.[4]}"`);
  console.log(`  Row 6: D="${values[5]?.[3]}", E="${values[5]?.[4]}"`);
  console.log(`  Row 7: D="${values[6]?.[3]}", E="${values[6]?.[4]}"`);
  console.log(`  Row 8: D="${values[7]?.[3]}", E="${values[7]?.[4]}"`);
  console.log(`  Row 9: D="${values[8]?.[3]}", E="${values[8]?.[4]}"\n`);

  console.log('\n=== FORMULAS CHECK ===\n');

  // Get formulas for Round 2
  const formulaResponse = await sheets.spreadsheets.get({
    spreadsheetId: TEST_SHEET_ID,
    ranges: ['Bracket!D1:F20'],
    includeGridData: true,
  });

  const bracketSheet = formulaResponse.data.sheets?.find(s => s.properties?.title === 'Bracket');
  const gridData = bracketSheet?.data?.[0];

  if (gridData?.rowData) {
    console.log('Round 2 Formulas (Columns D-F):');
    for (let rowIdx = 0; rowIdx < Math.min(20, gridData.rowData.length); rowIdx++) {
      const row = gridData.rowData[rowIdx];
      const rowNum = rowIdx + 1;

      if (row.values && row.values.some(v => v.userEnteredValue?.formulaValue)) {
        console.log(`\nRow ${rowNum}:`);
        row.values.forEach((cell, colIdx) => {
          const col = String.fromCharCode(68 + colIdx); // D, E, F
          const formula = cell.userEnteredValue?.formulaValue;
          const value = cell.effectiveValue?.stringValue || cell.effectiveValue?.boolValue?.toString() || cell.effectiveValue?.numberValue;
          const isCheckbox = cell.dataValidation?.condition?.type === 'BOOLEAN';

          if (formula || value || isCheckbox) {
            console.log(`  ${col}${rowNum}:`);
            if (formula) console.log(`    Formula: ${formula}`);
            if (value !== undefined) console.log(`    Value: ${value}`);
            if (isCheckbox) console.log(`    Type: CHECKBOX`);
          }
        });
      }
    }
  }

  console.log('\n=== REGION NAMES CHECK ===\n');

  const regionsResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: TEST_SHEET_ID,
    range: 'Bracket!E14:E17',
  });

  console.log('Checking rows 14-17 for region names:');
  regionsResponse.data.values?.forEach((row, idx) => {
    console.log(`  Row ${14 + idx}: E="${row[0] || '(empty)'}"`);
  });

  console.log('\n✅ Diagnostic complete!\n');
}

diagnoseBracketRows()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
