import { google } from 'googleapis';
import * as path from 'path';

/**
 * Update region cell background colors and text colors for optimal visibility
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

function hexToRgb(hex: string): { red: number; green: number; blue: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return {
    red: parseInt(result[1], 16) / 255,
    green: parseInt(result[2], 16) / 255,
    blue: parseInt(result[3], 16) / 255,
  };
}

async function updateRegionColors() {
  console.log('🎨 Updating region cell colors...\n');

  const sheetId = await getSheetIdByName(TEST_SHEET_ID, 'Bracket');
  const requests: any[] = [];

  // Define new color scheme
  // Text color determined by background brightness for optimal contrast
  const regionColors = [
    {
      name: 'Region 1 (ALPHA/Federation)',
      startRow: 15,
      startCol: 'E',
      endCol: 'G',
      rows: 4,
      backgroundColor: hexToRgb('#B22222'), // Firebrick red
      textColor: { red: 1, green: 1, blue: 1 }, // White text (dark background)
      hexBg: '#B22222',
    },
    {
      name: 'Region 3 (GAMMA/Romulan Star Empire)',
      startRow: 15,
      startCol: 'Y',
      endCol: 'AA',
      rows: 4,
      backgroundColor: hexToRgb('#6699CC'), // Light blue
      textColor: { red: 0, green: 0, blue: 0 }, // Black text (light background)
      hexBg: '#6699CC',
    },
    {
      name: 'Region 2 (BETA/Klingon Empire)',
      startRow: 47,
      startCol: 'E',
      endCol: 'G',
      rows: 4,
      backgroundColor: hexToRgb('#FFB300'), // Orange/Amber
      textColor: { red: 0, green: 0, blue: 0 }, // Black text (bright background)
      hexBg: '#FFB300',
    },
    {
      name: 'Region 4 (DELTA/Dominion)',
      startRow: 47,
      startCol: 'Y',
      endCol: 'AA',
      rows: 4,
      backgroundColor: hexToRgb('#999999'), // Gray
      textColor: { red: 1, green: 1, blue: 1 }, // White text (medium-dark background)
      hexBg: '#999999',
    },
  ];

  console.log('🔲 Applying new color scheme:\n');

  for (const region of regionColors) {
    console.log(`   ${region.name}:`);
    console.log(`      Background: ${region.hexBg}`);
    console.log(`      Text: ${region.textColor.red === 1 ? 'White' : 'Black'} (for optimal contrast)`);

    requests.push({
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: region.startRow - 1,
          endRowIndex: region.startRow + region.rows - 1,
          startColumnIndex: colToIndex(region.startCol),
          endColumnIndex: colToIndex(region.endCol) + 1,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: region.backgroundColor,
            textFormat: {
              foregroundColor: region.textColor,
              bold: true,
              fontSize: 22,
            },
            horizontalAlignment: 'CENTER',
            verticalAlignment: 'MIDDLE',
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
      },
    });
  }

  // Execute all requests
  console.log(`\n✨ Applying ${requests.length} color updates...`);

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: TEST_SHEET_ID,
    requestBody: {
      requests,
    },
  });

  console.log('\n✅ Region colors updated successfully!');
  console.log('\n📊 Summary:');
  console.log('   ✓ Region 1 (ALPHA/Federation): #B22222 (Firebrick) + White text');
  console.log('   ✓ Region 2 (BETA/Klingon Empire): #FFB300 (Amber) + Black text');
  console.log('   ✓ Region 3 (GAMMA/Romulan): #6699CC (Light Blue) + Black text');
  console.log('   ✓ Region 4 (DELTA/Dominion): #999999 (Gray) + White text');
  console.log('\n💡 Text colors chosen for optimal visibility and contrast');
}

updateRegionColors().catch(console.error);
