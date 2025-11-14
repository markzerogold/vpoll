import { google } from 'googleapis';
import * as path from 'path';

/**
 * Generate bracket formulas for a tournament sheet
 *
 * Bracket Structure:
 * - 64 participants → 6 rounds (32, 16, 8, 4, 2, 1 matches)
 * - Each match has a TRUE/FALSE cell pair for winner/loser indication
 * - Display cells use VLOOKUP to show winner based on TRUE cell
 * - Formula pattern cascades through all rounds to championship
 */

interface BracketCell {
  row: number;
  col: string;
  formula?: string;
  value?: string | boolean;
  isCheckbox?: boolean;
}

/**
 * Convert column index (0-based) to letter (A, B, C, ..., AA, AB, etc.)
 */
function colToLetter(col: number): string {
  let letter = '';
  while (col >= 0) {
    letter = String.fromCharCode((col % 26) + 65) + letter;
    col = Math.floor(col / 26) - 1;
  }
  return letter;
}

/**
 * Generate bracket layout for a 64-participant tournament
 */
function generateBracketLayout(): BracketCell[] {
  const cells: BracketCell[] = [];

  // Round headers (Row 1)
  cells.push({ row: 1, col: 'A', value: 'Round 1' });
  cells.push({ row: 1, col: 'D', value: 'Round 2' });
  cells.push({ row: 1, col: 'G', value: 'Sweet 16' });
  cells.push({ row: 1, col: 'J', value: 'Elite 8' });
  cells.push({ row: 1, col: 'M', value: 'Final 4' });
  cells.push({ row: 1, col: 'P', value: 'Championship' });

  // Mirror headers on right side (formulas reference left side)
  cells.push({ row: 1, col: 'R', formula: '=M1' }); // Final 4
  cells.push({ row: 1, col: 'U', formula: '=J1' }); // Elite 8
  cells.push({ row: 1, col: 'X', formula: '=G1' }); // Sweet 16
  cells.push({ row: 1, col: 'AA', formula: '=D1' }); // Round 2
  cells.push({ row: 1, col: 'AD', value: 'Round 1' });

  // Region labels
  // Note: These formulas write to cells that will have VALUES written over them by fix-test-sheet.ts
  // The merged regions are: E15:G18 (Federation), E47:G50 (Klingon Empire), Y15:AA18 (Romulan), Y47:AA50 (Dominion)
  cells.push({ row: 15, col: 'E', formula: '=Regions!B2' }); // ALPHA/Federation (top-left)
  cells.push({ row: 15, col: 'Y', formula: '=Regions!D2' }); // GAMMA/Romulan (top-right)
  cells.push({ row: 47, col: 'E', formula: '=Regions!C2' }); // BETA/Klingon Empire (bottom-left) - FIXED from row 31
  cells.push({ row: 47, col: 'Y', formula: '=Regions!E2' }); // DELTA/Dominion (bottom-right) - FIXED from row 31

  // Championship winner cell
  cells.push({ row: 18, col: 'O', value: 'Championship' });

  return cells;
}

/**
 * Generate Round 1 matches for one region
 * @param startRow - Starting row for this region's matches
 * @param regionCol - Region column in Regions tab (B=0, C=1, D=2, E=3)
 * @param isRightSide - Whether this region is on the right side of bracket
 */
