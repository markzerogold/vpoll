import { google } from 'googleapis';
import * as path from 'path';

const SPREADSHEET_ID = process.argv[2] || '1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w';

async function analyzeProgression() {
  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  console.log('📊 Analyzing tournament progression from Results tab...\n');

  // Read all results
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Results!A2:P200',
  });

  const rows = response.data.values || [];

  // Group by round
  const byRound: { [key: string]: any[] } = {};
  rows.forEach(row => {
    const round = row[1] || 'Unknown';
    if (!byRound[round]) byRound[round] = [];
    byRound[round].push({
      matchId: row[0],
      round: row[1],
      region: row[2],
      p1Name: row[3],
      p1Seed: row[4],
      p1Votes: row[5],
      p2Name: row[6],
      p2Seed: row[7],
      p2Votes: row[8],
      winner: row[9],
    });
  });

  // Analyze each round
  Object.keys(byRound).sort().forEach(round => {
    const matches = byRound[round];
    console.log(`\n=== ${round} (${matches.length} matches) ===`);

    // Group by match ID to find duplicates
    const byMatchId: { [key: string]: any[] } = {};
    matches.forEach(m => {
      if (!byMatchId[m.matchId]) byMatchId[m.matchId] = [];
      byMatchId[m.matchId].push(m);
    });

    // Show duplicates
    Object.keys(byMatchId).forEach(matchId => {
      const instances = byMatchId[matchId];
      if (instances.length > 1) {
        console.log(`\n⚠️  ${matchId} has ${instances.length} entries:`);
        instances.forEach((inst, idx) => {
          console.log(`   [${idx + 1}] Winner: ${inst.winner} (${inst.p1Votes}-${inst.p2Votes})`);
        });
      }
    });

    // Show unique matches
    const uniqueMatches = Object.keys(byMatchId).filter(id => byMatchId[id].length === 1);
    if (uniqueMatches.length > 0) {
      console.log(`\n✅ ${uniqueMatches.length} unique matches (no duplicates)`);
    }
  });

  console.log('\n\n=== SUMMARY ===');
  console.log(`Total result rows: ${rows.length}`);
  Object.keys(byRound).sort().forEach(round => {
    console.log(`  ${round}: ${byRound[round].length} entries`);
  });
}

analyzeProgression().catch(console.error);
