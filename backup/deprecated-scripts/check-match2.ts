import { google } from 'googleapis';
import * as path from 'path';

const SPREADSHEET_ID = '1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o';

async function checkMatch2() {
  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: SPREADSHEET_ID,
    ranges: ['Bracket!A4:B5', 'Bracket!A6:B7'],
  });

  console.log('Round 1 Match 2 (A4:B5):');
  console.log(JSON.stringify(response.data.valueRanges?.[0]?.values, null, 2));

  console.log('\nRound 1 Match 3 (A6:B7):');
  console.log(JSON.stringify(response.data.valueRanges?.[1]?.values, null, 2));
}

checkMatch2().catch(console.error);
