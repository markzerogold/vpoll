import { google } from 'googleapis';
import * as path from 'path';

const SPREADSHEET_ID = process.argv[2] || '1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w';

async function checkBracketState() {
  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  console.log('📊 Reading bracket state...\n');

  // Read Round 1 participant names and checkboxes
  const r1Ranges = [
    'Bracket!A2:B9',   // ALPHA M1-M8 checkboxes and names
    'Bracket!D4:E7',   // Round 2 ALPHA checkboxes and names
  ];

  const response = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: SPREADSHEET_ID,
    ranges: r1Ranges,
  });

  const values = response.data.valueRanges || [];

  console.log('=== Round 1 ALPHA Matches (Rows 2-9) ===');
  const r1Alpha = values[0]?.values || [];
  r1Alpha.forEach((row, idx) => {
    const checkbox = row[0] === 'TRUE' ? '✅' : row[0] === 'FALSE' ? '❌' : '⬜';
    const name = row[1] || '(empty)';
    console.log(`  Row ${2 + idx}: ${checkbox} ${name}`);
  });

  console.log('\n=== Round 2 ALPHA Matches (Rows 4-7) ===');
  const r2Alpha = values[1]?.values || [];
  r2Alpha.forEach((row, idx) => {
    const checkbox = row[0] === 'TRUE' ? '✅' : row[0] === 'FALSE' ? '❌' : '⬜';
    const name = row[1] || '(empty)';
    console.log(`  Row ${4 + idx}: ${checkbox} ${name}`);
  });

  // Read Round 3 participant names
  console.log('\n=== Round 3 ALPHA Matches (Rows 8-9) ===');
  const r3Range = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Bracket!E8:E9',
  });
  const r3Names = r3Range.data.values || [];
  r3Names.forEach((row, idx) => {
    console.log(`  Row ${8 + idx}: ${row[0] || '(empty)'}`);
  });
}

checkBracketState().catch(console.error);
