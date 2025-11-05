import { google } from 'googleapis';
import * as path from 'path';

const SPREADSHEET_ID = '1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o';

async function checkRound3() {
  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');

  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    console.log('🔍 Checking Round 3 cell population after Round 2 simulation...\n');

    // Round 3 ALPHA should be in column G (Sweet 16)
    console.log('=== ROUND 3 ALPHA (Column H, Expected rows 8 and 24) ===');
    const r3AlphaNames = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Bracket!H8:H24',
    });

    const alphaR3 = r3AlphaNames.data.values || [];
    console.log(`Total cells read: ${alphaR3.length}`);
    console.log(`Populated cells: ${alphaR3.filter(r => r[0]).length}`);
    alphaR3.forEach((row, idx) => {
      if (row[0]) {
        console.log(`  Row ${idx + 8}: ${row[0]}`);
      }
    });

    // Check Round 2 ALPHA to see if winners are there
    console.log('\n=== ROUND 2 ALPHA (Column E, for comparison) ===');
    const r2AlphaNames = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Bracket!E4:E28',
    });

    const alphaR2 = r2AlphaNames.data.values || [];
    console.log(`Total cells read: ${alphaR2.length}`);
    console.log(`Populated cells: ${alphaR2.filter(r => r[0]).length}`);
    alphaR2.filter(r => r[0]).forEach((row, idx) => {
      console.log(`  ${row[0]}`);
    });

    // Check Round 2 checkboxes to see if TRUE/FALSE are set
    console.log('\n=== ROUND 2 ALPHA Checkboxes (Column D) ===');
    const r2AlphaChecks = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Bracket!D4:D28',
    });

    const alphaR2Checks = r2AlphaChecks.data.values || [];
    alphaR2Checks.forEach((row, idx) => {
      const checkbox = row[0];
      if (checkbox === 'TRUE' || checkbox === true || checkbox === 'FALSE' || checkbox === false) {
        const status = (checkbox === 'TRUE' || checkbox === true) ? '✅' : '❌';
        console.log(`  Row ${idx + 4}: ${status} ${checkbox}`);
      }
    });

    // Check Round 3 checkboxes (should be empty before Round 3)
    console.log('\n=== ROUND 3 ALPHA Checkboxes (Column G) ===');
    const r3AlphaChecks = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Bracket!G8:G24',
    });

    const alphaR3Checks = r3AlphaChecks.data.values || [];
    console.log(`Checkbox cells read: ${alphaR3Checks.length}`);
    const populatedChecks = alphaR3Checks.filter(r => r[0] && (r[0] === 'TRUE' || r[0] === true || r[0] === 'FALSE' || r[0] === false)).length;
    console.log(`Populated checkboxes: ${populatedChecks}`);

  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

checkRound3()
  .then(() => {
    console.log('\n✅ Check complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  });
