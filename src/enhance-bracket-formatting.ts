import { google } from 'googleapis';
import * as path from 'path';

/**
 * Apply additional formatting enhancements to the bracket:
 * - Freeze row 1
 * - Bold all text in row 1
 * - Change O18 to formula pulling tournament name from Config
 * - Increase O18 text size to 16pt and bold
 * - Increase region name text size to 22pt
 * - Auto-size all columns to fit content
 */

const TEST_SHEET_ID = '1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o';

// Initialize Google Sheets API
const keyPath = path.join(__dirname, '../keys/vpoll-key.json');
const auth = new google.auth.GoogleAuth({
  keyFile: keyPath,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

/**
 * Get sheet ID by name
 */
async function getSheetIdByName(spreadsheetId: string, sheetName: string): Promise<number> {
  const response = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = response.data.sheets?.find(s => s.properties?.title === sheetName);
  if (!sheet || sheet.properties?.sheetId === undefined || sheet.properties.sheetId === null) {
    throw new Error(`Sheet "${sheetName}" not found`);
  }
  return sheet.properties.sheetId as number;
}

/**
 * Column letter to index (A=0, B=1, etc.)
 */
function colToIndex(col: string): number {
  let index = 0;
  for (let i = 0; i < col.length; i++) {
    index = index * 26 + (col.charCodeAt(i) - 65 + 1);
  }
  return index - 1;
}

/**
 * Apply formatting enhancements
 */
async function enhanceBracketFormatting() {
  console.log('🎨 Applying bracket formatting enhancements...\n');

  const sheetId = await getSheetIdByName(TEST_SHEET_ID, 'Bracket');
  const requests: any[] = [];

  // 1. FREEZE ROW 1
  console.log('❄️  Freezing row 1...');

  requests.push({
    updateSheetProperties: {
      properties: {
        sheetId,
        gridProperties: {
          frozenRowCount: 1,
        },
      },
      fields: 'gridProperties.frozenRowCount',
    },
  });

  // 2. BOLD ALL TEXT IN ROW 1
  console.log('📝 Making row 1 text bold...');

  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 0,
        endRowIndex: 1,
        startColumnIndex: 0,
        endColumnIndex: 32, // All columns A-AF
      },
      cell: {
        userEnteredFormat: {
          textFormat: {
            bold: true,
          },
        },
      },
      fields: 'userEnteredFormat.textFormat.bold',
    },
  });

  // 3. UPDATE O18 WITH FORMULA (single line display)
  console.log('🏆 Updating championship label with formula...');

  // First, update the cell value to use a formula (single line)
  await sheets.spreadsheets.values.update({
    spreadsheetId: TEST_SHEET_ID,
    range: 'Bracket!O18',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [['=Config!B3&" - Champion"']],
    },
  });

  // Then format O18 (10pt, bold, no text wrapping)
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 17,
        endRowIndex: 18,
        startColumnIndex: colToIndex('O'),
        endColumnIndex: colToIndex('Q') + 1, // Covers merged range O18:Q18
      },
      cell: {
        userEnteredFormat: {
          wrapStrategy: 'CLIP', // No wrapping - single line display
          textFormat: {
            bold: true,
            fontSize: 10,  // 10pt to avoid stretching row
          },
          horizontalAlignment: 'CENTER',
          verticalAlignment: 'MIDDLE',
        },
      },
      fields: 'userEnteredFormat(wrapStrategy,textFormat,horizontalAlignment,verticalAlignment)',
    },
  });

  // 4. INCREASE REGION NAME TEXT SIZE TO 22PT
  console.log('📐 Increasing region name text size to 22pt...');

  const regionRanges = [
    { startRow: 15, startCol: 'E', endCol: 'G', rows: 4 },   // ALPHA/Federation
    { startRow: 15, startCol: 'Y', endCol: 'AA', rows: 4 },  // GAMMA/Romulan
    { startRow: 31, startCol: 'E', endCol: 'G', rows: 4 },   // BETA/Klingon
    { startRow: 31, startCol: 'Y', endCol: 'AA', rows: 4 },  // DELTA/Dominion
  ];

  for (const region of regionRanges) {
    requests.push({
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: region.startRow - 1,
          endRowIndex: region.startRow + region.rows - 1,
          startColumnIndex: colToIndex(region.startCol),
          endColumnIndex: colToIndex(region.endCol) + 1,
        },
        cell: {
          userEnteredFormat: {
            textFormat: {
              bold: true,
              fontSize: 22,
            },
          },
        },
        fields: 'userEnteredFormat.textFormat',
      },
    });
  }

  // 5. AUTO-SIZE ALL COLUMNS
  console.log('📏 Auto-sizing all columns to fit content...');

  // Auto-resize all columns A-AF (columns 0-31)
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

  // 6. DISABLE TEXT WRAPPING FOR ALL CELLS (except column O)
  console.log('📄 Disabling text wrapping for most cells...');

  // Disable wrapping for columns A-N (before championship label)
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 0,
        endRowIndex: 1000,
        startColumnIndex: 0,
        endColumnIndex: colToIndex('O'), // A through N
      },
      cell: {
        userEnteredFormat: {
          wrapStrategy: 'CLIP',
        },
      },
      fields: 'userEnteredFormat.wrapStrategy',
    },
  });

  // Disable wrapping for columns R-AF (after championship label merged range)
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 0,
        endRowIndex: 1000,
        startColumnIndex: colToIndex('R'),
        endColumnIndex: 32, // R through AF
      },
      cell: {
        userEnteredFormat: {
          wrapStrategy: 'CLIP',
        },
      },
      fields: 'userEnteredFormat.wrapStrategy',
    },
  });

  // Note: Column O (and merged P, Q) uses CLIP strategy - no wrapping

  // 7. SET UNIFORM ROW HEIGHTS
  console.log('📏 Setting uniform row heights for all bracket rows...');

  // Set all rows to 21 pixels (standard row height)
  for (let rowIndex = 0; rowIndex < 65; rowIndex++) {
    requests.push({
      updateDimensionProperties: {
        range: {
          sheetId,
          dimension: 'ROWS',
          startIndex: rowIndex,
          endIndex: rowIndex + 1,
        },
        properties: {
          pixelSize: 21,  // Standard row height
        },
        fields: 'pixelSize',
      },
    });
  }

  // Execute all formatting requests
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

  console.log('\n✅ Bracket formatting enhancements complete!');
  console.log('\n📊 Summary:');
  console.log('   ✓ Row 1 frozen');
  console.log('   ✓ Row 1 text bolded (all columns)');
  console.log('   ✓ Championship label updated with formula (=Config!B3&" - Champion")');
  console.log('   ✓ Championship label: 10pt, bold, single-line display (no wrapping)');
  console.log('   ✓ Region names: 22pt, bold');
  console.log('   ✓ All columns auto-sized (A-AF)');
  console.log('   ✓ Text wrapping: All columns clip (no wrapping)');
  console.log('   ✓ All rows set to uniform height (21 pixels)');
}

// Run the script
enhanceBracketFormatting().catch(console.error);
