import { google } from 'googleapis';
import * as path from 'path';

/**
 * Apply bracket borders with correct alignment and autosize columns
 * Instead of mapping borders, generate them fresh based on test sheet checkbox positions
 */

const TEST_SHEET_ID = '1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o';

interface CheckboxLocation {
  row: number;
  col: number;
  colLetter: string;
}

/**
 * Find all checkbox cells in bracket
 */
async function findCheckboxes(sheets: any, spreadsheetId: string): Promise<CheckboxLocation[]> {
  const response = await sheets.spreadsheets.get({
    spreadsheetId,
    ranges: ['Bracket!A1:AF70'],
    includeGridData: true,
  });

  const sheetData = response.data.sheets?.[0];
  if (!sheetData) {
    throw new Error('Could not read sheet data');
  }

  const checkboxes: CheckboxLocation[] = [];
  const rows = sheetData.data?.[0]?.rowData || [];

  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    const row = rows[rowIdx];
    if (!row.values) continue;

    for (let colIdx = 0; colIdx < row.values.length; colIdx++) {
      const cell = row.values[colIdx];
      const isCheckbox =
        cell.dataValidation?.condition?.type === 'BOOLEAN' ||
        cell.userEnteredValue?.boolValue !== undefined;

      if (isCheckbox) {
        checkboxes.push({
          row: rowIdx + 1,
          col: colIdx + 1,
          colLetter: colToLetter(colIdx),
        });
      }
    }
  }

  return checkboxes;
}

/**
 * Generate border requests for bracket based on checkbox positions
 */
function generateBorderRequests(sheetId: number, checkboxes: CheckboxLocation[]): any[] {
  const requests: any[] = [];

  // Group checkboxes by column
  const byColumn = new Map<string, CheckboxLocation[]>();
  for (const cb of checkboxes) {
    const existing = byColumn.get(cb.colLetter) || [];
    existing.push(cb);
    byColumn.set(cb.colLetter, existing);
  }

  // Sort each column by row
  for (const [col, cbs] of byColumn) {
    byColumn.set(
      col,
      cbs.sort((a, b) => a.row - b.row)
    );
  }

  // Generate borders for each match (2 consecutive checkboxes)
  for (const [colLetter, cbs] of byColumn) {
    // Process pairs of checkboxes (each match has 2 participants)
    for (let i = 0; i < cbs.length; i += 2) {
      if (i + 1 >= cbs.length) break;

      const p1 = cbs[i];
      const p2 = cbs[i + 1];
      const nameCol = colToNumber(colLetter) + 1; // Name column is next to checkbox

      // Box around the match (2 rows)
      // Top border on participant 1
      requests.push({
        updateBorders: {
          range: {
            sheetId,
            startRowIndex: p1.row - 1,
            endRowIndex: p1.row,
            startColumnIndex: colToNumber(colLetter) - 1,
            endColumnIndex: nameCol,
          },
          top: { style: 'SOLID', width: 1, color: { red: 0, green: 0, blue: 0 } },
          left: { style: 'SOLID', width: 1, color: { red: 0, green: 0, blue: 0 } },
        },
      });

      // Right border on name cell for participant 1
      requests.push({
        updateBorders: {
          range: {
            sheetId,
            startRowIndex: p1.row - 1,
            endRowIndex: p1.row,
            startColumnIndex: nameCol - 1,
            endColumnIndex: nameCol,
          },
          right: { style: 'SOLID', width: 1, color: { red: 0, green: 0, blue: 0 } },
        },
      });

      // Bottom border on participant 2
      requests.push({
        updateBorders: {
          range: {
            sheetId,
            startRowIndex: p2.row - 1,
            endRowIndex: p2.row,
            startColumnIndex: colToNumber(colLetter) - 1,
            endColumnIndex: nameCol,
          },
          bottom: { style: 'SOLID', width: 1, color: { red: 0, green: 0, blue: 0 } },
          left: { style: 'SOLID', width: 1, color: { red: 0, green: 0, blue: 0 } },
        },
      });

      // Right border on name cell for participant 2
      requests.push({
        updateBorders: {
          range: {
            sheetId,
            startRowIndex: p2.row - 1,
            endRowIndex: p2.row,
            startColumnIndex: nameCol - 1,
            endColumnIndex: nameCol,
          },
          right: { style: 'SOLID', width: 1, color: { red: 0, green: 0, blue: 0 } },
        },
      });
    }
  }

  return requests;
}

