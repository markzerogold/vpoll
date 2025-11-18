import { google } from 'googleapis';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Extract ALL formatting from source sheet and save as standalone formatting code
 * This creates a self-contained formatting function that doesn't need the source sheet
 */

const SOURCE_SHEET_ID = '1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w';

async function extractAllFormatting() {
  const keyPath = path.join(__dirname, '../../../keys/vpoll-key.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  console.log('📖 Reading source sheet formatting...\n');

  // Read source sheet with ALL formatting
  const sourceResponse = await sheets.spreadsheets.get({
    spreadsheetId: SOURCE_SHEET_ID,
    ranges: ['Bracket!A1:AF70'],
    includeGridData: true,
  });

  const sourceBracket = sourceResponse.data.sheets?.find(
    (s: any) => s.properties?.title === 'Bracket'
  );

  if (!sourceBracket) {
    throw new Error('Source Bracket sheet not found');
  }

  const sourceProperties = sourceBracket.properties;
  const sourceMerges = sourceBracket.merges || [];
  const sourceRowData = sourceBracket.data?.[0]?.rowData || [];

  console.log(`✅ Found ${sourceMerges.length} merged ranges`);
  console.log(`✅ Found ${sourceRowData.length} rows with formatting\n`);

  // Extract key formatting details
  const formatting = {
    frozenRowCount: sourceProperties?.gridProperties?.frozenRowCount || 0,
    merges: sourceMerges.map((m: any) => ({
      startRow: m.startRowIndex || 0,
      endRow: m.endRowIndex || 0,
      startCol: m.startColumnIndex || 0,
      endCol: m.endColumnIndex || 0,
    })),
    regionCells: [] as any[],
    championshipCell: null as any,
    winnerCell: null as any,
    row1Headers: [] as any[],
    borderedCells: [] as any[],
  };

  // Extract region cell formatting (E15, E47, Y15, Y47)
  const regionPositions = [
    { name: 'E15 (ALPHA)', row: 14, col: 4 },
    { name: 'E47 (BETA)', row: 46, col: 4 },
    { name: 'Y15 (GAMMA)', row: 14, col: 24 },
    { name: 'Y47 (DELTA)', row: 46, col: 24 },
  ];

  regionPositions.forEach(({ name, row, col }) => {
    const cell = sourceRowData[row]?.values?.[col];
    if (cell) {
      const format = cell.effectiveFormat || cell.userEnteredFormat;
      formatting.regionCells.push({
        name,
        row,
        col,
        backgroundColor: format?.backgroundColor,
        textColor: format?.textFormat?.foregroundColor,
        fontSize: format?.textFormat?.fontSize,
        bold: format?.textFormat?.bold,
        horizontalAlignment: format?.horizontalAlignment,
        verticalAlignment: format?.verticalAlignment,
      });
    }
  });

  // Extract championship cell formatting (O17)
  const champCell = sourceRowData[16]?.values?.[14]; // O17 = row 16, col 14
  if (champCell) {
    const format = champCell.effectiveFormat || champCell.userEnteredFormat;
    formatting.championshipCell = {
      row: 16,
      col: 14,
      backgroundColor: format?.backgroundColor,
      textColor: format?.textFormat?.foregroundColor,
      fontSize: format?.textFormat?.fontSize,
      bold: format?.textFormat?.bold,
      horizontalAlignment: format?.horizontalAlignment,
      verticalAlignment: format?.verticalAlignment,
    };
  }

  // Extract winner cell formatting (O19)
  const winnerCell = sourceRowData[18]?.values?.[14]; // O19 = row 18, col 14
  if (winnerCell) {
    const format = winnerCell.effectiveFormat || winnerCell.userEnteredFormat;
    formatting.winnerCell = {
      row: 18,
      col: 14,
      // Use championship background color and white text
      backgroundColor: formatting.championshipCell?.backgroundColor || { red: 0.6, green: 0.6, blue: 0.6 },
      textColor: { red: 1, green: 1, blue: 1 }, // White text (same as championship)
      fontSize: format?.textFormat?.fontSize || 10,
      bold: format?.textFormat?.bold || false,
      horizontalAlignment: 'CENTER',
      verticalAlignment: format?.verticalAlignment,
    };
  }

  // Extract row 1 header formatting
  if (sourceRowData[0]) {
    sourceRowData[0].values?.forEach((cell: any, colIndex: number) => {
      const format = cell.effectiveFormat || cell.userEnteredFormat;
      if (format?.textFormat?.bold) {
        formatting.row1Headers.push({
          col: colIndex,
          backgroundColor: format?.backgroundColor,
          textColor: format?.textFormat?.foregroundColor,
          fontSize: format?.textFormat?.fontSize,
          bold: format?.textFormat?.bold,
        });
      }
    });
  }

  // Extract all cells with borders (with null handling)
  sourceRowData.forEach((row: any, rowIndex: number) => {
    row.values?.forEach((cell: any, colIndex: number) => {
      const format = cell.effectiveFormat || cell.userEnteredFormat;
      if (format?.borders) {
        // Clean border data to remove nulls
        const cleanBorders: any = {};
        ['top', 'bottom', 'left', 'right'].forEach((side) => {
          if (format.borders[side]) {
            cleanBorders[side] = {
              style: format.borders[side].style || 'SOLID',
              width: format.borders[side].width || 1,
              color: format.borders[side].color || { red: 0, green: 0, blue: 0 },
            };
          }
        });

        // Only add if at least one border side exists
        if (Object.keys(cleanBorders).length > 0) {
          formatting.borderedCells.push({
            row: rowIndex,
            col: colIndex,
            borders: cleanBorders,
          });
        }
      }
    });
  });

  console.log('📊 Formatting Summary:');
  console.log(`  - Frozen rows: ${formatting.frozenRowCount}`);
  console.log(`  - Merged ranges: ${formatting.merges.length}`);
  console.log(`  - Region cells: ${formatting.regionCells.length}`);
  console.log(`  - Championship cell: ${formatting.championshipCell ? 'O17' : 'none'}`);
  console.log(`  - Winner cell: ${formatting.winnerCell ? 'O19' : 'none'}`);
  console.log(`  - Row 1 headers: ${formatting.row1Headers.length}`);
  console.log(`  - Cells with borders: ${formatting.borderedCells.length}\n`);

  // Print region cell details
  console.log('🎨 Region Cell Formatting:');
  formatting.regionCells.forEach((cell: any) => {
    const bg = cell.backgroundColor;
    const tc = cell.textColor;
    console.log(`\n${cell.name}:`);
    console.log(`  Background: rgb(${bg?.red || 0}, ${bg?.green || 0}, ${bg?.blue || 0})`);
    console.log(`  Text color: rgb(${tc?.red || 0}, ${tc?.green || 0}, ${tc?.blue || 0})`);
    console.log(`  Font: ${cell.fontSize}pt, ${cell.bold ? 'bold' : 'normal'}`);
    console.log(`  Alignment: ${cell.horizontalAlignment}, ${cell.verticalAlignment}`);
  });

  // Save to JSON file
  const outputPath = path.join(__dirname, '../../logs/extracted-formatting.json');
  fs.writeFileSync(outputPath, JSON.stringify(formatting, null, 2));
  console.log(`\n✅ Saved to: ${outputPath}`);

  // Generate TypeScript code
  const tsCode = generateFormattingCode(formatting);
  const tsOutputPath = path.join(__dirname, 'apply-formatting-standalone.ts');
  fs.writeFileSync(tsOutputPath, tsCode);
  console.log(`✅ Generated TypeScript code: ${tsOutputPath}`);
}

function generateFormattingCode(formatting: any): string {
  return `import { google } from 'googleapis';
import * as path from 'path';

/**
 * Apply ALL bracket formatting from extracted rules
 * This script is SELF-CONTAINED and doesn't need a source sheet
 * Generated from extract-all-formatting.ts
 */

export async function applyAllBracketFormatting(
  spreadsheetId: string,
  bracketSheetId: number
): Promise<void> {
  const keyPath = path.join(__dirname, '../../../keys/vpoll-key.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const requests: any[] = [];

  // ========================================================================
  // REGION NAME FORMATTING (4 cells with 4×4 merges)
  // ========================================================================
  const regionFormats = ${JSON.stringify(formatting.regionCells, null, 2)};

  regionFormats.forEach((region: any) => {
    requests.push({
      repeatCell: {
        range: {
          sheetId: bracketSheetId,
          startRowIndex: region.row,
          endRowIndex: region.row + 1,
          startColumnIndex: region.col,
          endColumnIndex: region.col + 1,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: region.backgroundColor,
            textFormat: {
              fontSize: region.fontSize,
              bold: region.bold,
              foregroundColor: region.textColor,
            },
            horizontalAlignment: region.horizontalAlignment,
            verticalAlignment: region.verticalAlignment,
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
      },
    });
  });

  // ========================================================================
  // MERGED CELL RANGES (${formatting.merges.length} total)
  // ========================================================================
  const merges = ${JSON.stringify(formatting.merges, null, 2)};

  merges.forEach((merge: any) => {
    requests.push({
      mergeCells: {
        range: {
          sheetId: bracketSheetId,
          startRowIndex: merge.startRow,
          endRowIndex: merge.endRow,
          startColumnIndex: merge.startCol,
          endColumnIndex: merge.endCol,
        },
        mergeType: 'MERGE_ALL',
      },
    });
  });

  // ========================================================================
  // BORDERS (${formatting.borderedCells.length} cells)
  // ========================================================================
  const borderedCells = ${JSON.stringify(formatting.borderedCells, null, 2)};

  borderedCells.forEach((cell: any) => {
    requests.push({
      repeatCell: {
        range: {
          sheetId: bracketSheetId,
          startRowIndex: cell.row,
          endRowIndex: cell.row + 1,
          startColumnIndex: cell.col,
          endColumnIndex: cell.col + 1,
        },
        cell: {
          userEnteredFormat: {
            borders: cell.borders,
          },
        },
        fields: 'userEnteredFormat.borders',
      },
    });
  });

  // ========================================================================
  // CHAMPIONSHIP CELL FORMATTING (O17)
  // ========================================================================
  const championshipCell = ${JSON.stringify(formatting.championshipCell, null, 2)};

  if (championshipCell) {
    requests.push({
      repeatCell: {
        range: {
          sheetId: bracketSheetId,
          startRowIndex: championshipCell.row,
          endRowIndex: championshipCell.row + 1,
          startColumnIndex: championshipCell.col,
          endColumnIndex: championshipCell.col + 1,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: championshipCell.backgroundColor,
            textFormat: {
              fontSize: championshipCell.fontSize,
              bold: championshipCell.bold,
              foregroundColor: championshipCell.textColor,
            },
            horizontalAlignment: championshipCell.horizontalAlignment,
            verticalAlignment: championshipCell.verticalAlignment,
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
      },
    });
  }

  // ========================================================================
  // WINNER CELL FORMATTING (O19)
  // ========================================================================
  const winnerCell = ${JSON.stringify(formatting.winnerCell, null, 2)};

  if (winnerCell) {
    requests.push({
      repeatCell: {
        range: {
          sheetId: bracketSheetId,
          startRowIndex: winnerCell.row,
          endRowIndex: winnerCell.row + 1,
          startColumnIndex: winnerCell.col,
          endColumnIndex: winnerCell.col + 1,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: winnerCell.backgroundColor,
            textFormat: {
              fontSize: winnerCell.fontSize,
              bold: winnerCell.bold,
              foregroundColor: winnerCell.textColor,
            },
            horizontalAlignment: winnerCell.horizontalAlignment,
            verticalAlignment: winnerCell.verticalAlignment,
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
      },
    });
  }

  // ========================================================================
  // ROW 1 FREEZE
  // ========================================================================
  requests.push({
    updateSheetProperties: {
      properties: {
        sheetId: bracketSheetId,
        gridProperties: {
          frozenRowCount: ${formatting.frozenRowCount},
        },
      },
      fields: 'gridProperties.frozenRowCount',
    },
  });

  // ========================================================================
  // APPLY ALL FORMATTING
  // ========================================================================
  console.log(\`Applying \${requests.length} formatting requests...\`);

  // Apply in batches of 100
  const batchSize = 100;
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: batch,
      },
    });
    console.log(\`  Batch \${Math.floor(i / batchSize) + 1}/\${Math.ceil(requests.length / batchSize)} complete\`);
  }

  console.log('✅ All formatting applied');
}

// If run directly
if (require.main === module) {
  const TARGET_SHEET_ID = process.argv[2] || '1oInaAH5nZbFCwLnTKmbT5uYO2haFGkBCfPMDBSrmD6M';

  (async () => {
    // Get Bracket sheet ID
    const keyPath = path.join(__dirname, '../../../keys/vpoll-key.json');
    const auth = new google.auth.GoogleAuth({
      keyFile: keyPath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    const metadata = await sheets.spreadsheets.get({ spreadsheetId: TARGET_SHEET_ID });
    const bracketSheet = metadata.data.sheets?.find((s: any) => s.properties?.title === 'Bracket');
    const bracketSheetId = bracketSheet?.properties?.sheetId;

    if (bracketSheetId === undefined || bracketSheetId === null) {
      throw new Error('Bracket sheet not found');
    }

    await applyAllBracketFormatting(TARGET_SHEET_ID, bracketSheetId);
    console.log(\`\\n🔗 View: https://docs.google.com/spreadsheets/d/\${TARGET_SHEET_ID}/edit\`);
  })().catch(console.error);
}
`;
}

extractAllFormatting().catch(console.error);
