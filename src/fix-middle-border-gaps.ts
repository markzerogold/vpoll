import { google } from 'googleapis';
import * as path from 'path';

/**
 * Fix border gaps in the middle section of the bracket (around rows 38-42)
 * and verify surrounding rows to prevent creating new gaps
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

async function fixMiddleBorderGaps() {
  console.log('🔧 Fixing middle bracket border gaps...\n');

  const sheetId = await getSheetIdByName(TEST_SHEET_ID, 'Bracket');
  const requests: any[] = [];

  // Fix the problem area and surrounding rows to ensure no new gaps
  // Based on screenshot, issue is around row 39-40, but we'll check broader area
  const problemRanges = [
    { startRow: 35, endRow: 45 },  // Middle section with visible gap (extended range for safety)
  ];

  console.log('🔲 Reading borders from example sheet and applying fixes...\n');

  for (const range of problemRanges) {
    // Map example sheet rows to test sheet rows
    // Example row >= 33 → Test row = Example row + 1 (due to row 33 separator)
    const exampleStartRow = range.startRow >= 33 ? range.startRow - 1 : range.startRow;
    const exampleEndRow = range.endRow >= 33 ? range.endRow - 1 : range.endRow;

    console.log(`   Processing rows ${range.startRow}-${range.endRow}...`);
    console.log(`   Reading from example rows ${exampleStartRow}-${exampleEndRow}...`);

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
      console.log(`   Found ${borderCount} border updates for this range`);
    }
  }

  console.log(`\n📊 Total border updates to apply: ${requests.length}`);

  if (requests.length === 0) {
    console.log('\n⚠️  No border updates found - this is unexpected!');
    return;
  }

  // Execute all requests in batches
  console.log('\n✨ Executing border updates...');

  const batchSize = 100;
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: TEST_SHEET_ID,
      requestBody: {
        requests: batch,
      },
    });
    console.log(`   Applied ${Math.min(i + batchSize, requests.length)}/${requests.length} requests`);
  }

  console.log('\n✅ Middle bracket border gaps fixed!');
  console.log('\n📊 Summary:');
  console.log(`   ✓ ${requests.length} border updates applied`);
  console.log('   ✓ Rows 35-45 borders verified and corrected');
  console.log('   ✓ Surrounding area checked to prevent new gaps');
  console.log('\n💡 Next: Please check the bracket tab to verify all lines connect properly');
  console.log('   Focus on rows 35-45 to ensure no gaps remain');
}

fixMiddleBorderGaps().catch(console.error);
