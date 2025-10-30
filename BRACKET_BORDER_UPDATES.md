# Bracket Border Implementation

**Date:** 2025-10-30
**Status:** Complete ✅

## Overview

Implemented automated border formatting for tournament bracket visualization in Google Sheets, ensuring proper alignment of:
- Match borders (connecting lines between rounds)
- Region name borders (Federation, Klingon Empire, Romulan Star Empire, Dominion)
- Column sizing and text wrapping

## Problem Solved

The test bracket sheet (`1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o`) had different row spacing than the example sheet (`1Z83Lr02EW9wvpH3YfBvLwafHMIqyxJLXaO_0D85bMfk`), causing border misalignment:

- **Top half (ALPHA/GAMMA regions)**: Rows 1-32 matched perfectly
- **Bottom half (BETA/DELTA regions)**: Test sheet has row 33 as empty separator, causing +1 row offset for rows 34+
- **Region names**: Test sheet has custom region names at different positions than example

## Solution Implemented

### 1. Row Mapping Logic

```typescript
function mapRow(exampleRow: number): number {
  if (exampleRow >= 33) {
    return exampleRow + 1; // +1 offset for bottom half
  }
  return exampleRow; // No offset for top half
}
```

### 2. Border Application Process

1. **Read borders** from example sheet (all 459 cells with borders)
2. **Map rows** using offset logic for bottom bracket half
3. **Clear existing borders** to start fresh
4. **Apply mapped borders** in batches (100 cells per API call)
5. **Add region name borders** at test sheet-specific positions
6. **Autosize columns** and disable text wrapping

### 3. Region Name Border Positions

**Example Sheet:**
- ALPHA at E15, GAMMA at Y15 (top regions)
- BETA at E46, DELTA at Y46 (bottom regions)

**Test Sheet:**
- Federation at E15, Romulan Star Empire at Y15 ✅
- Klingon Empire at E31, Dominion at Y31 ✅ (required manual borders)

## Scripts Created

### Main Script

**`src/fix-bracket-borders.ts`** - Production script that applies all border formatting
- Maps borders from example sheet to test sheet
- Handles row offset for bottom bracket half
- Adds region name borders at correct positions
- Autosizes columns and disables text wrapping

**Usage:**
```bash
npm run apply-borders
```

### Diagnostic Scripts

Created for debugging and analysis (all in `src/`):

1. **`compare-bracket-layouts.ts`** - Compares checkbox positions between sheets
2. **`check-row33.ts`** - Verifies borders around row 33 transition
3. **`find-region-names.ts`** - Locates region name cells in both sheets
4. **`check-region-borders.ts`** - Checks borders around region name cells
5. **`check-example-region-borders.ts`** - Scans example sheet for region borders
6. **`find-all-region-borders.ts`** - Finds all boxed cells (cells with 4 borders)

### Alternative Approaches (Not Used)

- **`apply-bracket-borders.ts`** - Initial attempt (direct copy without offset)
- **`apply-borders-and-autosize.ts`** - Alternative approach using checkbox detection

## Key Findings

### Bracket Structure Differences

**Example Sheet:**
- 126 checkboxes across 12 columns
- Regions: Row 1-32 (ALPHA/GAMMA), Row 33-64 (BETA/DELTA)
- Continuous row numbering

**Test Sheet:**
- 126 checkboxes across same 12 columns
- Regions: Row 1-32 (ALPHA/GAMMA), Row 34-65 (BETA/DELTA)
- Row 33 is empty separator

### Checkbox Columns

Both sheets use identical checkbox columns:
- **Round 1**: A, AE (left/right sides)
- **Round 2**: D, AB
- **Round 3**: G, Y
- **Round 4**: J, V
- **Round 5**: M, S
- **Round 6**: O, Q

### Border Statistics

- **Total border updates**: 459 cells from example sheet
- **Additional borders**: 2 cells (region names E31, Y31)
- **API batches**: 5 batches of 100 requests each
- **Columns autosized**: 32 (A-AF)

## Verification

All borders verified correct:
- ✅ Match borders align with checkboxes in all columns
- ✅ No gaps in connector lines (including row 33/34 transition)
- ✅ Region name borders present at E15, Y15, E31, Y31
- ✅ Columns sized to fit text without wrapping

## Future Improvements

1. **Template Consistency**: Align test sheet row spacing with example sheet to eliminate offset logic
2. **Named Ranges**: Use named ranges for region labels instead of hardcoded cell positions
3. **Border Styles**: Support different border styles (dashed, dotted) for visual hierarchy
4. **Conditional Formatting**: Add color-coding for winners/losers

## Related Files

- **Main script**: `src/fix-bracket-borders.ts`
- **Package.json**: Added `"apply-borders"` script
- **Test sheet**: https://docs.google.com/spreadsheets/d/1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o/edit
- **Example sheet**: https://docs.google.com/spreadsheets/d/1Z83Lr02EW9wvpH3YfBvLwafHMIqyxJLXaO_0D85bMfk/edit

## References

- **Bracket Tab Spec**: [docs/reference/google-sheets/bracket-tab.md](docs/reference/google-sheets/bracket-tab.md)
- **Bracket Cell Mapping**: [docs/technical/specifications/bracket-cell-mapping.md](docs/technical/specifications/bracket-cell-mapping.md)
- **Bracket Formula Logic**: [docs/technical/specifications/bracket-formula-logic.md](docs/technical/specifications/bracket-formula-logic.md)
- **Google Sheets API**: [docs/technical/api/sheets-api.md](docs/technical/api/sheets-api.md)
