import { google } from 'googleapis';
import * as path from 'path';

/**
 * Copy borders from manually corrected test sheet
 * This reads the current borders and reapplies them to ensure they're preserved
 */

const TEST_SHEET_ID = '1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o';

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

async function copyBordersFromTest() {
  console.log('📖 Reading borders from manually corrected test sheet...\n');

  const sheetId = await getSheetIdByName(TEST_SHEET_ID, 'Bracket');

  // Read ALL cells from the bracket with border information
  console.log('🔍 Reading entire bracket (rows 1-65, columns A-AF)...');

  const testSheetData = await sheets.spreadsheets.get({
    spreadsheetId: TEST_SHEET_ID,
    ranges: ['Bracket!A1:AF65'],
    includeGridData: true,
  });

  const gridData = testSheetData.data.sheets?.[0]?.data?.[0];

  if (!gridData?.rowData) {
    console.log('❌ No grid data found!');
    return;
  }

  console.log(`✅ Read ${gridData.rowData.length} rows of data\n`);

  // Extract all borders and create update requests
  const requests: any[] = [];
  let borderCount = 0;

  console.log('🔲 Processing borders...\n');

  gridData.rowData.forEach((row, rowIndex) => {
    const actualRow = rowIndex + 1; // Convert to 1-based row number

    row.values?.forEach((cell, colIndex) => {
      const borders = cell.effectiveFormat?.borders;

      if (borders) {
        // Apply the border exactly as it exists in the test sheet
        requests.push({
          updateBorders: {
            range: {
              sheetId,
              startRowIndex: rowIndex,
              endRowIndex: rowIndex + 1,
              startColumnIndex: colIndex,
              endColumnIndex: colIndex + 1,
            },
            top: borders.top || { style: 'NONE' },
            bottom: borders.bottom || { style: 'NONE' },
            left: borders.left || { style: 'NONE' },
            right: borders.right || { style: 'NONE' },
          },
        });
        borderCount++;

        // Log progress every 100 borders
        if (borderCount % 100 === 0) {
          console.log(`   Processed ${borderCount} borders...`);
        }
      }
    });
  });

  console.log(`\n📊 Total borders to apply: ${requests.length}`);

  if (requests.length === 0) {
    console.log('\n⚠️  No borders found in test sheet!');
    return;
  }

  // Apply all borders back to the test sheet
  console.log('\n✨ Reapplying borders to test sheet...');

  const batchSize = 100;
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: TEST_SHEET_ID,
      requestBody: {
        requests: batch,
      },
    });
    console.log(`   Applied ${Math.min(i + batchSize, requests.length)}/${requests.length} borders`);
  }

  console.log('\n✅ Borders reapplied successfully!');
  console.log('\n📊 Summary:');
  console.log(`   ✓ ${requests.length} border operations applied`);
  console.log('   ✓ Borders read from manually corrected test sheet');
  console.log('   ✓ Borders reapplied to preserve manual corrections');
  console.log('\n🎯 Test sheet borders should now exactly match your manual corrections!');
  console.log('   This ensures all border formatting is preserved.');
}

copyBordersFromTest().catch(console.error);
