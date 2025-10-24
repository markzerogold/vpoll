import { google } from 'googleapis';
import * as path from 'path';

/**
 * Debug bracket cells to see what's actually there
 */

const SPREADSHEET_ID = '1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o';

async function debugBracket() {
  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // Check Round 1 first match (ALPHA region)
  console.log('Round 1 Match 1 (ALPHA):');
  console.log('Expected: A2=checkbox, B2=participant name\n');

  const cells = [
    'Bracket!A2', 'Bracket!B2',  // P1 checkbox and name
    'Bracket!A3', 'Bracket!B3',  // P2 checkbox and name
    'Bracket!A6', 'Bracket!B6',  // Next match
    'Bracket!A7', 'Bracket!B7',
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

  // Check each cell
  for (let rangeIdx = 0; rangeIdx < cells.length; rangeIdx++) {
    const range = sheetData[rangeIdx];
    const cellName = cells[rangeIdx];
    const cell = range.rowData?.[0]?.values?.[0];

    console.log(`\n${cellName}:`);
    console.log('  Formula:', cell?.userEnteredValue?.formulaValue || '(none)');
    console.log('  Value:', cell?.formattedValue || '(empty)');
    console.log('  Is Checkbox:', cell?.dataValidation?.condition?.type === 'BOOLEAN');
  }

  // Also check Regions tab to see if formulas can reference it
  console.log('\n\nRegions tab check:');
  const regionsResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Regions!A3:E4',
  });

  console.log('Regions!A3:E4:', JSON.stringify(regionsResponse.data.values, null, 2));
}

debugBracket().catch(console.error);
