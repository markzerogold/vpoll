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

  // Check intermediate cells between Round 2 and Round 3
  const cells = [
    'Bracket!D8',  // What Round 3 formula looks at
    'Bracket!E8',  // What Round 3 expects for participant name
    'Bracket!D9',  // Second row of Round 3's lookup range
    'Bracket!E9',  // Second row of Round 3's lookup range
    'Bracket!D4',  // Actual Round 2 checkbox position
    'Bracket!E4',  // Actual Round 2 name position
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
