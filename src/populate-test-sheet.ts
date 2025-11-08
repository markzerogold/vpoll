import { google } from 'googleapis';
import * as path from 'path';
import { generateCompleteBracket, BracketCell } from './generate-bracket';

/**
 * Populate an existing Google Sheet with tournament test data
 *
 * Usage:
 * 1. Create a blank Google Sheet
 * 2. Share it with: vpoll-sheets-access@vpoll-475821.iam.gserviceaccount.com (Editor permission)
 * 3. Run: npm run populate-test-sheet <spreadsheet-id>
 *
 * Get spreadsheet ID from the URL:
 * https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
 */

// Mock participant data - 64 Star Trek characters
const mockParticipants = [
  { rank: 1, name: 'Spock (TOS/TAS/Films/SNW)', notes: 'Science Officer, USS Enterprise. Logical and iconic Vulcan.', refLink: 'https://memory-alpha.fandom.com/wiki/Spock' },
  { rank: 2, name: 'Jean-Luc Picard (TNG/Films)', notes: 'Captain, USS Enterprise-D. "Make it so."', refLink: 'https://memory-alpha.fandom.com/wiki/Jean-Luc_Picard' },
  { rank: 3, name: 'Data (TNG/Films)', notes: 'Android officer, USS Enterprise-D. Fully functional.', refLink: 'https://memory-alpha.fandom.com/wiki/Data' },
  { rank: 4, name: 'Worf (TNG/DS9/Films)', notes: 'First Klingon in Starfleet. Honor and glory.', refLink: 'https://memory-alpha.fandom.com/wiki/Worf' },
  { rank: 5, name: 'Kathryn Janeway (VOY)', notes: 'Captain, USS Voyager. Coffee enthusiast.', refLink: 'https://memory-alpha.fandom.com/wiki/Kathryn_Janeway' },
  { rank: 6, name: 'Benjamin Sisko (DS9)', notes: 'Commander/Captain, Deep Space Nine. The Emissary.', refLink: 'https://memory-alpha.fandom.com/wiki/Benjamin_Sisko' },
  { rank: 7, name: 'James T. Kirk (TOS/TAS/Films)', notes: 'Captain, USS Enterprise. Bold and legendary.', refLink: 'https://memory-alpha.fandom.com/wiki/James_T._Kirk' },
  { rank: 8, name: 'Seven of Nine (VOY)', notes: 'Former Borg drone. Tertiary adjunct of Unimatrix 01.', refLink: 'https://memory-alpha.fandom.com/wiki/Seven_of_Nine' },
  { rank: 9, name: 'Miles O\'Brien (TNG/DS9)', notes: 'Chief of Operations, DS9. Best engineer.', refLink: 'https://memory-alpha.fandom.com/wiki/Miles_O\'Brien' },
  { rank: 10, name: 'Kira Nerys (DS9)', notes: 'Major, Bajoran Militia. Freedom fighter.', refLink: 'https://memory-alpha.fandom.com/wiki/Kira_Nerys' },
  { rank: 11, name: 'The Doctor (VOY)', notes: 'Emergency Medical Hologram. Please state the nature of the medical emergency.', refLink: 'https://memory-alpha.fandom.com/wiki/The_Doctor' },
  { rank: 12, name: 'Odo (DS9)', notes: 'Changeling, Chief of Security. Justice above all.', refLink: 'https://memory-alpha.fandom.com/wiki/Odo' },
  { rank: 13, name: 'William Riker (TNG/Films)', notes: 'First Officer, USS Enterprise-D. Number One.', refLink: 'https://memory-alpha.fandom.com/wiki/William_Riker' },
  { rank: 14, name: 'Jadzia Dax (DS9)', notes: 'Trill science officer. 300+ years of experience.', refLink: 'https://memory-alpha.fandom.com/wiki/Jadzia_Dax' },
  { rank: 15, name: 'Leonard McCoy (TOS/TAS/Films)', notes: 'Chief Medical Officer. "I\'m a doctor, not a..."', refLink: 'https://memory-alpha.fandom.com/wiki/Leonard_McCoy' },
  { rank: 16, name: 'Quark (DS9)', notes: 'Ferengi bartender. Rules of Acquisition expert.', refLink: 'https://memory-alpha.fandom.com/wiki/Quark' },
  { rank: 17, name: 'Deanna Troi (TNG/Films)', notes: 'Counselor, USS Enterprise-D. Empath.', refLink: 'https://memory-alpha.fandom.com/wiki/Deanna_Troi' },
  { rank: 18, name: 'Geordi La Forge (TNG/Films)', notes: 'Chief Engineer, USS Enterprise-D. VISOR user.', refLink: 'https://memory-alpha.fandom.com/wiki/Geordi_La_Forge' },
  { rank: 19, name: 'Chakotay (VOY)', notes: 'First Officer, USS Voyager. Former Maquis.', refLink: 'https://memory-alpha.fandom.com/wiki/Chakotay' },
  { rank: 20, name: 'B\'Elanna Torres (VOY)', notes: 'Chief Engineer, USS Voyager. Half-Klingon.', refLink: 'https://memory-alpha.fandom.com/wiki/B\'Elanna_Torres' },
  { rank: 21, name: 'Julian Bashir (DS9)', notes: 'Chief Medical Officer, DS9. Genetically enhanced.', refLink: 'https://memory-alpha.fandom.com/wiki/Julian_Bashir' },
  { rank: 22, name: 'Tuvok (VOY)', notes: 'Tactical/Security Officer, USS Voyager. Vulcan logic.', refLink: 'https://memory-alpha.fandom.com/wiki/Tuvok' },
  { rank: 23, name: 'Beverly Crusher (TNG/Films)', notes: 'Chief Medical Officer, USS Enterprise-D.', refLink: 'https://memory-alpha.fandom.com/wiki/Beverly_Crusher' },
  { rank: 24, name: 'Ezri Dax (DS9)', notes: 'Trill counselor. Ninth host of the Dax symbiont.', refLink: 'https://memory-alpha.fandom.com/wiki/Ezri_Dax' },
  { rank: 25, name: 'Tom Paris (VOY)', notes: 'Helmsman, USS Voyager. Former convict.', refLink: 'https://memory-alpha.fandom.com/wiki/Tom_Paris' },
  { rank: 26, name: 'Nyota Uhura (TOS/TAS/Films)', notes: 'Communications Officer, USS Enterprise.', refLink: 'https://memory-alpha.fandom.com/wiki/Nyota_Uhura' },
  { rank: 27, name: 'Montgomery Scott (TOS/TAS/Films)', notes: 'Chief Engineer, USS Enterprise. Miracle worker.', refLink: 'https://memory-alpha.fandom.com/wiki/Montgomery_Scott' },
  { rank: 28, name: 'Garak (DS9)', notes: 'Cardassian tailor. Just a simple tailor.', refLink: 'https://memory-alpha.fandom.com/wiki/Elim_Garak' },
  { rank: 29, name: 'Nog (DS9)', notes: 'First Ferengi in Starfleet. Overcame adversity.', refLink: 'https://memory-alpha.fandom.com/wiki/Nog' },
  { rank: 30, name: 'Neelix (VOY)', notes: 'Morale officer and cook, USS Voyager.', refLink: 'https://memory-alpha.fandom.com/wiki/Neelix' },
  { rank: 31, name: 'Kes (VOY)', notes: 'Ocampa medical assistant. Telepathic abilities.', refLink: 'https://memory-alpha.fandom.com/wiki/Kes' },
  { rank: 32, name: 'Guinan (TNG)', notes: 'El-Aurian bartender, Ten Forward. Wise listener.', refLink: 'https://memory-alpha.fandom.com/wiki/Guinan' },
  { rank: 33, name: 'Q (TNG/DS9/VOY)', notes: 'Omnipotent being from the Q Continuum.', refLink: 'https://memory-alpha.fandom.com/wiki/Q' },
  { rank: 34, name: 'Tasha Yar (TNG)', notes: 'Chief Security Officer, USS Enterprise-D.', refLink: 'https://memory-alpha.fandom.com/wiki/Tasha_Yar' },
  { rank: 35, name: 'Wesley Crusher (TNG)', notes: 'Acting Ensign, USS Enterprise-D. Prodigy.', refLink: 'https://memory-alpha.fandom.com/wiki/Wesley_Crusher' },
  { rank: 36, name: 'Lwaxana Troi (TNG/DS9)', notes: 'Betazoid ambassador. Daughter of the Fifth House.', refLink: 'https://memory-alpha.fandom.com/wiki/Lwaxana_Troi' },
  { rank: 37, name: 'Ro Laren (TNG)', notes: 'Bajoran officer, USS Enterprise-D.', refLink: 'https://memory-alpha.fandom.com/wiki/Ro_Laren' },
  { rank: 38, name: 'Keiko O\'Brien (TNG/DS9)', notes: 'Botanist and teacher. Miles\' wife.', refLink: 'https://memory-alpha.fandom.com/wiki/Keiko_O\'Brien' },
  { rank: 39, name: 'Alexander Rozhenko (TNG/DS9)', notes: 'Worf\'s son. Half-Klingon, half-human.', refLink: 'https://memory-alpha.fandom.com/wiki/Alexander_Rozhenko' },
  { rank: 40, name: 'Reginald Barclay (TNG/VOY)', notes: 'Systems engineer. Overcame social anxiety.', refLink: 'https://memory-alpha.fandom.com/wiki/Reginald_Barclay' },
  { rank: 41, name: 'Harry Kim (VOY)', notes: 'Operations Officer, USS Voyager. Forever ensign.', refLink: 'https://memory-alpha.fandom.com/wiki/Harry_Kim' },
  { rank: 42, name: 'Rom (DS9)', notes: 'Ferengi engineer. Brother of Quark.', refLink: 'https://memory-alpha.fandom.com/wiki/Rom' },
  { rank: 43, name: 'Leeta (DS9)', notes: 'Dabo girl on Deep Space Nine.', refLink: 'https://memory-alpha.fandom.com/wiki/Leeta' },
  { rank: 44, name: 'Vic Fontaine (DS9)', notes: 'Holographic lounge singer. Counselor to many.', refLink: 'https://memory-alpha.fandom.com/wiki/Vic_Fontaine' },
  { rank: 45, name: 'Martok (DS9)', notes: 'Klingon General. Chancellor of the Empire.', refLink: 'https://memory-alpha.fandom.com/wiki/Martok' },
  { rank: 46, name: 'Gowron (TNG/DS9)', notes: 'Klingon Chancellor. Distinctive eyes.', refLink: 'https://memory-alpha.fandom.com/wiki/Gowron' },
  { rank: 47, name: 'Kai Winn (DS9)', notes: 'Bajoran religious leader. Complex morality.', refLink: 'https://memory-alpha.fandom.com/wiki/Winn_Adami' },
  { rank: 48, name: 'Dukat (DS9)', notes: 'Cardassian Gul. Complex antagonist.', refLink: 'https://memory-alpha.fandom.com/wiki/Dukat' },
  { rank: 49, name: 'Khan Noonien Singh (TOS/Films)', notes: 'Genetically enhanced superhuman. "KHAAAAAN!"', refLink: 'https://memory-alpha.fandom.com/wiki/Khan_Noonien_Singh' },
  { rank: 50, name: 'Sarek (TOS/TNG/Films)', notes: 'Spock\'s father. Vulcan ambassador.', refLink: 'https://memory-alpha.fandom.com/wiki/Sarek' },
  { rank: 51, name: 'Amanda Grayson (TOS/Films)', notes: 'Spock\'s human mother.', refLink: 'https://memory-alpha.fandom.com/wiki/Amanda_Grayson' },
  { rank: 52, name: 'Christopher Pike (TOS/SNW)', notes: 'Captain, USS Enterprise. Picard\'s predecessor.', refLink: 'https://memory-alpha.fandom.com/wiki/Christopher_Pike' },
  { rank: 53, name: 'Number One (TOS/SNW)', notes: 'First Officer, USS Enterprise. Una Chin-Riley.', refLink: 'https://memory-alpha.fandom.com/wiki/Number_One' },
  { rank: 54, name: 'Christine Chapel (TOS/SNW)', notes: 'Nurse, USS Enterprise. Unrequited love for Spock.', refLink: 'https://memory-alpha.fandom.com/wiki/Christine_Chapel' },
  { rank: 55, name: 'Sulu (TOS/Films)', notes: 'Helmsman, USS Enterprise. Oh my!', refLink: 'https://memory-alpha.fandom.com/wiki/Hikaru_Sulu' },
  { rank: 56, name: 'Chekov (TOS/Films)', notes: 'Navigator, USS Enterprise. Russian pride.', refLink: 'https://memory-alpha.fandom.com/wiki/Pavel_Chekov' },
  { rank: 57, name: 'Nurse Ogawa (TNG)', notes: 'Head nurse, USS Enterprise-D.', refLink: 'https://memory-alpha.fandom.com/wiki/Alyssa_Ogawa' },
  { rank: 58, name: 'Mot (TNG)', notes: 'Bolian barber, USS Enterprise-D.', refLink: 'https://memory-alpha.fandom.com/wiki/Mot' },
  { rank: 59, name: 'Morn (DS9)', notes: 'Lurian bar patron. Surprisingly chatty off-screen.', refLink: 'https://memory-alpha.fandom.com/wiki/Morn' },
  { rank: 60, name: 'Naomi Wildman (VOY)', notes: 'First child born on USS Voyager.', refLink: 'https://memory-alpha.fandom.com/wiki/Naomi_Wildman' },
  { rank: 61, name: 'Icheb (VOY)', notes: 'Former Borg drone rescued by Voyager.', refLink: 'https://memory-alpha.fandom.com/wiki/Icheb' },
  { rank: 62, name: 'Seska (VOY)', notes: 'Cardassian spy posing as Bajoran.', refLink: 'https://memory-alpha.fandom.com/wiki/Seska' },
  { rank: 63, name: 'Lon Suder (VOY)', notes: 'Betazoid engineer with violent past.', refLink: 'https://memory-alpha.fandom.com/wiki/Lon_Suder' },
  { rank: 64, name: 'Tuvix (VOY)', notes: 'Transporter accident fusion of Tuvok and Neelix.', refLink: 'https://memory-alpha.fandom.com/wiki/Tuvix' },
];

