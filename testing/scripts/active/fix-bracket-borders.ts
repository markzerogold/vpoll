import { google } from 'googleapis';
import * as path from 'path';

/**
 * Apply bracket borders with row offset correction
 * Bottom half of bracket (BETA/DELTA regions) needs +1 row offset
 */

const EXAMPLE_SHEET_ID = '1Z83Lr02EW9wvpH3YfBvLwafHMIqyxJLXaO_0D85bMfk';
const TEST_SHEET_ID = process.argv[2] || '1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o';

interface BorderStyle {
  style: string;
  width: number;
  color: { red: number; green: number; blue: number };
}

interface CellBorders {
  top?: BorderStyle;
  bottom?: BorderStyle;
  left?: BorderStyle;
  right?: BorderStyle;
}

/**
 * Map example sheet row to test sheet row
 * BETA/DELTA regions start 1 row later in test sheet
 * Bottom half (rows >= 33) need +1 offset
 */
function mapRow(exampleRow: number): number {
  if (exampleRow >= 33) {
    return exampleRow + 1;
  }
  return exampleRow;
}

/**
 * Read border formatting from example sheet
 */
async function readBorderFormatting(sheets: any): Promise<Map<string, CellBorders>> {
  console.log('📖 Reading border formatting from example sheet...');

  const response = await sheets.spreadsheets.get({
    spreadsheetId: EXAMPLE_SHEET_ID,
    ranges: ['Bracket!A1:AF70'],
    includeGridData: true,
  });

  const sheetData = response.data.sheets?.[0];
  if (!sheetData) {
    throw new Error('Could not read example sheet data');
  }

  const borderMap = new Map<string, CellBorders>();
  const rows = sheetData.data?.[0]?.rowData || [];

  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    const row = rows[rowIdx];
    if (!row.values) continue;

    const exampleRow = rowIdx + 1;
    const mappedRow = mapRow(exampleRow);

    for (let colIdx = 0; colIdx < row.values.length; colIdx++) {
      const cell = row.values[colIdx];
      if (!cell.userEnteredFormat?.borders) continue;

      const borders = cell.userEnteredFormat.borders;
      const colLetter = colToLetter(colIdx);
      const cellRef = `${colLetter}${mappedRow}`; // Use mapped row for test sheet

      const cellBorders: CellBorders = {};
      if (borders.top) cellBorders.top = borders.top;
      if (borders.bottom) cellBorders.bottom = borders.bottom;
      if (borders.left) cellBorders.left = borders.left;
      if (borders.right) cellBorders.right = borders.right;

      if (Object.keys(cellBorders).length > 0) {
        borderMap.set(cellRef, cellBorders);
      }
    }
  }

  console.log(`✅ Found ${borderMap.size} cells with custom borders (row-mapped)`);
  return borderMap;
}

/**
 * Clear existing borders from test sheet
 */
async function clearBorders(sheets: any, sheetId: number): Promise<void> {
  console.log('🧹 Clearing existing borders...');

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: TEST_SHEET_ID,
    requestBody: {
      requests: [
        {
          updateBorders: {
            range: {
              sheetId,
              startRowIndex: 0,
              endRowIndex: 70,
              startColumnIndex: 0,
              endColumnIndex: 32, // Up to column AF
            },
            top: { style: 'NONE' },
            bottom: { style: 'NONE' },
            left: { style: 'NONE' },
            right: { style: 'NONE' },
            innerHorizontal: { style: 'NONE' },
            innerVertical: { style: 'NONE' },
          },
        },
      ],
    },
  });

  console.log('✅ Borders cleared');
}

/**
 * Apply borders to test sheet with corrected rows
 */
async function applyBorders(
  sheets: any,
  borderMap: Map<string, CellBorders>,
  sheetId: number
): Promise<void> {
  console.log('🎨 Applying borders to test sheet (with row correction)...');

  // Clear existing borders first
  await clearBorders(sheets, sheetId);

  // Build batch update requests
  const requests: any[] = [];

  for (const [cellRef, borders] of borderMap) {
    const { row, col } = parseCellRef(cellRef);

    requests.push({
      updateBorders: {
        range: {
          sheetId,
          startRowIndex: row - 1,
          endRowIndex: row,
          startColumnIndex: col - 1,
          endColumnIndex: col,
        },
        top: borders.top,
        bottom: borders.bottom,
        left: borders.left,
        right: borders.right,
      },
    });
  }

  // Apply borders in batches
  const batchSize = 100;
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    console.log(
      `  Applying batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(requests.length / batchSize)}...`
    );

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: TEST_SHEET_ID,
      requestBody: {
        requests: batch,
      },
    });
  }

  console.log(`✅ Applied ${requests.length} border updates`);
}

/**
 * Add borders around region name cells (E31 and Y31 in test sheet)
 */
