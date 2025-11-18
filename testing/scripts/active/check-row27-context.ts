import { google } from 'googleapis';
import * as path from 'path';

const keyPath = path.join(__dirname, '../../../keys/vpoll-key.json');
const auth = new google.auth.GoogleAuth({
  keyFile: keyPath,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SHEET_ID = process.argv[2] || '1oInaAH5nZbFCwLnTKmbT5uYO2haFGkBCfPMDBSrmD6M';

async function checkRow27() {
  console.log('\n📋 CHECKING ROW 27 CONTEXT\n');
  console.log('='.repeat(100));

  const response = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
    ranges: ['Bracket!A27:AF27'],
    fields: 'sheets(data(rowData(values(formattedValue,userEnteredValue))))',
  });

  const cells = response.data.sheets?.[0]?.data?.[0]?.rowData?.[0]?.values || [];

  console.log('\nShowing non-empty cells in row 27:\n');

  cells.forEach((cell, idx) => {
    const value = cell?.formattedValue || '';
    const formula = cell?.userEnteredValue?.formulaValue || '';

    if (value || formula) {
      const col = idx < 26 ? String.fromCharCode(65 + idx) : String.fromCharCode(65 + Math.floor(idx / 26) - 1) + String.fromCharCode(65 + (idx % 26));
      console.log(`${col.padEnd(3)}: ${value.padEnd(30)} ${formula ? '[FORMULA: ' + formula + ']' : '[VALUE]'}`);
    }
  });

  console.log('\n' + '='.repeat(100));
  console.log('\nRow 27 should be near championship (row 19) or Round 5 (rows 30-32)');
}

checkRow27().catch(console.error);
