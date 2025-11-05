import { google } from 'googleapis';
import * as path from 'path';

const SPREADSHEET_ID = '1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o';

async function checkStructure() {
  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');

  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    console.log('🔍 Checking actual bracket structure...\n');

    // Check rows 8-10 across multiple columns to find Round 3
    console.log('=== Row 8 across columns A-P (Top half Round 3 area) ===');
    const row8 = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Bracket!A8:P8',
    });

    const row8Values = row8.data.values?.[0] || [];
    row8Values.forEach((val, idx) => {
      const col = String.fromCharCode(65 + idx);
      if (val) {
        console.log(`  Column ${col}: ${val}`);
      }
    });

    console.log('\n=== Row 16 across columns A-P (Middle Round 4 area) ===');
    const row16 = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Bracket!A16:P16',
    });

    const row16Values = row16.data.values?.[0] || [];
    row16Values.forEach((val, idx) => {
      const col = String.fromCharCode(65 + idx);
      if (val) {
        console.log(`  Column ${col}: ${val}`);
      }
    });

    console.log('\n=== Row 24 across columns A-P (Bottom Round 3 area) ===');
    const row24 = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Bracket!A24:P24',
    });

    const row24Values = row24.data.values?.[0] || [];
    row24Values.forEach((val, idx) => {
      const col = String.fromCharCode(65 + idx);
      if (val) {
        console.log(`  Column ${col}: ${val}`);
      }
    });

    // Check if there are formulas in Round 3 name cells
    console.log('\n=== Checking for formulas in expected Round 3 cells ===');
    const formulaCheck = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
      ranges: ['Bracket!H8', 'Bracket!H24'],
      includeGridData: true,
    });

    const gridData = formulaCheck.data.sheets?.[0]?.data?.[0];
    console.log('Cell H8:');
    const h8 = gridData?.rowData?.[0]?.values?.[0];
    console.log(`  Value: ${h8?.formattedValue || '(empty)'}`);
    console.log(`  Formula: ${h8?.userEnteredValue?.formulaValue || '(no formula)'}`);

    console.log('Cell H24:');
    const h24 = gridData?.rowData?.[1]?.values?.[0];
    console.log(`  Value: ${h24?.formattedValue || '(empty)'}`);
    console.log(`  Formula: ${h24?.userEnteredValue?.formulaValue || '(no formula)'}`);

  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

checkStructure()
  .then(() => {
    console.log('\n✅ Structure check complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  });
