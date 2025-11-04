import { google } from 'googleapis';
import * as path from 'path';

/**
 * Remove text wrapping from championship cell and ensure uniform row heights
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

async function fixChampionshipClip() {
  console.log('🔧 Fixing championship cell wrapping and row heights...\n');

  const sheetId = await getSheetIdByName(TEST_SHEET_ID, 'Bracket');
  const requests: any[] = [];

  // 0. Update formula to remove line break
  console.log('🏆 Updating championship formula to single-line format...');

  await sheets.spreadsheets.values.update({
    spreadsheetId: TEST_SHEET_ID,
    range: 'Bracket!O18',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [['=Config!B3&" - Champion"']],
    },
  });

  // 1. Change championship cell from WRAP to CLIP
  console.log('📝 Removing text wrapping from championship cell O18...');

  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 17,  // Row 18
        endRowIndex: 18,
        startColumnIndex: colToIndex('O'),
        endColumnIndex: colToIndex('Q') + 1,  // Merged range O18:Q18
      },
      cell: {
        userEnteredFormat: {
          wrapStrategy: 'CLIP',  // Changed from WRAP
          textFormat: {
            bold: true,
            fontSize: 10,
          },
          horizontalAlignment: 'CENTER',
          verticalAlignment: 'MIDDLE',
        },
      },
      fields: 'userEnteredFormat(wrapStrategy,textFormat,horizontalAlignment,verticalAlignment)',
    },
  });

  // 2. Set uniform row heights for all rows
  console.log('📏 Setting uniform row heights for all bracket rows...');

  // Set all rows to 21 pixels (standard row height)
  // This ensures consistency across the entire bracket
  for (let rowIndex = 0; rowIndex < 65; rowIndex++) {
    requests.push({
      updateDimensionProperties: {
        range: {
          sheetId,
          dimension: 'ROWS',
          startIndex: rowIndex,
          endIndex: rowIndex + 1,
        },
        properties: {
          pixelSize: 21,  // Standard row height
        },
        fields: 'pixelSize',
      },
    });
  }

  // Execute all requests
  console.log(`\n✨ Executing ${requests.length} formatting updates...`);

  const batchSize = 100;
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: TEST_SHEET_ID,
      requestBody: {
        requests: batch,
      },
    });
    console.log(`   Applied ${Math.min(i + batchSize, requests.length)}/${requests.length} updates`);
  }

  console.log('\n✅ Championship cell and row heights fixed!');
  console.log('\n📊 Summary:');
  console.log('   ✓ Championship formula updated (=Config!B3&" - Champion")');
  console.log('   ✓ Championship cell O18: CLIP (no wrapping)');
  console.log('   ✓ All rows set to uniform height (21 pixels)');
  console.log('   ✓ Text formatting maintained (10pt bold, centered)');
  console.log('\n💡 Championship label displays: "Star Trek Character Battle 2025 - Champion"');
  console.log('   All rows in column B (and entire bracket) now have consistent height');
}

fixChampionshipClip().catch(console.error);
