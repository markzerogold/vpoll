import { google } from 'googleapis';
import * as path from 'path';

const keyPath = path.join(__dirname, '../../../keys/vpoll-key.json');
const auth = new google.auth.GoogleAuth({
  keyFile: keyPath,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SHEET_ID = process.argv[2] || '1oInaAH5nZbFCwLnTKmbT5uYO2haFGkBCfPMDBSrmD6M';

async function checkRow1() {
  console.log('\n📋 CHECKING BRACKET ROW 1 FORMATTING\n');
  console.log('='.repeat(80));

  const response = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
    ranges: ['Bracket!A1:AF1'],
    fields: 'sheets(data(rowData(values(formattedValue,userEnteredFormat,effectiveFormat))))',
  });

  const cells = response.data.sheets?.[0]?.data?.[0]?.rowData?.[0]?.values || [];

  console.log('\nCol | Value | Bold? | Font Size');
  console.log('-'.repeat(80));

  cells.forEach((cell, idx) => {
    const value = cell?.formattedValue || '';
    const bold = cell?.effectiveFormat?.textFormat?.bold || cell?.userEnteredFormat?.textFormat?.bold || false;
    const fontSize = cell?.effectiveFormat?.textFormat?.fontSize || cell?.userEnteredFormat?.textFormat?.fontSize || 10;

    if (value) {
      const col = String.fromCharCode(65 + idx);
      console.log(`${col.padEnd(3)} | ${value.padEnd(20)} | ${String(bold).padEnd(5)} | ${fontSize}`);
    }
  });

  console.log('\n' + '='.repeat(80));
}

checkRow1().catch(console.error);
