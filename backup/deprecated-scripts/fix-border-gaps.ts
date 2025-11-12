import { google } from 'googleapis';
import * as path from 'path';

/**
 * Fix border gaps in the bracket after moving regions
 * Also reduce championship label font size to 10pt
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

function colToIndex(col: string): number {
  let index = 0;
  for (let i = 0; i < col.length; i++) {
    index = index * 26 + (col.charCodeAt(i) - 65 + 1);
  }
  return index - 1;
}

async function fixBorderGaps() {
  console.log('🔧 Fixing border gaps and championship label...\n');

  const sheetId = await getSheetIdByName(TEST_SHEET_ID, 'Bracket');
  const requests: any[] = [];

  // STEP 1: FIX CHAMPIONSHIP LABEL FONT SIZE
  console.log('📝 Reducing championship label to 10pt...');

  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 17,  // Row 18
        endRowIndex: 18,
        startColumnIndex: colToIndex('O'),
        endColumnIndex: colToIndex('Q') + 1,  // Merged range O18:Q18
      },
      cell: {
        userEnteredFormat: {
          wrapStrategy: 'WRAP',
          textFormat: {
            bold: true,
            fontSize: 10,  // Reduced from 16pt
          },
          horizontalAlignment: 'CENTER',
          verticalAlignment: 'MIDDLE',
        },
      },
      fields: 'userEnteredFormat(wrapStrategy,textFormat,horizontalAlignment,verticalAlignment)',
    },
  });

  // STEP 2: REAPPLY BORDERS FROM EXAMPLE SHEET FOR GAP AREAS
  console.log('🔲 Reapplying borders to fix gaps...');

  // Focus on the problem areas: rows 30-35 (around old region location)
  const problemRanges = [
    { startRow: 30, endRow: 35 },  // Around old row 31 location
    { startRow: 13, endRow: 20 },  // Around top regions
    { startRow: 46, endRow: 52 },  // Around new bottom region location
  ];

  for (const range of problemRanges) {
    // Map example sheet rows to test sheet rows
    const exampleStartRow = range.startRow >= 33 ? range.startRow - 1 : range.startRow;
    const exampleEndRow = range.endRow >= 33 ? range.endRow - 1 : range.endRow;

    console.log(`   Reading borders from example rows ${exampleStartRow}-${exampleEndRow}...`);

    const exampleSheetData = await sheets.spreadsheets.get({
      spreadsheetId: EXAMPLE_SHEET_ID,
      ranges: [`Bracket!A${exampleStartRow}:AF${exampleEndRow}`],
      includeGridData: true,
    });

    const gridData = exampleSheetData.data.sheets?.[0]?.data?.[0];

    if (gridData?.rowData) {
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
            }
          }
        });
      });
    }
  }

  console.log(`   Found ${requests.length - 1} border updates`);

  // STEP 3: AUTO-SIZE COLUMNS
  console.log('📏 Auto-sizing columns...');

  // Auto-resize columns A-AF
  for (let colIndex = 0; colIndex < 32; colIndex++) {
    requests.push({
      autoResizeDimensions: {
        dimensions: {
          sheetId,
          dimension: 'COLUMNS',
          startIndex: colIndex,
          endIndex: colIndex + 1,
        },
      },
    });
  }

  // Execute all requests
  console.log(`\n✨ Executing ${requests.length} formatting requests...`);

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

  console.log('\n✅ Border gaps fixed!');
  console.log('\n📊 Summary:');
  console.log('   ✓ Championship label reduced to 10pt bold');
  console.log('   ✓ Text wrapping maintained (displays on 2 lines)');
  console.log('   ✓ Border gaps filled (rows 13-20, 30-35, 46-52)');
  console.log('   ✓ All columns auto-sized (A-AF)');
  console.log('   ✓ Bracket lines now connect properly');
}

fixBorderGaps().catch(console.error);
