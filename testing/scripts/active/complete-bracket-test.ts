import { google } from 'googleapis';
import * as path from 'path';
import { execSync } from 'child_process';
import * as fs from 'fs';

/**
 * COMPLETE BRACKET FORMATTING TEST
 *
 * This script performs ALL necessary steps to generate a fully formatted bracket:
 * 1. Clear sheet completely
 * 2. Populate test data (data + basic formatting)
 * 3. Apply comprehensive bracket borders (from example sheet)
 * 4. Freeze and bold Bracket row 1
 * 5. Update Championship cell with formula
 * 6. Verify all formatting
 *
 * Order matters! Steps must run in this exact sequence.
 */

const LOG_FILE = 'debug/complete-bracket-test-log.txt';

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

  const keyPath = path.join(__dirname, '../../../keys/vpoll-key.json');
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

async function runScript(scriptName: string, args: string = '') {
  log(`\n📝 Running ${scriptName}...`);

  try {
    const result = execSync(
      `npx ts-node testing/scripts/active/${scriptName} ${args}`,
      { encoding: 'utf8' }
    );
    log(result);
    log(`✅ ${scriptName} completed\n`);
  } catch (error: any) {
    log(`❌ Error running ${scriptName}: ${error.message}`);
    throw error;
  }
}

async function freezeAndBoldBracketRow1(spreadsheetId: string) {
  log('\n❄️  STEP 4: Freezing and bolding Bracket row 1...');

  const keyPath = path.join(__dirname, '../../../keys/vpoll-key.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    // Get Bracket sheet ID
    const metadata = await sheets.spreadsheets.get({ spreadsheetId });
    const bracketSheet = metadata.data.sheets?.find(
      (s: any) => s.properties?.title === 'Bracket'
    );

    if (!bracketSheet) {
      throw new Error('Bracket sheet not found');
    }

    const sheetId = bracketSheet.properties?.sheetId;
    if (sheetId === undefined) {
      throw new Error('Bracket sheet ID is undefined');
    }

    // Freeze row 1 and make it bold
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          // Freeze row 1
          {
            updateSheetProperties: {
              properties: {
                sheetId,
                gridProperties: {
                  frozenRowCount: 1,
                },
              },
              fields: 'gridProperties.frozenRowCount',
            },
          },
          // Bold all text in row 1
          {
            repeatCell: {
              range: {
                sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: 32, // All columns through AF
              },
              cell: {
                userEnteredFormat: {
                  textFormat: {
                    bold: true,
                  },
                },
              },
              fields: 'userEnteredFormat.textFormat.bold',
            },
          },
        ],
      },
    });

    log('  ✓ Row 1 frozen');
    log('  ✓ Row 1 text bolded');
    log('✅ Bracket row 1 formatting complete\n');
  } catch (error) {
    log(`❌ Error freezing/bolding row 1: ${error}`);
    throw error;
  }
}

