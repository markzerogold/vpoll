import { google } from 'googleapis';
import * as path from 'path';

async function fixSheet() {
  const keyPath = path.join(__dirname, '../../../keys/vpoll-key.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const sheetId = process.argv[2] || '1oInaAH5nZbFCwLnTKmbT5uYO2haFGkBCfPMDBSrmD6M';

  console.log('🔧 Fixing test sheet...');
  console.log(`Sheet ID: ${sheetId}\n`);

  // Get Bracket sheet ID
  const metadata = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
  const bracketSheet = metadata.data.sheets?.find((s: any) => s.properties?.title === 'Bracket');
  const bracketSheetId = bracketSheet?.properties?.sheetId;

  if (bracketSheetId === undefined) {
    throw new Error('Bracket sheet not found');
  }

  // Note: Region names are already set by formulas in generate-bracket.ts
  // (E15, E47, Y15, Y47 have formulas like =Regions!B2)
  // We should NOT overwrite those formulas with hardcoded values
  console.log('ℹ️  Region names are formula-driven from Regions tab (no changes needed)\n');

  // Step 1: Write Championship cell formula
  console.log('1️⃣  Writing Championship cell...');
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: 'Bracket!O17',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [['=Config!B3&" Champion"']],
    },
  });
  console.log('  ✅ Championship formula written\n');

  // Step 2: Autosize columns
  console.log('2️⃣  Autosizing columns...');
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: sheetId,
    requestBody: {
      requests: [
        // Autosize ALL columns first
        {
          autoResizeDimensions: {
            dimensions: {
              sheetId: bracketSheetId,
              dimension: 'COLUMNS',
              startIndex: 0,
              endIndex: 32, // A-AF
            },
          },
        },
        // Explicitly autosize region name columns (E-G for left regions)
        {
          autoResizeDimensions: {
            dimensions: {
              sheetId: bracketSheetId,
              dimension: 'COLUMNS',
              startIndex: 4, // E
              endIndex: 7, // through G
            },
          },
        },
        // Explicitly autosize region name columns (Y-AA for right regions)
        {
          autoResizeDimensions: {
            dimensions: {
              sheetId: bracketSheetId,
              dimension: 'COLUMNS',
              startIndex: 24, // Y
              endIndex: 27, // through AA
            },
          },
        },
        // Explicitly autosize championship columns (O-Q)
        {
          autoResizeDimensions: {
            dimensions: {
              sheetId: bracketSheetId,
              dimension: 'COLUMNS',
              startIndex: 14, // O
              endIndex: 17, // through Q
            },
          },
        },
      ],
    },
  });
  console.log('  ✅ All columns autosized');
  console.log('  ✅ Region columns (E-G, Y-AA) explicitly sized');
  console.log('  ✅ Championship columns (O-Q) explicitly sized\n');

  console.log('═══════════════════════════════════════════════════════════');
  console.log('  ✅ SHEET FIXED');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log(`🔗 View: https://docs.google.com/spreadsheets/d/${sheetId}/edit\n`);
}

fixSheet().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
