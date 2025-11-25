import { google } from 'googleapis';
import * as path from 'path';

/**
 * Simulate a complete tournament progression
 * - Randomly selects winners for each match
 * - Updates bracket checkboxes (TRUE/FALSE)
 * - Writes match results to Results tab
 * - Processes one full round at a time
 */

// vPoll tournament sheet - accept from command line or use default
const SPREADSHEET_ID = process.argv[2] || '1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w';

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

// Region names (will be loaded from Regions tab at runtime)
let REGIONS: string[] = ['ALPHA', 'BETA', 'GAMMA', 'DELTA']; // Default fallback

/**
 * Generate random vote count (between 20-100)
 */
function randomVotes(): number {
  return Math.floor(Math.random() * 80) + 20;
}

/**
 * Read region names from Regions tab (row 2, columns B-E)
 */
async function loadRegionNames(sheets: any, spreadsheetId: string): Promise<void> {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Regions!B2:E2',
    });

    const values = response.data.values?.[0];
    if (values && values.length === 4) {
      REGIONS[0] = values[0] || 'ALPHA';
      REGIONS[1] = values[1] || 'BETA';
      REGIONS[2] = values[2] || 'GAMMA';
      REGIONS[3] = values[3] || 'DELTA';
      console.log(`📍 Region names loaded: ${REGIONS.join(', ')}`);
    } else {
      console.warn('⚠️  Could not read region names, using defaults: ALPHA, BETA, GAMMA, DELTA');
    }
  } catch (error) {
    console.warn('⚠️  Error reading region names, using defaults:', error);
  }
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
    const checkboxCol = isRightSide ? 'V' : 'J';  // Round 4 right side uses V for checkbox, U for name

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
      matchId: `R5-${REGIONS[0]}_vs_${REGIONS[1]}-M1`,
      round: 5,
      roundName: 'Final 4',
      region: `${REGIONS[0]}_vs_${REGIONS[1]}`,
      participant1: { name: '', seed: 0, checkboxCell: 'M31' },
      participant2: { name: '', seed: 0, checkboxCell: 'M32' }
    },
    {
      matchId: `R5-${REGIONS[2]}_vs_${REGIONS[3]}-M1`,
      round: 5,
      roundName: 'Final 4',
      region: `${REGIONS[2]}_vs_${REGIONS[3]}`,
      participant1: { name: '', seed: 0, checkboxCell: 'S31' },  // Round 5 right side: S=checkbox, R=name
      participant2: { name: '', seed: 0, checkboxCell: 'S32' }
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
      // Special mappings for bracket columns (both single and multi-char)
      const specialMappings: Record<string, string> = {
        'AE': 'AD',  // Round 1 right - checkbox in AE, name in AD
        'AB': 'AA',  // Round 2 right - checkbox in AB, name in AA
        'Y': 'X',    // Round 3 right - checkbox in Y, name in X (FIXED: was incorrectly mapping to AB)
        'V': 'U',    // Round 4 right - checkbox in V, name in U
        'S': 'R',    // Round 5 right - checkbox in S, name in R
        'M': 'N',    // Round 5 left - checkbox in M, name in N
        'O': 'P',    // Round 6 - checkbox in O, name in P
        'Q': 'P',    // Round 6 - checkbox in Q, name in P (both finalists read from same name column)
      };

      // Check special mappings first (handles both single and multi-char)
      if (col in specialMappings) {
        return specialMappings[col];
      }

      // Default: next column (for standard single-char columns like A→B, D→E, G→H, J→K)
      const colCode = col.charCodeAt(col.length - 1);
      return String.fromCharCode(colCode + 1);
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

    // NOTE: We do NOT write participant names to Round 2+ cells.
    // All rounds now have VLOOKUP formulas that auto-propagate winners from previous round checkboxes.
    // Writing names here would overwrite those formulas with static values.

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
    console.log('⏳ Waiting 15 seconds for formulas to recalculate...');
    await new Promise(resolve => setTimeout(resolve, 15000));

    // Autosize columns after names have been populated by formulas
    console.log('📏 Autosizing columns to fit winner names...');
    const metadata = await sheets.spreadsheets.get({ spreadsheetId });
    const bracketSheet = metadata.data.sheets?.find((s: any) => s.properties?.title === 'Bracket');
    const bracketSheetId = bracketSheet?.properties?.sheetId;

    if (bracketSheetId !== undefined) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              autoResizeDimensions: {
                dimensions: {
                  sheetId: bracketSheetId,
                  dimension: 'COLUMNS',
                  startIndex: 0,
                  endIndex: 31, // A-AE
                },
              },
            },
          ],
        },
      });
    }
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

    // Autosize Results tab columns to fit participant names
    console.log('📏 Autosizing Results tab columns to fit names...');
    const metadata = await sheets.spreadsheets.get({ spreadsheetId });
    const resultsSheet = metadata.data.sheets?.find((s: any) => s.properties?.title === 'Results');
    const resultsSheetId = resultsSheet?.properties?.sheetId;

    if (resultsSheetId !== undefined) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              autoResizeDimensions: {
                dimensions: {
                  sheetId: resultsSheetId,
                  dimension: 'COLUMNS',
                  startIndex: 0,
                  endIndex: 16, // A-P (16 columns)
                },
              },
            },
          ],
        },
      });
    }
  }

  console.log(`\n✅ Round ${roundNum} complete!`);

  // ❌ REMOVED: Winner copying code (lines 488-602)
  //
  // This code wrote participant names directly to cells, which caused multiple problems:
  // 1. Overwrote region names (wrote to E16 which included E15 where "Federation" was)
  // 2. Wrote to wrong columns (wrote to E but Round 3 formulas are in H)
  // 3. Was unnecessary - VLOOKUP formulas automatically display winners when checkboxes are TRUE
  //
  // The bracket is FORMULA-DRIVEN. We only need to write TRUE/FALSE to checkboxes.
  // The VLOOKUP formulas like =IFERROR(VLOOKUP(TRUE,$D$4:$E$5,2,FALSE),"") handle everything else.

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
  const keyPath = path.join(__dirname, '../../../keys/vpoll-key.json');

  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    console.log('🎮 Starting tournament simulation...');
    console.log(`📊 Sheet: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit\n`);

    // Load region names from Regions tab
    await loadRegionNames(sheets, SPREADSHEET_ID);
    console.log('');

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
