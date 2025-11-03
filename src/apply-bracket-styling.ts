import { google } from 'googleapis';
import * as path from 'path';

/**
 * Apply comprehensive bracket styling to match the example sheet exactly
 *
 * Based on analysis of example sheet (1Z83Lr02EW9wvpH3YfBvLwafHMIqyxJLXaO_0D85bMfk):
 * - 16 merged cell ranges (round headers, region names, championship label)
 * - 4 cells with background colors (region names)
 * - 4 cells with bold text (region names)
 * - Center-aligned round headers and checkboxes
 */

const EXAMPLE_SHEET_ID = '1Z83Lr02EW9wvpH3YfBvLwafHMIqyxJLXaO_0D85bMfk';
const TEST_SHEET_ID = '1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o';

// Initialize Google Sheets API
const keyPath = path.join(__dirname, '../keys/vpoll-key.json');
const auth = new google.auth.GoogleAuth({
  keyFile: keyPath,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

/**
 * Exact region colors from example sheet
 */
const REGION_COLORS = {
  ALPHA: { red: 0.81, green: 0.89, blue: 0.95 },   // E15 - Light blue
  BETA: { red: 0.99, green: 0.9, blue: 0.8 },      // E46 - Light orange
  GAMMA: { red: 0.85, green: 0.92, blue: 0.83 },   // Y15 - Light green
  DELTA: { red: 0.9, green: 0.72, blue: 0.69 },    // Y46 - Light salmon/red
};

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
 * Map row numbers from example sheet to test sheet
 * Test sheet has row 33 as separator, so bottom half is offset by +1
 */
function mapRow(exampleRow: number): number {
  if (exampleRow >= 33) {
    return exampleRow + 1;
  }
  return exampleRow;
}

/**
 * Apply all bracket styling
 */
async function applyBracketStyling() {
  console.log('🎨 Applying bracket styling to match example sheet...\n');

  const sheetId = await getSheetIdByName(TEST_SHEET_ID, 'Bracket');
  const requests: any[] = [];

  // 1. MERGE ROUND HEADER CELLS (Row 1)
  console.log('📋 Merging and styling round headers...');

  const roundHeaderMerges = [
    { start: 'A', end: 'B', text: 'Round 1' },
    { start: 'D', end: 'E', text: 'Round 2' },
    { start: 'G', end: 'H', text: 'Sweet 16' },
    { start: 'J', end: 'K', text: 'Elite 8' },
    { start: 'M', end: 'N', text: 'Final 4' },
    // P1 is not merged (Championship)
    { start: 'R', end: 'S', text: 'Final 4' },
    { start: 'U', end: 'V', text: 'Elite 8' },
    { start: 'X', end: 'Y', text: 'Sweet 16' },
    { start: 'AA', end: 'AB', text: 'Round 2' },
    { start: 'AD', end: 'AE', text: 'Round 1' },
  ];

  for (const merge of roundHeaderMerges) {
    // Merge cells
    requests.push({
      mergeCells: {
        range: {
          sheetId,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: colToIndex(merge.start),
          endColumnIndex: colToIndex(merge.end) + 1,
        },
        mergeType: 'MERGE_ALL',
      },
    });

    // Format merged cell
    requests.push({
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: colToIndex(merge.start),
          endColumnIndex: colToIndex(merge.end) + 1,
        },
        cell: {
          userEnteredFormat: {
            textFormat: {
              fontSize: 10,
            },
            horizontalAlignment: 'CENTER',
            verticalAlignment: 'MIDDLE',
            wrapStrategy: 'CLIP',
          },
        },
        fields: 'userEnteredFormat(textFormat,horizontalAlignment,verticalAlignment,wrapStrategy)',
      },
    });
  }

  // Single-cell header (Championship at P1)
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 0,
        endRowIndex: 1,
        startColumnIndex: colToIndex('P'),
        endColumnIndex: colToIndex('P') + 1,
      },
      cell: {
        userEnteredFormat: {
          textFormat: {
            fontSize: 10,
          },
          horizontalAlignment: 'CENTER',
          verticalAlignment: 'MIDDLE',
          wrapStrategy: 'CLIP',
        },
      },
      fields: 'userEnteredFormat(textFormat,horizontalAlignment,verticalAlignment,wrapStrategy)',
    },
  });

  // 2. MERGE AND STYLE REGION NAME CELLS (3 cols x 4 rows each)
  console.log('🏆 Merging and styling region names...');

  const regionMerges = [
    { startRow: 15, startCol: 'E', endCol: 'G', rows: 4, region: 'ALPHA' },   // Top left
    { startRow: 15, startCol: 'Y', endCol: 'AA', rows: 4, region: 'GAMMA' },  // Top right
    { startRow: 47, startCol: 'E', endCol: 'G', rows: 4, region: 'BETA' },    // Bottom left (row 47 to match example structure)
    { startRow: 47, startCol: 'Y', endCol: 'AA', rows: 4, region: 'DELTA' },  // Bottom right (row 47 to match example structure)
  ];

  for (const merge of regionMerges) {
    const color = REGION_COLORS[merge.region as keyof typeof REGION_COLORS];

    // Merge cells
    requests.push({
      mergeCells: {
        range: {
          sheetId,
          startRowIndex: merge.startRow - 1,
          endRowIndex: merge.startRow + merge.rows - 1,
          startColumnIndex: colToIndex(merge.startCol),
          endColumnIndex: colToIndex(merge.endCol) + 1,
        },
        mergeType: 'MERGE_ALL',
      },
    });

    // Format merged region cell
    requests.push({
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: merge.startRow - 1,
          endRowIndex: merge.startRow + merge.rows - 1,
          startColumnIndex: colToIndex(merge.startCol),
          endColumnIndex: colToIndex(merge.endCol) + 1,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: color,
            textFormat: {
              bold: true,
              fontSize: 12,
            },
            horizontalAlignment: 'CENTER',
            verticalAlignment: 'MIDDLE',
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
      },
    });
  }

  // 3. MERGE AND STYLE "THE GREATEST" CHAMPIONSHIP LABEL (O18:Q19)
  console.log('👑 Styling championship label...');

  // Merge O18:Q18
  requests.push({
    mergeCells: {
      range: {
        sheetId,
        startRowIndex: 17,
        endRowIndex: 18,
        startColumnIndex: colToIndex('O'),
        endColumnIndex: colToIndex('Q') + 1,
      },
      mergeType: 'MERGE_ALL',
    },
  });

  // Merge O19:Q19
  requests.push({
    mergeCells: {
      range: {
        sheetId,
        startRowIndex: 18,
        endRowIndex: 19,
        startColumnIndex: colToIndex('O'),
        endColumnIndex: colToIndex('Q') + 1,
      },
      mergeType: 'MERGE_ALL',
    },
  });

  // Format championship label (both rows)
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 17,
        endRowIndex: 19,
        startColumnIndex: colToIndex('O'),
        endColumnIndex: colToIndex('Q') + 1,
      },
      cell: {
        userEnteredFormat: {
          textFormat: {
            fontSize: 10,
          },
          horizontalAlignment: 'CENTER',
          verticalAlignment: 'MIDDLE',
        },
      },
      fields: 'userEnteredFormat(textFormat,horizontalAlignment,verticalAlignment)',
    },
  });

  // 4. CENTER-ALIGN CHECKBOXES (TRUE/FALSE cells)
  console.log('☑️  Center-aligning checkbox cells...');

  const checkboxColumns = ['A', 'D', 'G', 'J', 'M', 'O', 'Q', 'S', 'V', 'Y', 'AB', 'AE'];

  for (const col of checkboxColumns) {
    requests.push({
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: 1,  // Skip header row
          endRowIndex: 65,
          startColumnIndex: colToIndex(col),
          endColumnIndex: colToIndex(col) + 1,
        },
        cell: {
          userEnteredFormat: {
            horizontalAlignment: 'CENTER',
            verticalAlignment: 'MIDDLE',
          },
        },
        fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment)',
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

  console.log('\n✅ Bracket styling complete!');
  console.log('\n📊 Summary:');
  console.log(`   ✓ Round headers merged and styled (10 + 1 = 11 cells)`);
  console.log(`   ✓ Region names merged, colored, and bolded (4 regions)`);
  console.log(`   ✓ Championship label merged (2 rows)`);
  console.log(`   ✓ Checkbox cells center-aligned (${checkboxColumns.length} columns)`);
  console.log('\n🎨 Colors applied:');
  console.log(`   • ALPHA (Federation): Light blue RGB(0.81, 0.89, 0.95)`);
  console.log(`   • BETA (Klingon Empire): Light orange RGB(0.99, 0.9, 0.8)`);
  console.log(`   • GAMMA (Romulan Star Empire): Light green RGB(0.85, 0.92, 0.83)`);
  console.log(`   • DELTA (Dominion): Light salmon RGB(0.9, 0.72, 0.69)`);
}

// Run the script
applyBracketStyling().catch(console.error);
