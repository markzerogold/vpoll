import { google } from 'googleapis';
import * as path from 'path';

/**
 * Copy EXACT bracket formatting from source sheet to target sheet
 *
 * Reads all formatting details from the source bracket and applies them
 * to the target bracket with 100% fidelity.
 */

const SOURCE_SHEET_ID = '1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w';
const TARGET_SHEET_ID = '1oInaAH5nZbFCwLnTKmbT5uYO2haFGkBCfPMDBSrmD6M';

async function copyBracketFormatting() {
  const keyPath = path.join(__dirname, '../../../keys/vpoll-key.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  console.log('📖 Step 1: Reading source sheet formatting...\n');

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
  console.log(`✅ Found ${sourceRowData.length} rows with data`);
  console.log();

  console.log('📝 Step 2: Setting up target sheet...\n');

  // Get or create Bracket tab in target sheet
  const targetMetadata = await sheets.spreadsheets.get({
    spreadsheetId: TARGET_SHEET_ID,
  });

  let targetBracketId = targetMetadata.data.sheets?.find(
    (s: any) => s.properties?.title === 'Bracket'
  )?.properties?.sheetId;

  if (targetBracketId === undefined) {
    console.log('Creating Bracket tab...');
    const addSheetResponse = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: TARGET_SHEET_ID,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: 'Bracket',
                gridProperties: {
                  rowCount: 100,
                  columnCount: 35,
                  frozenRowCount: 1,
                },
              },
            },
          },
        ],
      },
    });
    targetBracketId = addSheetResponse.data.replies?.[0]?.addSheet?.properties?.sheetId;
    console.log('✅ Bracket tab created');
  } else {
    console.log('✅ Bracket tab found');
    // Clear existing data and formatting
    console.log('Clearing existing formatting...');
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: TARGET_SHEET_ID,
      requestBody: {
        requests: [
          {
            updateCells: {
              range: {
                sheetId: targetBracketId,
              },
              fields: '*',
            },
          },
        ],
      },
    });
    console.log('✅ Cleared');
  }

  console.log();
  console.log('🎨 Step 3: Copying cell formatting...\n');

  // Build requests to copy all cell formatting
  const cellFormatRequests: any[] = [];

  sourceRowData.forEach((row: any, rowIndex: number) => {
    if (!row.values) return;

    row.values.forEach((cell: any, colIndex: number) => {
      const format = cell.effectiveFormat || cell.userEnteredFormat;
      if (!format) return;

      // Copy this cell's formatting
      cellFormatRequests.push({
        repeatCell: {
          range: {
            sheetId: targetBracketId,
            startRowIndex: rowIndex,
            endRowIndex: rowIndex + 1,
            startColumnIndex: colIndex,
            endColumnIndex: colIndex + 1,
          },
          cell: {
            userEnteredFormat: format,
          },
          fields: 'userEnteredFormat',
        },
      });
    });
  });

  console.log(`Applying ${cellFormatRequests.length} cell formats...`);

  // Apply in batches of 100 to avoid API limits
  const batchSize = 100;
  for (let i = 0; i < cellFormatRequests.length; i += batchSize) {
    const batch = cellFormatRequests.slice(i, i + batchSize);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: TARGET_SHEET_ID,
      requestBody: {
        requests: batch,
      },
    });
    console.log(`  Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(cellFormatRequests.length / batchSize)} complete`);
  }

  console.log('✅ Cell formatting applied');
  console.log();

  console.log('🔗 Step 4: Copying merged cells...\n');

  const mergeRequests = sourceMerges.map((merge: any) => ({
    mergeCells: {
      range: {
        sheetId: targetBracketId,
        startRowIndex: merge.startRowIndex,
        endRowIndex: merge.endRowIndex,
        startColumnIndex: merge.startColumnIndex,
        endColumnIndex: merge.endColumnIndex,
      },
      mergeType: 'MERGE_ALL',
    },
  }));

  if (mergeRequests.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: TARGET_SHEET_ID,
      requestBody: {
        requests: mergeRequests,
      },
    });
    console.log(`✅ Merged ${mergeRequests.length} cell ranges`);
  }

  console.log();
  console.log('❄️  Step 5: Freezing row 1...\n');

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: TARGET_SHEET_ID,
    requestBody: {
      requests: [
        {
          updateSheetProperties: {
            properties: {
              sheetId: targetBracketId,
              gridProperties: {
                frozenRowCount: 1,
              },
            },
            fields: 'gridProperties.frozenRowCount',
          },
        },
      ],
    },
  });

  console.log('✅ Row 1 frozen');
  console.log();

  console.log('═══════════════════════════════════════════════════════════');
  console.log('  ✅ FORMATTING COPY COMPLETE');
  console.log('═══════════════════════════════════════════════════════════');
  console.log();
  console.log(`🔗 View target sheet: https://docs.google.com/spreadsheets/d/${TARGET_SHEET_ID}/edit`);
  console.log();
  console.log('📊 Summary:');
  console.log(`  - ${cellFormatRequests.length} cells formatted`);
  console.log(`  - ${mergeRequests.length} ranges merged`);
  console.log('  - Row 1 frozen');
}

copyBracketFormatting().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
