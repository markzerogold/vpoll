import { google } from 'googleapis';
import * as path from 'path';

/**
 * Fix championship label (column O) to wrap text after tournament name
 * Formula will be: =Config!B3&CHAR(10)&"Champion"
 * This displays as:
 *   Star Trek Character Battle 2025
 *   Champion
 */

const TEST_SHEET_ID = '1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o';

const keyPath = path.join(__dirname, '../keys/vpoll-key.json');
const auth = new google.auth.GoogleAuth({
  keyFile: keyPath,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

async function getSheetIdByName(spreadsheetId: string, sheetName: string): Promise<number> {
  const response = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = response.data.sheets?.find(s => s.properties?.title === sheetName);
  if (!sheet || sheet.properties?.sheetId === undefined || sheet.properties.sheetId === null) {
    throw new Error(`Sheet "${sheetName}" not found`);
  }
  return sheet.properties.sheetId as number;
}

function colToIndex(col: string): number {
  let index = 0;
  for (let i = 0; i < col.length; i++) {
    index = index * 26 + (col.charCodeAt(i) - 65 + 1);
  }
  return index - 1;
}

async function fixChampionshipWrapping() {
  console.log('🔧 Fixing championship label wrapping...\n');

  const sheetId = await getSheetIdByName(TEST_SHEET_ID, 'Bracket');
  const requests: any[] = [];

  // 1. Update O18 formula to include line break
  console.log('📝 Updating formula with line break...');

  await sheets.spreadsheets.values.update({
    spreadsheetId: TEST_SHEET_ID,
    range: 'Bracket!O18',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [['=Config!B3&CHAR(10)&"Champion"']],
    },
  });

  // 2. Enable text wrapping for column O (merged range O18:Q18)
  console.log('📄 Enabling text wrapping for column O...');

  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 17,  // Row 18
        endRowIndex: 18,
        startColumnIndex: colToIndex('O'),
        endColumnIndex: colToIndex('Q') + 1,  // Covers merged range O18:Q18
      },
      cell: {
        userEnteredFormat: {
          wrapStrategy: 'WRAP',
          textFormat: {
            bold: true,
            fontSize: 16,
          },
          horizontalAlignment: 'CENTER',
          verticalAlignment: 'MIDDLE',
        },
      },
      fields: 'userEnteredFormat(wrapStrategy,textFormat,horizontalAlignment,verticalAlignment)',
    },
  });

  // 3. Auto-size column O
  console.log('📏 Auto-sizing column O...');

  requests.push({
    autoResizeDimensions: {
      dimensions: {
        sheetId,
        dimension: 'COLUMNS',
        startIndex: colToIndex('O'),
        endIndex: colToIndex('O') + 1,
      },
    },
  });

  // Also auto-size P and Q since they're part of the merged range
  requests.push({
    autoResizeDimensions: {
      dimensions: {
        sheetId,
        dimension: 'COLUMNS',
        startIndex: colToIndex('P'),
        endIndex: colToIndex('P') + 1,
      },
    },
  });

  requests.push({
    autoResizeDimensions: {
      dimensions: {
        sheetId,
        dimension: 'COLUMNS',
        startIndex: colToIndex('Q'),
        endIndex: colToIndex('Q') + 1,
      },
    },
  });

  // Execute all formatting requests
  console.log(`\n✨ Executing ${requests.length} formatting requests...`);

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: TEST_SHEET_ID,
    requestBody: {
      requests: requests,
    },
  });

  console.log('\n✅ Championship label wrapping fixed!\n');

  // Verify the change
  const tournamentName = await sheets.spreadsheets.values.get({
    spreadsheetId: TEST_SHEET_ID,
    range: 'Config!B3',
  });

  const formula = await sheets.spreadsheets.values.get({
    spreadsheetId: TEST_SHEET_ID,
    range: 'Bracket!O18',
    valueRenderOption: 'FORMULA',
  });

  const displayedValue = await sheets.spreadsheets.values.get({
    spreadsheetId: TEST_SHEET_ID,
    range: 'Bracket!O18',
  });

  console.log('📊 Verification:');
  console.log(`   Config!B3: ${tournamentName.data.values?.[0]?.[0]}`);
  console.log(`   Formula: ${formula.data.values?.[0]?.[0]}`);
  console.log(`   Displayed (with line break):`);
  console.log(`   "${displayedValue.data.values?.[0]?.[0]}"`);
  console.log('\n📐 Formatting:');
  console.log('   ✓ Text wrapping enabled (WRAP strategy)');
  console.log('   ✓ Column O auto-sized');
  console.log('   ✓ Text breaks after tournament name');
}

fixChampionshipWrapping().catch(console.error);
