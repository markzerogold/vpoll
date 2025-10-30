import { google } from 'googleapis';
import * as path from 'path';

/**
 * Find where region names are located in both sheets
 */

const EXAMPLE_SHEET_ID = '1Z83Lr02EW9wvpH3YfBvLwafHMIqyxJLXaO_0D85bMfk';
const TEST_SHEET_ID = '1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o';

const REGION_NAMES = ['Federation', 'Klingon Empire', 'Romulan Star Empire', 'Dominion'];

async function findRegionNames(sheets: any, spreadsheetId: string, sheetTitle: string) {
  console.log(`\nSearching in ${sheetTitle}...`);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Bracket!A1:AF70',
  });

  const rows = response.data.values || [];

  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    const row = rows[rowIdx];
    if (!row) continue;

    for (let colIdx = 0; colIdx < row.length; colIdx++) {
      const cellValue = row[colIdx];

      if (REGION_NAMES.includes(cellValue)) {
        const colLetter = colToLetter(colIdx);
        console.log(`  "${cellValue}" found at ${colLetter}${rowIdx + 1}`);
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

  console.log('🔍 Finding Region Names');
  console.log('='.repeat(80));

  await findRegionNames(sheets, EXAMPLE_SHEET_ID, 'Example Sheet');
  await findRegionNames(sheets, TEST_SHEET_ID, 'Test Sheet');
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
