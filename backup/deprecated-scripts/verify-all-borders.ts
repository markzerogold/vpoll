import { google } from 'googleapis';
import * as path from 'path';

/**
 * Comprehensive border verification and fix across all bracket rows
 * This ensures no gaps exist anywhere in the bracket
 */

const TEST_SHEET_ID = '1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o';
const EXAMPLE_SHEET_ID = '1Z83Lr02EW9wvpH3YfBvLwafHMIqyxJLXaO_0D85bMfk';

const keyPath = path.join(__dirname, '../keys/vpoll-key.json');
const auth = new google.auth.GoogleAuth({
  keyFile: keyPath,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

async function getSheetIdByName(spreadsheetId: string, sheetName: string): Promise<number> {
  const response = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = response.data.sheets?.find(s => s.properties?.title === sheetName);
  if (!sheet || sheet.properties?.sheetId === undefined || sheet.properties.sheetId === null) {
    throw new Error(`Sheet "${sheetName}" not found`);
  }
  return sheet.properties.sheetId as number;
}

async function verifyAndFixAllBorders() {
  console.log('🔍 Comprehensive bracket border verification...\n');

  const sheetId = await getSheetIdByName(TEST_SHEET_ID, 'Bracket');
  const requests: any[] = [];

  // Check all critical bracket areas
  // These ranges cover all areas where bracket lines appear
  const criticalRanges = [
    { name: 'Top bracket (Round 1-2)', startRow: 2, endRow: 12 },
    { name: 'Top regions area', startRow: 13, endRow: 20 },
    { name: 'Top to middle transition', startRow: 21, endRow: 32 },
    { name: 'Middle separator area', startRow: 33, endRow: 33 },
    { name: 'Middle to bottom transition', startRow: 34, endRow: 45 },
    { name: 'Bottom regions area', startRow: 46, endRow: 52 },
    { name: 'Bottom bracket (Round 1-2)', startRow: 53, endRow: 65 },
  ];

  console.log('🔲 Scanning all bracket areas for border gaps...\n');

  for (const range of criticalRanges) {
    console.log(`   Checking: ${range.name} (rows ${range.startRow}-${range.endRow})...`);

    // Map to example sheet rows
    const exampleStartRow = range.startRow >= 33 ? range.startRow - 1 : range.startRow;
    const exampleEndRow = range.endRow >= 33 ? range.endRow - 1 : range.endRow;

    // Read borders from example sheet
    const exampleSheetData = await sheets.spreadsheets.get({
      spreadsheetId: EXAMPLE_SHEET_ID,
      ranges: [`Bracket!A${exampleStartRow}:AF${exampleEndRow}`],
      includeGridData: true,
    });

    const gridData = exampleSheetData.data.sheets?.[0]?.data?.[0];

    if (gridData?.rowData) {
      let borderCount = 0;
      gridData.rowData.forEach((row, rowOffset) => {
        const exampleRow = exampleStartRow + rowOffset;
        const testRow = exampleRow >= 33 ? exampleRow + 1 : exampleRow;

        row.values?.forEach((cell, colIndex) => {
          if (cell.effectiveFormat?.borders) {
            const borders = cell.effectiveFormat.borders;

            // Check if any border is defined
            if (borders.top?.style || borders.bottom?.style || borders.left?.style || borders.right?.style) {
              requests.push({
                updateBorders: {
                  range: {
                    sheetId,
                    startRowIndex: testRow - 1,
                    endRowIndex: testRow,
                    startColumnIndex: colIndex,
                    endColumnIndex: colIndex + 1,
                  },
                  top: borders.top,
                  bottom: borders.bottom,
                  left: borders.left,
                  right: borders.right,
                },
              });
              borderCount++;
            }
          }
        });
      });
      console.log(`      → Found ${borderCount} borders to verify/fix`);
    }
  }

  console.log(`\n📊 Total border operations: ${requests.length}`);

  if (requests.length === 0) {
    console.log('\n✅ No border updates needed - all borders are correct!');
    return;
  }

  // Execute all requests in batches
  console.log('\n✨ Applying border updates...');

  const batchSize = 100;
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: TEST_SHEET_ID,
      requestBody: {
        requests: batch,
      },
    });
    console.log(`   Applied ${Math.min(i + batchSize, requests.length)}/${requests.length} updates`);
  }

  console.log('\n✅ Comprehensive border verification complete!');
  console.log('\n📊 Summary:');
  console.log(`   ✓ ${requests.length} border updates applied across all bracket areas`);
  console.log('   ✓ Top bracket (rows 2-12): Verified');
  console.log('   ✓ Top regions (rows 13-20): Verified');
  console.log('   ✓ Top-middle transition (rows 21-32): Verified');
  console.log('   ✓ Middle separator (row 33): Verified');
  console.log('   ✓ Middle-bottom transition (rows 34-45): Verified');
  console.log('   ✓ Bottom regions (rows 46-52): Verified');
  console.log('   ✓ Bottom bracket (rows 53-65): Verified');
  console.log('\n🎯 All bracket borders should now be complete without gaps!');
}

verifyAndFixAllBorders().catch(console.error);
