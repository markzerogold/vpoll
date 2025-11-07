import { google } from 'googleapis';
import * as path from 'path';

/**
 * Simulate a complete tournament progression
 * - Randomly selects winners for each match
 * - Updates bracket checkboxes (TRUE/FALSE)
 * - Writes match results to Results tab
 * - Processes one full round at a time
 */

// vPoll tournament sheet - all regions populated
const SPREADSHEET_ID = '1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w';

interface Match {
  matchId: string;
  round: number;
  roundName: string;
  region: string;
  participant1: { name: string; seed: number; checkboxCell: string };
  participant2: { name: string; seed: number; checkboxCell: string };
}

interface MatchResult {
  matchId: string;
  round: string;
  region: string;
  p1Name: string;
  p1Seed: number;
  p1Votes: number;
  p2Name: string;
  p2Seed: number;
  p2Votes: number;
  winner: string;
  pollId: string;
  pollStartTime: string;
  pollEndTime: string;
  totalVotes: number;
  tiebreaker: string;
  notes: string;
}

// Round names for display
const ROUND_NAMES = ['Round 1', 'Round 2', 'Sweet 16', 'Elite 8', 'Final 4', 'Championship'];

// Region names
const REGIONS = ['ALPHA', 'BETA', 'GAMMA', 'DELTA'];

/**
 * Generate random vote count (between 20-100)
 */
function randomVotes(): number {
  return Math.floor(Math.random() * 80) + 20;
}

/**
 * Calculate checkbox cells for Round 1 matches
 */
function getRound1Matches(): Match[] {
  const matches: Match[] = [];

  // Left side: ALPHA and BETA (columns A-B and AD-AE)
  // Right side: GAMMA and DELTA (columns AD-AE)

  for (let regionIdx = 0; regionIdx < 4; regionIdx++) {
    const region = REGIONS[regionIdx];
    const isRightSide = regionIdx >= 2; // GAMMA and DELTA on right

    for (let matchNum = 1; matchNum <= 8; matchNum++) {
      const matchInRegion = matchNum;
      const baseRow = (regionIdx % 2) * 32 + 2 + (matchNum - 1) * 4; // ALPHA/GAMMA start at row 2, BETA/DELTA at row 34

      const checkboxCol = isRightSide ? 'AE' : 'A';

      matches.push({
        matchId: `R1-${region}-M${matchNum}`,
        round: 1,
        roundName: 'Round 1',
        region,
        participant1: {
          name: '', // Will be read from sheet
          seed: 0,
          checkboxCell: `${checkboxCol}${baseRow}`
        },
        participant2: {
          name: '',
          seed: 0,
          checkboxCell: `${checkboxCol}${baseRow + 1}`
        }
      });
    }
  }

  return matches;
}

/**
 * Calculate checkbox cells for Round 2 matches
 */
function getRound2Matches(): Match[] {
  const matches: Match[] = [];

  for (let regionIdx = 0; regionIdx < 4; regionIdx++) {
    const region = REGIONS[regionIdx];
    const isRightSide = regionIdx >= 2;

    for (let matchNum = 1; matchNum <= 4; matchNum++) {
      // Round 2 participants are at rows 4, 5, 12, 13, 20, 21, 28, 29
      // (populated by Round 1 formulas in Column E)
      // Write checkboxes to Column D at these same rows
      const baseRow = (regionIdx % 2) * 32 + 4 + (matchNum - 1) * 8;
      const checkboxCol = isRightSide ? 'AB' : 'D';

      matches.push({
        matchId: `R2-${region}-M${matchNum}`,
        round: 2,
        roundName: 'Round 2',
        region,
        participant1: {
          name: '',
          seed: 0,
          checkboxCell: `${checkboxCol}${baseRow}`
        },
        participant2: {
          name: '',
          seed: 0,
          checkboxCell: `${checkboxCol}${baseRow + 1}`
        }
      });
    }
  }

  return matches;
}

/**
 * Calculate checkbox cells for Round 3 matches
 */
