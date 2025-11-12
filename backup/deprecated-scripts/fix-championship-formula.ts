import { google } from 'googleapis';
import * as path from 'path';

/**
 * Fix championship label to use Config!B3 instead of B1
 */

const TEST_SHEET_ID = '1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o';

const keyPath = path.join(__dirname, '../keys/vpoll-key.json');
const auth = new google.auth.GoogleAuth({
  keyFile: keyPath,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

async function fixChampionshipFormula() {
  console.log('🔧 Fixing championship label formula...\n');

  // Update O18 to use Config!B3 instead of B1
  await sheets.spreadsheets.values.update({
    spreadsheetId: TEST_SHEET_ID,
    range: 'Bracket!O18',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [['=Config!B3&" Champion"']],
    },
  });

  console.log('✅ Formula updated!\n');

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
  console.log(`   Config!B3 (Tournament Name): ${tournamentName.data.values?.[0]?.[0]}`);
  console.log(`   Bracket!O18 formula: ${formula.data.values?.[0]?.[0]}`);
  console.log(`   Bracket!O18 displayed: ${displayedValue.data.values?.[0]?.[0]}`);
}

fixChampionshipFormula().catch(console.error);
