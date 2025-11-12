import { google } from 'googleapis';
import * as path from 'path';

const SHEET_ID = '1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w';

async function clearSheet() {
  const keyPath = path.join(__dirname, '../../../keys/vpoll-key.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  console.log('🧹 Clearing all data and formatting from sheet...\n');

  // Get all sheet IDs
  const metadata = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
  });

  const sheetIds = metadata.data.sheets?.map(s => s.properties?.sheetId).filter(id => id !== undefined) || [];

  console.log(`Found ${sheetIds.length} tabs to clear`);

  // Clear all data and formatting from each sheet
  const requests = sheetIds.map(sheetId => ({
    updateCells: {
      range: {
        sheetId: sheetId,
      },
      fields: '*', // Clear everything
    }
  }));

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: requests,
    },
  });

  console.log('✅ All tabs cleared\n');
}

clearSheet()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
