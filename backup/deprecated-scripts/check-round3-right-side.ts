import { google } from 'googleapis';
import * as path from 'path';

const TEST_SHEET_ID = '1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w';

async function checkRound3RightSide() {
  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  console.log('🔍 Checking Round 3 RIGHT SIDE (GAMMA/DELTA) columns (Y-AB)...\n');

  // Read columns Y-AB rows 1-60
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: TEST_SHEET_ID,
    range: 'Bracket!Y1:AB60',
  });

  const values = response.data.values || [];

  console.log('=== COLUMNS Y-AB (Round 3 GAMMA/DELTA area) ===\n');

  // Check rows around 40 (where GAMMA Round 3 should be)
  const rowsToCheck = [1, 8, 9, 16, 17, 24, 25, 32, 33, 40, 41, 48, 49, 56, 57];

  for (const rowNum of rowsToCheck) {
    const rowIdx = rowNum - 1;
    if (rowIdx >= values.length) continue;

    const row = values[rowIdx] || [];
    if (row[0] || row[1] || row[2] || row[3]) {  // Y, Z, AA, AB
      console.log(`Row ${rowNum.toString().padStart(2, ' ')}: Y="${row[0] || '(empty)'}" | Z="${row[1] || '(empty)'}" | AA="${row[2] || '(empty)'}" | AB="${row[3] || '(empty)'}"`);
    }
  }

  console.log('\n=== EXPECTED ROUND 3 RIGHT SIDE STRUCTURE ===\n');
  console.log('Round 3 right side should have checkboxes in column Y, formulas in column AB:');
  console.log('  Row 40: Y=checkbox, AB=VLOOKUP from Round 2 GAMMA');
  console.log('  Row 41: Y=checkbox, AB=VLOOKUP from Round 2 GAMMA');
  console.log('  Row 56: Y=checkbox, AB=VLOOKUP from Round 2 DELTA');
  console.log('  Row 57: Y=checkbox, AB=VLOOKUP from Round 2 DELTA');

  console.log('\n✅ Check complete!');
}

checkRound3RightSide()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
