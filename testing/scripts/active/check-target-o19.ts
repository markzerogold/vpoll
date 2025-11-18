import { google } from 'googleapis';
import * as path from 'path';

const TARGET_SHEET_ID = '1oInaAH5nZbFCwLnTKmbT5uYO2haFGkBCfPMDBSrmD6M';

async function checkO19Formatting() {
  const keyPath = path.join(__dirname, '../../../keys/vpoll-key.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  console.log('Reading O19 formatting from target sheet...\n');

  // Read O19 (row 18, col 14) with formatting
  const response = await sheets.spreadsheets.get({
    spreadsheetId: TARGET_SHEET_ID,
    ranges: ['Bracket!O19'],
    includeGridData: true,
  });

  const bracket = response.data.sheets?.find(
    (s: any) => s.properties?.title === 'Bracket'
  );

  if (!bracket) {
    throw new Error('Bracket sheet not found');
  }

  const rowData = bracket.data?.[0]?.rowData || [];
  const cell = rowData[0]?.values?.[0]; // O19

  if (!cell) {
    console.log('❌ Cell O19 not found');
    return;
  }

  const format = cell.effectiveFormat || cell.userEnteredFormat;

  console.log('Cell O19 Formatting:');
  console.log('  Value:', cell.formattedValue || cell.userEnteredValue?.stringValue || cell.userEnteredValue?.formulaValue || '(empty)');
  console.log('  Background:', format?.backgroundColor);
  console.log(`  Background RGB: rgb(${format?.backgroundColor?.red || 0}, ${format?.backgroundColor?.green || 0}, ${format?.backgroundColor?.blue || 0})`);
  console.log('  Text Color:', format?.textFormat?.foregroundColor);
  console.log(`  Text RGB: rgb(${format?.textFormat?.foregroundColor?.red || 0}, ${format?.textFormat?.foregroundColor?.green || 0}, ${format?.textFormat?.foregroundColor?.blue || 0})`);
  console.log('  Font Size:', format?.textFormat?.fontSize);
  console.log('  Bold:', format?.textFormat?.bold);
  console.log('  H-Align:', format?.horizontalAlignment);
  console.log('  V-Align:', format?.verticalAlignment);
  console.log('  Wrap:', format?.wrapStrategy);
}

checkO19Formatting().catch(console.error);