function generateRound1Region(
  startRow: number,
  regionCol: number,
  isRightSide: boolean = false
): BracketCell[] {
  const cells: BracketCell[] = [];

  // Region columns: B=0 (ALPHA), C=1 (BETA), D=2 (GAMMA), E=3 (DELTA)
  const regionColLetter = colToLetter(regionCol + 1); // +1 because Regions!A is Rank

  // 8 matches per region in Round 1 (16 participants)
  for (let match = 0; match < 8; match++) {
    const matchStartRow = startRow + (match * 4);

    // Participant rows in Regions tab (row 3 is first participant, rank 1)
    const p1RegionsRow = 3 + (match * 2);      // e.g., row 3 for match 1
    const p2RegionsRow = 3 + (match * 2) + 1;  // e.g., row 4 for match 1

    if (isRightSide) {
      // Right side (GAMMA and DELTA regions) - columns AD and AE
      const checkboxCol = 'AE';
      const nameCol = 'AD';

      // Checkbox and participant name for P1
      cells.push({
        row: matchStartRow,
        col: checkboxCol,
        value: false,
        isCheckbox: true
      });
      cells.push({
        row: matchStartRow,
        col: nameCol,
        formula: `="("&Regions!$A$${p1RegionsRow}&") "&Regions!$${regionColLetter}$${p1RegionsRow}`
      });

      // Checkbox and participant name for P2
      cells.push({
        row: matchStartRow + 1,
        col: checkboxCol,
        value: false,
        isCheckbox: true
      });
      cells.push({
        row: matchStartRow + 1,
        col: nameCol,
        formula: `="("&Regions!$A$${p2RegionsRow}&") "&Regions!$${regionColLetter}$${p2RegionsRow}`
      });

    } else {
      // Left side (ALPHA and BETA regions) - columns A and B
      const checkboxCol = 'A';
      const nameCol = 'B';

      // Checkbox and participant name for P1
      cells.push({
        row: matchStartRow,
        col: checkboxCol,
        value: false,
        isCheckbox: true
      });
      cells.push({
        row: matchStartRow,
        col: nameCol,
        formula: `="("&Regions!$A$${p1RegionsRow}&") "&Regions!$${regionColLetter}$${p1RegionsRow}`
      });

      // Checkbox and participant name for P2
      cells.push({
        row: matchStartRow + 1,
        col: checkboxCol,
        value: false,
        isCheckbox: true
      });
      cells.push({
        row: matchStartRow + 1,
        col: nameCol,
        formula: `="("&Regions!$A$${p2RegionsRow}&") "&Regions!$${regionColLetter}$${p2RegionsRow}`
      });
    }
  }

  return cells;
}

/**
 * Generate Round 2 advancement cells
 * Round 2 shows winners from Round 1 matches
 */
function generateRound2Region(
  startRow: number,
  isRightSide: boolean = false
): BracketCell[] {
  const cells: BracketCell[] = [];

  // Round 1 always starts at row 2 (or 34 for bottom half)
  // startRow parameter is where Round 2 displays, not where Round 1 is
  const r1BaseRow = startRow <= 20 ? 2 : 34;  // Top half vs bottom half

  // 4 matches per region in Round 2 (8 participants from Round 1)
  for (let match = 0; match < 4; match++) {
    const matchStartRow = startRow + (match * 8); // Each R2 match is 8 rows apart

    // Each R2 match pulls from 2 R1 matches (4 rows each)
    // Round 1 matches are at rows: 2, 6, 10, 14, 18, 22, 26, 30 (top)
    // or 34, 38, 42, 46, 50, 54, 58, 62 (bottom)
    const r1Match1Start = r1BaseRow + (match * 2 * 4);  // First R1 match for this R2 match
    const r1Match1End = r1Match1Start + 1;
    const r1Match2Start = r1Match1Start + 4;             // Second R1 match for this R2 match
    const r1Match2End = r1Match2Start + 1;

    if (isRightSide) {
      // Right side - columns AB and AA
      const checkboxCol = 'AB';
      const nameCol = 'AA';

      // Winner of first R1 match
      cells.push({
        row: matchStartRow,
        col: checkboxCol,
        value: false,
        isCheckbox: true
      });
      cells.push({
        row: matchStartRow,
        col: nameCol,
        formula: `=IFERROR(VLOOKUP(TRUE,{$AE$${r1Match1Start}:$AE$${r1Match1End},$AD$${r1Match1Start}:$AD$${r1Match1End}},2,FALSE),"")`
      });

      // Winner of second R1 match
      cells.push({
        row: matchStartRow + 1,
        col: checkboxCol,
        value: false,
        isCheckbox: true
      });
      cells.push({
        row: matchStartRow + 1,
        col: nameCol,
        formula: `=IFERROR(VLOOKUP(TRUE,{$AE$${r1Match2Start}:$AE$${r1Match2End},$AD$${r1Match2Start}:$AD$${r1Match2End}},2,FALSE),"")`
      });

    } else {
      // Left side - columns D and E
      const checkboxCol = 'D';
      const nameCol = 'E';

      // Winner of first R1 match
      cells.push({
        row: matchStartRow,
        col: checkboxCol,
        value: false,
        isCheckbox: true
      });
      cells.push({
        row: matchStartRow,
        col: nameCol,
        formula: `=IFERROR(VLOOKUP(TRUE,$A$${r1Match1Start}:$B$${r1Match1End},2,FALSE),"")`
      });

      // Winner of second R1 match
      cells.push({
        row: matchStartRow + 1,
        col: checkboxCol,
        value: false,
        isCheckbox: true
      });
      cells.push({
        row: matchStartRow + 1,
        col: nameCol,
        formula: `=IFERROR(VLOOKUP(TRUE,$A$${r1Match2Start}:$B$${r1Match2End},2,FALSE),"")`
      });
    }
  }

  return cells;
}

