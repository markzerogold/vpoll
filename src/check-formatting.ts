import { google } from 'googleapis';
import * as path from 'path';

const TEST_SHEET_ID = '1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w';

async function checkFormatting() {
  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  console.log('🎨 DETAILED FORMATTING REPORT\n');
  console.log('='.repeat(80));

  const metadata = await sheets.spreadsheets.get({
    spreadsheetId: TEST_SHEET_ID,
    ranges: ['Bracket!A1:AE60'],
    includeGridData: true,
  });

  const sheet = metadata.data.sheets?.[0];
  const merges = sheet?.merges || [];

  console.log('\n📐 MERGED CELLS\n');
  console.log(`Total merged ranges: ${merges.length}\n`);

  merges.forEach((merge, i) => {
    const startRow = (merge.startRowIndex || 0) + 1;
    const endRow = (merge.endRowIndex || 0);
    const startCol = colToLetter((merge.startColumnIndex || 0));
    const endCol = colToLetter((merge.endColumnIndex || 0) - 1);

    console.log(`  ${i + 1}. ${startCol}${startRow}:${endCol}${endRow}`);
    console.log(`      Rows ${merge.startRowIndex}-${merge.endRowIndex}, Cols ${merge.startColumnIndex}-${merge.endColumnIndex}`);
  });

  console.log('\n' + '='.repeat(80));
  console.log('\n🖼️  BORDER STATUS\n');

  const gridData = sheet?.data?.[0];
  const rowData = gridData?.rowData || [];

  // Check specific cells for borders
  const cellsToCheck = [
    { row: 1, col: 0, label: 'A1 (Round 1 header)' },
    { row: 2, col: 1, label: 'B2 (First participant)' },
    { row: 3, col: 1, label: 'B3 (Second participant)' },
    { row: 14, col: 4, label: 'E15 (Region name area)' },
  ];

  cellsToCheck.forEach(({ row, col, label }) => {
    const cell = rowData[row]?.values?.[col];
    const hasBorders = !!cell?.effectiveFormat?.borders;
    const borders = cell?.effectiveFormat?.borders;

    console.log(`  ${label}:`);
    console.log(`    Has borders: ${hasBorders}`);
    if (hasBorders && borders) {
      console.log(`    Top: ${!!borders.top?.style}`);
      console.log(`    Bottom: ${!!borders.bottom?.style}`);
      console.log(`    Left: ${!!borders.left?.style}`);
      console.log(`    Right: ${!!borders.right?.style}`);
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log('\n🎨 BACKGROUND COLORS\n');

  // Check for region name backgrounds
  const regionsNameRow = 14; // Row 15 (0-indexed)
  const row15 = rowData[regionsNameRow];

  if (row15) {
    const regionsColumns = [4, 20]; // E and U columns (0-indexed)
    regionsColumns.forEach(col => {
      const cell = row15.values?.[col];
      const bgColor = cell?.effectiveFormat?.backgroundColor;
      const hasColor = !!(bgColor && (bgColor.red || bgColor.green || bgColor.blue));

      console.log(`  ${colToLetter(col)}15 (Region name):`);
      console.log(`    Has background: ${hasColor}`);
      if (hasColor && bgColor) {
        console.log(`    RGB: (${bgColor.red || 0}, ${bgColor.green || 0}, ${bgColor.blue || 0})`);
      }
    });
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n✅ FORMATTING CHECK COMPLETE\n');
}

function colToLetter(col: number): string {
  let letter = '';
  while (col >= 0) {
    letter = String.fromCharCode((col % 26) + 65) + letter;
    col = Math.floor(col / 26) - 1;
  }
  return letter;
}

checkFormatting()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