async function updateChampionshipCell(spreadsheetId: string) {
  log('\n🏆 STEP 5: Updating Championship cell with formula...');

  const keyPath = path.join(__dirname, '../../../keys/vpoll-key.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    // Get Bracket sheet ID
    const metadata = await sheets.spreadsheets.get({ spreadsheetId });
    const bracketSheet = metadata.data.sheets?.find(
      (s: any) => s.properties?.title === 'Bracket'
    );

    if (!bracketSheet) {
      throw new Error('Bracket sheet not found');
    }

    const sheetId = bracketSheet.properties?.sheetId;
    if (sheetId === undefined) {
      throw new Error('Bracket sheet ID is undefined');
    }

    // Update O17 with formula (merged cell stores formula in top-left)
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Bracket!O17',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [['=Config!B3&" Champion"']],
      },
    });

    log('  ✓ Formula set: =Config!B3&" Champion"');

    // Unmerge any existing merges in the championship cell area first
    log('  ✓ Unmerging any existing championship cell merges...');
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            unmergeCells: {
              range: {
                sheetId,
                startRowIndex: 16, // Row 17 (0-indexed)
                endRowIndex: 18,   // Row 18 (inclusive, to catch any vertical merges)
                startColumnIndex: 14, // Column O (0-indexed)
                endColumnIndex: 20,   // Column T (to catch any wide merges)
              },
            },
          },
        ],
      },
    });

    // Merge O17:Q17 horizontally for Championship label
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            mergeCells: {
              range: {
                sheetId,
                startRowIndex: 16, // Row 17 (0-indexed)
                endRowIndex: 17,   // Row 17 (exclusive end)
                startColumnIndex: 14, // Column O (0-indexed)
                endColumnIndex: 17,   // Column Q (0-indexed, exclusive end)
              },
              mergeType: 'MERGE_ALL',
            },
          },
          // Format merged cell: 16pt bold, centered
          {
            repeatCell: {
              range: {
                sheetId,
                startRowIndex: 16, // Row 17
                endRowIndex: 17,   // Row 17
                startColumnIndex: 14, // Column O
                endColumnIndex: 17,   // Column Q
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 1, green: 0.949, blue: 0.8 }, // Light gold
                  textFormat: {
                    fontSize: 16,
                    bold: true,
                    foregroundColor: { red: 0, green: 0, blue: 0 },
                  },
                  horizontalAlignment: 'CENTER',
                  verticalAlignment: 'MIDDLE',
                  wrapStrategy: 'CLIP', // No wrapping
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,wrapStrategy)',
            },
          },
        ],
      },
    });

    log('  ✓ Cells O17:Q17 merged (horizontal)');
    log('  ✓ Font: 16pt bold, centered');
    log('  ✓ Background: light gold');

    // Autosize columns O, P, Q to fit the championship text
    log('  ✓ Autosizing championship columns (O, P, Q)...');
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId,
                dimension: 'COLUMNS',
                startIndex: 14, // Column O (0-indexed)
                endIndex: 17,   // Column Q (exclusive)
              },
            },
          },
        ],
      },
    });

    log('✅ Championship cell complete\n');
  } catch (error) {
    log(`❌ Error updating Championship cell: ${error}`);
    throw error;
  }
}

async function finalColumnAutosizing(spreadsheetId: string) {
  log('\n📐 STEP 7: Final column autosizing (after formula evaluation)...');

  const keyPath = path.join(__dirname, '../../../keys/vpoll-key.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    // Get Bracket sheet ID
    const metadata = await sheets.spreadsheets.get({ spreadsheetId });
    const bracketSheet = metadata.data.sheets?.find(
      (s: any) => s.properties?.title === 'Bracket'
    );

    if (!bracketSheet) {
      throw new Error('Bracket sheet not found');
    }

    const sheetId = bracketSheet.properties?.sheetId;
    if (sheetId === undefined) {
      throw new Error('Bracket sheet ID is undefined');
    }

    // Autosize ALL columns one more time to ensure formulas are evaluated
    log('  ✓ Autosizing all Bracket columns (A-AF)...');
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 32, // Columns A-AF
              },
            },
          },
        ],
      },
    });

    // Explicitly autosize critical columns that contain formulas/long text
    log('  ✓ Explicitly autosizing columns E, Y (region names)...');
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          { autoResizeDimensions: { dimensions: { sheetId, dimension: 'COLUMNS', startIndex: 4, endIndex: 5 } } }, // E
          { autoResizeDimensions: { dimensions: { sheetId, dimension: 'COLUMNS', startIndex: 24, endIndex: 25 } } }, // Y
        ],
      },
    });

    log('✅ Final column autosizing complete\n');
  } catch (error) {
    log(`❌ Error during final autosizing: ${error}`);
    throw error;
  }
}

