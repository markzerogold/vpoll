import { google } from 'googleapis';
import * as path from 'path';

/**
 * Move bottom region names (Klingon Empire, Dominion) from row 31 to row 47
 * This matches the example sheet structure where bottom regions are at row 46
 * (row 47 in test sheet due to row 33 separator)
 */

const TEST_SHEET_ID = '1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o';
const EXAMPLE_SHEET_ID = '1Z83Lr02EW9wvpH3YfBvLwafHMIqyxJLXaO_0D85bMfk';

const keyPath = path.join(__dirname, '../keys/vpoll-key.json');
const auth = new google.auth.GoogleAuth({
  keyFile: keyPath,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

/**
 * Region colors from previous styling
 */
const REGION_COLORS = {
  BETA: { red: 0.99, green: 0.9, blue: 0.8 },      // Light orange
  DELTA: { red: 0.9, green: 0.72, blue: 0.69 },    // Light salmon/red
};

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

async function moveBottomRegions() {
  console.log('🔧 Moving bottom region names from row 31 to row 47...\n');

  const sheetId = await getSheetIdByName(TEST_SHEET_ID, 'Bracket');
  const requests: any[] = [];

  // STEP 1: UNMERGE OLD LOCATIONS (row 31)
  console.log('📦 Unmerging old region cells at row 31...');

  // Unmerge E31:G34 (BETA/Klingon Empire)
  requests.push({
    unmergeCells: {
      range: {
        sheetId,
        startRowIndex: 30,  // Row 31
        endRowIndex: 34,
        startColumnIndex: colToIndex('E'),
        endColumnIndex: colToIndex('G') + 1,
      },
    },
  });

  // Unmerge Y31:AA34 (DELTA/Dominion)
  requests.push({
    unmergeCells: {
      range: {
        sheetId,
        startRowIndex: 30,  // Row 31
        endRowIndex: 34,
        startColumnIndex: colToIndex('Y'),
        endColumnIndex: colToIndex('AA') + 1,
      },
    },
  });

  // STEP 2: CLEAR OLD CELLS (row 31-34, columns E-G and Y-AA)
  console.log('🧹 Clearing old region cells...');

  // Clear content from E31:G34
  await sheets.spreadsheets.values.clear({
    spreadsheetId: TEST_SHEET_ID,
    range: 'Bracket!E31:G34',
  });

  // Clear content from Y31:AA34
  await sheets.spreadsheets.values.clear({
    spreadsheetId: TEST_SHEET_ID,
    range: 'Bracket!Y31:AA34',
  });

  // Reset formatting on old cells (E31:G34) - without borders
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 30,
        endRowIndex: 34,
        startColumnIndex: colToIndex('E'),
        endColumnIndex: colToIndex('G') + 1,
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: { red: 1, green: 1, blue: 1 }, // White
          textFormat: { bold: false, fontSize: 10 },
          horizontalAlignment: 'LEFT',
        },
      },
      fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
    },
  });

  // Reset formatting on old cells (Y31:AA34) - without borders
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 30,
        endRowIndex: 34,
        startColumnIndex: colToIndex('Y'),
        endColumnIndex: colToIndex('AA') + 1,
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: { red: 1, green: 1, blue: 1 }, // White
          textFormat: { bold: false, fontSize: 10 },
          horizontalAlignment: 'LEFT',
        },
      },
      fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
    },
  });

  // Clear borders on old cells (E31:G34)
  requests.push({
    updateBorders: {
      range: {
        sheetId,
        startRowIndex: 30,
        endRowIndex: 34,
        startColumnIndex: colToIndex('E'),
        endColumnIndex: colToIndex('G') + 1,
      },
      top: { style: 'NONE' },
      bottom: { style: 'NONE' },
      left: { style: 'NONE' },
      right: { style: 'NONE' },
      innerHorizontal: { style: 'NONE' },
      innerVertical: { style: 'NONE' },
    },
  });

  // Clear borders on old cells (Y31:AA34)
  requests.push({
    updateBorders: {
      range: {
        sheetId,
        startRowIndex: 30,
        endRowIndex: 34,
        startColumnIndex: colToIndex('Y'),
        endColumnIndex: colToIndex('AA') + 1,
      },
      top: { style: 'NONE' },
      bottom: { style: 'NONE' },
      left: { style: 'NONE' },
      right: { style: 'NONE' },
      innerHorizontal: { style: 'NONE' },
      innerVertical: { style: 'NONE' },
    },
  });

  // STEP 3: WRITE REGION NAMES TO NEW LOCATIONS (row 47)
  console.log('📝 Writing region names to row 47...');

  // Write "Klingon Empire" to E47
  await sheets.spreadsheets.values.update({
    spreadsheetId: TEST_SHEET_ID,
    range: 'Bracket!E47',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [['=Regions!C2']],  // Formula to pull from Regions tab
    },
  });

  // Write "Dominion" to Y47
  await sheets.spreadsheets.values.update({
    spreadsheetId: TEST_SHEET_ID,
    range: 'Bracket!Y47',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [['=Regions!E2']],  // Formula to pull from Regions tab
    },
  });

  // STEP 4: MERGE NEW LOCATIONS (row 47-50)
  console.log('🔗 Merging new region cells at row 47...');

  // Merge E47:G50 (BETA/Klingon Empire)
  requests.push({
    mergeCells: {
      range: {
        sheetId,
        startRowIndex: 46,  // Row 47
        endRowIndex: 50,    // 4 rows
        startColumnIndex: colToIndex('E'),
        endColumnIndex: colToIndex('G') + 1,  // 3 columns
      },
      mergeType: 'MERGE_ALL',
    },
  });

  // Merge Y47:AA50 (DELTA/Dominion)
  requests.push({
    mergeCells: {
      range: {
        sheetId,
        startRowIndex: 46,  // Row 47
        endRowIndex: 50,    // 4 rows
        startColumnIndex: colToIndex('Y'),
        endColumnIndex: colToIndex('AA') + 1,  // 3 columns
      },
      mergeType: 'MERGE_ALL',
    },
  });

  // STEP 5: FORMAT NEW CELLS (colors, text size, borders)
  console.log('🎨 Applying formatting to new region cells...');

  // Format E47:G50 (BETA/Klingon Empire)
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 46,
        endRowIndex: 50,
        startColumnIndex: colToIndex('E'),
        endColumnIndex: colToIndex('G') + 1,
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: REGION_COLORS.BETA,
          textFormat: {
            bold: true,
            fontSize: 22,
          },
          horizontalAlignment: 'CENTER',
          verticalAlignment: 'MIDDLE',
        },
      },
      fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
    },
  });

  // Format Y47:AA50 (DELTA/Dominion)
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 46,
        endRowIndex: 50,
        startColumnIndex: colToIndex('Y'),
        endColumnIndex: colToIndex('AA') + 1,
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: REGION_COLORS.DELTA,
          textFormat: {
            bold: true,
            fontSize: 22,
          },
          horizontalAlignment: 'CENTER',
          verticalAlignment: 'MIDDLE',
        },
      },
      fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
    },
  });

  // STEP 6: REAPPLY BORDERS FROM EXAMPLE SHEET
  console.log('🔲 Reapplying borders from example sheet...');

  // Read borders from example sheet for rows 46-50 (which maps to 47-51 in test sheet)
  const exampleSheetData = await sheets.spreadsheets.get({
    spreadsheetId: EXAMPLE_SHEET_ID,
    ranges: ['Bracket!A46:AF50'],
    includeGridData: true,
  });

  const gridData = exampleSheetData.data.sheets?.[0]?.data?.[0];
  const borderRequests: any[] = [];

  if (gridData?.rowData) {
    gridData.rowData.forEach((row, rowOffset) => {
      const exampleRow = 46 + rowOffset;  // 46, 47, 48, 49, 50
      const testRow = 47 + rowOffset;     // 47, 48, 49, 50, 51

      row.values?.forEach((cell, colIndex) => {
        if (cell.effectiveFormat?.borders) {
          const borders = cell.effectiveFormat.borders;

          // Check if any border is defined
          if (borders.top?.style || borders.bottom?.style || borders.left?.style || borders.right?.style) {
            borderRequests.push({
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

    console.log(`   Found ${borderRequests.length} border updates`);
    requests.push(...borderRequests);
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

  console.log('\n✅ Bottom regions moved successfully!');
  console.log('\n📊 Summary:');
  console.log('   ✓ Unmerged old cells at row 31');
  console.log('   ✓ Cleared content and reset formatting');
  console.log('   ✓ Created new merged cells at row 47 (E47:G50, Y47:AA50)');
  console.log('   ✓ Applied background colors (BETA: orange, DELTA: salmon)');
  console.log('   ✓ Applied text formatting (22pt bold, centered)');
  console.log('   ✓ Reapplied borders from example sheet');
  console.log('\n🎯 Region positions:');
  console.log('   • Federation (ALPHA): E15');
  console.log('   • Romulan Star Empire (GAMMA): Y15');
  console.log('   • Klingon Empire (BETA): E47 ← MOVED');
  console.log('   • Dominion (DELTA): Y47 ← MOVED');
}

moveBottomRegions().catch(console.error);
