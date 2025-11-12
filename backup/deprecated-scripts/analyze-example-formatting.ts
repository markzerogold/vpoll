import { google } from 'googleapis';
import * as path from 'path';

/**
 * Analyze formatting in the example sheet to understand what needs to be replicated
 */

const EXAMPLE_SHEET_ID = '1Z83Lr02EW9wvpH3YfBvLwafHMIqyxJLXaO_0D85bMfk';

const keyPath = path.join(__dirname, '../keys/vpoll-key.json');
const auth = new google.auth.GoogleAuth({
  keyFile: keyPath,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

function colIndexToLetter(index: number): string {
  let letter = '';
  let num = index;
  while (num >= 0) {
    letter = String.fromCharCode((num % 26) + 65) + letter;
    num = Math.floor(num / 26) - 1;
  }
  return letter;
}

async function analyzeFormatting() {
  console.log('🔍 Analyzing example sheet formatting...\n');

  // Get full sheet data with formatting
  const response = await sheets.spreadsheets.get({
    spreadsheetId: EXAMPLE_SHEET_ID,
    ranges: ['Bracket!A1:AF65'],
    includeGridData: true,
  });

  const sheetData = response.data.sheets?.[0];
  if (!sheetData) {
    console.error('No sheet data found');
    return;
  }

  // 1. MERGED CELLS
  console.log('📦 MERGED CELLS:');
  if (sheetData.merges) {
    console.log(`Found ${sheetData.merges.length} merged cell ranges:\n`);

    for (const merge of sheetData.merges) {
      const startCol = colIndexToLetter(merge.startColumnIndex || 0);
      const endCol = colIndexToLetter((merge.endColumnIndex || 1) - 1);
      const startRow = (merge.startRowIndex || 0) + 1;
      const endRow = (merge.endRowIndex || 1);

      console.log(`   ${startCol}${startRow}:${endCol}${endRow}`);
    }
  } else {
    console.log('   No merged cells found');
  }

  console.log('\n');

  // 2. CELLS WITH BACKGROUND COLORS
  console.log('🎨 CELLS WITH BACKGROUND COLORS:');

  const coloredCells: any[] = [];
  const gridData = sheetData.data?.[0];

  if (gridData?.rowData) {
    gridData.rowData.forEach((row, rowIndex) => {
      row.values?.forEach((cell, colIndex) => {
        const bgColor = cell.effectiveFormat?.backgroundColor;

        // Check if cell has a non-white background
        if (bgColor && (
          bgColor.red !== 1 ||
          bgColor.green !== 1 ||
          bgColor.blue !== 1
        )) {
          const colLetter = colIndexToLetter(colIndex);
          const cellAddress = `${colLetter}${rowIndex + 1}`;
          const cellValue = cell.formattedValue || cell.effectiveValue?.stringValue || '';

          coloredCells.push({
            cell: cellAddress,
            row: rowIndex + 1,
            col: colLetter,
            value: cellValue,
            color: bgColor,
          });
        }
      });
    });

    console.log(`Found ${coloredCells.length} cells with background colors:\n`);

    // Group by color for easier analysis
    const colorGroups = new Map<string, any[]>();

    for (const cell of coloredCells) {
      const colorKey = `${cell.color.red?.toFixed(2)},${cell.color.green?.toFixed(2)},${cell.color.blue?.toFixed(2)}`;

      if (!colorGroups.has(colorKey)) {
        colorGroups.set(colorKey, []);
      }
      colorGroups.get(colorKey)?.push(cell);
    }

    for (const [colorKey, cells] of colorGroups) {
      const [r, g, b] = colorKey.split(',').map(Number);
      console.log(`   Color RGB(${r}, ${g}, ${b}):`);

      cells.forEach(cell => {
        console.log(`      ${cell.cell}: "${cell.value}"`);
      });
      console.log('');
    }
  }

  // 3. BOLD/FORMATTED TEXT
  console.log('📝 CELLS WITH BOLD TEXT:');

  const boldCells: any[] = [];

  if (gridData?.rowData) {
    gridData.rowData.forEach((row, rowIndex) => {
      row.values?.forEach((cell, colIndex) => {
        const isBold = cell.effectiveFormat?.textFormat?.bold;

        if (isBold) {
          const colLetter = colIndexToLetter(colIndex);
          const cellAddress = `${colLetter}${rowIndex + 1}`;
          const cellValue = cell.formattedValue || cell.effectiveValue?.stringValue || '';

          boldCells.push({
            cell: cellAddress,
            value: cellValue,
          });
        }
      });
    });

    console.log(`Found ${boldCells.length} cells with bold text:\n`);

    // Show first 30 bold cells
    boldCells.slice(0, 30).forEach(cell => {
      console.log(`   ${cell.cell}: "${cell.value}"`);
    });

    if (boldCells.length > 30) {
      console.log(`   ... and ${boldCells.length - 30} more`);
    }
  }

  console.log('\n');

  // 4. TEXT ALIGNMENT
  console.log('📐 TEXT ALIGNMENT PATTERNS:');

  const alignmentCounts = {
    LEFT: 0,
    CENTER: 0,
    RIGHT: 0,
  };

  const centerAlignedCells: any[] = [];

  if (gridData?.rowData) {
    gridData.rowData.forEach((row, rowIndex) => {
      row.values?.forEach((cell, colIndex) => {
        const alignment = cell.effectiveFormat?.horizontalAlignment;

        if (alignment === 'CENTER') {
          alignmentCounts.CENTER++;

          const colLetter = colIndexToLetter(colIndex);
          const cellAddress = `${colLetter}${rowIndex + 1}`;
          const cellValue = cell.formattedValue || cell.effectiveValue?.stringValue || '';

          if (cellValue) {
            centerAlignedCells.push({
              cell: cellAddress,
              value: cellValue,
            });
          }
        } else if (alignment === 'RIGHT') {
          alignmentCounts.RIGHT++;
        } else {
          alignmentCounts.LEFT++;
        }
      });
    });

    console.log(`   LEFT: ${alignmentCounts.LEFT} cells`);
    console.log(`   CENTER: ${alignmentCounts.CENTER} cells`);
    console.log(`   RIGHT: ${alignmentCounts.RIGHT} cells`);

    console.log('\n   Notable center-aligned cells:');
    centerAlignedCells.slice(0, 20).forEach(cell => {
      console.log(`      ${cell.cell}: "${cell.value}"`);
    });
  }

  console.log('\n✅ Analysis complete!');
}

analyzeFormatting().catch(console.error);
