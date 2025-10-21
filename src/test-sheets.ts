import { SheetsService } from './services/sheets';

/**
 * Test script to read the vPoll tournament template
 * Run with: npm run test-sheets
 */
async function testSheets() {
  console.log('Testing Google Sheets API connection...\n');

  const sheetsService = new SheetsService();

  // Your template spreadsheet ID (from the URL)
  const TEMPLATE_SPREADSHEET_ID = '1Z83Lr02EW9wvpH3YfBvLwafHMIqyxJLXaO_0D85bMfk';

  try {
    // Test 1: Get spreadsheet metadata
    console.log('📋 Fetching spreadsheet metadata...');
    const metadata = await sheetsService.getSpreadsheetMetadata(TEMPLATE_SPREADSHEET_ID);
    console.log(`   Title: ${metadata.properties?.title}`);
    console.log(`   Tabs: ${metadata.sheets?.map((s) => s.properties?.title).join(', ')}\n`);

    // Test 2: Read Rank tab
    console.log('📊 Reading Rank tab (A1:B65)...');
    const rankData = await sheetsService.readRange(TEMPLATE_SPREADSHEET_ID, 'Rank!A1:B65');
    console.log(`   Rows read: ${rankData.length}`);
    console.log(`   Header: ${rankData[0]?.join(' | ')}`);
    console.log(`   First participant: ${rankData[1]?.join(' | ')}`);
    console.log(`   Last participant: ${rankData[rankData.length - 1]?.join(' | ')}\n`);

    // Test 3: Read Teams tab
    console.log('🏆 Reading Teams tab (A1:E17)...');
    const teamsData = await sheetsService.readRange(TEMPLATE_SPREADSHEET_ID, 'Teams!A1:E17');
    console.log(`   Rows read: ${teamsData.length}`);
    console.log(`   Header: ${teamsData[0]?.join(' | ')}`);
    console.log(`   Region names: ${teamsData[0]?.slice(1).join(', ')}\n`);

    // Test 4: Read Config tab
    console.log('⚙️  Reading Config tab...');
    const configData = await sheetsService.readRange(TEMPLATE_SPREADSHEET_ID, 'Config!A1:B10');
    console.log(`   Settings found: ${configData.length}`);
    configData.forEach((row) => {
      if (row.length >= 2) {
        console.log(`   ${row[0]}: ${row[1]}`);
      }
    });

    console.log('\n✅ All tests passed! Google Sheets API is working correctly.');
  } catch (error) {
    console.error('\n❌ Error testing Google Sheets API:');
    console.error(error);
    process.exit(1);
  }
}

testSheets();
