import { google } from 'googleapis';
import * as path from 'path';

const SPREADSHEET_ID = '1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o';

async function checkSheetIds() {
  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
    fields: 'sheets.properties'
  });

  console.log('Sheet IDs:');
  response.data.sheets?.forEach(sheet => {
    console.log(`  ${sheet.properties?.title}: ${sheet.properties?.sheetId}`);
  });
}

checkSheetIds().catch(console.error);
