import { google } from 'googleapis';
import * as path from 'path';

/**
 * Fix missing right borders in bracket
 *
 * Issues to fix:
 * 1. K33 and T33 missing right borders
 * 2. Match cells in columns S, V, Y, AB missing right borders
 */

interface BorderRequest {
  row: number; // 1-indexed
  col: number; // 0-indexed
  side: 'right' | 'left' | 'top' | 'bottom';
}

const BORDER_STYLE = {
  style: 'SOLID',
  width: 1,
  color: { red: 0, green: 0, blue: 0 },
};

/**
 * Generate border fix requests
 */
function generateBorderFixes(): BorderRequest[] {
  const fixes: BorderRequest[] = [];

  // Fix K33 and T33 right borders
  fixes.push({ row: 33, col: 10, side: 'right' }); // K33
  fixes.push({ row: 33, col: 19, side: 'right' }); // T33

  // Fix match cell right borders in columns S, V, Y, AB
  // These are the match rows that need right borders
  const matchRows = [
    // Round 2 matches (approximate based on bracket structure)
    4, 5, 12, 13, 20, 21, 28, 29, // Round 2 left side
    40, 41, 48, 49, // Round 2 right side (need to verify)
  ];

  // Column S = index 18
  // Column V = index 21
  // Column Y = index 24
  // Column AB = index 27

  // Apply right borders to all match rows in these columns
  const borderColumns = [18, 21, 24, 27]; // S, V, Y, AB

  for (const row of matchRows) {
    for (const col of borderColumns) {
      fixes.push({ row, col, side: 'right' });
    }
  }

  return fixes;
}

/**
 * Convert column index to letter (0-indexed)
 */
function colToLetter(col: number): string {
  let letter = '';
  let temp = col;
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

async function fixMissingBorders(spreadsheetId: string) {
  const keyPath = path.join(__dirname, '../keys/vpoll-key.json');

  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  try {
    console.log(`\n🔧 Fixing missing borders in spreadsheet: ${spreadsheetId}\n`);

    // Get bracket sheet ID
    const metadata = await sheets.spreadsheets.get({ spreadsheetId });
    const bracketSheet = metadata.data.sheets?.find(
      (s: any) => s.properties?.title === 'Bracket'
    );

    if (!bracketSheet || !bracketSheet.properties) {
      throw new Error('Bracket sheet not found');
    }

    const sheetId = bracketSheet.properties.sheetId;

    // Generate border fixes
    const borderFixes = generateBorderFixes();
    console.log(`📋 Applying ${borderFixes.length} border fixes...`);

    // Create batch update requests
    const requests = borderFixes.map(fix => {
      const borderUpdate: any = {};
      borderUpdate[fix.side] = BORDER_STYLE;

      return {
        updateBorders: {
          range: {
            sheetId,
            startRowIndex: fix.row - 1,
            endRowIndex: fix.row,
            startColumnIndex: fix.col,
            endColumnIndex: fix.col + 1,
          },
          ...borderUpdate,
        },
      };
    });

    // Apply all border fixes
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests },
    });

    console.log('✅ Border fixes applied successfully!\n');

    // Log which cells were fixed
    console.log('Fixed borders on:');
    const cellRefs = borderFixes.map(fix => `${colToLetter(fix.col)}${fix.row}`);
    console.log(cellRefs.join(', '));
    console.log();

  } catch (error) {
    console.error('❌ Error fixing borders:', error);
    throw error;
  }
}

// Get spreadsheet ID from command line
const spreadsheetId = process.argv[2];

if (!spreadsheetId) {
  console.error('❌ Error: Please provide a spreadsheet ID');
  console.log('\nUsage: npx ts-node src/fix-missing-borders.ts <spreadsheet-id>');
  process.exit(1);
}

fixMissingBorders(spreadsheetId);
