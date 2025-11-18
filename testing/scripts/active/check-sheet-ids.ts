import { google } from 'googleapis';
import * as path from 'path';

const keyPath = path.join(__dirname, '../../../keys/vpoll-key.json');
const auth = new google.auth.GoogleAuth({
  keyFile: keyPath,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SHEET_ID = process.argv[2] || '1oInaAH5nZbFCwLnTKmbT5uYO2haFGkBCfPMDBSrmD6M';

async function checkSheetIds() {
  console.log('\n📋 CHECKING ALL SHEET IDS\n');
  console.log('='.repeat(80));

  const metadata = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });

  console.log('\nAll sheets in spreadsheet:\n');
  metadata.data.sheets?.forEach((sheet: any) => {
    const title = sheet.properties?.title;
    const id = sheet.properties?.sheetId;
    const index = sheet.properties?.index;
    console.log(`  ${String(index).padStart(2)}. ${title.padEnd(20)} → Sheet ID: ${id}`);
  });

  console.log('\n' + '='.repeat(80));
}

checkSheetIds().catch(console.error);
