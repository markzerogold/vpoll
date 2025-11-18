import { google } from 'googleapis';
import * as path from 'path';

const SHEET_ID = process.argv[2] || '1oInaAH5nZbFCwLnTKmbT5uYO2haFGkBCfPMDBSrmD6M';

async function testClearMerges() {
  const keyPath = path.join(__dirname, '../../../keys/vpoll-key.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  console.log('📋 Checking merges BEFORE clear...\n');
  
  let metadata = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID, fields: 'sheets(properties(title,sheetId),merges)' });
  metadata.data.sheets?.forEach((sheet: any) => {
    const merges = sheet.merges || [];
    console.log(`  ${sheet.properties?.title}: ${merges.length} merges`);
  });

  console.log('\n🧹 Clearing with updateCells fields: "*"...\n');

  const sheetIds = metadata.data.sheets?.map((s: any) => s.properties?.sheetId).filter((id: any) => id !== undefined) || [];
  const requests = sheetIds.map((sheetId: number) => ({
    updateCells: {
      range: { sheetId },
      fields: '*',
    }
  }));

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { requests },
  });

  console.log('📋 Checking merges AFTER clear...\n');
  
  metadata = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID, fields: 'sheets(properties(title,sheetId),merges)' });
  metadata.data.sheets?.forEach((sheet: any) => {
    const merges = sheet.merges || [];
    console.log(`  ${sheet.properties?.title}: ${merges.length} merges`);
  });
}

testClearMerges().catch(console.error);
