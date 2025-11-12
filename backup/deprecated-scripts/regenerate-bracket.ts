import { google } from 'googleapis';
import * as path from 'path';
import { generateCompleteBracket, BracketCell } from './generate-bracket';

/**
 * Clear and regenerate the bracket with fixed formulas
 */

const SPREADSHEET_ID = '1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o';

async function regenerateBracket() {
  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  console.log('🧹 Clearing existing bracket data...');

  // Clear the entire bracket tab (rows 1-100)
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Bracket!A1:AE100',
  });

  console.log('✅ Bracket cleared');
  console.log('🔧 Generating new bracket with corrected formulas...');

  // Generate bracket cells
  const bracketCells = generateCompleteBracket();

  // Separate into formulas, values, and checkboxes
  const formulaCells = bracketCells.filter(c => c.formula);
  const valueCells = bracketCells.filter(c => c.value && !c.formula);
  const checkboxCells = bracketCells.filter(c => c.isCheckbox);

  console.log(`  📊 ${formulaCells.length} formula cells`);
  console.log(`  📝 ${valueCells.length} value cells`);
  console.log(`  ☑️  ${checkboxCells.length} checkbox cells`);

  // Write formulas
  if (formulaCells.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: formulaCells.map(cell => ({
          range: `Bracket!${cell.col}${cell.row}`,
          values: [[cell.formula]]
        }))
      }
    });
    console.log('  ✅ Formulas written');
  }

  // Write values
  if (valueCells.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: valueCells.map(cell => ({
          range: `Bracket!${cell.col}${cell.row}`,
          values: [[cell.value]]
        }))
      }
    });
    console.log('  ✅ Values written');
  }

  // Set checkbox data validation
  if (checkboxCells.length > 0) {
    const checkboxRequests = checkboxCells.map(cell => {
      const col = cell.col;
      const row = cell.row;

      // Convert column letter to index
      let colIndex = 0;
      for (let i = 0; i < col.length; i++) {
        colIndex = colIndex * 26 + (col.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
      }
      colIndex--; // Convert to 0-based

      return {
        setDataValidation: {
          range: {
            sheetId: 0, // Assuming Bracket is first sheet
            startRowIndex: row - 1,
            endRowIndex: row,
            startColumnIndex: colIndex,
            endColumnIndex: colIndex + 1
          },
          rule: {
            condition: {
              type: 'BOOLEAN' as const
            },
            showCustomUi: true
          }
        }
      };
    });

    // Bracket tab has sheet ID 0 (first tab)
    const bracketSheetId = 0;

    // Update sheet ID in all requests
    checkboxRequests.forEach(req => {
      req.setDataValidation.range.sheetId = bracketSheetId;
    });

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: checkboxRequests
      }
    });
    console.log('  ✅ Checkboxes configured');
  }

  console.log('\n✅ Bracket regenerated successfully!');
  console.log(`📊 View: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit#gid=${0}`);
}

regenerateBracket().catch(console.error);
