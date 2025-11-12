import { google } from 'googleapis';
import * as path from 'path';

const TEST_SHEET_ID = '1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o';

const keyPath = path.join(__dirname, '../keys/vpoll-key.json');
const auth = new google.auth.GoogleAuth({
  keyFile: keyPath,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

async function checkConfigStructure() {
  console.log('📋 Checking Config tab structure...\n');

  // Read Config column A and B
  const config = await sheets.spreadsheets.values.get({
    spreadsheetId: TEST_SHEET_ID,
    range: 'Config!A1:B10',
  });

  console.log('Config tab rows:');
  config.data.values?.forEach((row, i) => {
    const colA = row[0] || '(empty)';
    const colB = row[1] || '(empty)';
    console.log(`Row ${i + 1}: ${colA.padEnd(25)} | ${colB}`);
  });
}

checkConfigStructure().catch(console.error);
