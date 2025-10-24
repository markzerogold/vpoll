# Bracket Formula Structure

This document explains how the vPoll bracket formulas work in Google Sheets.

## Overview

The bracket is a **formula-driven visualization** that automatically updates as tournament results are recorded. The bot writes TRUE/FALSE values to checkbox cells, and formulas cascade those winners through all 6 rounds to the championship.

## Key Concepts

### 1. Checkbox Cells (TRUE/FALSE)

Each match has two checkbox cells representing the two participants:
- **TRUE** = Winner (advances to next round)
- **FALSE** = Loser (eliminated)

The bot sets these values when poll results are processed.

### 2. VLOOKUP Formulas

Display cells use `VLOOKUP(TRUE, range, 2, FALSE)` to show the winner's name:

```excel
=IFERROR(VLOOKUP(TRUE, $A$2:$B$3, 2, FALSE), "")
```

**How it works:**
- Searches the range (A2:B3) for a row where column 1 = TRUE
- Returns the value from column 2 (the participant name)
- IFERROR handles cases where no winner is set yet (returns blank)

### 3. Cascading Pattern

Each round's formulas reference the previous round's checkbox/name pairs:

```
Round 1 (Participants) → Round 2 → Round 3 → Round 4 → Round 5 → Round 6 (Champion)
```

## Column Layout

### Left Bracket (ALPHA and BETA Regions)

| Columns | Purpose | Content |
|---------|---------|---------|
| A-B | Round 1 | Checkboxes (A) + Participant names from Regions tab (B) |
| D-E | Round 2 | Checkboxes (D) + Winners from Round 1 (E) |
| G-H | Round 3 (Sweet 16) | Checkboxes (G) + Winners from Round 2 (H) |
| J-K | Round 4 (Elite 8) | Checkboxes (J) + Winners from Round 3 (K) |
| M-N | Round 5 (Final Four) | Checkboxes (M) + Regional champions (N) |

### Center (Championship)

| Columns | Purpose | Content |
|---------|---------|---------|
| O-Q | Round 6 (Championship) | Final match checkboxes and "The Greatest" display |

### Right Bracket (GAMMA and DELTA Regions)

| Columns | Purpose | Content |
|---------|---------|---------|
| R-S | Round 5 (Final Four) | Checkboxes (S) + Regional champions (R) |
| U-V | Round 4 (Elite 8) | Checkboxes (V) + Winners from Round 3 (U) |
| X-Y | Round 3 (Sweet 16) | Checkboxes (Y) + Winners from Round 2 (X) |
| AA-AB | Round 2 | Checkboxes (AB) + Winners from Round 1 (AA) |
| AD-AE | Round 1 | Checkboxes (AE) + Participant names from Regions tab (AD) |

## Formula Examples

### Round 1 - Participant Names

Left side (ALPHA region, match 1):
```excel
B2: =Regions!$A$3&" "&Regions!$B$3
```
Shows: "(1) Spock (TOS/TAS/Films/SNW)"

Right side (GAMMA region, match 1):
```excel
AD2: =Regions!$A$3&" "&Regions!$D$3
```
Shows: "(1) Data (TNG/Films)"

### Round 2 - Winners from Round 1

Left side (winner of match between rows 2-3):
```excel
E4: =IFERROR(VLOOKUP(TRUE, $A$2:$B$3, 2, FALSE), "")
```

Right side (winner of match between rows 2-3):
```excel
AA4: =IFERROR(VLOOKUP(TRUE, {$AE$2:$AE$3, $AD$2:$AD$3}, 2, FALSE), "")
```

**Note:** Right side uses array syntax `{checkbox_col, name_col}` to combine non-adjacent columns.

### Round 3 - Winners from Round 2

Left side:
```excel
H8: =IFERROR(VLOOKUP(TRUE, $D$4:$E$5, 2, FALSE), "")
```

Right side:
```excel
X8: =IFERROR(VLOOKUP(TRUE, {$AB$4:$AB$5, $AA$4:$AA$5}, 2, FALSE), "")
```

### Round 4 - Winners from Round 3

Left side (ALPHA regional final):
```excel
K16: =IFERROR(VLOOKUP(TRUE, $G$8:$H$9, 2, FALSE), "")
```

Right side (GAMMA regional final):
```excel
U16: =IFERROR(VLOOKUP(TRUE, {$Y$8:$Y$9, $X$8:$X$9}, 2, FALSE), "")
```

### Round 5 - Final Four

Match 1 (ALPHA winner vs BETA winner):
```excel
N31: =IFERROR(VLOOKUP(TRUE, $J$16:$K$17, 2, FALSE), "")
N32: =IFERROR(VLOOKUP(TRUE, $J$32:$K$33, 2, FALSE), "")
```

