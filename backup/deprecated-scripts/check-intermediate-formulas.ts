import { google } from 'googleapis';
import * as path from 'path';

const SPREADSHEET_ID = '1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o';

async function checkIntermediateFormulas() {
  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  console.log('🔍 Checking if E8 should copy from E4/E5 via formula...\n');

  // The hypothesis: Maybe E8 has a formula like =IF(D4, E4, IF(D5, E5, ""))
  // This would copy the Round 2 winner from E4/E5 to E8 based on which has TRUE in Column D

  const cells = [
    'Bracket!E4',  // Round 2 Match 1 Participant 1 name
    'Bracket!E5',  // Round 2 Match 1 Participant 2 name
    'Bracket!D4',  // Round 2 Match 1 Participant 1 checkbox
    'Bracket!D5',  // Round 2 Match 1 Participant 2 checkbox
    'Bracket!E8',  // Should this copy the winner from E4/E5?
    'Bracket!E9',  // Or maybe the loser?
    'Bracket!H8',  // Round 3 reads from here
  ];

  const response = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
    ranges: cells,
    includeGridData: true,
  });

  const sheetData = response.data.sheets?.[0]?.data;
  if (!sheetData) {
    console.log('No data found');
    return;
  }

  cells.forEach((cellName, idx) => {
    const range = sheetData[idx];
    const cell = range.rowData?.[0]?.values?.[0];

    console.log(`\n${cellName}:`);
    console.log('  Formula:', cell?.userEnteredValue?.formulaValue || '(none)');
    console.log('  Value:', cell?.formattedValue || '(empty)');
    console.log('  Has checkbox?:', cell?.effectiveFormat?.numberFormat?.type === 'DATE' ? 'No' : (cell?.userEnteredValue?.boolValue !== undefined ? 'Yes' : 'No'));
  });

  // Check a few more intermediate cells
  console.log('\n\n=== CHECKING MORE CELLS FOR PATTERN ===');
  const moreCells = [
    'Bracket!D8', 'Bracket!D9',
    'Bracket!G8', 'Bracket!G9',
    'Bracket!H8', 'Bracket!H9'
  ];

  const response2 = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
    ranges: moreCells,
    includeGridData: true,
  });

  const sheetData2 = response2.data.sheets?.[0]?.data;
  moreCells.forEach((cellName, idx) => {
    const range = sheetData2?.[idx];
    const cell = range?.rowData?.[0]?.values?.[0];

    console.log(`\n${cellName}:`);
    console.log('  Formula:', cell?.userEnteredValue?.formulaValue || '(none)');
    console.log('  Value:', cell?.formattedValue || '(empty)');
  });
}

checkIntermediateFormulas().catch(console.error);
