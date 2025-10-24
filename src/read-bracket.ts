import { google } from 'googleapis';
import * as path from 'path';

/**
 * Read and analyze the Bracket tab structure from the example sheet
 */

const EXAMPLE_SHEET_ID = '1Z83Lr02EW9wvpH3YfBvLwafHMIqyxJLXaO_0D85bMfk';

async function readBracket() {
  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');

  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    console.log('Reading Bracket tab structure...\n');

    // Read a large range to capture the entire bracket
    const response = await sheets.spreadsheets.get({
      spreadsheetId: EXAMPLE_SHEET_ID,
      ranges: ['Bracket!A1:AA100'],
      includeGridData: true,
    });

    const sheetData = response.data.sheets?.[0]?.data?.[0];
    if (!sheetData || !sheetData.rowData) {
      console.log('No bracket data found');
      return;
    }

    console.log('Bracket Tab Analysis:');
    console.log('='.repeat(80));

    // Analyze the structure
    const rows = sheetData.rowData;

    // Show first 50 rows with formulas and values
    for (let rowIdx = 0; rowIdx < Math.min(50, rows.length); rowIdx++) {
      const row = rows[rowIdx];
      if (!row.values) continue;

      const rowNum = rowIdx + 1;
      const cells = row.values.slice(0, 27); // First 27 columns (A-AA)

      // Only show rows that have meaningful content
      const hasContent = cells.some(cell =>
        cell.formattedValue || cell.userEnteredValue?.formulaValue
      );

      if (!hasContent) continue;

      console.log(`\nRow ${rowNum}:`);

      for (let colIdx = 0; colIdx < cells.length; colIdx++) {
        const cell = cells[colIdx];
        const colLetter = String.fromCharCode(65 + colIdx); // A, B, C...

        if (cell.userEnteredValue?.formulaValue) {
          console.log(`  ${colLetter}${rowNum}: FORMULA = ${cell.userEnteredValue.formulaValue}`);
          if (cell.formattedValue) {
            console.log(`         VALUE   = "${cell.formattedValue}"`);
          }
        } else if (cell.formattedValue) {
          console.log(`  ${colLetter}${rowNum}: "${cell.formattedValue}"`);
        }
      }
    }

    // Look for checkboxes (TRUE/FALSE cells)
    console.log('\n' + '='.repeat(80));
    console.log('Checkbox cells (TRUE/FALSE indicators):');
    console.log('='.repeat(80));

    for (let rowIdx = 0; rowIdx < Math.min(100, rows.length); rowIdx++) {
      const row = rows[rowIdx];
      if (!row.values) continue;

      const rowNum = rowIdx + 1;

      for (let colIdx = 0; colIdx < row.values.length; colIdx++) {
        const cell = row.values[colIdx];
        const colLetter = String.fromCharCode(65 + colIdx);

        // Check for boolean values or checkbox data validation
        if (cell.userEnteredValue?.boolValue !== undefined ||
            cell.dataValidation?.condition?.type === 'BOOLEAN') {
          console.log(`  ${colLetter}${rowNum}: CHECKBOX (value: ${cell.effectiveValue?.boolValue})`);
        }
      }
    }

  } catch (error) {
    console.error('Error reading bracket:', error);
    throw error;
  }
}

// Run the reader
readBracket()
  .then(() => {
    console.log('\n✅ Done reading bracket structure');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error.message);
    process.exit(1);
  });
