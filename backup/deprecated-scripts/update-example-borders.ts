import { google } from 'googleapis';
import * as path from 'path';

/**
 * Update example sheet borders from manually corrected test sheet
 * This makes the test sheet the new source of truth for borders
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

async function updateExampleBorders() {
  console.log('📖 Reading borders from manually corrected test sheet...\n');

  // Read borders from test sheet
  console.log('🔍 Reading entire bracket from test sheet (rows 1-65, columns A-AF)...');

  const testSheetData = await sheets.spreadsheets.get({
    spreadsheetId: TEST_SHEET_ID,
    ranges: ['Bracket!A1:AF65'],
    includeGridData: true,
  });

  const testGridData = testSheetData.data.sheets?.[0]?.data?.[0];

  if (!testGridData?.rowData) {
    console.log('❌ No grid data found in test sheet!');
    return;
  }

  console.log(`✅ Read ${testGridData.rowData.length} rows from test sheet\n`);

  // Get example sheet ID
  const exampleSheetId = await getSheetIdByName(EXAMPLE_SHEET_ID, 'Bracket');

  // Extract borders and create update requests for example sheet
  const requests: any[] = [];
  let borderCount = 0;

  console.log('🔲 Processing borders for example sheet...\n');

  testGridData.rowData.forEach((row, rowIndex) => {
    // Map test sheet rows to example sheet rows
    // Test sheet has row 33 separator, example sheet doesn't
    let exampleRowIndex = rowIndex;
    if (rowIndex >= 33) {
      // Test rows 33-64 map to example rows 32-63
      exampleRowIndex = rowIndex - 1;
    }

    row.values?.forEach((cell, colIndex) => {
      const borders = cell.effectiveFormat?.borders;

      if (borders) {
        // Skip row 33 from test sheet (separator that doesn't exist in example)
        if (rowIndex === 32) {
          return;
        }

        // Apply border to example sheet
        requests.push({
          updateBorders: {
            range: {
              sheetId: exampleSheetId,
              startRowIndex: exampleRowIndex,
              endRowIndex: exampleRowIndex + 1,
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

  console.log(`\n📊 Total borders to apply to example sheet: ${requests.length}`);

  if (requests.length === 0) {
    console.log('\n⚠️  No borders to apply!');
    return;
  }

  // Apply borders to example sheet
  console.log('\n✨ Applying borders to example sheet...');

  const batchSize = 100;
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: EXAMPLE_SHEET_ID,
      requestBody: {
        requests: batch,
      },
    });
    console.log(`   Applied ${Math.min(i + batchSize, requests.length)}/${requests.length} borders`);
  }

  console.log('\n✅ Example sheet borders updated successfully!');
  console.log('\n📊 Summary:');
  console.log(`   ✓ ${requests.length} border operations applied to example sheet`);
  console.log('   ✓ Borders copied from manually corrected test sheet');
  console.log('   ✓ Row mapping applied (test row 33 separator handled)');
  console.log('\n🎯 Example sheet now has correct borders!');
  console.log('   Future border applications will use these corrected borders.');
}

updateExampleBorders().catch(console.error);
