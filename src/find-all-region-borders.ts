import { google } from 'googleapis';
import * as path from 'path';

/**
 * Find all cells in example bracket with region name-like borders
 * (boxes with all 4 borders)
 */

const EXAMPLE_SHEET_ID = '1Z83Lr02EW9wvpH3YfBvLwafHMIqyxJLXaO_0D85bMfk';

async function findBoxedCells(sheets: any) {
  console.log('Searching for cells with all 4 borders (likely region labels)...\n');

  const response = await sheets.spreadsheets.get({
    spreadsheetId: EXAMPLE_SHEET_ID,
    ranges: ['Bracket!A1:AF70'],
    includeGridData: true,
  });

  const sheetsData = response.data.sheets?.[0];
  if (!sheetsData) return;

  const rowData = sheetsData.data?.[0]?.rowData || [];

  for (let rowIdx = 0; rowIdx < rowData.length; rowIdx++) {
    const row = rowData[rowIdx];
    if (!row.values) continue;

    for (let colIdx = 0; colIdx < row.values.length; colIdx++) {
      const cell = row.values[colIdx];
      const borders = cell.userEnteredFormat?.borders;

      if (!borders) continue;

      // Check if cell has all 4 borders (boxed)
      const hasAllBorders =
        borders.top && borders.bottom && borders.left && borders.right;

      if (hasAllBorders) {
        const colLetter = colToLetter(colIdx);
        const cellValue = cell.formattedValue || cell.effectiveValue?.stringValue || '';
        console.log(`  ${colLetter}${rowIdx + 1}: "${cellValue}"`);
      }
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

  console.log('🔍 Finding Boxed Cells in Example Bracket');
  console.log('='.repeat(80));

  await findBoxedCells(sheets);
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
