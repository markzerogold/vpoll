import { google } from 'googleapis';
import * as path from 'path';

/**
 * Check borders around region name cells
 */

const EXAMPLE_SHEET_ID = '1Z83Lr02EW9wvpH3YfBvLwafHMIqyxJLXaO_0D85bMfk';
const TEST_SHEET_ID = '1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o';

async function checkBordersAroundCell(
  sheets: any,
  spreadsheetId: string,
  sheetName: string,
  col: string,
  row: number
) {
  console.log(`\n${sheetName} - Checking around ${col}${row}:`);

  const response = await sheets.spreadsheets.get({
    spreadsheetId,
    ranges: [`Bracket!${col}${row - 1}:${col}${row + 1}`],
    includeGridData: true,
  });

  const rowData = response.data.sheets?.[0]?.data?.[0]?.rowData || [];

  for (let i = 0; i < rowData.length; i++) {
    const actualRow = row - 1 + i;
    const cell = rowData[i]?.values?.[0];

    if (!cell) continue;

    const borders = cell.userEnteredFormat?.borders;
    if (!borders) {
      console.log(`  ${col}${actualRow}: no borders`);
      continue;
    }

    const borderTypes = [];
    if (borders.top) borderTypes.push('top');
    if (borders.bottom) borderTypes.push('bottom');
    if (borders.left) borderTypes.push('left');
    if (borders.right) borderTypes.push('right');

    if (borderTypes.length > 0) {
      console.log(`  ${col}${actualRow}: ${borderTypes.join(', ')}`);
    }
  }
}

async function main() {
  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');

  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  console.log('🔍 Checking Region Name Borders');
  console.log('='.repeat(80));

  // Check Federation (E15) and Romulan Star Empire (Y15)
  console.log('\n📍 ALPHA/GAMMA Region Names (Row 15)');
  await checkBordersAroundCell(sheets, EXAMPLE_SHEET_ID, 'Example', 'E', 15);
  await checkBordersAroundCell(sheets, TEST_SHEET_ID, 'Test', 'E', 15);
  await checkBordersAroundCell(sheets, EXAMPLE_SHEET_ID, 'Example', 'Y', 15);
  await checkBordersAroundCell(sheets, TEST_SHEET_ID, 'Test', 'Y', 15);

  // Check Klingon Empire (E31) and Dominion (Y31)
  console.log('\n📍 BETA/DELTA Region Names (Row 31)');
  await checkBordersAroundCell(sheets, EXAMPLE_SHEET_ID, 'Example', 'E', 31);
  await checkBordersAroundCell(sheets, TEST_SHEET_ID, 'Test', 'E', 31);
  await checkBordersAroundCell(sheets, EXAMPLE_SHEET_ID, 'Example', 'Y', 31);
  await checkBordersAroundCell(sheets, TEST_SHEET_ID, 'Test', 'Y', 31);

  console.log('\n' + '='.repeat(80));
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
