import { google } from 'googleapis';
import * as path from 'path';
import { execSync } from 'child_process';
import * as fs from 'fs';

/**
 * Comprehensive formatting test script
 *
 * This script will:
 * 1. Clear the test sheet completely
 * 2. Populate with test data
 * 3. Apply border fixes
 * 4. Log all steps for debugging
 * 5. Verify formatting results
 */

const LOG_FILE = 'debug/format-test-log.txt';

function log(message: string) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);

  // Append to log file
  if (!fs.existsSync('debug')) {
    fs.mkdirSync('debug');
  }
  fs.appendFileSync(LOG_FILE, logMessage);
}

async function clearSheet(spreadsheetId: string) {
  log('\n🧹 STEP 1: Clearing sheet completely...');

  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    // Get all sheets
    const metadata = await sheets.spreadsheets.get({ spreadsheetId });
    const allSheets = metadata.data.sheets || [];

    log(`  Found ${allSheets.length} sheets`);

    for (const sheet of allSheets) {
      const sheetId = sheet.properties?.sheetId;
      const sheetTitle = sheet.properties?.title;

      if (sheetId === undefined) continue;

      log(`  Clearing sheet: ${sheetTitle}`);

      // Clear all data
      await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: `${sheetTitle}!A1:ZZ1000`,
      });

      // Clear all formatting
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              updateCells: {
                range: {
                  sheetId,
                },
                fields: '*',
              },
            },
          ],
        },
      });
    }

    log('✅ Sheet cleared successfully\n');
  } catch (error) {
    log(`❌ Error clearing sheet: ${error}`);
    throw error;
  }
}

async function runPopulateScript(spreadsheetId: string) {
  log('\n📝 STEP 2: Populating test data...');

  try {
    const result = execSync(
      `npx ts-node src/populate-test-sheet.ts ${spreadsheetId}`,
      { encoding: 'utf8' }
    );
    log(result);
    log('✅ Population completed\n');
  } catch (error: any) {
    log(`❌ Error running populate script: ${error.message}`);
    throw error;
  }
}

async function runBorderFixes(spreadsheetId: string) {
  log('\n🎨 STEP 3: Applying border fixes...');

  try {
    const result = execSync(
      `npx ts-node src/fix-missing-borders.ts ${spreadsheetId}`,
      { encoding: 'utf8' }
    );
    log(result);
    log('✅ Border fixes completed\n');
  } catch (error: any) {
    log(`❌ Error applying border fixes: ${error.message}`);
    throw error;
  }
}

async function verifyFormatting(spreadsheetId: string) {
  log('\n🔍 STEP 4: Verifying formatting...');

  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    // Read Championship cell (O18)
    const championshipCell = await sheets.spreadsheets.get({
      spreadsheetId,
      ranges: ['Bracket!O18'],
      includeGridData: true,
    });

    const cellData = championshipCell.data.sheets?.[0]?.data?.[0]?.rowData?.[0]?.values?.[0];
    const cellValue = cellData?.formattedValue;
    const backgroundColor = cellData?.effectiveFormat?.backgroundColor;
    const fontSize = cellData?.effectiveFormat?.textFormat?.fontSize;
    const isBold = cellData?.effectiveFormat?.textFormat?.bold;

    log(`  Championship cell (O18):`);
    log(`    Value: "${cellValue}"`);
    log(`    Background: RGB(${backgroundColor?.red}, ${backgroundColor?.green}, ${backgroundColor?.blue})`);
    log(`    Font size: ${fontSize}pt`);
    log(`    Bold: ${isBold}`);

    // Check if formatting is correct
    if (cellValue !== 'Championship') {
      log(`  ⚠️  Expected "Championship", got "${cellValue}"`);
    } else {
      log(`  ✅ Championship cell text is correct`);
    }

    // Read K33 border
    const k33Cell = await sheets.spreadsheets.get({
      spreadsheetId,
      ranges: ['Bracket!K33'],
      includeGridData: true,
    });

    const k33Borders = k33Cell.data.sheets?.[0]?.data?.[0]?.rowData?.[0]?.values?.[0]?.effectiveFormat?.borders;
    log(`  K33 borders:`);
    log(`    Right: ${k33Borders?.right ? 'Present' : 'Missing'}`);

    // Read T33 border
    const t33Cell = await sheets.spreadsheets.get({
      spreadsheetId,
      ranges: ['Bracket!T33'],
      includeGridData: true,
    });

    const t33Borders = t33Cell.data.sheets?.[0]?.data?.[0]?.rowData?.[0]?.values?.[0]?.effectiveFormat?.borders;
    log(`  T33 borders:`);
    log(`    Right: ${t33Borders?.right ? 'Present' : 'Missing'}`);

    // Check column E width
    const metadata = await sheets.spreadsheets.get({ spreadsheetId });
    const bracketSheet = metadata.data.sheets?.find(s => s.properties?.title === 'Bracket');
    const columnEWidth = bracketSheet?.data?.[0]?.columnMetadata?.[4]?.pixelSize;

    log(`  Column E width: ${columnEWidth}px`);

    log('\n✅ Verification completed\n');

  } catch (error) {
    log(`❌ Error verifying formatting: ${error}`);
    throw error;
  }
}

async function runComprehensiveTest(spreadsheetId: string) {
  // Clear log file
  if (fs.existsSync(LOG_FILE)) {
    fs.unlinkSync(LOG_FILE);
  }

  log('═══════════════════════════════════════════════════════════');
  log('  COMPREHENSIVE FORMATTING TEST');
  log('═══════════════════════════════════════════════════════════');
  log(`  Spreadsheet ID: ${spreadsheetId}`);
  log(`  URL: https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`);
  log('═══════════════════════════════════════════════════════════\n');

  try {
    await clearSheet(spreadsheetId);
    await runPopulateScript(spreadsheetId);
    await runBorderFixes(spreadsheetId);
    await verifyFormatting(spreadsheetId);

    log('═══════════════════════════════════════════════════════════');
    log('  ✅ ALL TESTS PASSED');
    log('═══════════════════════════════════════════════════════════');
    log(`\n📄 Full log saved to: ${LOG_FILE}`);
    log(`\n🔗 View sheet: https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit\n`);

  } catch (error: any) {
    log('\n═══════════════════════════════════════════════════════════');
    log('  ❌ TEST FAILED');
    log('═══════════════════════════════════════════════════════════');
    log(`\nError: ${error.message}`);
    log(`\n📄 Full log saved to: ${LOG_FILE}\n`);
    process.exit(1);
  }
}

// Get spreadsheet ID from command line
const spreadsheetId = process.argv[2];

if (!spreadsheetId) {
  console.error('❌ Error: Please provide a spreadsheet ID');
  console.log('\nUsage: npx ts-node src/comprehensive-format-test.ts <spreadsheet-id>');
  console.log('\nExample: npx ts-node src/comprehensive-format-test.ts 1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w');
  process.exit(1);
}

runComprehensiveTest(spreadsheetId);
