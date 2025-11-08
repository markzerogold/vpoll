import { google } from 'googleapis';
import * as path from 'path';

const EXAMPLE_SHEET_ID = '1Z83Lr02EW9wvpH3YfBvLwafHMIqyxJLXaO_0D85bMfk';
const TEST_SHEET_ID = process.argv[2] || '1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w';

async function addMissingFormatting() {
  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  console.log('🎨 Adding Missing Formatting');
  console.log('='.repeat(80));
  console.log(`Example sheet: ${EXAMPLE_SHEET_ID}`);
  console.log(`Test sheet: ${TEST_SHEET_ID}\n`);

  // Get sheet IDs
  const testMetadata = await sheets.spreadsheets.get({
    spreadsheetId: TEST_SHEET_ID,
  });

  console.log('Available sheets:');
  testMetadata.data.sheets?.forEach(s => {
    console.log(`  - ${s.properties?.title} (ID: ${s.properties?.sheetId})`);
  });

  const bracketSheetId = testMetadata.data.sheets?.find(s => s.properties?.title === 'Bracket')?.properties?.sheetId;

  if (bracketSheetId === undefined) {
    throw new Error('Bracket sheet not found');
  }

  console.log(`\n📋 Bracket sheet ID: ${bracketSheetId}\n`);

  // Step 1: Get region name formatting from example sheet
  console.log('📖 Reading region name formatting from example sheet...');
  const exampleMetadata = await sheets.spreadsheets.get({
    spreadsheetId: EXAMPLE_SHEET_ID,
    ranges: ['Bracket!E15', 'Bracket!E31', 'Bracket!Y15', 'Bracket!Y31'],
    includeGridData: true,
  });

  const exampleData = exampleMetadata.data.sheets?.[0]?.data;
  const regionFormats: any[] = [];

  // Collect formatting from all 4 region name cells
  const regionCells = [
    { row: 14, col: 4, label: 'E15 (Federation)' },
    { row: 30, col: 4, label: 'E31 (Klingon Empire)' },
    { row: 14, col: 24, label: 'Y15 (Romulan Star Empire)' },
    { row: 30, col: 24, label: 'Y31 (Dominion)' },
  ];

  if (exampleData) {
    for (const cell of regionCells) {
      const cellData = exampleData[regionCells.indexOf(cell)]?.rowData?.[0]?.values?.[0];
      if (cellData?.effectiveFormat) {
        console.log(`  ${cell.label}:`);
        console.log(`    Background: RGB(${cellData.effectiveFormat.backgroundColor?.red || 0}, ${cellData.effectiveFormat.backgroundColor?.green || 0}, ${cellData.effectiveFormat.backgroundColor?.blue || 0})`);
        console.log(`    Font size: ${cellData.effectiveFormat.textFormat?.fontSize || 10}`);
        console.log(`    Bold: ${cellData.effectiveFormat.textFormat?.bold || false}`);

        regionFormats.push({
          row: cell.row,
          col: cell.col,
          format: cellData.effectiveFormat,
        });
      }
    }
  }

  console.log(`✅ Found formatting for ${regionFormats.length} region cells\n`);

  // Step 2: Merge header cells
  console.log('🔗 Merging header cells...');
  const merges = [
    // Left side headers
    { startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 2 }, // A1:B1 Round 1
    { startRowIndex: 0, endRowIndex: 1, startColumnIndex: 3, endColumnIndex: 5 }, // D1:E1 Round 2
    { startRowIndex: 0, endRowIndex: 1, startColumnIndex: 6, endColumnIndex: 8 }, // G1:H1 Sweet 16
    { startRowIndex: 0, endRowIndex: 1, startColumnIndex: 9, endColumnIndex: 11 }, // J1:K1 Elite 8
    { startRowIndex: 0, endRowIndex: 1, startColumnIndex: 12, endColumnIndex: 14 }, // M1:N1 Final 4
    { startRowIndex: 0, endRowIndex: 1, startColumnIndex: 15, endColumnIndex: 19 }, // P1:S1 Championship
    // Right side headers
    { startRowIndex: 0, endRowIndex: 1, startColumnIndex: 20, endColumnIndex: 22 }, // U1:V1 Elite 8
    { startRowIndex: 0, endRowIndex: 1, startColumnIndex: 23, endColumnIndex: 25 }, // X1:Y1 Sweet 16
    { startRowIndex: 0, endRowIndex: 1, startColumnIndex: 26, endColumnIndex: 28 }, // AA1:AB1 Round 2
    { startRowIndex: 0, endRowIndex: 1, startColumnIndex: 29, endColumnIndex: 31 }, // AD1:AE1 Round 1
  ];

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: TEST_SHEET_ID,
    requestBody: {
      requests: merges.map(merge => ({
        mergeCells: {
          range: {
            sheetId: bracketSheetId,
            ...merge,
          },
          mergeType: 'MERGE_ALL',
        },
      })),
    },
  });

  console.log(`✅ Merged ${merges.length} header cell ranges\n`);

  // Step 3: Apply region name formatting
  console.log('🎨 Applying region name formatting...');

  if (regionFormats.length > 0) {
    const formatRequests = regionFormats.map(({ row, col, format }) => ({
      repeatCell: {
        range: {
          sheetId: bracketSheetId,
          startRowIndex: row,
          endRowIndex: row + 1,
          startColumnIndex: col,
          endColumnIndex: col + 1,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: format.backgroundColor,
            textFormat: {
              fontSize: format.textFormat?.fontSize || 14,
              bold: format.textFormat?.bold || true,
              foregroundColor: format.textFormat?.foregroundColor || { red: 1, green: 1, blue: 1 },
            },
            horizontalAlignment: 'CENTER',
            verticalAlignment: 'MIDDLE',
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
      },
    }));

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: TEST_SHEET_ID,
      requestBody: {
        requests: formatRequests,
      },
    });

    console.log(`✅ Applied formatting to ${formatRequests.length} region name cells\n`);
  }

  // Step 4: Fix borders for columns Y and AA (Round 2 right side)
  console.log('🖼️  Reading borders for columns Y and AA from example sheet...');

  const exampleBorders = await sheets.spreadsheets.get({
    spreadsheetId: EXAMPLE_SHEET_ID,
    ranges: ['Bracket!Y1:AA60'],
    includeGridData: true,
  });

  const exampleGridData = exampleBorders.data.sheets?.[0]?.data?.[0];
  const borderUpdates: any[] = [];

  if (exampleGridData?.rowData) {
    for (let rowIdx = 0; rowIdx < exampleGridData.rowData.length; rowIdx++) {
      const row = exampleGridData.rowData[rowIdx];
      if (!row.values) continue;

      for (let colIdx = 0; colIdx < row.values.length; colIdx++) {
        const cell = row.values[colIdx];
        const borders = cell?.effectiveFormat?.borders;

        if (borders && (borders.top || borders.bottom || borders.left || borders.right)) {
          const actualCol = 24 + colIdx; // Y starts at column 24
          const actualRow = rowIdx;

          borderUpdates.push({
            updateBorders: {
              range: {
                sheetId: bracketSheetId,
                startRowIndex: actualRow,
                endRowIndex: actualRow + 1,
                startColumnIndex: actualCol,
                endColumnIndex: actualCol + 1,
              },
              top: borders.top,
              bottom: borders.bottom,
              left: borders.left,
              right: borders.right,
            },
          });
        }
      }
    }
  }

  console.log(`✅ Found ${borderUpdates.length} cells with borders in Y:AA\n`);

  if (borderUpdates.length > 0) {
    console.log('🖼️  Applying borders to columns Y and AA...');

    // Apply in batches of 100
    for (let i = 0; i < borderUpdates.length; i += 100) {
      const batch = borderUpdates.slice(i, i + 100);
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: TEST_SHEET_ID,
        requestBody: {
          requests: batch,
        },
      });
      console.log(`  Applied batch ${Math.floor(i / 100) + 1}/${Math.ceil(borderUpdates.length / 100)}...`);
    }

    console.log(`✅ Applied ${borderUpdates.length} border updates\n`);
  }

  console.log('='.repeat(80));
  console.log('✅ Missing formatting added successfully!');
  console.log(`🔗 View result: https://docs.google.com/spreadsheets/d/${TEST_SHEET_ID}/edit\n`);
}

addMissingFormatting()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
