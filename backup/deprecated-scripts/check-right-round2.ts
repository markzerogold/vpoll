import { google } from 'googleapis';
import * as path from 'path';

const SPREADSHEET_ID = '1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o';

async function checkRightRound2() {
  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
    ranges: ['Bracket!AA4', 'Bracket!AB4'],
    includeGridData: true,
  });

  const sheetData = response.data.sheets?.[0]?.data;

  console.log('Bracket!AA4 (Round 2 GAMMA name - should have VLOOKUP formula):');
  const aa4 = sheetData?.[0]?.rowData?.[0]?.values?.[0];
  console.log('  Formula:', aa4?.userEnteredValue?.formulaValue || '(none)');
  console.log('  Value:', aa4?.formattedValue || '(empty)');

  console.log('\nBracket!AB4 (Round 2 GAMMA checkbox):');
  const ab4 = sheetData?.[1]?.rowData?.[0]?.values?.[0];
  console.log('  Formula:', ab4?.userEnteredValue?.formulaValue || '(none)');
  console.log('  Value:', ab4?.formattedValue || '(empty)');
}

checkRightRound2().catch(console.error);
