import { google } from 'googleapis';
import * as path from 'path';

const SPREADSHEET_ID = '1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o';

async function checkRound3AfterCopy() {
  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  console.log('🔍 Checking Round 3 cells after Round 2 copy operation...\n');

  // Check what's in E8, E9 (Round 3 Match 1 expected participants)
  console.log('=== ROUND 3 ALPHA Match 1 (Rows 8-9) ===');
  const r3m1 = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Bracket!D8:E9',
  });

  const m1Values = r3m1.data.values || [];
  console.log('Row 8: D (checkbox):', m1Values[0]?.[0] || '(empty)', '| E (name):', m1Values[0]?.[1] || '(empty)');
  console.log('Row 9: D (checkbox):', m1Values[1]?.[0] || '(empty)', '| E (name):', m1Values[1]?.[1] || '(empty)');

  // Check Round 3 Match 2 (rows 16-17)
  console.log('\n=== ROUND 3 ALPHA Match 2 (Rows 16-17) ===');
  const r3m2 = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Bracket!D16:E17',
  });

  const m2Values = r3m2.data.values || [];
  console.log('Row 16: D (checkbox):', m2Values[0]?.[0] || '(empty)', '| E (name):', m2Values[0]?.[1] || '(empty)');
  console.log('Row 17: D (checkbox):', m2Values[1]?.[0] || '(empty)', '| E (name):', m2Values[1]?.[1] || '(empty)');

  // Check what Round 3 formula expects
  console.log('\n=== ROUND 3 FORMULA EXPECTATIONS ===');
  const formulaCheck = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
    ranges: ['Bracket!H8', 'Bracket!H16'],
    includeGridData: true,
  });

  const sheetData = formulaCheck.data.sheets?.[0]?.data;
  const h8 = sheetData?.[0]?.rowData?.[0]?.values?.[0];
  const h16 = sheetData?.[1]?.rowData?.[0]?.values?.[0];

  console.log('\nH8 (Round 3 Match 1, Participant 1):');
  console.log('  Formula:', h8?.userEnteredValue?.formulaValue || '(no formula)');
  console.log('  Current value:', h8?.formattedValue || '(empty)');

  console.log('\nH16 (Round 3 Match 2, Participant 1):');
  console.log('  Formula:', h16?.userEnteredValue?.formulaValue || '(no formula)');
  console.log('  Current value:', h16?.formattedValue || '(empty)');

  // Check Round 3 Match function to see what cells it expects
  console.log('\n=== ROUND 3 MATCH CELL EXPECTATIONS ===');
  console.log('Round 3 ALPHA Match 1: Expects participants at G8/G9 (checkbox) and H8/H9 (names)');
  console.log('Round 3 ALPHA Match 2: Expects participants at G16/G17 (checkbox) and H16/H17 (names)');
  console.log('\n⚠️  But we wrote to E8/E9, E16/E17!');
  console.log('⚠️  Round 3 checkboxes should be at G8/G16, not D8/D16!');
}

checkRound3AfterCopy().catch(console.error);