function getRound3Matches(): Match[] {
  const matches: Match[] = [];

  for (let regionIdx = 0; regionIdx < 4; regionIdx++) {
    const region = REGIONS[regionIdx];
    const isRightSide = regionIdx >= 2;

    for (let matchNum = 1; matchNum <= 2; matchNum++) {
      // Round 3 participants are at rows 8, 9, 24, 25 (from Round 2 copy operation)
      // Write checkboxes to Column G (left) or Y (right) - matches generate-bracket.ts:301
      const baseRow = (regionIdx % 2) * 32 + 8 + (matchNum - 1) * 16;
      const checkboxCol = isRightSide ? 'Y' : 'G';  // FIX: Was 'AB':'D', should be 'Y':'G'

      matches.push({
        matchId: `R3-${region}-M${matchNum}`,
        round: 3,
        roundName: 'Sweet 16',
        region,
        participant1: {
          name: '',
          seed: 0,
          checkboxCell: `${checkboxCol}${baseRow}`
        },
        participant2: {
          name: '',
          seed: 0,
          checkboxCell: `${checkboxCol}${baseRow + 1}`
        }
      });
    }
  }

  return matches;
}

/**
 * Calculate checkbox cells for Round 4 matches
 */
function getRound4Matches(): Match[] {
  const matches: Match[] = [];

  for (let regionIdx = 0; regionIdx < 4; regionIdx++) {
    const region = REGIONS[regionIdx];
    const isRightSide = regionIdx >= 2;

    const baseRow = (regionIdx % 2) * 32 + 16;
    const checkboxCol = isRightSide ? 'U' : 'J';  // FIX: Was 'V', should be 'U' for right side

    matches.push({
      matchId: `R4-${region}-M1`,
      round: 4,
      roundName: 'Elite 8',
      region,
      participant1: {
        name: '',
        seed: 0,
        checkboxCell: `${checkboxCol}${baseRow}`
      },
      participant2: {
        name: '',
        seed: 0,
        checkboxCell: `${checkboxCol}${baseRow + 1}`
      }
    });
  }

  return matches;
}

/**
 * Calculate checkbox cells for Round 5 matches (Final Four)
 */
function getRound5Matches(): Match[] {
  return [
    {
      matchId: 'R5-ALPHA_vs_BETA-M1',
      round: 5,
      roundName: 'Final 4',
      region: 'ALPHA_vs_BETA',
      participant1: { name: '', seed: 0, checkboxCell: 'M31' },
      participant2: { name: '', seed: 0, checkboxCell: 'M32' }
    },
    {
      matchId: 'R5-GAMMA_vs_DELTA-M1',
      round: 5,
      roundName: 'Final 4',
      region: 'GAMMA_vs_DELTA',
      participant1: { name: '', seed: 0, checkboxCell: 'R31' },  // FIX: Was 'S31', should be 'R31'
      participant2: { name: '', seed: 0, checkboxCell: 'R32' }   // FIX: Was 'S32', should be 'R32'
    }
  ];
}

/**
 * Calculate checkbox cells for Round 6 match (Championship)
 */
function getRound6Matches(): Match[] {
  return [
    {
      matchId: 'R6-CHAMPIONSHIP-M1',
      round: 6,
      roundName: 'Championship',
      region: 'FINAL',
      participant1: { name: '', seed: 0, checkboxCell: 'O26' },
      participant2: { name: '', seed: 0, checkboxCell: 'Q27' }
    }
  ];
}

/**
 * Read participant names from bracket cells
 */