/**
 * Generate Round 3 (Sweet 16) advancement cells
 */
function generateRound3Region(
  startRow: number,
  isRightSide: boolean = false
): BracketCell[] {
  const cells: BracketCell[] = [];

  // 2 matches per region in Round 3
  for (let match = 0; match < 2; match++) {
    const matchStartRow = startRow + (match * 16); // Each R3 match is 16 rows apart

    // Each R3 match pulls from 2 R2 matches
    // Round 2 starts at row 4 (top half) or row 36 (bottom half), matches 8 rows apart
    const r2BaseRow = startRow <= 20 ? 4 : 36;  // FIX: Round 2 base row
    const r2Match1Start = r2BaseRow + (match * 2 * 8);  // FIX: First of two R2 matches
    const r2Match1End = r2Match1Start + 1;
    const r2Match2Start = r2Match1Start + 8;  // FIX: Second R2 match (8 rows after first)
    const r2Match2End = r2Match2Start + 1;

    if (isRightSide) {
      // Right side - columns Y and AB
      const checkboxCol = 'Y';
      const nameCol = 'AB';  // FIX: Was 'X', should be 'AB'

      cells.push({
        row: matchStartRow,
        col: checkboxCol,
        value: false,
        isCheckbox: true
      });
      cells.push({
        row: matchStartRow,
        col: nameCol,
        // FIX: Look at Round 2 right side columns W:AA (was AB:AA)
        formula: `=IFERROR(VLOOKUP(TRUE,{$W$${r2Match1Start}:$W$${r2Match1End},$AA$${r2Match1Start}:$AA$${r2Match1End}},2,FALSE),"")`
      });

      cells.push({
        row: matchStartRow + 1,
        col: checkboxCol,
        value: false,
        isCheckbox: true
      });
      cells.push({
        row: matchStartRow + 1,
        col: nameCol,
        // FIX: Look at Round 2 right side columns W:AA (was AB:AA)
        formula: `=IFERROR(VLOOKUP(TRUE,{$W$${r2Match2Start}:$W$${r2Match2End},$AA$${r2Match2Start}:$AA$${r2Match2End}},2,FALSE),"")`
      });

    } else {
      // Left side - columns G and H
      const checkboxCol = 'G';
      const nameCol = 'H';

      cells.push({
        row: matchStartRow,
        col: checkboxCol,
        value: false,
        isCheckbox: true
      });
      cells.push({
        row: matchStartRow,
        col: nameCol,
        formula: `=IFERROR(VLOOKUP(TRUE,$D$${r2Match1Start}:$E$${r2Match1End},2,FALSE),"")`
      });

      cells.push({
        row: matchStartRow + 1,
        col: checkboxCol,
        value: false,
        isCheckbox: true
      });
      cells.push({
        row: matchStartRow + 1,
        col: nameCol,
        formula: `=IFERROR(VLOOKUP(TRUE,$D$${r2Match2Start}:$E$${r2Match2End},2,FALSE),"")`
      });
    }
  }

  return cells;
}