async function verifyFormatting(spreadsheetId: string) {
  log('\n🔍 STEP 6: Verifying formatting...');

  const keyPath = path.join(__dirname, '../../../keys/vpoll-key.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    // Get Bracket sheet with formatting
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId,
      ranges: ['Bracket!A1:AF70'],
      includeGridData: true,
    });

    const bracketSheet = metadata.data.sheets?.find(
      (s: any) => s.properties?.title === 'Bracket'
    );

    if (!bracketSheet) {
      throw new Error('Bracket sheet not found');
    }

    const sheetProperties = bracketSheet.properties;
    const frozenRows = sheetProperties?.gridProperties?.frozenRowCount || 0;

    log(`  Frozen rows: ${frozenRows}`);
    if (frozenRows === 1) {
      log('  ✅ Row 1 frozen');
    } else {
      log('  ⚠️  Row 1 NOT frozen!');
    }

    // Check row 1 bold
    const rowData = bracketSheet.data?.[0]?.rowData?.[0];
    const firstCellBold = rowData?.values?.[0]?.effectiveFormat?.textFormat?.bold;

    log(`  Row 1 first cell bold: ${firstCellBold}`);
    if (firstCellBold) {
      log('  ✅ Row 1 text is bold');
    } else {
      log('  ⚠️  Row 1 text NOT bold!');
    }

    // Check Championship cell formula (merged cell O17:Q17)
    const champCellValue = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Bracket!O17',
    });

    const formula = champCellValue.data.values?.[0]?.[0];
    log(`  Championship cell formula: ${formula}`);

    if (formula && formula.includes('Champion')) {
      log('  ✅ Championship cell has correct content');
    } else {
      log('  ⚠️  Championship cell formula incorrect!');
    }

    // Count borders
    let borderCount = 0;
    const rows = bracketSheet.data?.[0]?.rowData || [];
    for (const row of rows) {
      if (!row.values) continue;
      for (const cell of row.values) {
        const borders = cell.effectiveFormat?.borders;
        if (
          borders &&
          (borders.top?.style !== 'NONE' ||
            borders.bottom?.style !== 'NONE' ||
            borders.left?.style !== 'NONE' ||
            borders.right?.style !== 'NONE')
        ) {
          borderCount++;
        }
      }
    }

    log(`  Border cells found: ${borderCount}`);
    if (borderCount > 400) {
      log('  ✅ Comprehensive borders applied');
    } else {
      log('  ⚠️  Borders may be incomplete (expected 400+, got ${borderCount})');
    }

    log('\n✅ Verification complete\n');
  } catch (error) {
    log(`❌ Error during verification: ${error}`);
    throw error;
  }
}

async function main() {
  const spreadsheetId = process.argv[2];

  if (!spreadsheetId) {
    console.error('Usage: ts-node complete-bracket-test.ts <spreadsheet-id>');
    process.exit(1);
  }

  // Clear log file
  if (fs.existsSync(LOG_FILE)) {
    fs.unlinkSync(LOG_FILE);
  }

  log('═══════════════════════════════════════════════════════════');
  log('  COMPLETE BRACKET FORMATTING TEST');
  log('═══════════════════════════════════════════════════════════');
  log(`  Spreadsheet ID: ${spreadsheetId}`);
  log(`  URL: https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`);
  log('═══════════════════════════════════════════════════════════');

  try {
    // STEP 1: Clear sheet
    await clearSheet(spreadsheetId);

    // STEP 2: Populate test data
    await runScript('populate-test-sheet.ts', spreadsheetId);

    // STEP 3: Apply comprehensive borders from example sheet
    await runScript('fix-bracket-borders.ts', spreadsheetId);

    // STEP 4: Freeze and bold Bracket row 1
    await freezeAndBoldBracketRow1(spreadsheetId);

    // STEP 5: Update Championship cell with formula and merge
    await updateChampionshipCell(spreadsheetId);

    // STEP 6: Verify all formatting
    await verifyFormatting(spreadsheetId);

    // STEP 7: Final column autosizing (after all formulas evaluated)
    await finalColumnAutosizing(spreadsheetId);

    log('═══════════════════════════════════════════════════════════');
    log('  ✅ ALL FORMATTING COMPLETE');
    log('═══════════════════════════════════════════════════════════');
    log(`\n📄 Full log saved to: ${LOG_FILE}`);
    log(`\n🔗 View sheet: https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`);
  } catch (error) {
    log(`\n❌ TEST FAILED: ${error}`);
    process.exit(1);
  }
}

main();
