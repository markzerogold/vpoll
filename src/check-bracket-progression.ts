import { google } from 'googleapis';
import * as path from 'path';

const SPREADSHEET_ID = '1Z83Lr02EW9wvpH3YfBvLwafHMIqyxJLXaO_0D85bMfk';

async function checkBracket() {
  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');

  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    console.log('🏀 Checking bracket progression...\n');

    // Round 1 ALPHA checkboxes are in column A, names in column B
    // Round 2 ALPHA checkboxes are in column D, names in column E

    // Check Round 1 ALPHA winners (column A checkboxes, column B names)
    console.log('=== ROUND 1 ALPHA (Checkboxes in Column A) ===');
    const r1ChecksAlpha = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Bracket!A2:B30',
    });

    const r1AlphaRows = r1ChecksAlpha.data.values || [];
    r1AlphaRows.forEach((row, idx) => {
      const checkbox = row[0];
      const name = row[1];
      const rowNum = idx + 2;
      if (checkbox === 'TRUE' || checkbox === true || checkbox === 'FALSE' || checkbox === false) {
        const status = (checkbox === 'TRUE' || checkbox === true) ? '✅' : '❌';
        console.log(`Row ${rowNum}: ${status} ${checkbox.toString().padEnd(6)} | ${name || '(no name)'}`);
      }
    });

    // Check Round 2 ALPHA participants (column E names)
    console.log('\n=== ROUND 2 ALPHA (Names in Column E) ===');
    const r2NamesAlpha = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Bracket!E4:E28',
    });

    const r2AlphaNames = r2NamesAlpha.data.values || [];
    r2AlphaNames.forEach((row, idx) => {
      const name = row[0];
      const rowNum = idx + 4;
      if (name) {
        console.log(`Row ${rowNum}: ${name}`);
      }
    });

    // Check Round 1 GAMMA checkboxes (column AE, names would be in AD)
    console.log('\n=== ROUND 1 GAMMA (Checkboxes in Column AE) ===');
    const r1ChecksGamma = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Bracket!AE2:AE30',
    });

    const r1GammaChecks = r1ChecksGamma.data.values || [];
    r1GammaChecks.forEach((row, idx) => {
      const checkbox = row[0];
      const rowNum = idx + 2;
      if (checkbox === 'TRUE' || checkbox === true || checkbox === 'FALSE' || checkbox === false) {
        const status = (checkbox === 'TRUE' || checkbox === true) ? '✅' : '❌';
        console.log(`Row ${rowNum}: ${status} ${checkbox.toString().padEnd(6)}`);
      }
    });

    console.log('\n✅ Bracket check complete!');

  } catch (error) {
    console.error('Error checking bracket:', error);
    throw error;
  }
}

checkBracket()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  });