// Tournament configuration with descriptions
const tournamentConfig = [
  ['Setting Name', 'Value', 'Valid Options / Description'],
  ['--- REQUIRED TOURNAMENT SETTINGS ---', '', ''],
  ['Tournament Name', 'Star Trek Character Battle 2025', 'Any text - Display name for the tournament'],
  ['Tournament Description', 'Vote for the best character across all Star Trek series!', 'Any text - Brief description shown in announcements'],
  ['Start Date', '2025-10-25', 'Date in YYYY-MM-DD format (display only, not enforced)'],
  ['Poll Length', '24', 'Number of hours (positive integer). Examples: 24, 48, 72'],
  ['Poll Batches', 'full round', '"full round" | "one per region" | "two per region" | "half round" | "sequential" | number (e.g., "6")'],
  ['Discord Channel ID', '1234567890123456789', 'Channel ID from Discord (right-click channel → Copy Channel ID). Bot must have access.'],
  ['Auto-advance', 'true', 'true | false - Automatically start next round after current completes'],
  ['Tie Breaker Rule', 'Dice roll', '"Dice roll" - Automatic dice roll (1-100) for tied matches'],
  ['--- OPTIONAL FEATURES ---', '', ''],
  ['Auto Round Scheduling', '3 days', 'blank (disabled) | "immediate" | "X days" | "X hours" - Delay before auto-starting next round'],
  ['Celebratory GIF', 'true', 'true | false - Include random GIF in winner announcement'],
];

