import { google } from 'googleapis';
import * as path from 'path';

const SPREADSHEET_ID = '1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o';

async function mapAllRounds() {
  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  console.log('🗺️  Mapping complete bracket structure...\n');

  // Check formulas at key cells to understand the pattern
  const cells = [
    'Bracket!E4',   // Round 2 Match 1 P1 name (from R1 formula)
    'Bracket!H8',   // Round 3 Match 1 P1 (formula cell)
    'Bracket!K16',  // Round 4 Match 1 P1 (formula cell?)
  ];

  const response = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
    ranges: cells,
    includeGridData: true,
  });

  const sheetData = response.data.sheets?.[0]?.data;

  cells.forEach((cellName, idx) => {
    const range = sheetData?.[idx];
    const cell = range?.rowData?.[0]?.values?.[0];

    console.log(`${cellName}:`);
    console.log('  Formula:', cell?.userEnteredValue?.formulaValue || '(none)');
    console.log('  Value:', cell?.formattedValue || '(empty)');
    console.log('');
  });

  // Now infer the pattern:
  console.log('=== INFERRED PATTERN ===\n');
  console.log('Round 1:');
  console.log('  Checkboxes: Column A (rows 2-31, pairs at 2/3, 6/7, 10/11, ...)');
  console.log('  Names: Column B (direct), Column E (formulas from A)');
  console.log('');
  console.log('Round 2:');
  console.log('  Participants: Column E rows 4, 5, 12, 13, 20, 21, 28, 29 (from R1 formulas)');
  console.log('  Checkboxes: Column D rows 4, 5, 12, 13, 20, 21, 28, 29 (simulation writes here)');
  console.log('  Formulas: None at this level');
  console.log('');
  console.log('Round 3:');
  console.log('  H8 formula: =IFERROR(VLOOKUP(TRUE,$D$8:$E$9,2,FALSE),"")');
  console.log('  This means: R3 expects participant NAMES at E8/E9');
  console.log('              and R3 writes CHECKBOXES to... where?');
  console.log('');
  console.log('  Round 3 match function says: checkboxCol = "G" (for left side)');
  console.log('  So R3 CHECKBOXES go to G8/G9');
  console.log('  And R3 NAMES should be at H8/H9 (G + 1)');
  console.log('');
  console.log('  But H8 is a FORMULA cell that reads from D8:E9!');
  console.log('  So H8 will show the name from E8/E9 once D8/D9 have checkboxes.');
  console.log('');
  console.log('⚠️  THE PROBLEM:');
  console.log('  - We wrote R2 winners to E8/E9 ✅');
  console.log('  - R3 tries to read from H8/H9 (formula cells)');
  console.log('  - But H8 formula looks for TRUE in D8:E9');
  console.log('  - D8/D9 are empty (R3 hasn\'t written checkboxes yet)');
  console.log('  - So H8 returns empty → R3 thinks no participants ready');
  console.log('');
  console.log('💡 THE SOLUTION:');
  console.log('  - R3 should write checkboxes to D8/D9 (not G8/G9!)');
  console.log('  - OR read names directly from E8/E9 (not H8/H9)');
}

mapAllRounds().catch(console.error);
