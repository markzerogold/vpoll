import { google } from 'googleapis';
import * as path from 'path';

/**
 * Run Round 1 with random winners
 */

const SPREADSHEET_ID = '1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o';

interface Match {
  matchId: string;
  region: string;
  p1CheckboxCell: string;
  p2CheckboxCell: string;
  p1NameCell: string;
  p2NameCell: string;
}

function randomVotes(): number {
  return Math.floor(Math.random() * 80) + 20;
}

// Round 1 matches (32 total, 8 per region)
const ROUND1_MATCHES: Match[] = [
  // ALPHA region (left side, checkboxes in column A, names in column B)
  { matchId: 'R1-ALPHA-M1', region: 'ALPHA', p1CheckboxCell: 'A2', p2CheckboxCell: 'A3', p1NameCell: 'B2', p2NameCell: 'B3' },
  { matchId: 'R1-ALPHA-M2', region: 'ALPHA', p1CheckboxCell: 'A6', p2CheckboxCell: 'A7', p1NameCell: 'B6', p2NameCell: 'B7' },
  { matchId: 'R1-ALPHA-M3', region: 'ALPHA', p1CheckboxCell: 'A10', p2CheckboxCell: 'A11', p1NameCell: 'B10', p2NameCell: 'B11' },
  { matchId: 'R1-ALPHA-M4', region: 'ALPHA', p1CheckboxCell: 'A14', p2CheckboxCell: 'A15', p1NameCell: 'B14', p2NameCell: 'B15' },
  { matchId: 'R1-ALPHA-M5', region: 'ALPHA', p1CheckboxCell: 'A18', p2CheckboxCell: 'A19', p1NameCell: 'B18', p2NameCell: 'B19' },
  { matchId: 'R1-ALPHA-M6', region: 'ALPHA', p1CheckboxCell: 'A22', p2CheckboxCell: 'A23', p1NameCell: 'B22', p2NameCell: 'B23' },
  { matchId: 'R1-ALPHA-M7', region: 'ALPHA', p1CheckboxCell: 'A26', p2CheckboxCell: 'A27', p1NameCell: 'B26', p2NameCell: 'B27' },
  { matchId: 'R1-ALPHA-M8', region: 'ALPHA', p1CheckboxCell: 'A30', p2CheckboxCell: 'A31', p1NameCell: 'B30', p2NameCell: 'B31' },

  // BETA region (left side, rows 34-65)
  { matchId: 'R1-BETA-M1', region: 'BETA', p1CheckboxCell: 'A34', p2CheckboxCell: 'A35', p1NameCell: 'B34', p2NameCell: 'B35' },
  { matchId: 'R1-BETA-M2', region: 'BETA', p1CheckboxCell: 'A38', p2CheckboxCell: 'A39', p1NameCell: 'B38', p2NameCell: 'B39' },
  { matchId: 'R1-BETA-M3', region: 'BETA', p1CheckboxCell: 'A42', p2CheckboxCell: 'A43', p1NameCell: 'B42', p2NameCell: 'B43' },
  { matchId: 'R1-BETA-M4', region: 'BETA', p1CheckboxCell: 'A46', p2CheckboxCell: 'A47', p1NameCell: 'B46', p2NameCell: 'B47' },
  { matchId: 'R1-BETA-M5', region: 'BETA', p1CheckboxCell: 'A50', p2CheckboxCell: 'A51', p1NameCell: 'B50', p2NameCell: 'B51' },
  { matchId: 'R1-BETA-M6', region: 'BETA', p1CheckboxCell: 'A54', p2CheckboxCell: 'A55', p1NameCell: 'B54', p2NameCell: 'B55' },
  { matchId: 'R1-BETA-M7', region: 'BETA', p1CheckboxCell: 'A58', p2CheckboxCell: 'A59', p1NameCell: 'B58', p2NameCell: 'B59' },
  { matchId: 'R1-BETA-M8', region: 'BETA', p1CheckboxCell: 'A62', p2CheckboxCell: 'A63', p1NameCell: 'B62', p2NameCell: 'B63' },

  // GAMMA region (right side, checkboxes in AE, names in AD)
  { matchId: 'R1-GAMMA-M1', region: 'GAMMA', p1CheckboxCell: 'AE2', p2CheckboxCell: 'AE3', p1NameCell: 'AD2', p2NameCell: 'AD3' },
  { matchId: 'R1-GAMMA-M2', region: 'GAMMA', p1CheckboxCell: 'AE6', p2CheckboxCell: 'AE7', p1NameCell: 'AD6', p2NameCell: 'AD7' },
  { matchId: 'R1-GAMMA-M3', region: 'GAMMA', p1CheckboxCell: 'AE10', p2CheckboxCell: 'AE11', p1NameCell: 'AD10', p2NameCell: 'AD11' },
  { matchId: 'R1-GAMMA-M4', region: 'GAMMA', p1CheckboxCell: 'AE14', p2CheckboxCell: 'AE15', p1NameCell: 'AD14', p2NameCell: 'AD15' },
  { matchId: 'R1-GAMMA-M5', region: 'GAMMA', p1CheckboxCell: 'AE18', p2CheckboxCell: 'AE19', p1NameCell: 'AD18', p2NameCell: 'AD19' },
  { matchId: 'R1-GAMMA-M6', region: 'GAMMA', p1CheckboxCell: 'AE22', p2CheckboxCell: 'AE23', p1NameCell: 'AD22', p2NameCell: 'AD23' },
  { matchId: 'R1-GAMMA-M7', region: 'GAMMA', p1CheckboxCell: 'AE26', p2CheckboxCell: 'AE27', p1NameCell: 'AD26', p2NameCell: 'AD27' },
  { matchId: 'R1-GAMMA-M8', region: 'GAMMA', p1CheckboxCell: 'AE30', p2CheckboxCell: 'AE31', p1NameCell: 'AD30', p2NameCell: 'AD31' },

  // DELTA region (right side, rows 34-65)
  { matchId: 'R1-DELTA-M1', region: 'DELTA', p1CheckboxCell: 'AE34', p2CheckboxCell: 'AE35', p1NameCell: 'AD34', p2NameCell: 'AD35' },
  { matchId: 'R1-DELTA-M2', region: 'DELTA', p1CheckboxCell: 'AE38', p2CheckboxCell: 'AE39', p1NameCell: 'AD38', p2NameCell: 'AD39' },
  { matchId: 'R1-DELTA-M3', region: 'DELTA', p1CheckboxCell: 'AE42', p2CheckboxCell: 'AE43', p1NameCell: 'AD42', p2NameCell: 'AD43' },
  { matchId: 'R1-DELTA-M4', region: 'DELTA', p1CheckboxCell: 'AE46', p2CheckboxCell: 'AE47', p1NameCell: 'AD46', p2NameCell: 'AD47' },
  { matchId: 'R1-DELTA-M5', region: 'DELTA', p1CheckboxCell: 'AE50', p2CheckboxCell: 'AE51', p1NameCell: 'AD50', p2NameCell: 'AD51' },
  { matchId: 'R1-DELTA-M6', region: 'DELTA', p1CheckboxCell: 'AE54', p2CheckboxCell: 'AE55', p1NameCell: 'AD54', p2NameCell: 'AD55' },
  { matchId: 'R1-DELTA-M7', region: 'DELTA', p1CheckboxCell: 'AE58', p2CheckboxCell: 'AE59', p1NameCell: 'AD58', p2NameCell: 'AD59' },
  { matchId: 'R1-DELTA-M8', region: 'DELTA', p1CheckboxCell: 'AE62', p2CheckboxCell: 'AE63', p1NameCell: 'AD62', p2NameCell: 'AD63' },
];

