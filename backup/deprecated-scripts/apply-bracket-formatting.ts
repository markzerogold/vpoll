import { google } from 'googleapis';
import * as path from 'path';

/**
 * Apply comprehensive formatting to bracket tab:
 * - Merged cells for round headers
 * - Background colors for region names
 * - Font sizes and bold formatting
 * - Borders around matches
 */

interface CheckboxLocation {
  row: number;
  col: number;
  colLetter: string;
}

function colToLetter(col: number): string {
  let result = '';
  let num = col;
  while (num >= 0) {
    result = String.fromCharCode((num % 26) + 65) + result;
    num = Math.floor(num / 26) - 1;
  }
  return result;
}

function colToNumber(letter: string): number {
  let result = 0;
  for (let i = 0; i < letter.length; i++) {
    result = result * 26 + letter.charCodeAt(i) - 64;
  }
  return result;
}

/**
 * Find all checkbox cells in bracket
 */
async function findCheckboxes(sheets: any, spreadsheetId: string, sheetId: number): Promise<CheckboxLocation[]> {
  const response = await sheets.spreadsheets.get({
    spreadsheetId,
    ranges: ['Bracket!A1:AF70'],
    includeGridData: true,
  });

  const sheetData = response.data.sheets?.find((s: any) => s.properties.sheetId === sheetId);
  if (!sheetData) {
    throw new Error('Could not find Bracket sheet');
  }

  const checkboxes: CheckboxLocation[] = [];
  const rows = sheetData.data?.[0]?.rowData || [];

  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    const row = rows[rowIdx];
    if (!row.values) continue;

    for (let colIdx = 0; colIdx < row.values.length; colIdx++) {
      const cell = row.values[colIdx];
      const isCheckbox =
        cell.dataValidation?.condition?.type === 'BOOLEAN' ||
        cell.userEnteredValue?.boolValue !== undefined;

      if (isCheckbox) {
        checkboxes.push({
          row: rowIdx + 1,
          col: colIdx + 1,
          colLetter: colToLetter(colIdx),
        });
      }
    }
  }

  console.log(`  Found ${checkboxes.length} checkboxes`);
  return checkboxes;
}

/**
 * Generate border requests for bracket based on checkbox positions
 */
function generateBorderRequests(sheetId: number, checkboxes: CheckboxLocation[]): any[] {
  const requests: any[] = [];

  // Group checkboxes by column
  const byColumn = new Map<string, CheckboxLocation[]>();
  for (const cb of checkboxes) {
    const existing = byColumn.get(cb.colLetter) || [];
    existing.push(cb);
    byColumn.set(cb.colLetter, existing);
  }

  // Sort each column by row
  for (const [col, cbs] of byColumn) {
    byColumn.set(
      col,
      cbs.sort((a, b) => a.row - b.row)
    );
  }

  console.log(`  Processing ${byColumn.size} columns of checkboxes`);

  // Generate borders for each match (2 consecutive checkboxes)
  for (const [colLetter, cbs] of byColumn) {
    for (let i = 0; i < cbs.length; i += 2) {
      if (i + 1 >= cbs.length) break;

      const p1 = cbs[i];
      const p2 = cbs[i + 1];
      const nameCol = colToNumber(colLetter) + 1;

      // Box around the match
      // Top border
      requests.push({
        updateBorders: {
          range: {
            sheetId,
            startRowIndex: p1.row - 1,
            endRowIndex: p1.row,
            startColumnIndex: colToNumber(colLetter) - 1,
            endColumnIndex: nameCol,
          },
          top: { style: 'SOLID', width: 2 },
        },
      });

      // Bottom border
      requests.push({
        updateBorders: {
          range: {
            sheetId,
            startRowIndex: p2.row,
            endRowIndex: p2.row + 1,
            startColumnIndex: colToNumber(colLetter) - 1,
            endColumnIndex: nameCol,
          },
          bottom: { style: 'SOLID', width: 2 },
        },
      });

      // Left border
      requests.push({
        updateBorders: {
          range: {
            sheetId,
            startRowIndex: p1.row - 1,
            endRowIndex: p2.row + 1,
            startColumnIndex: colToNumber(colLetter) - 1,
            endColumnIndex: colToNumber(colLetter),
          },
          left: { style: 'SOLID', width: 2 },
        },
      });

      // Right border
      requests.push({
        updateBorders: {
          range: {
            sheetId,
            startRowIndex: p1.row - 1,
            endRowIndex: p2.row + 1,
            startColumnIndex: nameCol - 1,
            endColumnIndex: nameCol,
          },
          right: { style: 'SOLID', width: 2 },
        },
      });

      // Middle horizontal border
      requests.push({
        updateBorders: {
          range: {
            sheetId,
            startRowIndex: p1.row,
            endRowIndex: p1.row + 1,
            startColumnIndex: colToNumber(colLetter) - 1,
            endColumnIndex: nameCol,
          },
          bottom: { style: 'SOLID', width: 1 },
        },
      });
    }
  }

  console.log(`  Generated ${requests.length} border requests`);
  return requests;
}

