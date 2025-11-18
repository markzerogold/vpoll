import { google } from 'googleapis';
import * as path from 'path';

const keyPath = path.join(__dirname, '../../../keys/vpoll-key.json');
const auth = new google.auth.GoogleAuth({
  keyFile: keyPath,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SHEET_ID = process.argv[2] || '1oInaAH5nZbFCwLnTKmbT5uYO2haFGkBCfPMDBSrmD6M';

async function checkResultsMerges() {
  console.log('\n📋 CHECKING RESULTS TAB FOR MERGED CELLS\n');
  console.log('='.repeat(80));

  const response = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
    ranges: ['Results!A1:S100'],
    fields: 'sheets(properties(title,sheetId),merges,data(rowData(values(formattedValue))))',
  });

  const sheet = response.data.sheets?.[0];
  const merges = sheet?.merges || [];
  const rows = sheet?.data?.[0]?.rowData || [];

  console.log(`\nSheet: ${sheet?.properties?.title}`);
  console.log(`Sheet ID: ${sheet?.properties?.sheetId}`);
  console.log(`\nMerged cells found: ${merges.length}`);

  if (merges.length > 0) {
    console.log('\n❌ PROBLEM: Results tab should have NO merged cells!\n');
    console.log('Merged cell ranges:');
    merges.forEach((merge: any, idx: number) => {
      const startRow = (merge.startRowIndex || 0) + 1;
      const endRow = (merge.endRowIndex || 0);
      const startCol = String.fromCharCode(65 + (merge.startColumnIndex || 0));
      const endCol = String.fromCharCode(65 + (merge.endColumnIndex || 1) - 1);
      console.log(`  ${idx + 1}. ${startCol}${startRow}:${endCol}${endRow}`);
    });
  } else {
    console.log('\n✅ Good: No merged cells found');
  }

  // Check for blank rows
  console.log('\n\nChecking for blank rows...\n');
  const blankRows: number[] = [];

  rows.forEach((row: any, idx: number) => {
    const values = row.values || [];
    const hasContent = values.some((cell: any) => cell?.formattedValue);

    if (!hasContent && idx > 0) { // Skip header row
      blankRows.push(idx + 1);
    }
  });

  if (blankRows.length > 0) {
    console.log(`❌ Found ${blankRows.length} blank rows:`);
    blankRows.slice(0, 10).forEach(rowNum => {
      console.log(`  Row ${rowNum}`);
    });
    if (blankRows.length > 10) {
      console.log(`  ... and ${blankRows.length - 10} more`);
    }
  } else {
    console.log('✅ No blank rows found');
  }

  console.log('\n' + '='.repeat(80));
}

checkResultsMerges().catch(console.error);
