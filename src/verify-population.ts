import { google } from 'googleapis';
import * as path from 'path';

const TEST_SHEET_ID = '1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w';

async function verifyPopulation() {
  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  console.log('🔍 VERIFICATION REPORT\n');
  console.log('='.repeat(80));

  // 1. Check Regions tab structure
  console.log('\n📊 REGIONS TAB VERIFICATION\n');
  const regionsData = await sheets.spreadsheets.values.get({
    spreadsheetId: TEST_SHEET_ID,
    range: 'Regions!A1:E18',
  });

  const regions = regionsData.data.values || [];
  console.log('Row 1 (Headers):', regions[0]);
  console.log('Row 2 (Labels):', regions[1]);
  console.log('\nSeed Order (Column A, Rows 3-18):');
  for (let i = 2; i < regions.length; i++) {
    console.log(`  Row ${i + 1}: Seed ${regions[i][0]} | ${regions[i][1]?.substring(0, 30) || '(empty)'}...`);
  }

  // Expected seed order
  const expectedSeeds = [1, 16, 8, 9, 5, 12, 4, 13, 6, 11, 3, 14, 7, 10, 2, 15];
  const actualSeeds = regions.slice(2).map(r => parseInt(r[0]));
  const seedsMatch = JSON.stringify(actualSeeds) === JSON.stringify(expectedSeeds);
  console.log(`\n✓ Seed order ${seedsMatch ? 'CORRECT' : 'INCORRECT'}`);
  if (!seedsMatch) {
    console.log('  Expected:', expectedSeeds);
    console.log('  Actual:  ', actualSeeds);
  }

  // 2. Check Round 1 formulas
  console.log('\n' + '='.repeat(80));
  console.log('\n🎯 ROUND 1 BRACKET FORMULAS\n');

  // Left side - ALPHA region (rows 2-33)
  console.log('Left Side (ALPHA) - First Match:');
  const alphaMatch1 = await sheets.spreadsheets.values.get({
    spreadsheetId: TEST_SHEET_ID,
    range: 'Bracket!B2:B3',
  });
  console.log('  B2:', alphaMatch1.data.values?.[0]?.[0] || '(empty)');
  console.log('  B3:', alphaMatch1.data.values?.[1]?.[0] || '(empty)');

  // Right side - GAMMA region (rows 2-33)
  console.log('\nRight Side (GAMMA) - First Match:');
  const gammaMatch1 = await sheets.spreadsheets.values.get({
    spreadsheetId: TEST_SHEET_ID,
    range: 'Bracket!AD2:AD3',
  });
  console.log('  AD2:', gammaMatch1.data.values?.[0]?.[0] || '(empty)');
  console.log('  AD3:', gammaMatch1.data.values?.[1]?.[0] || '(empty)');

  // 3. Check Round 2 formulas
  console.log('\n' + '='.repeat(80));
  console.log('\n🎯 ROUND 2 BRACKET FORMULAS\n');

  const round2Match1 = await sheets.spreadsheets.values.get({
    spreadsheetId: TEST_SHEET_ID,
    range: 'Bracket!E4:E5',
  });
  console.log('Left Side (ALPHA) - First Match:');
  console.log('  E4:', round2Match1.data.values?.[0]?.[0] || '(empty)');
  console.log('  E5:', round2Match1.data.values?.[1]?.[0] || '(empty)');

  // 4. Check Round 3 formulas
  console.log('\n' + '='.repeat(80));
  console.log('\n🎯 ROUND 3 BRACKET FORMULAS\n');

  const round3Left = await sheets.spreadsheets.values.get({
    spreadsheetId: TEST_SHEET_ID,
    range: 'Bracket!H8:H9',
  });
  console.log('Left Side (ALPHA) - First Match:');
  console.log('  H8:', round3Left.data.values?.[0]?.[0] || '(empty)');
  console.log('  H9:', round3Left.data.values?.[1]?.[0] || '(empty)');

  const round3Right = await sheets.spreadsheets.values.get({
    spreadsheetId: TEST_SHEET_ID,
    range: 'Bracket!AB40:AB41',
  });
  console.log('\nRight Side (GAMMA) - First Match:');
  console.log('  AB40:', round3Right.data.values?.[0]?.[0] || '(empty)');
  console.log('  AB41:', round3Right.data.values?.[1]?.[0] || '(empty)');

  // 5. Check checkbox cells
  console.log('\n' + '='.repeat(80));
  console.log('\n☑️  CHECKBOX VERIFICATION\n');

  const round1Checkboxes = await sheets.spreadsheets.values.get({
    spreadsheetId: TEST_SHEET_ID,
    range: 'Bracket!A2:A3',
  });
  console.log('Round 1 Checkboxes (A2:A3):');
  console.log('  A2:', round1Checkboxes.data.values?.[0]?.[0] || 'FALSE');
  console.log('  A3:', round1Checkboxes.data.values?.[1]?.[0] || 'FALSE');

  const round3Checkboxes = await sheets.spreadsheets.values.get({
    spreadsheetId: TEST_SHEET_ID,
    range: 'Bracket!G8:G9',
  });
  console.log('\nRound 3 Checkboxes (G8:G9):');
  console.log('  G8:', round3Checkboxes.data.values?.[0]?.[0] || 'FALSE');
  console.log('  G9:', round3Checkboxes.data.values?.[1]?.[0] || 'FALSE');

  // 6. Check formatting/styling
  console.log('\n' + '='.repeat(80));
  console.log('\n🎨 FORMATTING VERIFICATION\n');

  const metadata = await sheets.spreadsheets.get({
    spreadsheetId: TEST_SHEET_ID,
    ranges: ['Bracket!A1:AE60'],
    includeGridData: true,
  });

  const gridData = metadata.data.sheets?.[0]?.data?.[0];
  console.log('Grid data loaded:', !!gridData);
  console.log('Total rows:', gridData?.rowData?.length || 0);

  // Check for merged cells
  const merges = metadata.data.sheets?.[0]?.merges || [];
  console.log(`\nMerged cells: ${merges.length} ranges`);
  if (merges.length > 0) {
    console.log('  First 3 merges:');
    merges.slice(0, 3).forEach((merge, i) => {
      console.log(`    ${i + 1}. Rows ${merge.startRowIndex}-${merge.endRowIndex}, Cols ${merge.startColumnIndex}-${merge.endColumnIndex}`);
    });
  }

  // Check for borders
  const firstRow = gridData?.rowData?.[0];
  const firstCell = firstRow?.values?.[0];
  console.log('\nBorders on A1:', !!firstCell?.effectiveFormat?.borders);

  console.log('\n' + '='.repeat(80));
  console.log('\n✅ VERIFICATION COMPLETE\n');
}

verifyPopulation()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
