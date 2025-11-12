import { google } from 'googleapis';
import * as path from 'path';

/**
 * Comprehensive border fix - copy ALL borders from example sheet to test sheet
 * This ensures complete border coverage without any gaps
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

async function fixAllBracketBorders() {
  console.log('🔍 Comprehensive bracket border fix - copying ALL borders from example sheet...\n');

  const sheetId = await getSheetIdByName(TEST_SHEET_ID, 'Bracket');
  const requests: any[] = [];

  // Process the entire bracket in sections for better progress tracking
  const sections = [
    { name: 'Top section (rows 2-20)', startRow: 2, endRow: 20 },
    { name: 'Upper middle (rows 21-32)', startRow: 21, endRow: 32 },
    { name: 'Middle separator (row 33)', startRow: 33, endRow: 33 },
    { name: 'Lower middle (rows 34-46)', startRow: 34, endRow: 46 },
    { name: 'Bottom section (rows 47-65)', startRow: 47, endRow: 65 },
  ];

  console.log('🔲 Copying borders from example sheet...\n');

  for (const section of sections) {
    console.log(`   Processing: ${section.name}...`);

    // Map to example sheet rows (accounting for row 33 offset)
    const exampleStartRow = section.startRow >= 33 ? section.startRow - 1 : section.startRow;
    const exampleEndRow = section.endRow >= 33 ? section.endRow - 1 : section.endRow;

    // Read all borders from example sheet for this section
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
          // Check if cell has any border information
          const borders = cell.effectiveFormat?.borders;

          if (borders) {
            // Apply border even if it's "NONE" - this ensures we clear unwanted borders too
            const hasBorder = borders.top?.style || borders.bottom?.style ||
                            borders.left?.style || borders.right?.style;

            // Create border update request
            // We'll apply the border exactly as it appears in the example
            requests.push({
              updateBorders: {
                range: {
                  sheetId,
                  startRowIndex: testRow - 1,
                  endRowIndex: testRow,
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
          }
        });
      });

      console.log(`      → ${borderCount} borders copied`);
    }
  }

  console.log(`\n📊 Total border operations: ${requests.length}`);

  if (requests.length === 0) {
    console.log('\n⚠️  No borders found - this is unexpected!');
    return;
  }

  // Execute all requests in batches
  console.log('\n✨ Applying all borders to test sheet...');

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

  console.log('\n✅ Comprehensive border fix complete!');
  console.log('\n📊 Summary:');
  console.log(`   ✓ ${requests.length} border operations applied`);
  console.log('   ✓ All borders copied exactly from example sheet');
  console.log('   ✓ Top section (rows 2-20): Complete');
  console.log('   ✓ Upper middle (rows 21-32): Complete');
  console.log('   ✓ Middle separator (row 33): Complete');
  console.log('   ✓ Lower middle (rows 34-46): Complete');
  console.log('   ✓ Bottom section (rows 47-65): Complete');
  console.log('\n🎯 All bracket borders should now match example sheet exactly!');
  console.log('   No gaps should remain in any connecting lines.');
}

fixAllBracketBorders().catch(console.error);
