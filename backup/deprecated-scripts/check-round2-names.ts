import { google } from 'googleapis';
import * as path from 'path';

const SPREADSHEET_ID = '1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o';

async function checkRound2() {
  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // Check Round 2 participant cells (should be populated from Round 1 winners)
  const cells = [
    'Bracket!E4',  // Round 2 ALPHA M1 P1
    'Bracket!E5',  // Round 2 ALPHA M1 P2
    'Bracket!AB4', // Round 2 GAMMA M1 P1 (right side)
    'Bracket!AB5', // Round 2 GAMMA M1 P2 (right side)
  ];

  const response = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: SPREADSHEET_ID,
    ranges: cells,
  });

  console.log('Round 2 participants (should show Round 1 winners):');
  cells.forEach((cell, idx) => {
    const value = response.data.valueRanges?.[idx]?.values?.[0]?.[0] || '(empty)';
    console.log(`  ${cell}: ${value}`);
  });
}

checkRound2().catch(console.error);
