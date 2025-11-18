import { google } from 'googleapis';
import * as path from 'path';

const SHEET_ID = process.argv[2] || '1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w';

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

  // First, get all merges and unmerge them
  const fullMetadata = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
    fields: 'sheets(properties(sheetId),merges)',
  });

  const unmergeRequests: any[] = [];
  fullMetadata.data.sheets?.forEach(sheet => {
    const merges = sheet.merges || [];
    merges.forEach(merge => {
      unmergeRequests.push({
        unmergeCells: {
          range: {
            sheetId: sheet.properties?.sheetId,
            startRowIndex: merge.startRowIndex,
            endRowIndex: merge.endRowIndex,
            startColumnIndex: merge.startColumnIndex,
            endColumnIndex: merge.endColumnIndex,
          },
        },
      });
    });
  });

  if (unmergeRequests.length > 0) {
    console.log(`  Unmerging ${unmergeRequests.length} merged cell ranges...`);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: unmergeRequests,
      },
    });
  }

  // Then clear all data and formatting from each sheet
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
