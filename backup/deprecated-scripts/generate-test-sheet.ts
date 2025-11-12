import { google } from 'googleapis';
import * as path from 'path';

/**
 * Generate a test tournament Google Sheet with mock data
 * This creates all 5 tabs (Participants, Config, Regions, Bracket, Results) with sample data
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

// Tournament configuration
const tournamentConfig = [
  ['Setting Name', 'Value'],
  ['--- REQUIRED TOURNAMENT SETTINGS ---', ''],
  ['Tournament Name', 'Star Trek Character Battle 2025'],
  ['Tournament Description', 'Vote for the best character across all Star Trek series!'],
  ['Start Date', '2025-10-25'],
  ['Poll Length', '24'],
  ['Poll Batches', 'full round'],
  ['Discord Channel ID', '1234567890123456789'],
  ['Auto-advance', 'true'],
  ['Tie Breaker Rule', 'Dice roll'],
  ['--- OPTIONAL FEATURES ---', ''],
  ['Results Visibility', 'after voting'],
  ['Required Voter Role', ''],
  ['Match Preview Posts', 'true'],
  ['Live Vote Updates', 'never'],
  ['Auto Round Scheduling', '3 days'],
  ['Advertising Template', '🏆 **{tournament_name}** is starting {start_date}!\n\n{description}\n\n🎯 {participants_count} participants competing across 4 regions\n📊 View live bracket: {bracket_link}\n🗳️ Vote here: {channel_link}\n\nMay the best character win! 🖖'],
  ['Announcements Channel ID', ''],
  ['Celebratory GIF', 'true'],
];

async function generateTestSheet() {
  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');

  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    console.log('Creating new Google Sheet...');

    // Create a new spreadsheet
    const createResponse = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: 'vPoll Test Tournament - Star Trek Character Battle',
        },
        sheets: [
          { properties: { title: 'Participants', gridProperties: { rowCount: 65, columnCount: 4 } } },
          { properties: { title: 'Config', gridProperties: { rowCount: 50, columnCount: 2 } } },
          { properties: { title: 'Regions', gridProperties: { rowCount: 17, columnCount: 5 } } },
          { properties: { title: 'Bracket', gridProperties: { rowCount: 100, columnCount: 20 } } },
          { properties: { title: 'Results', gridProperties: { rowCount: 100, columnCount: 16 } } },
        ],
      },
    });

    const spreadsheetId = createResponse.data.spreadsheetId!;
    console.log(`✅ Created spreadsheet: ${spreadsheetId}`);
    console.log(`🔗 URL: https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`);

    // Prepare data for batch update
    const batchData = [];

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
      range: 'Config!A1:B20',
      values: tournamentConfig,
    });

    // 3. Regions tab
    console.log('Populating Regions tab...');
    const regionsData = [['Rank', 'Federation', 'Klingon Empire', 'Romulan Star Empire', 'Dominion']];

    // Distribute 64 participants across 4 regions (16 each)
    // Ranks 1-4 go to regions 1-4, ranks 5-8 go to regions 1-4, etc.
    for (let i = 0; i < 16; i++) {
      const row: any[] = [i + 1]; // Rank column (1-16 within each region)
      for (let regionIdx = 0; regionIdx < 4; regionIdx++) {
        const participantRank = i * 4 + regionIdx + 1; // Calculate participant rank (1-64)
        const participant = mockParticipants.find(p => p.rank === participantRank);
        row.push(participant ? participant.name : '');
      }
      regionsData.push(row);
    }
    batchData.push({
      range: 'Regions!A1:E17',
      values: regionsData,
    });

    // 4. Bracket tab (placeholder structure)
    console.log('Populating Bracket tab...');
    const bracketData = [
      ['STAR TREK CHARACTER BATTLE 2025', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['Round 1', 'Round 2', 'Sweet 16', 'Elite 8', 'FINAL FOUR', '', 'CHAMPIONSHIP', '', 'FINAL FOUR', 'Elite 8', 'Sweet 16', 'Round 2', 'Round 1'],
      ['', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['FEDERATION REGION', '', '', '', '', '', '', '', '', '', '', '', 'KLINGON EMPIRE REGION'],
      ['', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['Match 1:', '', '', '', '', '', '', '', '', '', '', '', 'Match 1:'],
      ['(1) vs (16)', '', '', '', '', '', '', '', '', '', '', '', '(2) vs (15)'],
      ['', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['NOTE: This is a simplified bracket visualization.', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['Full bracket formulas would be complex and require detailed cell references.', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['For MVP, the bracket display is handled by formulas in the actual template.', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['ROMULAN STAR EMPIRE', '', '', '', '', '', '', '', '', '', '', '', 'DOMINION REGION'],
      ['Match 1:', '', '', '', '', '', '', '', '', '', '', '', 'Match 1:'],
      ['(3) vs (14)', '', '', '', '', '', '', '', '', '', '', '', '(4) vs (13)'],
    ];
    batchData.push({
      range: 'Bracket!A1:T16',
      values: bracketData,
    });

    // 5. Results tab (header only, no results yet)
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
    console.log('Writing all data to spreadsheet...');
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: batchData,
      },
    });

    // Format the spreadsheet
    console.log('Applying formatting...');
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          // Freeze header rows in all tabs
          { updateSheetProperties: { properties: { sheetId: 0, gridProperties: { frozenRowCount: 1 } }, fields: 'gridProperties.frozenRowCount' } },
          { updateSheetProperties: { properties: { sheetId: 1, gridProperties: { frozenRowCount: 1 } }, fields: 'gridProperties.frozenRowCount' } },
          { updateSheetProperties: { properties: { sheetId: 2, gridProperties: { frozenRowCount: 1 } }, fields: 'gridProperties.frozenRowCount' } },
          { updateSheetProperties: { properties: { sheetId: 4, gridProperties: { frozenRowCount: 1 } }, fields: 'gridProperties.frozenRowCount' } },

          // Bold headers in all tabs
          {
            repeatCell: {
              range: { sheetId: 0, startRowIndex: 0, endRowIndex: 1 },
              cell: { userEnteredFormat: { textFormat: { bold: true } } },
              fields: 'userEnteredFormat.textFormat.bold',
            },
          },
          {
            repeatCell: {
              range: { sheetId: 1, startRowIndex: 0, endRowIndex: 1 },
              cell: { userEnteredFormat: { textFormat: { bold: true } } },
              fields: 'userEnteredFormat.textFormat.bold',
            },
          },
          {
            repeatCell: {
              range: { sheetId: 2, startRowIndex: 0, endRowIndex: 1 },
              cell: { userEnteredFormat: { textFormat: { bold: true } } },
              fields: 'userEnteredFormat.textFormat.bold',
            },
          },
          {
            repeatCell: {
              range: { sheetId: 4, startRowIndex: 0, endRowIndex: 1 },
              cell: { userEnteredFormat: { textFormat: { bold: true } } },
              fields: 'userEnteredFormat.textFormat.bold',
            },
          },
        ],
      },
    });

    console.log('\n✅ Test tournament sheet created successfully!');
    console.log(`\n📊 Spreadsheet ID: ${spreadsheetId}`);
    console.log(`🔗 URL: https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`);
    console.log('\n📝 Next steps:');
    console.log('1. Open the sheet and grant "Anyone with the link" → Viewer access');
    console.log('2. Verify the service account has Editor access');
    console.log('3. Update Discord Channel ID in Config tab with a real channel ID');
    console.log('4. Use this sheet to test /tournament create command');

    return spreadsheetId;
  } catch (error) {
    console.error('Error generating test sheet:', error);
    throw error;
  }
}

// Run the generator
generateTestSheet()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  });
