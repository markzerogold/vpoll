import { google } from 'googleapis';
import * as path from 'path';

const SPREADSHEET_ID = '1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o';

async function analyzeFormulas() {
  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');

  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    console.log('🔍 Analyzing bracket formulas to map expected cell positions...\n');

    // Get Round 3 ALPHA cells with formulas
    console.log('=== ROUND 3 ALPHA (Sweet 16) ===');
    const r3Alpha = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
      ranges: ['Bracket!H8', 'Bracket!H24'],
      includeGridData: true,
    });

    const gridData = r3Alpha.data.sheets?.[0]?.data?.[0];

    console.log('\nCell H8 (Round 3 ALPHA Match 1, Participant 1):');
    const h8 = gridData?.rowData?.[0]?.values?.[0];
    console.log(`  Formula: ${h8?.userEnteredValue?.formulaValue || '(no formula)'}`);
    console.log(`  Current value: ${h8?.formattedValue || '(empty)'}`);

    console.log('\nCell H24 (Round 3 ALPHA Match 2, Participant 1):');
    const h24 = gridData?.rowData?.[1]?.values?.[0];
    console.log(`  Formula: ${h24?.userEnteredValue?.formulaValue || '(no formula)'}`);
    console.log(`  Current value: ${h24?.formattedValue || '(empty)'}`);

    // Check Round 4 ALPHA
    console.log('\n=== ROUND 4 ALPHA (Elite 8) ===');
    const r4Alpha = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
      ranges: ['Bracket!K16'],
      includeGridData: true,
    });

    const r4GridData = r4Alpha.data.sheets?.[0]?.data?.[0];
    const k16 = r4GridData?.rowData?.[0]?.values?.[0];
    console.log('\nCell K16 (Round 4 ALPHA, Participant 1):');
    console.log(`  Formula: ${k16?.userEnteredValue?.formulaValue || '(no formula)'}`);

    // Check Round 5 (Final Four)
    console.log('\n=== ROUND 5 (Final Four) ===');
    const r5 = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
      ranges: ['Bracket!N31', 'Bracket!N32'],
      includeGridData: true,
    });

    const r5GridData = r5.data.sheets?.[0]?.data?.[0];
    const n31 = r5GridData?.rowData?.[0]?.values?.[0];
    const n32 = r5GridData?.rowData?.[1]?.values?.[0];
    console.log('\nCell N31 (ALPHA champion):');
    console.log(`  Formula: ${n31?.userEnteredValue?.formulaValue || '(no formula)'}`);
    console.log('\nCell N32 (BETA champion):');
    console.log(`  Formula: ${n32?.userEnteredValue?.formulaValue || '(no formula)'}`);

    // Check Round 6 (Championship)
    console.log('\n=== ROUND 6 (Championship) ===');
    const r6 = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
      ranges: ['Bracket!P26', 'Bracket!P27'],
      includeGridData: true,
    });

    const r6GridData = r6.data.sheets?.[0]?.data?.[0];
    const p26 = r6GridData?.rowData?.[0]?.values?.[0];
    const p27 = r6GridData?.rowData?.[1]?.values?.[0];
    console.log('\nCell P26 (Finalist 1):');
    console.log(`  Formula: ${p26?.userEnteredValue?.formulaValue || '(no formula)'}`);
    console.log('\nCell P27 (Finalist 2):');
    console.log(`  Formula: ${p27?.userEnteredValue?.formulaValue || '(no formula)'}`);

    // Now check what cells Round 2 checkboxes are actually in
    console.log('\n\n=== ACTUAL ROUND 2 CHECKBOX POSITIONS ===');
    const r2Checks = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Bracket!D1:D30',
    });

    const d_values = r2Checks.data.values || [];
    console.log('\nColumn D (Round 2 ALPHA checkboxes):');
    d_values.forEach((row, idx) => {
      if (row[0] === 'TRUE' || row[0] === true || row[0] === 'FALSE' || row[0] === false) {
        console.log(`  Row ${idx + 1}: ${row[0]}`);
      }
    });

    // Analyze the pattern
    console.log('\n\n=== PATTERN ANALYSIS ===');
    console.log('\nRound 3 formula H8 expects TRUE in: D8:E9');
    console.log('Round 3 formula H24 expects TRUE in: D24:E25 (likely)');
    console.log('\nFor 8 Round 2 matches → 8 pairs of checkboxes needed');
    console.log('Expected pattern for Round 2 ALPHA checkboxes:');
    console.log('  Match 1: Rows 8-9');
    console.log('  Match 2: Rows 16-17');
    console.log('  Match 3: Rows 24-25');
    console.log('  Match 4: Rows 32-33 (probably wraps or uses different pattern)');

  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

analyzeFormulas()
  .then(() => {
    console.log('\n✅ Analysis complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  });
