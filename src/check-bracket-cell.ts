import { google } from 'googleapis';
import * as path from 'path';

const SPREADSHEET_ID = '1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o';

async function checkBracketCell() {
  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // Check a few cells to see formulas and values
  const cells = [
    'Bracket!B2',  // Should be first ALPHA participant name
    'Bracket!B3',  // Should be second ALPHA participant name
    'Bracket!A2',  // Should be checkbox for first participant
    'Bracket!AB2', // Should be first GAMMA participant name (right side)
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
    console.log('  Effective value:', cell?.effectiveValue);
  });
}

checkBracketCell().catch(console.error);
