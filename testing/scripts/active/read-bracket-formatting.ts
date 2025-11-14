import { google } from 'googleapis';
import * as path from 'path';
import * as fs from 'fs';

async function readBracketFormatting() {
  const keyPath = path.join(__dirname, '../../../keys/vpoll-key.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w';

  console.log('📖 Reading Bracket tab formatting...\n');

  // Get sheet data with full formatting
  const response = await sheets.spreadsheets.get({
    spreadsheetId,
    ranges: ['Bracket!A1:AF70'],
    includeGridData: true,
  });

  const bracketSheet = response.data.sheets?.find(
    (s: any) => s.properties?.title === 'Bracket'
  );

  if (!bracketSheet) {
    console.error('Bracket sheet not found');
    return;
  }

  // Extract detailed formatting information
  const sheetProperties = bracketSheet.properties;
  const gridData = bracketSheet.data?.[0];
  const rowData = gridData?.rowData || [];

  console.log('=== SHEET PROPERTIES ===');
  console.log('Frozen rows:', sheetProperties?.gridProperties?.frozenRowCount);
  console.log('Frozen columns:', sheetProperties?.gridProperties?.frozenColumnCount);
  console.log('Grid rows:', sheetProperties?.gridProperties?.rowCount);
  console.log('Grid columns:', sheetProperties?.gridProperties?.columnCount);
  console.log();

  // Check for merged cells
  const merges = bracketSheet.merges || [];
  console.log('=== MERGED CELLS ===');
  console.log('Total merged ranges:', merges.length);
  merges.forEach((merge: any, idx: number) => {
    const startCol = String.fromCharCode(65 + merge.startColumnIndex);
    const endCol = String.fromCharCode(65 + merge.endColumnIndex - 1);
    const startRow = merge.startRowIndex + 1;
    const endRow = merge.endRowIndex;
    console.log(`Merge ${idx + 1}: ${startCol}${startRow}:${endCol}${endRow}`);
  });
  console.log();

  // Analyze specific cells for formatting patterns
  const cellsToCheck = [
    { row: 0, col: 0, label: 'A1 (header)' },
    { row: 14, col: 4, label: 'E15 (ALPHA region)' },
    { row: 30, col: 4, label: 'E31 (BETA region)' },
    { row: 14, col: 24, label: 'Y15 (GAMMA region)' },
    { row: 30, col: 24, label: 'Y31 (DELTA region)' },
    { row: 16, col: 14, label: 'O17 (Championship)' },
    { row: 3, col: 0, label: 'A4 (Round 1 match)' },
    { row: 3, col: 2, label: 'C4 (Round 1 checkbox)' },
    { row: 3, col: 4, label: 'E4 (Round 2 match)' },
  ];

  console.log('=== CELL FORMATTING SAMPLES ===');
  cellsToCheck.forEach(({ row, col, label }) => {
    if (rowData[row] && rowData[row].values?.[col]) {
      const cell = rowData[row].values[col];
      const format = cell.effectiveFormat || cell.userEnteredFormat;

      console.log(`${label}:`);
      console.log('  Value:', cell.formattedValue || cell.userEnteredValue?.stringValue || cell.userEnteredValue?.formulaValue || '(empty)');

      if (format) {
        console.log('  Font size:', format.textFormat?.fontSize || 'default');
        console.log('  Bold:', format.textFormat?.bold || false);

        if (format.textFormat?.foregroundColor) {
          const r = Math.round((format.textFormat.foregroundColor.red || 0) * 255);
          const g = Math.round((format.textFormat.foregroundColor.green || 0) * 255);
          const b = Math.round((format.textFormat.foregroundColor.blue || 0) * 255);
          console.log(`  Text color: RGB(${r}, ${g}, ${b})`);
        }

        if (format.backgroundColor) {
          const r = Math.round((format.backgroundColor.red || 0) * 255);
          const g = Math.round((format.backgroundColor.green || 0) * 255);
          const b = Math.round((format.backgroundColor.blue || 0) * 255);
          console.log(`  Background: RGB(${r}, ${g}, ${b})`);
        }

        console.log('  H-align:', format.horizontalAlignment || 'default');
        console.log('  V-align:', format.verticalAlignment || 'default');
        console.log('  Wrap:', format.wrapStrategy || 'default');

        const borders = format.borders;
        if (borders && (borders.top || borders.bottom || borders.left || borders.right)) {
          console.log('  Borders:');
          if (borders.top?.style !== 'NONE') console.log('    Top:', borders.top?.style, borders.top?.width);
          if (borders.bottom?.style !== 'NONE') console.log('    Bottom:', borders.bottom?.style, borders.bottom?.width);
          if (borders.left?.style !== 'NONE') console.log('    Left:', borders.left?.style, borders.left?.width);
          if (borders.right?.style !== 'NONE') console.log('    Right:', borders.right?.style, borders.right?.width);
        }
      }
      console.log();
    }
  });

  // Count cells with various formatting
  let borderCount = 0;
  let boldCount = 0;
  let coloredBgCount = 0;

  rowData.forEach((row: any, rowIdx: number) => {
    if (!row.values) return;
    row.values.forEach((cell: any, colIdx: number) => {
      const format = cell.effectiveFormat || cell.userEnteredFormat;
      if (format?.borders && (
        format.borders.top?.style !== 'NONE' ||
        format.borders.bottom?.style !== 'NONE' ||
        format.borders.left?.style !== 'NONE' ||
        format.borders.right?.style !== 'NONE'
      )) {
        borderCount++;
      }
      if (format?.textFormat?.bold) boldCount++;
      if (format?.backgroundColor && (
        format.backgroundColor.red !== 1 ||
        format.backgroundColor.green !== 1 ||
        format.backgroundColor.blue !== 1
      )) {
        coloredBgCount++;
      }
    });
  });

  console.log('=== SUMMARY ===');
  console.log('Cells with borders:', borderCount);
  console.log('Cells with bold text:', boldCount);
  console.log('Cells with colored backgrounds:', coloredBgCount);

  // Save detailed data to JSON for analysis
  const outputData = {
    sheetProperties,
    merges,
    sampleCells: cellsToCheck.map(({ row, col, label }) => {
      if (rowData[row] && rowData[row].values?.[col]) {
        const cell = rowData[row].values[col];
        return {
          label,
          row: row + 1,
          col: String.fromCharCode(65 + col),
          value: cell.formattedValue || cell.userEnteredValue?.stringValue || cell.userEnteredValue?.formulaValue,
          format: cell.effectiveFormat || cell.userEnteredFormat,
        };
      }
      return null;
    }).filter(Boolean),
    summary: {
      borderCount,
      boldCount,
      coloredBgCount,
    },
  };

  const outputPath = path.join(__dirname, '../../logs/bracket-formatting-analysis.json');
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
  console.log('\n📄 Detailed data saved to:', outputPath);
}

readBracketFormatting().catch(console.error);
