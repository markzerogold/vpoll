import { google } from 'googleapis';
import * as path from 'path';

/**
 * Run a single round of the tournament
 * Usage: npx ts-node src/run-single-round.ts <round-number>
 */

const SPREADSHEET_ID = '1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o';
const ROUND = parseInt(process.argv[2] || '1');

interface Match {
  matchId: string;
  roundName: string;
  region: string;
  p1Cell: string;
  p2Cell: string;
}

function randomVotes(): number {
  return Math.floor(Math.random() * 80) + 20;
}

// Match definitions for each round
const ROUND_MATCHES: { [key: number]: Match[] } = {
  2: [
    // ALPHA region
    { matchId: 'R2-ALPHA-M1', roundName: 'Round 2', region: 'ALPHA', p1Cell: 'D4', p2Cell: 'D5' },
    { matchId: 'R2-ALPHA-M2', roundName: 'Round 2', region: 'ALPHA', p1Cell: 'D12', p2Cell: 'D13' },
    { matchId: 'R2-ALPHA-M3', roundName: 'Round 2', region: 'ALPHA', p1Cell: 'D20', p2Cell: 'D21' },
    { matchId: 'R2-ALPHA-M4', roundName: 'Round 2', region: 'ALPHA', p1Cell: 'D28', p2Cell: 'D29' },
    // BETA region
    { matchId: 'R2-BETA-M1', roundName: 'Round 2', region: 'BETA', p1Cell: 'D36', p2Cell: 'D37' },
    { matchId: 'R2-BETA-M2', roundName: 'Round 2', region: 'BETA', p1Cell: 'D44', p2Cell: 'D45' },
    { matchId: 'R2-BETA-M3', roundName: 'Round 2', region: 'BETA', p1Cell: 'D52', p2Cell: 'D53' },
    { matchId: 'R2-BETA-M4', roundName: 'Round 2', region: 'BETA', p1Cell: 'D60', p2Cell: 'D61' },
    // GAMMA region
    { matchId: 'R2-GAMMA-M1', roundName: 'Round 2', region: 'GAMMA', p1Cell: 'AB4', p2Cell: 'AB5' },
    { matchId: 'R2-GAMMA-M2', roundName: 'Round 2', region: 'GAMMA', p1Cell: 'AB12', p2Cell: 'AB13' },
    { matchId: 'R2-GAMMA-M3', roundName: 'Round 2', region: 'GAMMA', p1Cell: 'AB20', p2Cell: 'AB21' },
    { matchId: 'R2-GAMMA-M4', roundName: 'Round 2', region: 'GAMMA', p1Cell: 'AB28', p2Cell: 'AB29' },
    // DELTA region
    { matchId: 'R2-DELTA-M1', roundName: 'Round 2', region: 'DELTA', p1Cell: 'AB36', p2Cell: 'AB37' },
    { matchId: 'R2-DELTA-M2', roundName: 'Round 2', region: 'DELTA', p1Cell: 'AB44', p2Cell: 'AB45' },
    { matchId: 'R2-DELTA-M3', roundName: 'Round 2', region: 'DELTA', p1Cell: 'AB52', p2Cell: 'AB53' },
    { matchId: 'R2-DELTA-M4', roundName: 'Round 2', region: 'DELTA', p1Cell: 'AB60', p2Cell: 'AB61' },
  ],
  3: [
    { matchId: 'R3-ALPHA-M1', roundName: 'Sweet 16', region: 'ALPHA', p1Cell: 'G8', p2Cell: 'G9' },
    { matchId: 'R3-ALPHA-M2', roundName: 'Sweet 16', region: 'ALPHA', p1Cell: 'G24', p2Cell: 'G25' },
    { matchId: 'R3-BETA-M1', roundName: 'Sweet 16', region: 'BETA', p1Cell: 'G40', p2Cell: 'G41' },
    { matchId: 'R3-BETA-M2', roundName: 'Sweet 16', region: 'BETA', p1Cell: 'G56', p2Cell: 'G57' },
    { matchId: 'R3-GAMMA-M1', roundName: 'Sweet 16', region: 'GAMMA', p1Cell: 'Y8', p2Cell: 'Y9' },
    { matchId: 'R3-GAMMA-M2', roundName: 'Sweet 16', region: 'GAMMA', p1Cell: 'Y24', p2Cell: 'Y25' },
    { matchId: 'R3-DELTA-M1', roundName: 'Sweet 16', region: 'DELTA', p1Cell: 'Y40', p2Cell: 'Y41' },
    { matchId: 'R3-DELTA-M2', roundName: 'Sweet 16', region: 'DELTA', p1Cell: 'Y56', p2Cell: 'Y57' },
  ],
  4: [
    { matchId: 'R4-ALPHA-M1', roundName: 'Elite 8', region: 'ALPHA', p1Cell: 'J16', p2Cell: 'J17' },
    { matchId: 'R4-BETA-M1', roundName: 'Elite 8', region: 'BETA', p1Cell: 'J48', p2Cell: 'J49' },
    { matchId: 'R4-GAMMA-M1', roundName: 'Elite 8', region: 'GAMMA', p1Cell: 'V16', p2Cell: 'V17' },
    { matchId: 'R4-DELTA-M1', roundName: 'Elite 8', region: 'DELTA', p1Cell: 'V48', p2Cell: 'V49' },
  ],
  5: [
    { matchId: 'R5-ALPHA_vs_BETA-M1', roundName: 'Final 4', region: 'ALPHA_vs_BETA', p1Cell: 'M31', p2Cell: 'M32' },
    { matchId: 'R5-GAMMA_vs_DELTA-M1', roundName: 'Final 4', region: 'GAMMA_vs_DELTA', p1Cell: 'S31', p2Cell: 'S32' },
  ],
  6: [
    { matchId: 'R6-CHAMPIONSHIP-M1', roundName: 'Championship', region: 'FINAL', p1Cell: 'O26', p2Cell: 'Q27' },
  ],
};