async function populateMatchNames(
  sheets: any,
  spreadsheetId: string,
  matches: Match[]
): Promise<void> {
  // Get all name cells we need to read
  const nameCells = matches.flatMap(m => {
    const p1NameCell = m.participant1.checkboxCell.replace(/^[A-Z]+/, (col) => {
      // Convert checkbox column to name column (next column)
      const colCode = col.charCodeAt(col.length - 1);
      if (col.length === 1) {
        return String.fromCharCode(colCode + 1); // A→B, D→E, etc.
      } else {
        // Handle multi-char columns like AE→AD (right side uses different pattern)
        return col === 'AE' ? 'AD' :
               col === 'AB' ? 'AA' :
               col === 'Y' ? 'X' :
               col === 'U' ? 'V' :   // FIX: Added U→V mapping for Round 4 right side
               col === 'R' ? 'S' :   // FIX: Changed S→R to R→S for Round 5 right side
               col === 'M' ? 'N' :
               col === 'O' ? 'P' :
               col === 'Q' ? 'P' :   // Q also reads from P
               String.fromCharCode(colCode + 1);
      }
    });

    const p2NameCell = p1NameCell.replace(/\d+/, (rowNum) => String(parseInt(rowNum) + 1));

    return [`Bracket!${p1NameCell}`, `Bracket!${p2NameCell}`];
  });

  // Batch read all names
  const response = await sheets.spreadsheets.values.batchGet({
    spreadsheetId,
    ranges: nameCells,
  });

  // Parse names back into matches
  const values = response.data.valueRanges || [];
  matches.forEach((match, idx) => {
    const p1Value = values[idx * 2]?.values?.[0]?.[0] || '';
    const p2Value = values[idx * 2 + 1]?.values?.[0]?.[0] || '';

    // Parse "(seed) Name" format
    const p1Match = p1Value.match(/^\((\d+)\)\s+(.+)$/);
    const p2Match = p2Value.match(/^\((\d+)\)\s+(.+)$/);

    if (p1Match) {
      match.participant1.seed = parseInt(p1Match[1]);
      match.participant1.name = p1Match[2];
    } else {
      match.participant1.name = p1Value;
    }

    if (p2Match) {
      match.participant2.seed = parseInt(p2Match[1]);
      match.participant2.name = p2Match[2];
    } else {
      match.participant2.name = p2Value;
    }
  });
}

/**
 * Process one round of matches
 */