async function runRound1() {
  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  console.log('\n' + '='.repeat(80));
  console.log('ROUND 1: Simulated Tournament');
  console.log('='.repeat(80) + '\n');

  // Read participant names
  const nameCells = ROUND1_MATCHES.flatMap(m => [
    `Bracket!${m.p1NameCell}`,
    `Bracket!${m.p2NameCell}`
  ]);

  const namesResponse = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: SPREADSHEET_ID,
    ranges: nameCells,
  });

  const checkboxUpdates: any[] = [];
  const results: any[] = [];

  ROUND1_MATCHES.forEach((match, idx) => {
    const p1Name = namesResponse.data.valueRanges?.[idx * 2]?.values?.[0]?.[0] || '';
    const p2Name = namesResponse.data.valueRanges?.[idx * 2 + 1]?.values?.[0]?.[0] || '';

    if (!p1Name || !p2Name) {
      console.log(`⏭️  Skipping ${match.matchId} - participants not ready`);
      return;
    }

    // Parse seeds from names like "(1) Spock"
    const p1Match = p1Name.match(/^\((\d+)\)/);
    const p2Match = p2Name.match(/^\((\d+)\)/);
    const p1Seed = p1Match ? parseInt(p1Match[1]) : 0;
    const p2Seed = p2Match ? parseInt(p2Match[1]) : 0;

    // Random votes
    const p1Votes = randomVotes();
    const p2Votes = randomVotes();
    const winner = p1Votes > p2Votes ? 1 : 2;

    const winnerName = winner === 1 ? p1Name : p2Name;
    const loserName = winner === 1 ? p2Name : p1Name;
    const maxVotes = Math.max(p1Votes, p2Votes);
    const minVotes = Math.min(p1Votes, p2Votes);
    console.log(`🏆 ${match.matchId}: ${winnerName} defeats ${loserName} (${maxVotes}-${minVotes})`);

    // Update checkboxes
    checkboxUpdates.push({
      range: `Bracket!${winner === 1 ? match.p1CheckboxCell : match.p2CheckboxCell}`,
      values: [[true]]
    });
    checkboxUpdates.push({
      range: `Bracket!${winner === 1 ? match.p2CheckboxCell : match.p1CheckboxCell}`,
      values: [[false]]
    });

    // Result row
    const now = new Date();
    const pollStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    results.push([
      match.matchId,
      'Round 1',
      match.region,
      p1Name,
      p1Seed,
      p1Votes,
      p2Name,
      p2Seed,
      p2Votes,
      winner === 1 ? p1Name : p2Name,
      `SIM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      pollStart.toISOString(),
      now.toISOString(),
      p1Votes + p2Votes,
      '',
      'Simulated'
    ]);
  });

  if (checkboxUpdates.length > 0) {
    console.log('\n📝 Updating ' + checkboxUpdates.length + ' bracket cells...');
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: checkboxUpdates,
      },
    });
  }

  if (results.length > 0) {
    console.log('📊 Writing ' + results.length + ' results to Results tab...');
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Results!A:P',
      valueInputOption: 'RAW',
      requestBody: {
        values: results,
      },
    });
  }

  console.log('\n✅ Round 1 complete!');
  console.log('📊 View the sheet: https://docs.google.com/spreadsheets/d/' + SPREADSHEET_ID + '/edit\n');
}

runRound1().catch(console.error);