async function addRegionNameBorders(sheets: any, sheetId: number): Promise<void> {
  console.log('📝 Adding region name borders (E31, Y31)...');

  const borderStyle = {
    style: 'SOLID',
    width: 1,
    color: { red: 0, green: 0, blue: 0 },
  };

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: TEST_SHEET_ID,
    requestBody: {
      requests: [
        // E31 (Klingon Empire / BETA region)
        {
          updateBorders: {
            range: {
              sheetId,
              startRowIndex: 30, // Row 31 (0-indexed)
              endRowIndex: 31,
              startColumnIndex: 4, // Column E (0-indexed)
              endColumnIndex: 5,
            },
            top: borderStyle,
            bottom: borderStyle,
            left: borderStyle,
            right: borderStyle,
          },
        },
        // Y31 (Dominion / DELTA region)
        {
          updateBorders: {
            range: {
              sheetId,
              startRowIndex: 30, // Row 31 (0-indexed)
              endRowIndex: 31,
              startColumnIndex: 24, // Column Y (0-indexed, Y is 25th letter)
              endColumnIndex: 25,
            },
            top: borderStyle,
            bottom: borderStyle,
            left: borderStyle,
            right: borderStyle,
          },
        },
      ],
    },
  });

  console.log('✅ Region name borders added');
}

/**
 * Autosize columns and disable text wrapping
 */
async function autosizeColumns(sheets: any, sheetId: number): Promise<void> {
  console.log('📏 Autosizing columns and disabling text wrap...');

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: TEST_SHEET_ID,
    requestBody: {
      requests: [
        // Disable text wrapping
        {
          repeatCell: {
            range: {
              sheetId,
              startRowIndex: 0,
              endRowIndex: 70,
              startColumnIndex: 0,
              endColumnIndex: 32, // Columns A-AF
            },
            cell: {
              userEnteredFormat: {
                wrapStrategy: 'CLIP',
              },
            },
            fields: 'userEnteredFormat.wrapStrategy',
          },
        },
        // Autosize all columns
        {
          autoResizeDimensions: {
            dimensions: {
              sheetId,
              dimension: 'COLUMNS',
              startIndex: 0,
              endIndex: 32, // Columns A-AF
            },
          },
        },
      ],
    },
  });

  console.log('✅ Columns autosized, text wrapping disabled');
}

/**
 * Convert column index to letter
 */
function colToLetter(col: number): string {
  let letter = '';
  while (col >= 0) {
    letter = String.fromCharCode((col % 26) + 65) + letter;
    col = Math.floor(col / 26) - 1;
  }
  return letter;
}

/**
 * Parse cell reference
 */
function parseCellRef(ref: string): { row: number; col: number } {
  const match = ref.match(/^([A-Z]+)(\d+)$/);
  if (!match) {
    throw new Error(`Invalid cell reference: ${ref}`);
  }

  const colLetter = match[1];
  const rowNum = parseInt(match[2]);

  let col = 0;
  for (let i = 0; i < colLetter.length; i++) {
    col = col * 26 + (colLetter.charCodeAt(i) - 64);
  }

  return { row: rowNum, col };
}

/**
 * Main function
 */
async function main() {
  const keyPath = path.join(__dirname, '../../../keys/vpoll-key.json');

  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    console.log('🎨 Fixing Bracket Borders and Autosizing Columns');
    console.log('='.repeat(80));
    console.log(`Example sheet: ${EXAMPLE_SHEET_ID}`);
    console.log(`Test sheet: ${TEST_SHEET_ID}`);
    console.log('\n⚙️  Row mapping: rows 1-32 = no offset, rows 33+ = +1 offset\n');

    // Get sheet ID first
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId: TEST_SHEET_ID,
    });

    const bracketSheet = metadata.data.sheets?.find(
      (s: any) => s.properties?.title === 'Bracket'
    );

    if (!bracketSheet || !bracketSheet.properties || bracketSheet.properties.sheetId === null || bracketSheet.properties.sheetId === undefined) {
      throw new Error('Bracket sheet not found in test sheet');
    }

    const sheetId: number = bracketSheet.properties.sheetId;

    // Read border formatting from example (with row mapping)
    const borderMap = await readBorderFormatting(sheets);

    // Apply borders to test sheet
    await applyBorders(sheets, borderMap, sheetId);

    // Add missing region name borders (test sheet has different positions)
    await addRegionNameBorders(sheets, sheetId);

    // Autosize columns and disable text wrapping
    await autosizeColumns(sheets, sheetId);

    console.log('\n' + '='.repeat(80));
    console.log('✅ Border formatting applied successfully with row correction!');
    console.log(`🔗 View result: https://docs.google.com/spreadsheets/d/${TEST_SHEET_ID}/edit`);

  } catch (error) {
    console.error('❌ Error applying borders:', error);
    throw error;
  }
}

// Run
main()
  .then(() => {
    console.log('\n✨ Complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error.message);
    process.exit(1);
  });
