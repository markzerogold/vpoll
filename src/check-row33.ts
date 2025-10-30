import { google } from 'googleapis';
import * as path from 'path';

/**
 * Check what borders exist at row 33 in both sheets
 */

const EXAMPLE_SHEET_ID = '1Z83Lr02EW9wvpH3YfBvLwafHMIqyxJLXaO_0D85bMfk';
const TEST_SHEET_ID = '1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o';

async function checkRow(sheets: any, spreadsheetId: string, sheetName: string, row: number) {
  console.log(`\nChecking row ${row} in ${sheetName}...`);

  const response = await sheets.spreadsheets.get({
    spreadsheetId,
    ranges: [`${sheetName}!A${row}:AF${row}`],
    includeGridData: true,
  });

  const rowData = response.data.sheets?.[0]?.data?.[0]?.rowData?.[0];
  if (!rowData || !rowData.values) {
    console.log('  No data found');
    return;
  }

  for (let colIdx = 0; colIdx < rowData.values.length; colIdx++) {
    const cell = rowData.values[colIdx];
    if (!cell.userEnteredFormat?.borders) continue;

    const borders = cell.userEnteredFormat.borders;
    const colLetter = colToLetter(colIdx);

    const borderTypes = [];
    if (borders.top) borderTypes.push('top');
    if (borders.bottom) borderTypes.push('bottom');
    if (borders.left) borderTypes.push('left');
    if (borders.right) borderTypes.push('right');

    if (borderTypes.length > 0) {
      console.log(`  ${colLetter}${row}: ${borderTypes.join(', ')}`);
    }
  }
}

function colToLetter(col: number): string {
  let letter = '';
  while (col >= 0) {
    letter = String.fromCharCode((col % 26) + 65) + letter;
    col = Math.floor(col / 26) - 1;
  }
  return letter;
}

async function main() {
  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');

  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  console.log('🔍 Checking Row 33 Border Gap');
  console.log('='.repeat(80));

  // Check rows 32, 33, 34 in example sheet
  console.log('\n📋 EXAMPLE SHEET:');
  await checkRow(sheets, EXAMPLE_SHEET_ID, 'Bracket', 32);
  await checkRow(sheets, EXAMPLE_SHEET_ID, 'Bracket', 33);
  await checkRow(sheets, EXAMPLE_SHEET_ID, 'Bracket', 34);

  console.log('\n' + '='.repeat(80));
  console.log('\n📋 TEST SHEET:');

  // Check same rows in test sheet
  await checkRow(sheets, TEST_SHEET_ID, 'Bracket', 32);
  await checkRow(sheets, TEST_SHEET_ID, 'Bracket', 33);
  await checkRow(sheets, TEST_SHEET_ID, 'Bracket', 34);
  await checkRow(sheets, TEST_SHEET_ID, 'Bracket', 35);
}

main()
  .then(() => {
    console.log('\n✨ Done');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