async function runRound() {
  if (!ROUND_MATCHES[ROUND]) {
    console.error(`❌ Invalid round: ${ROUND}. Must be 2-6.`);
    console.log('Note: Round 1 was already completed. Run rounds 2-6 sequentially.');
    process.exit(1);
  }

  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  const matches = ROUND_MATCHES[ROUND];

  console.log('\n' + '='.repeat(80));
  console.log(`ROUND ${ROUND}: ${matches[0].roundName}`);
  console.log('='.repeat(80) + '\n');

  // Read participant names
  const nameCells = matches.flatMap(m => {
    const p1Name = m.p1Cell.replace(/^([A-Z]+)/, (col) => {
      return col === 'D' ? 'E' :
             col === 'AB' ? 'AA' :
             col === 'G' ? 'H' :
             col === 'Y' ? 'X' :
             col === 'J' ? 'K' :
             col === 'V' ? 'U' :
             col === 'M' ? 'N' :
             col === 'S' ? 'R' :
             col === 'O' ? 'P' :
             col === 'Q' ? 'P' :
             String.fromCharCode(col.charCodeAt(col.length - 1) + 1);
    });
    const p2Name = p1Name.replace(/\d+/, (n) => String(parseInt(n) + 1));
    return [`Bracket!${p1Name}`, `Bracket!${p2Name}`];
  });

  const namesResponse = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: SPREADSHEET_ID,
    ranges: nameCells,
  });

  const checkboxUpdates: any[] = [];
  const results: any[] = [];

  matches.forEach((match, idx) => {
    const p1Name = namesResponse.data.valueRanges?.[idx * 2]?.values?.[0]?.[0] || '';
    const p2Name = namesResponse.data.valueRanges?.[idx * 2 + 1]?.values?.[0]?.[0] || '';

    if (!p1Name || !p2Name) {
      console.log(`⏭️  Skipping ${match.matchId} - participants not ready`);
      return;
    }

    // Parse seeds
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
      range: `Bracket!${winner === 1 ? match.p1Cell : match.p2Cell}`,
      values: [[true]]
    });
    checkboxUpdates.push({
      range: `Bracket!${winner === 1 ? match.p2Cell : match.p1Cell}`,
      values: [[false]]
    });

    // Result row
    const now = new Date();
    const pollStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    results.push([
      match.matchId,
      match.roundName,
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

  console.log('\n✅ Round ' + ROUND + ' complete!');
  console.log('📊 View the sheet: https://docs.google.com/spreadsheets/d/' + SPREADSHEET_ID + '/edit\n');

  if (ROUND < 6) {
    console.log('➡️  Next: Run round ' + (ROUND + 1) + ' with: npx ts-node src/run-single-round.ts ' + (ROUND + 1) + '\n');
  } else {
    console.log('🏆 TOURNAMENT COMPLETE! Check cell O19 for the champion!\n');
  }
}

runRound().catch(console.error);
