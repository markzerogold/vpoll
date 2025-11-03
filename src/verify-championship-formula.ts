import { google } from 'googleapis';
import * as path from 'path';

const TEST_SHEET_ID = '1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o';

const keyPath = path.join(__dirname, '../keys/vpoll-key.json');
const auth = new google.auth.GoogleAuth({
  keyFile: keyPath,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

async function verifyFormula() {
  console.log('🔍 Verifying championship label formula...\n');

  // Read Config B1 (Tournament Name)
  const config = await sheets.spreadsheets.values.get({
    spreadsheetId: TEST_SHEET_ID,
    range: 'Config!B1',
  });

  const tournamentName = config.data.values?.[0]?.[0] || 'NOT FOUND';
  console.log('📋 Tournament Name (Config!B1):', tournamentName);

  // Read Bracket O18 formula
  const o18Formula = await sheets.spreadsheets.values.get({
    spreadsheetId: TEST_SHEET_ID,
    range: 'Bracket!O18',
    valueRenderOption: 'FORMULA',
  });

  const formula = o18Formula.data.values?.[0]?.[0] || 'NOT FOUND';
  console.log('📝 Formula in Bracket!O18:', formula);

  // Read formatted/displayed value
  const o18Value = await sheets.spreadsheets.values.get({
    spreadsheetId: TEST_SHEET_ID,
    range: 'Bracket!O18',
  });

  const displayedValue = o18Value.data.values?.[0]?.[0] || 'NOT FOUND';
  console.log('🏆 Displayed value in Bracket!O18:', displayedValue);

  // Verify formula is correct
  const expectedFormula = '=Config!B1&" Champion"';
  const expectedValue = `${tournamentName} Champion`;

  console.log('\n✅ Verification:');
  console.log(`   Formula matches expected: ${formula === expectedFormula ? '✅' : '❌'}`);
  console.log(`   Displayed value correct: ${displayedValue === expectedValue ? '✅' : '❌'}`);
}

verifyFormula().catch(console.error);
