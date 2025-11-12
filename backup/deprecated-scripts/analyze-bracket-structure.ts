import { google } from 'googleapis';
import * as path from 'path';

const SPREADSHEET_ID = '1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o';

async function analyzeBracketStructure() {
  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  console.log('🔍 Analyzing bracket structure to understand cell mapping...\n');

  // Read Round 1 ALPHA winners (from formulas in Column E)
  console.log('=== ROUND 1 ALPHA WINNERS (Column E with formulas) ===');
  const r1Winners = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Bracket!E2:E31',
  });

  const r1Values = r1Winners.data.values || [];
  r1Values.forEach((row, idx) => {
    const rowNum = idx + 2;
    if (row[0]) {
      console.log(`Row ${rowNum}: ${row[0]}`);
    }
  });

  // Now check Round 2 formula cells to see what they reference
  console.log('\n=== ROUND 2 FORMULA CELLS ===');
  const r2Formulas = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
    ranges: ['Bracket!E4', 'Bracket!E5', 'Bracket!E8', 'Bracket!E9', 'Bracket!E12', 'Bracket!E13'],
    includeGridData: true,
  });

  const sheetData = r2Formulas.data.sheets?.[0]?.data;
  ['E4', 'E5', 'E8', 'E9', 'E12', 'E13'].forEach((cellName, idx) => {
    const range = sheetData?.[idx];
    const cell = range?.rowData?.[0]?.values?.[0];

    console.log(`\n${cellName}:`);
    console.log('  Formula:', cell?.userEnteredValue?.formulaValue || '(none)');
    console.log('  Value:', cell?.formattedValue || '(empty)');
  });

  // Check if there's a pattern: are E4/E5 the participants for Round 2 Match 1?
  console.log('\n=== HYPOTHESIS: Round 1 winners in E4/E5 should face each other in Round 2 ===');
  console.log('E4 (R1 M1 winner) vs E5 (R1 M2 winner) = Round 2 Match 1');
  console.log('E12 (R1 M3 winner) vs E13 (R1 M4 winner) = Round 2 Match 2');
  console.log('E20 (R1 M5 winner) vs E21 (R1 M6 winner) = Round 2 Match 3');
  console.log('E28 (R1 M7 winner) vs E29 (R1 M8 winner) = Round 2 Match 4');

  console.log('\n=== SO Round 2 should READ from E4/E5, E12/E13, E20/E21, E28/E29 ===');
  console.log('Not from E8/E9, E16/E17, E24/E25, E32/E33 (which are for Round 3 formulas)');
}

analyzeBracketStructure().catch(console.error);