/**
 * Generate Round 4 (Elite 8) - Regional finals
 */
function generateRound4Region(
  startRow: number,
  isRightSide: boolean = false
): BracketCell[] {
  const cells: BracketCell[] = [];

  // 1 match per region in Round 4 (regional final)
  const r3Match1Start = startRow;
  const r3Match1End = r3Match1Start + 1;
  const r3Match2Start = startRow + 16;
  const r3Match2End = r3Match2Start + 1;

  if (isRightSide) {
    // Right side - columns V and U
    const checkboxCol = 'V';
    const nameCol = 'U';

    cells.push({
      row: startRow,
      col: checkboxCol,
      value: false,
      isCheckbox: true
    });
    cells.push({
      row: startRow,
      col: nameCol,
      formula: `=IFERROR(VLOOKUP(TRUE,{$Y$${r3Match1Start}:$Y$${r3Match1End},$X$${r3Match1Start}:$X$${r3Match1End}},2,FALSE),"")`
    });

    cells.push({
      row: startRow + 1,
      col: checkboxCol,
      value: false,
      isCheckbox: true
    });
    cells.push({
      row: startRow + 1,
      col: nameCol,
      formula: `=IFERROR(VLOOKUP(TRUE,{$Y$${r3Match2Start}:$Y$${r3Match2End},$X$${r3Match2Start}:$X$${r3Match2End}},2,FALSE),"")`
    });

  } else {
    // Left side - columns J and K
    const checkboxCol = 'J';
    const nameCol = 'K';

    cells.push({
      row: startRow,
      col: checkboxCol,
      value: false,
      isCheckbox: true
    });
    cells.push({
      row: startRow,
      col: nameCol,
      formula: `=IFERROR(VLOOKUP(TRUE,$G$${r3Match1Start}:$H$${r3Match1End},2,FALSE),"")`
    });

    cells.push({
      row: startRow + 1,
      col: checkboxCol,
      value: false,
      isCheckbox: true
    });
    cells.push({
      row: startRow + 1,
      col: nameCol,
      formula: `=IFERROR(VLOOKUP(TRUE,$G$${r3Match2Start}:$H$${r3Match2End},2,FALSE),"")`
    });
  }

  return cells;
}

/**
 * Generate Round 5 (Final Four) - 2 matches
 */
function generateRound5(): BracketCell[] {
  const cells: BracketCell[] = [];

  // Match 1: ALPHA winner (row 16) vs BETA winner (row 32)
  const alphaRow = 16;
  const betaRow = 32;

  // Match 2: GAMMA winner (row 16 right side) vs DELTA winner (row 32 right side)
  const gammaRow = 16;
  const deltaRow = 32;

  // Match 1 - Left side (columns M and N)
  cells.push({
    row: 31,
    col: 'M',
    value: false,
    isCheckbox: true
  });
  cells.push({
    row: 31,
    col: 'N',
    formula: `=IFERROR(VLOOKUP(TRUE,$J$${alphaRow}:$K$${alphaRow+1},2,FALSE),"")`
  });

  cells.push({
    row: 32,
    col: 'M',
    value: false,
    isCheckbox: true
  });
  cells.push({
    row: 32,
    col: 'N',
    formula: `=IFERROR(VLOOKUP(TRUE,$J$${betaRow}:$K$${betaRow+1},2,FALSE),"")`
  });

  // Match 2 - Right side (columns S and R)
  cells.push({
    row: 31,
    col: 'S',
    value: false,
    isCheckbox: true
  });
  cells.push({
    row: 31,
    col: 'R',
    formula: `=IFERROR(VLOOKUP(TRUE,{$V$${gammaRow}:$V$${gammaRow+1},$U$${gammaRow}:$U$${gammaRow+1}},2,FALSE),"")`
  });

  cells.push({
    row: 32,
    col: 'S',
    value: false,
    isCheckbox: true
  });
  cells.push({
    row: 32,
    col: 'R',
    formula: `=IFERROR(VLOOKUP(TRUE,{$V$${deltaRow}:$V$${deltaRow+1},$U$${deltaRow}:$U$${deltaRow+1}},2,FALSE),"")`
  });

  return cells;
}