async function processRound(
  sheets: any,
  spreadsheetId: string,
  roundNum: number
): Promise<void> {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`ROUND ${roundNum}: ${ROUND_NAMES[roundNum - 1]}`);
  console.log('='.repeat(80));

  // Get matches for this round
  let matches: Match[];
  switch (roundNum) {
    case 1: matches = getRound1Matches(); break;
    case 2: matches = getRound2Matches(); break;
    case 3: matches = getRound3Matches(); break;
    case 4: matches = getRound4Matches(); break;
    case 5: matches = getRound5Matches(); break;
    case 6: matches = getRound6Matches(); break;
    default: throw new Error(`Invalid round: ${roundNum}`);
  }

  console.log(`Processing ${matches.length} matches...\n`);

  // Read participant names from bracket
  await populateMatchNames(sheets, spreadsheetId, matches);

  // Process each match
  const results: MatchResult[] = [];
  const checkboxUpdates: any[] = [];

  for (const match of matches) {
    // Skip if participants not populated yet
    if (!match.participant1.name || !match.participant2.name) {
      console.log(`⏭️  Skipping ${match.matchId} - participants not ready`);
      continue;
    }

    // Generate random votes
    const p1Votes = randomVotes();
    const p2Votes = randomVotes();
    const winner = p1Votes > p2Votes ? match.participant1 : match.participant2;
    const loser = p1Votes > p2Votes ? match.participant2 : match.participant1;

    console.log(`🏆 ${match.matchId}: ${winner.name} defeats ${loser.name} (${Math.max(p1Votes, p2Votes)}-${Math.min(p1Votes, p2Votes)})`);

    // Update checkboxes
    checkboxUpdates.push({
      range: `Bracket!${winner.checkboxCell}`,
      values: [[true]]
    });
    checkboxUpdates.push({
      range: `Bracket!${loser.checkboxCell}`,
      values: [[false]]
    });

    // For Round 2+, also write participant names (since cells don't have formulas)
    if (roundNum >= 2) {
      // Calculate name cell (column next to checkbox)
      const nameCol = winner.checkboxCell.replace(/^[A-Z]+/, (col) => {
        if (col === 'D') return 'E';
        if (col === 'AB') return 'AA';
        if (col === 'G') return 'H';
        if (col === 'Y') return 'X';
        if (col === 'J') return 'K';
        if (col === 'V') return 'U';
        if (col === 'M') return 'N';
        if (col === 'O') return 'P';
        return String.fromCharCode(col.charCodeAt(col.length - 1) + 1);
      });

      const loserNameCol = loser.checkboxCell.replace(/^[A-Z]+/, (col) => {
        if (col === 'D') return 'E';
        if (col === 'AB') return 'AA';
        if (col === 'G') return 'H';
        if (col === 'Y') return 'X';
        if (col === 'J') return 'K';
        if (col === 'V') return 'U';
        if (col === 'M') return 'N';
        if (col === 'O') return 'P';
        return String.fromCharCode(col.charCodeAt(col.length - 1) + 1);
      });

      // Write winner name with seed
      checkboxUpdates.push({
        range: `Bracket!${nameCol}`,
        values: [[`(${winner.seed}) ${winner.name}`]]
      });

      // Write loser name with seed (it will show until next round)
      checkboxUpdates.push({
        range: `Bracket!${loserNameCol}`,
        values: [[`(${loser.seed}) ${loser.name}`]]
      });
    }

    // Prepare result row
    const now = new Date();
    const pollStart = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

    results.push({
      matchId: match.matchId,
      round: match.roundName,
      region: match.region,
      p1Name: match.participant1.name,
      p1Seed: match.participant1.seed,
      p1Votes,
      p2Name: match.participant2.name,
      p2Seed: match.participant2.seed,
      p2Votes,
      winner: winner.name,
      pollId: `SIMULATED_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      pollStartTime: pollStart.toISOString(),
      pollEndTime: now.toISOString(),
      totalVotes: p1Votes + p2Votes,
      tiebreaker: '',
      notes: 'Simulated match'
    });
  }

  // Batch update checkboxes
  if (checkboxUpdates.length > 0) {
    console.log(`\n📝 Updating ${checkboxUpdates.length} bracket cells...`);
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data: checkboxUpdates,
      },
    });

    // Wait for Google Sheets formulas to recalculate
    console.log('⏳ Waiting 5 seconds for formulas to recalculate...');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  // Append results to Results tab
  if (results.length > 0) {
    console.log(`📊 Writing ${results.length} results to Results tab...`);

    const resultRows = results.map(r => [
      r.matchId,
      r.round,
      r.region,
      r.p1Name,
      r.p1Seed,
      r.p1Votes,
      r.p2Name,
      r.p2Seed,
      r.p2Votes,
      r.winner,
      r.pollId,
      r.pollStartTime,
      r.pollEndTime,
      r.totalVotes,
      r.tiebreaker,
      r.notes
    ]);

    // Write results to Results tab
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Results!A:P',
      valueInputOption: 'RAW',
      requestBody: {
        values: resultRows,
      },
    });
  }

  console.log(`\n✅ Round ${roundNum} complete!`);

  // For Round 2, copy winners to Round 3's expected cells
  if (roundNum === 2 && checkboxUpdates.length > 0) {
    console.log(`📋 Copying Round 2 winners to Round 3 cells (rows 8, 16, 24, 32)...`);

    const round3PrepUpdates: any[] = [];

    for (const match of matches) {
      if (!match.participant1.name || !match.participant2.name) continue;

      // Find this match's result
      const matchResult = results.find(r => r.matchId === match.matchId);
      if (!matchResult) continue;

      const winner = matchResult.p1Votes > matchResult.p2Votes ? match.participant1 : match.participant2;
      const loser = matchResult.p1Votes > matchResult.p2Votes ? match.participant2 : match.participant1;

      // Round 2 matches are at rows 4, 12, 20, 28 (participant 1)
      // Need to copy to rows 8, 16, 24, 32 for Round 3
      // Pattern: row + 4
      const p1Row = parseInt(winner.checkboxCell.replace(/[A-Z]/g, ''));
      const targetRow = p1Row + 4;

      // Get name column (E for left side, AA for right side)
      const checkboxCol = winner.checkboxCell.replace(/[0-9]/g, '');
      const nameCol = checkboxCol === 'D' ? 'E' : 'AA';

      round3PrepUpdates.push({
        range: `Bracket!${nameCol}${targetRow}`,
        values: [[`(${winner.seed}) ${winner.name}`]]
      });

      // Also write loser to targetRow + 1
      round3PrepUpdates.push({
        range: `Bracket!${nameCol}${targetRow + 1}`,
        values: [[`(${loser.seed}) ${loser.name}`]]
      });
    }

    if (round3PrepUpdates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: 'RAW',
          data: round3PrepUpdates,
        },
      });
      console.log(`  ✓ Copied ${round3PrepUpdates.length / 2} matches to Round 3 cells`);
    }
  }

  // For Round 3, copy winners to Round 4's expected cells
  if (roundNum === 3 && checkboxUpdates.length > 0) {
    console.log(`📋 Copying Round 3 winners to Round 4 cells (rows 16, 48 for each region)...`);

    const round4PrepUpdates: any[] = [];

    // Group matches by region to pair them
    const matchesByRegion: { [key: string]: Match[] } = {};
    for (const match of matches) {
      if (!match.participant1.name || !match.participant2.name) continue;
      if (!matchesByRegion[match.region]) {
        matchesByRegion[match.region] = [];
      }
      matchesByRegion[match.region].push(match);
    }

    // For each region, take the 2 Round 3 matches and create 1 Round 4 match
    for (const [region, regionMatches] of Object.entries(matchesByRegion)) {
      if (regionMatches.length !== 2) continue;

      // Find winners from both matches
      const match1 = regionMatches[0];
      const match2 = regionMatches[1];
      const result1 = results.find(r => r.matchId === match1.matchId);
      const result2 = results.find(r => r.matchId === match2.matchId);

      if (!result1 || !result2) continue;

      const winner1 = result1.p1Votes > result1.p2Votes ? match1.participant1 : match1.participant2;
      const winner2 = result2.p1Votes > result2.p2Votes ? match2.participant1 : match2.participant2;

      // Determine target row for Round 4
      // ALPHA (regionIdx 0): row 16
      // BETA (regionIdx 1): row 48
      // GAMMA (regionIdx 2): row 16 (right side)
      // DELTA (regionIdx 3): row 48 (right side)
      const regionIdx = ['ALPHA', 'BETA', 'GAMMA', 'DELTA'].indexOf(region);
      const isRightSide = regionIdx >= 2;
      const targetRow = (regionIdx % 2) * 32 + 16;

      // Column H for left side, column X for right side
      const nameCol = isRightSide ? 'X' : 'H';

      round4PrepUpdates.push({
        range: `Bracket!${nameCol}${targetRow}`,
        values: [[`(${winner1.seed}) ${winner1.name}`]]
      });

      round4PrepUpdates.push({
        range: `Bracket!${nameCol}${targetRow + 1}`,
        values: [[`(${winner2.seed}) ${winner2.name}`]]
      });
    }

    if (round4PrepUpdates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: 'RAW',
          data: round4PrepUpdates,
        },
      });
      console.log(`  ✓ Copied ${round4PrepUpdates.length / 2} matches to Round 4 cells`);
    }
  }

  // Pause between rounds for dramatic effect
  if (roundNum < 6) {
    console.log('⏸️  Waiting 3 seconds before next round...');
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
}

/**
 * Main tournament simulation
 */
async function simulateTournament() {
  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');

  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    console.log('🎮 Starting tournament simulation...');
    console.log(`📊 Sheet: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit\n`);

    // Clear previous simulation results (keep header row)
    console.log('🧹 Clearing previous results from Results tab...');
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Results!A2:P1000',
    });
    console.log('  ✓ Results tab cleared\n');

    // Process all 6 rounds
    for (let round = 1; round <= 6; round++) {
      await processRound(sheets, SPREADSHEET_ID, round);
    }

    console.log('\n' + '='.repeat(80));
    console.log('🏆 TOURNAMENT COMPLETE! 🏆');
    console.log('='.repeat(80));
    console.log('\n📊 Check the Results tab for complete match history');
    console.log('🏅 Check cell O19 in the Bracket tab for the champion!\n');

  } catch (error) {
    console.error('Error simulating tournament:', error);
    throw error;
  }
}

// Run simulation
simulateTournament()
  .then(() => {
    console.log('✨ Simulation complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Simulation failed:', error.message);
    process.exit(1);
  });
