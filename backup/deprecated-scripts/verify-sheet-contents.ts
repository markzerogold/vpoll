import { google } from 'googleapis';
import * as path from 'path';

const SPREADSHEET_ID = '1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o';

async function verifySheetContents() {
  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');

  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    console.log('🔍 Verifying sheet contents before simulation...\n');
    console.log(`📊 Sheet: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit\n`);

    // Get sheet metadata
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    console.log('=== SHEET TABS ===');
    const tabs = metadata.data.sheets?.map(s => s.properties?.title) || [];
    console.log(`Tabs found: ${tabs.join(', ')}\n`);

    // Check Round 1 participants for all 4 regions
    console.log('=== ROUND 1 PARTICIPANTS ===');

    // ALPHA region (left side, top)
    console.log('\n--- ALPHA Region (Column B, Rows 2-31) ---');
    const alphaR1 = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Bracket!B2:B31',
    });
    const alphaParticipants = alphaR1.data.values || [];
    console.log(`Total cells: ${alphaParticipants.length}`);
    console.log(`Populated: ${alphaParticipants.filter(r => r[0]).length}`);
    alphaParticipants.slice(0, 5).forEach((r, i) => {
      console.log(`  Row ${i + 2}: ${r[0] || '(empty)'}`);
    });
    console.log('  ...');

    // BETA region (left side, bottom)
    console.log('\n--- BETA Region (Column B, Rows 34-63) ---');
    const betaR1 = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Bracket!B34:B63',
    });
    const betaParticipants = betaR1.data.values || [];
    console.log(`Total cells: ${betaParticipants.length}`);
    console.log(`Populated: ${betaParticipants.filter(r => r[0]).length}`);
    betaParticipants.slice(0, 5).forEach((r, i) => {
      console.log(`  Row ${i + 34}: ${r[0] || '(empty)'}`);
    });
    console.log('  ...');

    // GAMMA region (right side, top)
    console.log('\n--- GAMMA Region (Column AD, Rows 2-31) ---');
    const gammaR1 = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Bracket!AD2:AD31',
    });
    const gammaParticipants = gammaR1.data.values || [];
    console.log(`Total cells: ${gammaParticipants.length}`);
    console.log(`Populated: ${gammaParticipants.filter(r => r[0]).length}`);
    gammaParticipants.slice(0, 5).forEach((r, i) => {
      console.log(`  Row ${i + 2}: ${r[0] || '(empty)'}`);
    });
    console.log('  ...');

    // DELTA region (right side, bottom)
    console.log('\n--- DELTA Region (Column AD, Rows 34-63) ---');
    const deltaR1 = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Bracket!AD34:AD63',
    });
    const deltaParticipants = deltaR1.data.values || [];
    console.log(`Total cells: ${deltaParticipants.length}`);
    console.log(`Populated: ${deltaParticipants.filter(r => r[0]).length}`);
    deltaParticipants.slice(0, 5).forEach((r, i) => {
      console.log(`  Row ${i + 34}: ${r[0] || '(empty)'}`);
    });
    console.log('  ...');

    // Check Round 2 starting cells (should be empty before simulation)
    console.log('\n=== ROUND 2 CELLS (Should be empty or formula-driven) ===');

    console.log('\n--- ALPHA Round 2 (Column E, Row 4) ---');
    const alphaR2 = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Bracket!E4:E28',
    });
    const alphaR2Values = alphaR2.data.values || [];
    console.log(`Populated cells: ${alphaR2Values.filter(r => r[0]).length}`);
    if (alphaR2Values.filter(r => r[0]).length > 0) {
      console.log('Sample values:');
      alphaR2Values.filter(r => r[0]).slice(0, 3).forEach(r => console.log(`  ${r[0]}`));
    }

    // Check championship cell
    console.log('\n=== CHAMPIONSHIP CELL ===');
    const championship = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Bracket!P26:P27',
    });
    console.log(`Championship cells: ${(championship.data.values || []).map(r => r[0] || '(empty)').join(', ')}`);

    // Summary
    console.log('\n=== VERIFICATION SUMMARY ===');
    const totalR1 = alphaParticipants.filter(r => r[0]).length +
                    betaParticipants.filter(r => r[0]).length +
                    gammaParticipants.filter(r => r[0]).length +
                    deltaParticipants.filter(r => r[0]).length;

    console.log(`Total Round 1 participants populated: ${totalR1} / 64`);
    console.log(`ALPHA: ${alphaParticipants.filter(r => r[0]).length} / 16`);
    console.log(`BETA: ${betaParticipants.filter(r => r[0]).length} / 16`);
    console.log(`GAMMA: ${gammaParticipants.filter(r => r[0]).length} / 16`);
    console.log(`DELTA: ${deltaParticipants.filter(r => r[0]).length} / 16`);

    if (totalR1 === 64) {
      console.log('\n✅ All regions fully populated - ready for complete simulation!');
    } else {
      console.log(`\n⚠️  Missing ${64 - totalR1} participants - simulation will be incomplete`);
    }

  } catch (error) {
    console.error('Error verifying sheet:', error);
    throw error;
  }
}

verifySheetContents()
  .then(() => {
    console.log('\n✅ Verification complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  });