/**
 * Generate requests for merged cells, colors, and fonts
 */
function generateFormattingRequests(sheetId: number): any[] {
  const requests: any[] = [];

  // Round headers (row 1) - merge cells and format
  const roundHeaders = [
    { text: 'Round 1', startCol: 0, endCol: 2 },      // A-B
    { text: 'Round 2', startCol: 3, endCol: 5 },      // D-F
    { text: 'Sweet 16', startCol: 6, endCol: 8 },     // G-I
    { text: 'Elite 8', startCol: 9, endCol: 11 },     // J-L
    { text: 'Final 4', startCol: 12, endCol: 14 },    // M-O
    { text: 'Championship', startCol: 15, endCol: 19 }, // P-T
    { text: 'Final 4', startCol: 20, endCol: 22 },    // U-W
    { text: 'Elite 8', startCol: 23, endCol: 25 },    // X-Z
    { text: 'Sweet 16', startCol: 26, endCol: 28 },   // AA-AC
    { text: 'Round 2', startCol: 29, endCol: 31 },    // AD-AF
    { text: 'Round 1', startCol: 32, endCol: 34 },    // AG-AI
  ];

  for (const header of roundHeaders) {
    // Merge cells
    requests.push({
      mergeCells: {
        range: {
          sheetId,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: header.startCol,
          endColumnIndex: header.endCol,
        },
        mergeType: 'MERGE_ALL',
      },
    });

    // Format: bold, centered, font size 12
    requests.push({
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: header.startCol,
          endColumnIndex: header.endCol,
        },
        cell: {
          userEnteredFormat: {
            textFormat: { bold: true, fontSize: 12 },
            horizontalAlignment: 'CENTER',
          },
        },
        fields: 'userEnteredFormat.textFormat,userEnteredFormat.horizontalAlignment',
      },
    });
  }

  // Region name headers with background colors
  // Federation (row 17, columns C-E)
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 16,
        endRowIndex: 17,
        startColumnIndex: 2,
        endColumnIndex: 5,
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: { red: 0.85, green: 0.92, blue: 0.83 }, // Light green
          textFormat: { bold: true, fontSize: 11 },
          horizontalAlignment: 'CENTER',
        },
      },
      fields: 'userEnteredFormat.backgroundColor,userEnteredFormat.textFormat,userEnteredFormat.horizontalAlignment',
    },
  });

  // Klingon Empire (row 49, columns C-E)
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 48,
        endRowIndex: 49,
        startColumnIndex: 2,
        endColumnIndex: 5,
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: { red: 0.98, green: 0.82, blue: 0.82 }, // Light red
          textFormat: { bold: true, fontSize: 11 },
          horizontalAlignment: 'CENTER',
        },
      },
      fields: 'userEnteredFormat.backgroundColor,userEnteredFormat.textFormat,userEnteredFormat.horizontalAlignment',
    },
  });

  // Romulan Star Empire (row 17, columns W-Y on right side)
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 16,
        endRowIndex: 17,
        startColumnIndex: 22,
        endColumnIndex: 25,
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: { red: 0.85, green: 0.88, blue: 0.98 }, // Light blue
          textFormat: { bold: true, fontSize: 11 },
          horizontalAlignment: 'CENTER',
        },
      },
      fields: 'userEnteredFormat.backgroundColor,userEnteredFormat.textFormat,userEnteredFormat.horizontalAlignment',
    },
  });

  // Dominion (row 49, columns W-Y on right side)
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 48,
        endRowIndex: 49,
        startColumnIndex: 22,
        endColumnIndex: 25,
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: { red: 0.98, green: 0.93, blue: 0.82 }, // Light orange
          textFormat: { bold: true, fontSize: 11 },
          horizontalAlignment: 'CENTER',
        },
      },
      fields: 'userEnteredFormat.backgroundColor,userEnteredFormat.textFormat,userEnteredFormat.horizontalAlignment',
    },
  });

  // Championship label "The Greatest" (centered)
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 14,
        endRowIndex: 15,
        startColumnIndex: 15,
        endColumnIndex: 19,
      },
      cell: {
        userEnteredFormat: {
          textFormat: { bold: true, fontSize: 14 },
          horizontalAlignment: 'CENTER',
        },
      },
      fields: 'userEnteredFormat.textFormat,userEnteredFormat.horizontalAlignment',
    },
  });

  console.log(`  Generated ${requests.length} formatting requests (merges, colors, fonts)`);
  return requests;
}