async function populateSheet(spreadsheetId: string) {
  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');

  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    console.log(`Populating spreadsheet: ${spreadsheetId}\n`);

    // First, create/rename tabs to match our structure
    console.log('Setting up tabs...');
    let metadata = await sheets.spreadsheets.get({ spreadsheetId });
    const existingSheets = metadata.data.sheets || [];

    const requiredTabs = ['Bracket', 'Results', 'Participants', 'Regions', 'Config', 'Instructions'];
    const requests: any[] = [];

    // Check which tabs already exist by name
    const existingTabNames = new Set(existingSheets.map(s => s.properties?.title));

    // Rename or create tabs
    requiredTabs.forEach((tabName, index) => {
      if (existingSheets[index]) {
        const currentName = existingSheets[index].properties?.title;
        // Only rename if the name is different
        if (currentName !== tabName) {
          requests.push({
            updateSheetProperties: {
              properties: {
                sheetId: existingSheets[index].properties?.sheetId,
                title: tabName,
              },
              fields: 'title',
            },
          });
        }
      } else {
        // Create new tab only if it doesn't already exist
        if (!existingTabNames.has(tabName)) {
          requests.push({
            addSheet: {
              properties: {
                title: tabName,
              },
            },
          });
        }
      }
    });

    if (requests.length > 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests },
      });
      console.log('✅ Tabs created/renamed\n');
    }

    // Re-fetch metadata to get updated sheet IDs
    metadata = await sheets.spreadsheets.get({ spreadsheetId });
    const allSheets = metadata.data.sheets || [];

    // Create a map of tab names to sheet IDs
    const sheetIdMap: { [key: string]: number } = {};
    allSheets.forEach(sheet => {
      const title = sheet.properties?.title || '';
      const sheetId = sheet.properties?.sheetId || 0;
      sheetIdMap[title] = sheetId;
    });

    // Expand Bracket tab grid to accommodate all columns (need up to column AE = 31 columns)
    console.log('Expanding Bracket tab grid dimensions...');
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            updateSheetProperties: {
              properties: {
                sheetId: sheetIdMap['Bracket'],
                gridProperties: {
                  rowCount: 100,
                  columnCount: 35, // A-Z = 26, need up to AE = 31, add buffer = 35
                },
              },
              fields: 'gridProperties(rowCount,columnCount)',
            },
          },
        ],
      },
    });
    console.log('✅ Bracket tab expanded to 100 rows × 35 columns\n');

    // Prepare data for batch update
    const batchData = [];

    // 0. Instructions tab
    console.log('Populating Instructions tab...');
    const instructionsData = [
      ['🏆 VPOLL TOURNAMENT SETUP GUIDE 🏆'],
      [''],
      ['QUICK START CHECKLIST'],
      ['☐ 1. Fill in Participants tab (64 participants with ranks, names, notes, links)'],
      ['☐ 2. Configure tournament settings in Config tab'],
      ['☐ 3. Customize region names in Regions tab (Row 2)'],
      ['☐ 4. Share this sheet with service account (see below)'],
      ['☐ 5. Run /tournament create <sheet-url> in Discord'],
      ['☐ 6. Run /tournament start when ready to begin'],
      [''],
      ['📋 ORDER OF OPERATIONS'],
      [''],
      ['Phase 1: Setup (Google Sheets)'],
      ['  1. Fill Participants tab - All 64 participants with unique ranks 1-64'],
      ['  2. Fill Config tab - Required: Tournament Name, Poll Length, Discord Channel ID'],
      ['  3. Customize Regions tab - Edit region names in Row 2 (e.g., ALPHA, BETA, GAMMA, DELTA)'],
      ['  4. Share sheet - Give EDITOR permission to: vpoll-sheets-access@vpoll-475821.iam.gserviceaccount.com'],
      [''],
      ['Phase 2: Create Tournament (Discord)'],
      ['  5. Run: /tournament create <your-sheet-url>'],
      ['  6. vPoll validates sheet and confirms tournament is ready'],
      [''],
      ['Phase 3: Start Tournament (Discord)'],
      ['  7. Run: /tournament start'],
      ['  8. vPoll creates first round polls based on Poll Batches setting'],
      ['  9. Users vote using Discord native polls'],
      [''],
      ['Phase 4: Tournament Runs Automatically'],
      ['  10. Polls close after Poll Length hours'],
      ['  11. vPoll writes results to Results tab and updates Bracket'],
      ['  12. Next round starts automatically (if Auto Round Scheduling enabled) or manually with /tournament next-round'],
      ['  13. Repeat until champion is crowned after 6 rounds'],
      [''],
      ['🤖 VPOLL COMMANDS'],
      [''],
      ['Setup Commands:'],
      ['  /tournament template - Get link to this master template'],
      ['  /tournament create <sheet-url> - Validate sheet and create tournament'],
      [''],
      ['Tournament Control:'],
      ['  /tournament start - Begin Round 1 (creates first polls)'],
      ['  /tournament next-round - Manually advance to next round (if auto-advance disabled)'],
      ['  /tournament pause - Pause tournament (stops auto-advancement)'],
      ['  /tournament resume - Resume paused tournament'],
      ['  /tournament cancel - Cancel tournament (requires confirmation)'],
      [''],
      ['Information Commands:'],
      ['  /tournament status - View current tournament state and active polls'],
      ['  /tournament bracket - Get link to live Google Sheets bracket'],
      ['  /tournament results - View recent match results'],
      ['  /participant info <name> - Look up participant notes and reference link'],
      [''],
      ['⚙️ KEY CONFIG SETTINGS'],
      [''],
      ['Poll Length - How long each poll stays open (e.g., "24 hours", "48 hours")'],
      ['Poll Batches - How many polls to create at once:'],
      ['  • "full round" - All matches in round (32 polls in R1)'],
      ['  • "one per region" - 1 match per region (4 polls)'],
      ['  • "sequential" - 1 poll at a time'],
      [''],
      ['Auto-advance - Automatically start next round when previous completes (true/false)'],
      ['Auto Round Scheduling - Delay before auto-starting next round ("immediate", "3 days", blank = disabled)'],
      ['Tie Breaker - How to resolve tied polls ("Dice roll", "Higher seed wins", "Revote")'],
      [''],
      ['🔧 TROUBLESHOOTING'],
      [''],
      ['Error: "Cannot access sheet"'],
      ['  → Share sheet with service account (vpoll-sheets-access@...) with EDITOR permission'],
      [''],
      ['Error: "Missing required tab"'],
      ['  → Check all 6 tabs exist: Instructions, Bracket, Participants, Regions, Config, Results'],
      [''],
      ['Error: "Participants tab has duplicate ranks"'],
      ['  → Ensure Column A has unique ranks 1-64 (no duplicates, no gaps)'],
      [''],
      ['Error: "Discord Channel ID is invalid"'],
      ['  → Right-click channel in Discord → Copy Channel ID, paste in Config tab'],
      ['  → Ensure vPoll bot has access to that channel'],
      [''],
      ['Polls not appearing in Discord'],
      ['  → Check Discord Channel ID in Config tab matches your intended channel'],
      ['  → Verify bot has "Send Messages" and "Create Polls" permissions'],
      [''],
      ['📚 DOCUMENTATION'],
      [''],
      ['Full documentation: github.com/yourrepo/vpoll/blob/main/REQUIREMENTS.md'],
      ['Test sheet guide: github.com/yourrepo/vpoll/blob/main/TEST_SHEET_GENERATION.md'],
      [''],
      ['🔗 SERVICE ACCOUNT'],
      [''],
      ['Email: vpoll-sheets-access@vpoll-475821.iam.gserviceaccount.com'],
      ['Permission: Editor (REQUIRED - Viewer will not work)'],
      ['Why: vPoll needs to write match results to Results tab and update Bracket formulas'],
      [''],
      ['💡 TIPS'],
      [''],
      ['• You can reorder tabs - vPoll finds them by name, not position'],
      ['• Bracket tab should be first for easy viewing by tournament participants'],
      ['• Use Notes column (C) in Participants to add context for voters'],
      ['• Use Reference Link column (D) for character images or wiki pages'],
      ['• Test with a small Discord channel first before announcing publicly'],
      ['• Make sheet publicly viewable ("Anyone with link → Viewer") so participants can follow along'],
      [''],
      ['✨ Ready to start? Fill in Participants, Config, and Regions tabs, then run /tournament create!'],
    ];
    batchData.push({
      range: 'Instructions!A1:A110',
      values: instructionsData.map(row => [row[0]]), // Single column
    });

    // 1. Participants tab
    console.log('Populating Participants tab...');
    const participantsData = [
      ['Rank', 'Participant Name', 'Notes', 'Reference Link'],
      ...mockParticipants.map(p => [p.rank, p.name, p.notes, p.refLink]),
    ];
    batchData.push({
      range: 'Participants!A1:D65',
      values: participantsData,
    });

    // 2. Config tab
    console.log('Populating Config tab...');
    batchData.push({
      range: 'Config!A1:C20',
      values: tournamentConfig,
    });

    // 3. Regions tab
    console.log('Populating Regions tab...');
    const regionsData = [
      // Row 1: Generic headers including "Seed"
      ['Seed', 'Region 1', 'Region 2', 'Region 3', 'Region 4'],
      // Row 2: "Seed" label + Customizable region names
      ['Seed', 'Federation', 'Klingon Empire', 'Romulan Star Empire', 'Dominion'],
    ];

    // Seed order for tournament bracket (ALWAYS FIXED)
    // Creates matchups: 1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15
    const seedOrder = [1, 16, 8, 9, 5, 12, 4, 13, 6, 11, 3, 14, 7, 10, 2, 15];

    // Distribute 64 participants across 4 regions (16 each)
    // Participant ranks 1-4 go to first seed position across regions
    // Participant ranks 5-8 go to their respective seed positions
    for (let i = 0; i < 16; i++) {
      const seed = seedOrder[i];
      const row: any[] = [seed]; // Column A: Seed number

      // For each region, add the appropriate participant
      for (let regionIdx = 0; regionIdx < 4; regionIdx++) {
        // Calculate which participant rank goes in this region's seed position
        // Region 1 (idx 0): ranks 1, 5, 9, 13, 17, 21, 25, 29, 33, 37, 41, 45, 49, 53, 57, 61
        // Region 2 (idx 1): ranks 2, 6, 10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62
        // Region 3 (idx 2): ranks 3, 7, 11, 15, 19, 23, 27, 31, 35, 39, 43, 47, 51, 55, 59, 63
        // Region 4 (idx 3): ranks 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64

        // Find which rank should be at this seed position for this region
        // The pattern: rank = (seed_position * 4) + region_offset + 1
        // But we need to map seed to seed position (0-15)
        const seedPosition = i; // Position in seedOrder array
        const participantRank = (seedPosition * 4) + regionIdx + 1;

        const participant = mockParticipants.find(p => p.rank === participantRank);
        row.push(participant ? participant.name : '');
      }
      regionsData.push(row);
    }
    batchData.push({
      range: 'Regions!A1:E18',
      values: regionsData,
    });

    // 4. Bracket tab - Generate full formula-driven bracket
    console.log('Populating Bracket tab...');
    // We'll populate the bracket in a separate step after initial data
    // to ensure proper formula references
    // For now, just add a placeholder note
    const bracketData = [
      ['Bracket formulas will be added in next step...'],
    ];
    batchData.push({
      range: 'Bracket!A1',
      values: bracketData,
    });

    // 5. Results tab
    console.log('Populating Results tab...');
    const resultsData = [
      [
        'Match ID',
        'Round',
        'Region',
        'Participant 1 Name',
        'Participant 1 Seed',
        'Participant 1 Votes',
        'Participant 2 Name',
        'Participant 2 Seed',
        'Participant 2 Votes',
        'Winner',
        'Discord Poll ID',
        'Poll Start Time',
        'Poll End Time',
        'Total Votes',
        'Tiebreaker',
        'Notes',
      ],
    ];
    batchData.push({
      range: 'Results!A1:P1',
      values: resultsData,
    });

    // Execute batch update
    console.log('\nWriting all data...');
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: batchData,
      },
    });

    // ========================================================================
    // STEP 1.5: MERGE HEADER CELLS (MUST BE DONE BEFORE BORDERS)
    // ========================================================================
    console.log('Merging header cells...');

    const bracketSheetId = 0; // Bracket is always the first sheet
    const merges = [
      // Left side headers
      { startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 2 }, // A1:B1 Round 1
      { startRowIndex: 0, endRowIndex: 1, startColumnIndex: 3, endColumnIndex: 5 }, // D1:E1 Round 2
      { startRowIndex: 0, endRowIndex: 1, startColumnIndex: 6, endColumnIndex: 8 }, // G1:H1 Sweet 16
      { startRowIndex: 0, endRowIndex: 1, startColumnIndex: 9, endColumnIndex: 11 }, // J1:K1 Elite 8
      { startRowIndex: 0, endRowIndex: 1, startColumnIndex: 12, endColumnIndex: 14 }, // M1:N1 Final 4
      { startRowIndex: 0, endRowIndex: 1, startColumnIndex: 15, endColumnIndex: 19 }, // P1:S1 Championship
      // Right side headers
      { startRowIndex: 0, endRowIndex: 1, startColumnIndex: 20, endColumnIndex: 22 }, // U1:V1 Elite 8
      { startRowIndex: 0, endRowIndex: 1, startColumnIndex: 23, endColumnIndex: 25 }, // X1:Y1 Sweet 16
      { startRowIndex: 0, endRowIndex: 1, startColumnIndex: 26, endColumnIndex: 28 }, // AA1:AB1 Round 2
      { startRowIndex: 0, endRowIndex: 1, startColumnIndex: 29, endColumnIndex: 31 }, // AD1:AE1 Round 1
    ];

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: merges.map(merge => ({
          mergeCells: {
            range: {
              sheetId: bracketSheetId,
              ...merge,
            },
            mergeType: 'MERGE_ALL',
          },
        })),
      },
    });

    console.log(`  ✓ Merged ${merges.length} header ranges`);

    // ========================================================================
    // STEP 1.6: FORMAT REGION NAMES (BACKGROUND COLOR, FONT SIZE, BOLD)
    // ========================================================================
    console.log('Formatting region names...');

    const regionNameFormats = [
      // Federation (E15) - Light blue background
      { row: 14, col: 4, color: { red: 0.8117647, green: 0.8862745, blue: 0.9529412 } },
      // Klingon Empire (E31) - Light blue background
      { row: 30, col: 4, color: { red: 0.8117647, green: 0.8862745, blue: 0.9529412 } },
      // Romulan Star Empire (Y15) - Light green background
      { row: 14, col: 24, color: { red: 0.8509804, green: 0.91764706, blue: 0.827451 } },
      // Dominion (Y31) - Light green background
      { row: 30, col: 24, color: { red: 0.8509804, green: 0.91764706, blue: 0.827451 } },
    ];

    const regionFormatRequests = regionNameFormats.map(({ row, col, color }) => ({
      repeatCell: {
        range: {
          sheetId: bracketSheetId,
          startRowIndex: row,
          endRowIndex: row + 1,
          startColumnIndex: col,
          endColumnIndex: col + 1,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: color,
            textFormat: {
              fontSize: 24,
              bold: true,
              foregroundColor: { red: 0, green: 0, blue: 0 }, // Black text
            },
            horizontalAlignment: 'CENTER',
            verticalAlignment: 'MIDDLE',
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
      },
    }));

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: regionFormatRequests,
      },
    });

    console.log(`  ✓ Formatted ${regionNameFormats.length} region name cells`);

    // ========================================================================
    // STEP 2: GENERATE AND WRITE BRACKET FORMULAS + CHECKBOX VALUES
    // ========================================================================
    console.log('Generating bracket formulas...');
    const bracketCells = generateCompleteBracket();

    // Group cells by type for batch operations
    const formulaCells: any[] = [];
    const valueCells: any[] = [];
    const checkboxCells: any[] = [];

    bracketCells.forEach(cell => {
      const cellAddress = `Bracket!${cell.col}${cell.row}`;

      if (cell.isCheckbox) {
        // Checkbox cells need both value AND validation
        checkboxCells.push({
          range: cellAddress,
          value: cell.value ?? false
        });
      } else if (cell.formula) {
        formulaCells.push({
          range: cellAddress,
          values: [[cell.formula]]
        });
      } else if (cell.value !== undefined) {
        valueCells.push({
          range: cellAddress,
          values: [[cell.value]]
        });
      }
    });

    // FIX: Write checkbox VALUES along with formulas and values
    const checkboxValueUpdates = checkboxCells.map(cell => ({
      range: cell.range,
      values: [[false]] // Initial FALSE value for all checkboxes
    }));

    // Write ALL cell values at once: formulas, values, AND checkbox values
    if (formulaCells.length > 0 || valueCells.length > 0 || checkboxValueUpdates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: 'USER_ENTERED',
          data: [...formulaCells, ...valueCells, ...checkboxValueUpdates],
        },
      });
      console.log(`✅ Wrote ${formulaCells.length} formulas, ${valueCells.length} values, and ${checkboxValueUpdates.length} checkbox values`);
    }

    // ========================================================================
    // STEP 3: ADD CHECKBOX DATA VALIDATION
    // ========================================================================
    if (checkboxCells.length > 0) {
      const checkboxRequests = checkboxCells.map(cell => {
        // Parse cell address like "Bracket!A2" or "Bracket!AB15"
        const match = cell.range.match(/^Bracket!([A-Z]+)(\d+)$/);
        if (!match) {
          console.warn(`Invalid cell address: ${cell.range}`);
          return null;
        }

        const colLetters = match[1];
        const rowNum = parseInt(match[2]);

        // Convert column letters to index (A=0, B=1, ..., AA=26, AB=27)
        let colIndex = 0;
        for (let i = 0; i < colLetters.length; i++) {
          colIndex = colIndex * 26 + (colLetters.charCodeAt(i) - 65 + 1);
        }
        colIndex -= 1; // Make it 0-indexed

        return {
          setDataValidation: {
            range: {
              sheetId: sheetIdMap['Bracket'],
              startRowIndex: rowNum - 1,
              endRowIndex: rowNum,
              startColumnIndex: colIndex,
              endColumnIndex: colIndex + 1,
            },
            rule: {
              condition: {
                type: 'BOOLEAN',
              },
              showCustomUi: true,
            },
          },
        };
      }).filter(req => req !== null);

      if (checkboxRequests.length > 0) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: checkboxRequests,
          },
        });
        console.log(`✅ Added ${checkboxRequests.length} checkbox validations`);
      }
    }

    // Format headers and columns
    console.log('Applying formatting...');
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          // Freeze header row for Participants tab
          {
            updateSheetProperties: {
              properties: {
                sheetId: sheetIdMap['Participants'],
                gridProperties: { frozenRowCount: 1 },
              },
              fields: 'gridProperties.frozenRowCount',
            },
          },
          // Freeze header row for Config tab
          {
            updateSheetProperties: {
              properties: {
                sheetId: sheetIdMap['Config'],
                gridProperties: { frozenRowCount: 1 },
              },
              fields: 'gridProperties.frozenRowCount',
            },
          },
          // Freeze header rows for Regions tab (both generic headers and region names)
          {
            updateSheetProperties: {
              properties: {
                sheetId: sheetIdMap['Regions'],
                gridProperties: { frozenRowCount: 2 },
              },
              fields: 'gridProperties.frozenRowCount',
            },
          },
          // Freeze header row for Results tab
          {
            updateSheetProperties: {
              properties: {
                sheetId: sheetIdMap['Results'],
                gridProperties: { frozenRowCount: 1 },
              },
              fields: 'gridProperties.frozenRowCount',
            },
          },
          // Bold headers for Participants tab
          {
            repeatCell: {
              range: { sheetId: sheetIdMap['Participants'], startRowIndex: 0, endRowIndex: 1 },
              cell: { userEnteredFormat: { textFormat: { bold: true } } },
              fields: 'userEnteredFormat.textFormat.bold',
            },
          },
          // Bold headers for Config tab
          {
            repeatCell: {
              range: { sheetId: sheetIdMap['Config'], startRowIndex: 0, endRowIndex: 1 },
              cell: { userEnteredFormat: { textFormat: { bold: true } } },
              fields: 'userEnteredFormat.textFormat.bold',
            },
          },
          // Bold headers for Regions tab (both rows: generic headers and region names)
          {
            repeatCell: {
              range: { sheetId: sheetIdMap['Regions'], startRowIndex: 0, endRowIndex: 2 },
              cell: { userEnteredFormat: { textFormat: { bold: true } } },
              fields: 'userEnteredFormat.textFormat.bold',
            },
          },
          // Bold headers for Results tab
          {
            repeatCell: {
              range: { sheetId: sheetIdMap['Results'], startRowIndex: 0, endRowIndex: 1 },
              cell: { userEnteredFormat: { textFormat: { bold: true } } },
              fields: 'userEnteredFormat.textFormat.bold',
            },
          },
          // Format Instructions tab - Bold title (row 1)
          {
            repeatCell: {
              range: { sheetId: sheetIdMap['Instructions'], startRowIndex: 0, endRowIndex: 1 },
              cell: { userEnteredFormat: { textFormat: { bold: true, fontSize: 14 } } },
              fields: 'userEnteredFormat.textFormat',
            },
          },
          // Format Instructions tab - Bold section headers
          {
            repeatCell: {
              range: { sheetId: sheetIdMap['Instructions'], startRowIndex: 2, endRowIndex: 3 },
              cell: { userEnteredFormat: { textFormat: { bold: true, fontSize: 12 } } },
              fields: 'userEnteredFormat.textFormat',
            },
          },
          {
            repeatCell: {
              range: { sheetId: sheetIdMap['Instructions'], startRowIndex: 10, endRowIndex: 11 },
              cell: { userEnteredFormat: { textFormat: { bold: true, fontSize: 12 } } },
              fields: 'userEnteredFormat.textFormat',
            },
          },
          {
            repeatCell: {
              range: { sheetId: sheetIdMap['Instructions'], startRowIndex: 33, endRowIndex: 34 },
              cell: { userEnteredFormat: { textFormat: { bold: true, fontSize: 12 } } },
              fields: 'userEnteredFormat.textFormat',
            },
          },
          {
            repeatCell: {
              range: { sheetId: sheetIdMap['Instructions'], startRowIndex: 48, endRowIndex: 49 },
              cell: { userEnteredFormat: { textFormat: { bold: true, fontSize: 12 } } },
              fields: 'userEnteredFormat.textFormat',
            },
          },
          {
            repeatCell: {
              range: { sheetId: sheetIdMap['Instructions'], startRowIndex: 68, endRowIndex: 69 },
              cell: { userEnteredFormat: { textFormat: { bold: true, fontSize: 12 } } },
              fields: 'userEnteredFormat.textFormat',
            },
          },
          {
            repeatCell: {
              range: { sheetId: sheetIdMap['Instructions'], startRowIndex: 74, endRowIndex: 75 },
              cell: { userEnteredFormat: { textFormat: { bold: true, fontSize: 12 } } },
              fields: 'userEnteredFormat.textFormat',
            },
          },
          {
            repeatCell: {
              range: { sheetId: sheetIdMap['Instructions'], startRowIndex: 79, endRowIndex: 80 },
              cell: { userEnteredFormat: { textFormat: { bold: true, fontSize: 12 } } },
              fields: 'userEnteredFormat.textFormat',
            },
          },
          // Auto-resize Instructions tab column
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: sheetIdMap['Instructions'],
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 1,
              },
            },
          },
          // Auto-resize Config tab columns for better readability
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: sheetIdMap['Config'],
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 3,
              },
            },
          },
          // Auto-resize Participants tab columns
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: sheetIdMap['Participants'],
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 4,
              },
            },
          },
          // Auto-resize Results tab columns
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: sheetIdMap['Results'],
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 16,
              },
            },
          },
          // Auto-resize Regions tab columns
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: sheetIdMap['Regions'],
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 5,
              },
            },
          },
          // Auto-resize Bracket tab columns
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: sheetIdMap['Bracket'],
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 13,
              },
            },
          },
        ],
      },
    });

    console.log('\n✅ Test tournament sheet populated successfully!');
    console.log(`\n🔗 URL: https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`);
    console.log('\n📝 Next steps:');
    console.log('1. Open the sheet and verify all tabs are populated');
    console.log('2. Grant "Anyone with the link" → Viewer access for public viewing');
    console.log('3. Update Discord Channel ID in Config tab with a real channel ID');
    console.log('4. Use this sheet to test /tournament create command');

  } catch (error) {
    console.error('Error populating sheet:', error);
    throw error;
  }
}

// Get spreadsheet ID from command line argument
const spreadsheetId = process.argv[2];

if (!spreadsheetId) {
  console.error('❌ Error: Please provide a spreadsheet ID');
  console.log('\nUsage: npm run populate-test-sheet <spreadsheet-id>');
  console.log('\nSteps:');
  console.log('1. Create a blank Google Sheet');
  console.log('2. Share it with: vpoll-sheets-access@vpoll-475821.iam.gserviceaccount.com (Editor)');
  console.log('3. Copy the spreadsheet ID from the URL');
  console.log('4. Run: npm run populate-test-sheet <spreadsheet-id>');
  process.exit(1);
}

// Run the populator
populateSheet(spreadsheetId)
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error.message);
    process.exit(1);
  });