Match 2 (GAMMA winner vs DELTA winner):
```excel
R31: =IFERROR(VLOOKUP(TRUE, {$V$16:$V$17, $U$16:$U$17}, 2, FALSE), "")
R32: =IFERROR(VLOOKUP(TRUE, {$V$32:$V$33, $U$32:$U$33}, 2, FALSE), "")
```

### Round 6 - Championship Winner

Display "The Greatest" (row 19, column O):
```excel
O19: =IFERROR(VLOOKUP(TRUE, $O$26:$P$26, 2, FALSE), IFERROR(VLOOKUP(TRUE, {$Q$27, $P$27}, 2, FALSE), " "))
```

This shows the champion's name after the final match is decided.

## Row Spacing

Matches are spaced to create a visually balanced bracket:

| Round | Matches | Rows per Match | Total Rows |
|-------|---------|----------------|------------|
| Round 1 | 32 (8 per region) | 4 | ~64 |
| Round 2 | 16 (4 per region) | 8 | ~64 |
| Round 3 | 8 (2 per region) | 16 | ~64 |
| Round 4 | 4 (1 per region) | 32 | ~64 |
| Round 5 | 2 | Variable | Center of bracket |
| Round 6 | 1 | Variable | Center of bracket |

## Bot Implementation

### Match ID to Cell Mapping

The bot needs to know which cells to update for each match. Pattern:

**Round 1 Matches:**
- `R1-ALPHA-M1` → Checkboxes at A2 (P1) and A3 (P2)
- `R1-ALPHA-M2` → Checkboxes at A6 (P1) and A7 (P2)
- `R1-ALPHA-M3` → Checkboxes at A10 (P1) and A11 (P2)
- ... (continues every 4 rows)

**Round 2 Matches:**
- `R2-ALPHA-M1` → Checkboxes at D4 (P1) and D5 (P2)
- `R2-ALPHA-M2` → Checkboxes at D12 (P1) and D13 (P2)
- ... (continues every 8 rows)

**Pattern:**
```typescript
function getCheckboxCells(matchId: string): { winner: string; loser: string } {
  const [_, round, region, matchNum] = matchId.match(/R(\d+)-(\w+)-M(\d+)/)!;

  // Calculate row based on region, round, and match number
  const row = calculateMatchRow(parseInt(round), region, parseInt(matchNum));

  // Get column based on round and side (left/right)
  const col = getMatchColumn(parseInt(round), region);

  return {
    winner: `${col}${row}`,
    loser: `${col}${row + 1}`
  };
}
```

### Updating Results

When a poll closes:

1. Bot determines winner from vote counts
2. Bot updates Google Sheets:
   ```typescript
   await sheets.spreadsheets.values.batchUpdate({
     spreadsheetId,
     valueInputOption: 'RAW',
     data: [
       { range: `Bracket!${winnerCell}`, values: [[true]] },
       { range: `Bracket!${loserCell}`, values: [[false]] }
     ]
   });
   ```
3. Formulas automatically cascade the winner to the next round
4. Bracket updates in real-time for all viewers

## Testing the Bracket

To test bracket formulas manually:

1. Open the populated test sheet
2. Find a Round 1 match (e.g., rows 2-3 in column A)
3. Check the checkbox in row 2 (set to TRUE)
4. Watch column E row 4 automatically populate with the winner's name
5. Check that checkbox in column D row 4
6. Watch column H row 8 show the winner advancing to Round 3

Continue this pattern through all 6 rounds to verify the championship winner appears under "The Greatest".

## Common Issues

### Formula shows #REF! error

**Cause:** Referenced cells don't exist (usually from incorrect row/column calculation)

**Fix:** Verify the match row calculation matches the actual bracket layout

### Winner name not appearing

**Cause:** No checkbox set to TRUE in the match

**Fix:** Ensure exactly one checkbox per match is TRUE

### Duplicate winners in same match

**Cause:** Both checkboxes set to TRUE

**Fix:** Implement validation to ensure only one TRUE per match pair

## Future Enhancements

Potential improvements for future versions:

1. **Named Ranges:** Use named ranges instead of hardcoded cells for easier maintenance
2. **Vote Counts:** Display vote counts next to participant names (requires Results tab reference)
3. **Conditional Formatting:** Highlight winners, fade losers, color by region
4. **Protected Ranges:** Lock formula cells to prevent accidental editing
5. **Match IDs:** Display match IDs in bracket for easier debugging

## References

- `src/generate-bracket.ts` - Formula generation logic
- `src/populate-test-sheet.ts` - Script that creates bracket with formulas
- `docs/requirements/07-google-sheets-spec.md` - Bracket tab specification
- `docs/technical/TECHNICAL_SPEC.md` - Section 2: Bracket Tab Formula Logic