/**
 * Generate Round 6 (Championship) - 1 match
 */
function generateRound6(): BracketCell[] {
  const cells: BracketCell[] = [];

  // Championship match - center columns
  // Winner displays in row 19, column O ("The Greatest")

  // Match checkbox columns
  cells.push({
    row: 26,
    col: 'O',
    value: false,
    isCheckbox: true
  });
  cells.push({
    row: 26,
    col: 'P',
    formula: '=IFERROR(VLOOKUP(TRUE,$M$31:$N$32,2,FALSE),"")'
  });

  cells.push({
    row: 27,
    col: 'Q',
    value: false,
    isCheckbox: true
  });
  cells.push({
    row: 27,
    col: 'P',
    formula: '=IFERROR(VLOOKUP(TRUE,{$S$31:$S$32,$R$31:$R$32},2,FALSE),"")'
  });

  // Winner display (under "The Greatest")
  cells.push({
    row: 19,
    col: 'O',
    formula: '=IFERROR(VLOOKUP(TRUE,$O$26:$P$26,2,FALSE),IFERROR(VLOOKUP(TRUE,{$Q$27,$P$27},2,FALSE)," "))'
  });

  // Mirror winner to right side
  cells.push({
    row: 27,
    col: 'R',
    formula: '=$P$27'
  });

  return cells;
}

/**
 * Generate complete bracket with all formulas
 */
export function generateCompleteBracket(): BracketCell[] {
  const allCells: BracketCell[] = [];

  // Add header and labels
  allCells.push(...generateBracketLayout());

  // Round 1 - 4 regions
  // ALPHA region (left, rows 2-33)
  allCells.push(...generateRound1Region(2, 0, false)); // Regions!B (column index 0 -> B)

  // BETA region (left, rows 34-65)
  allCells.push(...generateRound1Region(34, 1, false)); // Regions!C (column index 1 -> C)

  // GAMMA region (right, rows 2-33)
  allCells.push(...generateRound1Region(2, 2, true)); // Regions!D (column index 2 -> D)

  // DELTA region (right, rows 34-65)
  allCells.push(...generateRound1Region(34, 3, true)); // Regions!E (column index 3 -> E)

  // Round 2 - 4 regions
  allCells.push(...generateRound2Region(4, false));  // ALPHA left
  allCells.push(...generateRound2Region(36, false)); // BETA left
  allCells.push(...generateRound2Region(4, true));   // GAMMA right
  allCells.push(...generateRound2Region(36, true));  // DELTA right

  // Round 3 - 4 regions
  allCells.push(...generateRound3Region(8, false));  // ALPHA left
  allCells.push(...generateRound3Region(40, false)); // BETA left
  allCells.push(...generateRound3Region(8, true));   // GAMMA right
  allCells.push(...generateRound3Region(40, true));  // DELTA right

  // Round 4 - 4 regions
  allCells.push(...generateRound4Region(16, false)); // ALPHA left
  allCells.push(...generateRound4Region(48, false)); // BETA left - wait, this needs adjustment
  allCells.push(...generateRound4Region(16, true));  // GAMMA right
  allCells.push(...generateRound4Region(48, true));  // DELTA right

  // Round 5 - Final Four
  allCells.push(...generateRound5());

  // Round 6 - Championship
  allCells.push(...generateRound6());

  return allCells;
}

// Export for use in populate-test-sheet.ts
export { BracketCell, colToLetter };
