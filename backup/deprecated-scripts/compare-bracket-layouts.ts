import { google } from 'googleapis';
import * as path from 'path';

/**
 * Compare bracket layouts between example and test sheets
 * Find where checkboxes are located in each
 */

const EXAMPLE_SHEET_ID = '1Z83Lr02EW9wvpH3YfBvLwafHMIqyxJLXaO_0D85bMfk';
const TEST_SHEET_ID = '1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o';

interface CheckboxLocation {
  cell: string;
  row: number;
  col: number;
  colLetter: string;
  value?: boolean;
}

/**
 * Find all checkbox cells in a sheet
 */
async function findCheckboxes(
  sheets: any,
  spreadsheetId: string,
  sheetName: string
): Promise<CheckboxLocation[]> {
  const response = await sheets.spreadsheets.get({
    spreadsheetId,
    ranges: [`${sheetName}!A1:AF70`],
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

      // Check for checkbox (boolean data validation or boolean value)
      const isCheckbox =
        cell.dataValidation?.condition?.type === 'BOOLEAN' ||
        cell.userEnteredValue?.boolValue !== undefined;

      if (isCheckbox) {
        const colLetter = colToLetter(colIdx);
        checkboxes.push({
          cell: `${colLetter}${rowIdx + 1}`,
          row: rowIdx + 1,
          col: colIdx + 1,
          colLetter,
          value: cell.effectiveValue?.boolValue,
        });
      }
    }
  }

  return checkboxes;
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
 * Group checkboxes by column
 */
function groupByColumn(checkboxes: CheckboxLocation[]): Map<string, CheckboxLocation[]> {
  const grouped = new Map<string, CheckboxLocation[]>();

  for (const checkbox of checkboxes) {
    const existing = grouped.get(checkbox.colLetter) || [];
    existing.push(checkbox);
    grouped.set(checkbox.colLetter, existing);
  }

  // Sort each group by row
  for (const [col, boxes] of grouped) {
    grouped.set(
      col,
      boxes.sort((a, b) => a.row - b.row)
    );
  }

  return grouped;
}

/**
 * Main comparison
 */
async function main() {
  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');

  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    console.log('🔍 Comparing Bracket Layouts');
    console.log('='.repeat(80));

    // Find checkboxes in both sheets
    console.log('\n📖 Reading example sheet checkboxes...');
    const exampleCheckboxes = await findCheckboxes(sheets, EXAMPLE_SHEET_ID, 'Bracket');
    console.log(`  Found ${exampleCheckboxes.length} checkboxes`);

    console.log('\n📖 Reading test sheet checkboxes...');
    const testCheckboxes = await findCheckboxes(sheets, TEST_SHEET_ID, 'Bracket');
    console.log(`  Found ${testCheckboxes.length} checkboxes`);

    // Group by column
    const exampleByCol = groupByColumn(exampleCheckboxes);
    const testByCol = groupByColumn(testCheckboxes);

    console.log('\n' + '='.repeat(80));
    console.log('EXAMPLE SHEET CHECKBOX COLUMNS:');
    console.log('='.repeat(80));

    for (const [col, boxes] of Array.from(exampleByCol.entries()).sort()) {
      console.log(`\nColumn ${col}: ${boxes.length} checkboxes`);
      console.log(`  Rows: ${boxes.map(b => b.row).join(', ')}`);
      if (boxes.length <= 10) {
        boxes.forEach(b => console.log(`    ${b.cell}: ${b.value ?? 'null'}`));
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('TEST SHEET CHECKBOX COLUMNS:');
    console.log('='.repeat(80));

    for (const [col, boxes] of Array.from(testByCol.entries()).sort()) {
      console.log(`\nColumn ${col}: ${boxes.length} checkboxes`);
      console.log(`  Rows: ${boxes.map(b => b.row).join(', ')}`);
      if (boxes.length <= 10) {
        boxes.forEach(b => console.log(`    ${b.cell}: ${b.value ?? 'null'}`));
      }
    }

    // Compare columns
    console.log('\n' + '='.repeat(80));
    console.log('COMPARISON:');
    console.log('='.repeat(80));

    const exampleCols = Array.from(exampleByCol.keys()).sort();
    const testCols = Array.from(testByCol.keys()).sort();

    console.log(`\nExample columns: ${exampleCols.join(', ')}`);
    console.log(`Test columns:    ${testCols.join(', ')}`);

    // Find differences
    const onlyInExample = exampleCols.filter(c => !testCols.includes(c));
    const onlyInTest = testCols.filter(c => !exampleCols.includes(c));

    if (onlyInExample.length > 0) {
      console.log(`\n⚠️  Columns only in EXAMPLE: ${onlyInExample.join(', ')}`);
    }

    if (onlyInTest.length > 0) {
      console.log(`\n⚠️  Columns only in TEST: ${onlyInTest.join(', ')}`);
    }

    // Check matching columns for different row counts
    const commonCols = exampleCols.filter(c => testCols.includes(c));
    console.log(`\n✅ Common columns: ${commonCols.join(', ')}`);

    for (const col of commonCols) {
      const exampleCount = exampleByCol.get(col)!.length;
      const testCount = testByCol.get(col)!.length;

      if (exampleCount !== testCount) {
        console.log(
          `\n⚠️  Column ${col}: Example has ${exampleCount} checkboxes, Test has ${testCount}`
        );
      }
    }

  } catch (error) {
    console.error('❌ Error comparing layouts:', error);
    throw error;
  }
}

// Run
main()
  .then(() => {
    console.log('\n✨ Comparison complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error.message);
    process.exit(1);
  });
