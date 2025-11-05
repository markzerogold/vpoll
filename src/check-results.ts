import { google } from 'googleapis';
import * as path from 'path';

const SPREADSHEET_ID = '1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o';

async function checkResults() {
  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');

  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    console.log('📊 Reading Results tab...\n');

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Results!A:P',
    });

    const rows = response.data.values || [];

    console.log(`Total rows: ${rows.length}\n`);

    // Group by round
    const byRound: { [round: string]: number } = {};
    const byRegion: { [region: string]: number } = {};

    rows.forEach((row, idx) => {
      const matchId = row[0] || '';
      const round = row[1] || '';
      const region = row[2] || '';
      const winner = row[9] || '';

      if (matchId) {
        byRound[round] = (byRound[round] || 0) + 1;
        byRegion[region] = (byRegion[region] || 0) + 1;
      }

      // Show all rows including empty ones
      if (matchId || idx < 30) {
        console.log(`Row ${String(idx + 1).padStart(2)}: ${matchId.padEnd(20)} | ${round.padEnd(12)} | ${region.padEnd(10)} | ${winner || '(empty)'}`);
      }
    });

    console.log('\n=== SUMMARY ===');
    console.log('\nBy Round:');
    Object.entries(byRound).forEach(([round, count]) => {
      console.log(`  ${round}: ${count} matches`);
    });

    console.log('\nBy Region:');
    Object.entries(byRegion).forEach(([region, count]) => {
      console.log(`  ${region}: ${count} matches`);
    });

    console.log(`\nTotal matches simulated: ${rows.length - 1}`);

  } catch (error) {
    console.error('Error reading results:', error);
    throw error;
  }
}

checkResults()
  .then(() => {
    console.log('\n✅ Results check complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  });
