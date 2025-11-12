import { google } from 'googleapis';
import * as path from 'path';

const TEST_SHEET_ID = '1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w';

async function checkRound3() {
  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  console.log('🔍 Checking Round 3 columns (G-H)...\n');

  // Read columns G-H rows 1-30
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: TEST_SHEET_ID,
    range: 'Bracket!G1:H30',
  });

  const values = response.data.values || [];

  console.log('=== COLUMNS G-H (Round 3 area) ===\n');

  for (let rowIdx = 0; rowIdx < values.length; rowIdx++) {
    const row = values[rowIdx] || [];
    const rowNum = rowIdx + 1;

    if (row[0] || row[1]) {  // Only show non-empty rows
      console.log(`Row ${rowNum.toString().padStart(2, ' ')}: G="${row[0] || '(empty)'}" | H="${row[1] || '(empty)'}"`);
    }
  }

  console.log('\n=== EXPECTED ROUND 3 STRUCTURE ===\n');
  console.log('Round 3 should have checkboxes in column G, formulas in column H:');
  console.log('  Row 8: G=checkbox, H=VLOOKUP from Round 2');
  console.log('  Row 9: G=checkbox, H=VLOOKUP from Round 2');
  console.log('  Row 24: G=checkbox, H=VLOOKUP from Round 2');
  console.log('  Row 25: G=checkbox, H=VLOOKUP from Round 2');

  console.log('\n✅ Check complete!');
}

checkRound3()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
