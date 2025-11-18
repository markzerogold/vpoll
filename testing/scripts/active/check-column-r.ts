import { google } from 'googleapis';
import * as path from 'path';

const keyPath = path.join(__dirname, '../../../keys/vpoll-key.json');
const auth = new google.auth.GoogleAuth({
  keyFile: keyPath,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SHEET_ID = process.argv[2] || '1oInaAH5nZbFCwLnTKmbT5uYO2haFGkBCfPMDBSrmD6M';

async function checkColumnR() {
  console.log('\n📋 CHECKING COLUMN R IN BRACKET TAB\n');
  console.log('='.repeat(80));

  const response = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
    ranges: ['Bracket!R1:R70'],
    fields: 'sheets(data(rowData(values(formattedValue,userEnteredValue,effectiveFormat))))',
  });

  const rows = response.data.sheets?.[0]?.data?.[0]?.rowData || [];

  console.log('\nRow | Value | Type | Formula');
  console.log('-'.repeat(80));

  rows.forEach((row, idx) => {
    const cell = row.values?.[0];
    const value = cell?.formattedValue || cell?.effectiveValue?.stringValue || '';
    const formula = cell?.userEnteredValue?.formulaValue || '';
    const boolValue = cell?.effectiveValue?.boolValue;
    const type = boolValue !== undefined ? 'CHECKBOX' :
                 formula ? 'FORMULA' :
                 value ? 'VALUE' : 'EMPTY';

    if (value || formula || boolValue !== undefined) {
      const rowNum = idx + 1;
      const displayValue = boolValue !== undefined ? String(boolValue) : value;
      console.log(`${rowNum.toString().padStart(3)} | ${displayValue.padEnd(30)} | ${type.padEnd(10)} | ${formula.substring(0, 60)}`);
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log('\nColumn R Context:');
  console.log('- Column R: Round 5 right name (should be FORMULA)');
  console.log('- Column S: Round 5 right checkbox');
  console.log('- Column T: (should be empty)');
}

checkColumnR().catch(console.error);
