import { SheetsService } from './services/sheets';

async function readRegions() {
  const sheetsService = new SheetsService();
  const spreadsheetId = '1Le5xZjpKjBykwPGZ54sEFfwDmjPtb59JFQh4sZJ7t6k';

  console.log('Reading Regions tab...\n');

  const regionsData = await sheetsService.readRange(spreadsheetId, 'Regions!A1:E20');

  console.log('Regions Tab Structure:');
  console.log('='.repeat(80));

  regionsData.forEach((row, index) => {
    console.log(`Row ${index + 1}: ${JSON.stringify(row)}`);
  });
}

readRegions().catch(console.error);
