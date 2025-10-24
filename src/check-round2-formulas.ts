import { google } from 'googleapis';
import * as path from 'path';

const SPREADSHEET_ID = '1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o';

async function checkRound2Formulas() {
  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // Check Round 2 cells with includeGridData to see formulas
  const cells = [
    'Bracket!E4',  // Round 2 ALPHA M1 P1 name
    'Bracket!D4',  // Round 2 ALPHA M1 P1 checkbox
    'Bracket!AB4', // Round 2 GAMMA M1 P1 name (right side)
    'Bracket!AC4', // Round 2 GAMMA M1 P1 checkbox (right side)
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
  });
}

checkRound2Formulas().catch(console.error);