async function applyBracketFormatting(spreadsheetId: string) {
  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');
  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    console.log('🎨 Applying comprehensive bracket formatting...\n');
    console.log(`📊 Sheet: https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit\n`);

    // Get sheet metadata to find Bracket sheet ID
    const metadata = await sheets.spreadsheets.get({ spreadsheetId });

    console.log('  Available sheets:');
    metadata.data.sheets?.forEach((s: any) => {
      console.log(`    - ${s.properties?.title} (ID: ${s.properties?.sheetId})`);
    });
    console.log('');

    const bracketSheet = metadata.data.sheets?.find((s: any) => s.properties?.title === 'Bracket');
    if (!bracketSheet || bracketSheet.properties?.sheetId === undefined || bracketSheet.properties?.sheetId === null) {
      throw new Error('Bracket sheet not found or has no sheet ID');
    }
    const sheetId = bracketSheet.properties.sheetId;
    console.log(`  Found Bracket sheet (ID: ${sheetId})\n`);

    // Step 1: Find checkboxes
    console.log('🔍 Step 1: Finding checkboxes...');
    const checkboxes = await findCheckboxes(sheets, spreadsheetId, sheetId);

    // Step 2: Generate all requests
    console.log('\n📐 Step 2: Generating formatting requests...');
    const borderRequests = generateBorderRequests(sheetId, checkboxes);
    const formattingRequests = generateFormattingRequests(sheetId);
    const allRequests = [...formattingRequests, ...borderRequests];

    console.log(`\n  Total requests: ${allRequests.length}`);

    // Step 3: Apply all formatting in batches
    console.log('\n✨ Step 3: Applying formatting...');
    const batchSize = 100;
    for (let i = 0; i < allRequests.length; i += batchSize) {
      const batch = allRequests.slice(i, i + batchSize);
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests: batch },
      });
      console.log(`  Applied batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allRequests.length / batchSize)}`);
    }

    console.log('\n✅ Bracket formatting complete!');
    console.log('\n📊 Formatting applied:');
    console.log('  ✓ Round headers merged and bold');
    console.log('  ✓ Region names with colored backgrounds');
    console.log('  ✓ Borders around all matches');
    console.log('  ✓ Championship label formatted');
    console.log('\n🔗 View: https://docs.google.com/spreadsheets/d/' + spreadsheetId + '/edit#gid=' + sheetId);

  } catch (error) {
    console.error('❌ Error applying formatting:', error);
    throw error;
  }
}

// Get spreadsheet ID from command line
const spreadsheetId = process.argv[2];

if (!spreadsheetId) {
  console.error('❌ Error: Please provide a spreadsheet ID');
  console.log('\nUsage: npm run format-bracket <spreadsheet-id>');
  console.log('\nExample: npm run format-bracket 1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w');
  process.exit(1);
}

applyBracketFormatting(spreadsheetId)
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error.message);
    process.exit(1);
  });
