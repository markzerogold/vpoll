import { google } from 'googleapis';
import * as path from 'path';

/**
 * Scan example sheet for region name borders around row 31
 */

const EXAMPLE_SHEET_ID = '1Z83Lr02EW9wvpH3YfBvLwafHMIqyxJLXaO_0D85bMfk';

async function scanRows(sheets: any, startRow: number, endRow: number) {
  console.log(`\nScanning example sheet rows ${startRow}-${endRow} for region borders:`);

  const response = await sheets.spreadsheets.get({
    spreadsheetId: EXAMPLE_SHEET_ID,
    ranges: [`Bracket!E${startRow}:E${endRow}`, `Bracket!Y${startRow}:Y${endRow}`],
    includeGridData: true,
  });

  const sheetsData = response.data.sheets?.[0];
  if (!sheetsData) return;

  // Check column E
  console.log('\nColumn E:');
  const eData = sheetsData.data?.[0]?.rowData || [];
  for (let i = 0; i < eData.length; i++) {
    const row = startRow + i;
    const cell = eData[i]?.values?.[0];
    const borders = cell?.userEnteredFormat?.borders;

    if (borders) {
      const borderTypes = [];
      if (borders.top) borderTypes.push('top');
      if (borders.bottom) borderTypes.push('bottom');
      if (borders.left) borderTypes.push('left');
      if (borders.right) borderTypes.push('right');

      if (borderTypes.length > 0) {
        const value = cell?.formattedValue || '';
        console.log(`  E${row}: ${borderTypes.join(', ')} - value: "${value}"`);
      }
    }
  }

  // Check column Y
  console.log('\nColumn Y:');
  const yData = sheetsData.data?.[1]?.rowData || [];
  for (let i = 0; i < yData.length; i++) {
    const row = startRow + i;
    const cell = yData[i]?.values?.[0];
    const borders = cell?.userEnteredFormat?.borders;

    if (borders) {
      const borderTypes = [];
      if (borders.top) borderTypes.push('top');
      if (borders.bottom) borderTypes.push('bottom');
      if (borders.left) borderTypes.push('left');
      if (borders.right) borderTypes.push('right');

      if (borderTypes.length > 0) {
        const value = cell?.formattedValue || '';
        console.log(`  Y${row}: ${borderTypes.join(', ')} - value: "${value}"`);
      }
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

  console.log('🔍 Finding Region Name Borders in Example Sheet');
  console.log('='.repeat(80));

  // Scan around row 15 (ALPHA/GAMMA)
  await scanRows(sheets, 14, 16);

  // Scan around row 31 (BETA/DELTA) - check wider range
  await scanRows(sheets, 28, 34);
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
