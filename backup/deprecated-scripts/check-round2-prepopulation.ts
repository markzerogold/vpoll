import { google } from 'googleapis';
import * as path from 'path';

const SPREADSHEET_ID = '1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o';

async function checkRound2Prepopulation() {
  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  console.log('🔍 Checking Round 2 cells after pre-population...\n');

  // Check Round 2 ALPHA cells (should be at rows 8, 16, 24, 32)
  console.log('=== ROUND 2 ALPHA (Expected at rows 8, 16, 24, 32) ===');

  // Column D: Checkboxes
  // Column E: Participant names
  const alphaR2 = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Bracket!D8:E32',
  });

  const alphaValues = alphaR2.data.values || [];
  console.log('\nColumn D (checkboxes) | Column E (names):');
  [8, 16, 24, 32].forEach((row, idx) => {
    const arrayIdx = row - 8;
    const rowData = alphaValues[arrayIdx] || [];
    console.log(`Row ${row}: ${rowData[0] || '(empty)'} | ${rowData[1] || '(empty)'}`);
  });

  // Also check what was written at rows 4, 12, 20, 28 (old positions)
  console.log('\n=== OLD POSITIONS (Rows 4, 12, 20, 28 - should be empty now?) ===');
  const oldPositions = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Bracket!D4:E28',
  });

  const oldValues = oldPositions.data.values || [];
  [4, 12, 20, 28].forEach((row) => {
    const arrayIdx = row - 4;
    const rowData = oldValues[arrayIdx] || [];
    console.log(`Row ${row}: ${rowData[0] || '(empty)'} | ${rowData[1] || '(empty)'}`);
  });

  // Check what column the pre-population ACTUALLY wrote to
  console.log('\n=== CHECKING BROADER RANGE (Columns A-H, Rows 2-32) ===');
  const broadCheck = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Bracket!A2:H32',
  });

  const broadValues = broadCheck.data.values || [];
  console.log('\nRows with data in columns E-H:');
  broadValues.forEach((row, idx) => {
    const rowNum = idx + 2;
    const eVal = row[4] || ''; // Column E
    const fVal = row[5] || ''; // Column F
    const gVal = row[6] || ''; // Column G
    const hVal = row[7] || ''; // Column H

    if (eVal || fVal || gVal || hVal) {
      console.log(`Row ${rowNum}: E="${eVal}" F="${fVal}" G="${gVal}" H="${hVal}"`);
    }
  });
}

checkRound2Prepopulation().catch(console.error);
