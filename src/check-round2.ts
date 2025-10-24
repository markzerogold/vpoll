import { google } from 'googleapis';
import * as path from 'path';

/**
 * Check what values are in Round 2 cells after Round 1 completion
 */

const SPREADSHEET_ID = '1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o';

async function checkRound2() {
  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');

  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Check a few Round 2 name cells
  const cellsToCheck = [
    'Bracket!E4',  // ALPHA R2 M1 P1
    'Bracket!E5',  // ALPHA R2 M1 P2
    'Bracket!E12', // ALPHA R2 M2 P1
    'Bracket!E13', // ALPHA R2 M2 P2
    'Bracket!AA4', // GAMMA R2 M1 P1
    'Bracket!AA5', // GAMMA R2 M1 P2
  ];

  const response = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: SPREADSHEET_ID,
    ranges: cellsToCheck,
  });

  console.log('Round 2 cell values:');
  response.data.valueRanges?.forEach((range, idx) => {
    const value = range.values?.[0]?.[0] || '(empty)';
    console.log(`  ${cellsToCheck[idx]}: "${value}"`);
  });
}

checkRound2().catch(console.error);
