import { google } from 'googleapis';
import * as path from 'path';

/**
 * Apply bracket borders and connecting lines to test sheet
 * Copies border formatting from example sheet to test sheet
 */

const EXAMPLE_SHEET_ID = '1Z83Lr02EW9wvpH3YfBvLwafHMIqyxJLXaO_0D85bMfk';
const TEST_SHEET_ID = '1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o';

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

    for (let colIdx = 0; colIdx < row.values.length; colIdx++) {
      const cell = row.values[colIdx];
      if (!cell.userEnteredFormat?.borders) continue;

      const borders = cell.userEnteredFormat.borders;
      const cellRef = `${colToLetter(colIdx)}${rowIdx + 1}`;

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

  console.log(`✅ Found ${borderMap.size} cells with custom borders`);
  return borderMap;
}

/**
 * Apply borders to test sheet
 */
async function applyBorders(
  sheets: any,
  borderMap: Map<string, CellBorders>
): Promise<void> {
  console.log('🎨 Applying borders to test sheet...');

  // Get bracket sheet ID
  const metadata = await sheets.spreadsheets.get({
    spreadsheetId: TEST_SHEET_ID,
  });

  const bracketSheet = metadata.data.sheets?.find(
    (s: any) => s.properties?.title === 'Bracket'
  );

  if (!bracketSheet) {
    throw new Error('Bracket sheet not found in test sheet');
  }

  const sheetId = bracketSheet.properties.sheetId;

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

  // Apply borders in batches (API has request limit)
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
 * Convert column index to letter (0 = A, 1 = B, etc.)
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
 * Parse cell reference (e.g., "A1" → { row: 1, col: 1 })
 */
function parseCellRef(ref: string): { row: number; col: number } {
  const match = ref.match(/^([A-Z]+)(\d+)$/);
  if (!match) {
    throw new Error(`Invalid cell reference: ${ref}`);
  }

  const colLetter = match[1];
  const rowNum = parseInt(match[2]);

  // Convert column letter to index (A=1, B=2, ..., AA=27, etc.)
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
  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');

  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    console.log('🎨 Applying Bracket Borders');
    console.log('='.repeat(80));
    console.log(`Example sheet: ${EXAMPLE_SHEET_ID}`);
    console.log(`Test sheet: ${TEST_SHEET_ID}\n`);

    // Read border formatting from example
    const borderMap = await readBorderFormatting(sheets);

    // Apply to test sheet
    await applyBorders(sheets, borderMap);

    console.log('\n' + '='.repeat(80));
    console.log('✅ Border formatting applied successfully!');
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