/**
 * Autosize all columns
 */
function createAutosizeRequest(sheetId: number): any {
  return {
    autoResizeDimensions: {
      dimensions: {
        sheetId,
        dimension: 'COLUMNS',
        startIndex: 0,
        endIndex: 32, // Columns A-AF
      },
    },
  };
}

/**
 * Disable text wrapping for all cells
 */
function createNoWrapRequest(sheetId: number): any {
  return {
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 0,
        endRowIndex: 70,
        startColumnIndex: 0,
        endColumnIndex: 32,
      },
      cell: {
        userEnteredFormat: {
          wrapStrategy: 'CLIP',
        },
      },
      fields: 'userEnteredFormat.wrapStrategy',
    },
  };
}

/**
 * Clear existing borders
 */
function createClearBordersRequest(sheetId: number): any {
  return {
    updateBorders: {
      range: {
        sheetId,
        startRowIndex: 0,
        endRowIndex: 70,
        startColumnIndex: 0,
        endColumnIndex: 32,
      },
      top: { style: 'NONE' },
      bottom: { style: 'NONE' },
      left: { style: 'NONE' },
      right: { style: 'NONE' },
      innerHorizontal: { style: 'NONE' },
      innerVertical: { style: 'NONE' },
    },
  };
}

function colToLetter(col: number): string {
  let letter = '';
  while (col >= 0) {
    letter = String.fromCharCode((col % 26) + 65) + letter;
    col = Math.floor(col / 26) - 1;
  }
  return letter;
}

function colToNumber(letter: string): number {
  let col = 0;
  for (let i = 0; i < letter.length; i++) {
    col = col * 26 + (letter.charCodeAt(i) - 64);
  }
  return col;
}

async function main() {
  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');

  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    console.log('🎨 Applying Bracket Borders and Autosizing Columns');
    console.log('='.repeat(80));
    console.log(`Test sheet: ${TEST_SHEET_ID}\n`);

    // Get bracket sheet ID
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId: TEST_SHEET_ID,
    });

    const bracketSheet = metadata.data.sheets?.find(
      (s: any) => s.properties?.title === 'Bracket'
    );

    if (!bracketSheet || !bracketSheet.properties ||
        bracketSheet.properties.sheetId === undefined ||
        bracketSheet.properties.sheetId === null) {
      throw new Error('Bracket sheet not found or missing sheetId');
    }

    const sheetId = bracketSheet.properties.sheetId;

    // Find checkboxes
    console.log('📖 Finding checkbox positions...');
    const checkboxes = await findCheckboxes(sheets, TEST_SHEET_ID);
    console.log(`✅ Found ${checkboxes.length} checkboxes\n`);

    // Generate border requests
    console.log('🎨 Generating border requests...');
    const borderRequests = generateBorderRequests(sheetId, checkboxes);
    console.log(`✅ Generated ${borderRequests.length} border requests\n`);

    // Apply all changes
    console.log('📝 Applying changes...');
    const allRequests = [
      createClearBordersRequest(sheetId),
      createNoWrapRequest(sheetId),
      ...borderRequests,
      createAutosizeRequest(sheetId),
    ];

    // Apply in batches
    const batchSize = 100;
    for (let i = 0; i < allRequests.length; i += batchSize) {
      const batch = allRequests.slice(i, i + batchSize);
      console.log(
        `  Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allRequests.length / batchSize)}...`
      );

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: TEST_SHEET_ID,
        requestBody: {
          requests: batch,
        },
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Complete!');
    console.log(`🔗 View result: https://docs.google.com/spreadsheets/d/${TEST_SHEET_ID}/edit`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

main()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error.message);
    process.exit(1);
  });
