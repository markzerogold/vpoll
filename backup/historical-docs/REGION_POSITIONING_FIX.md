# Region Name Positioning Fix

**Date:** 2025-11-03
**Status:** Complete ✅

## Overview

Moved bottom region names (Klingon Empire, Dominion) from row 31 to row 47 to match the example sheet structure and ensure proper bracket layout.

## Problem

The bottom region names were incorrectly positioned at row 31, which caused:
- Mismatch with example sheet (where bottom regions are at row 46)
- Improper alignment with bracket structure
- Potential border connection issues

## Solution

### Row Positioning

**Top Regions (unchanged):**
- Federation (ALPHA): E15:G18
- Romulan Star Empire (GAMMA): Y15:AA18

**Bottom Regions (moved):**
- **Before:** Row 31 (E31:G34, Y31:AA34)
- **After:** Row 47 (E47:G50, Y47:AA50)

### Why Row 47?

The example sheet places bottom regions at row 46. However, the test sheet has:
- Row 33 as an empty separator between top and bottom bracket halves
- This creates a +1 offset for all rows below row 33

Therefore:
- Example row 46 → Test sheet row 47

## Implementation

### Script: `move-bottom-regions.ts`

The migration script performs these steps:

#### 1. Unmerge Old Cells
```typescript
unmergeCells: {
  range: {
    startRowIndex: 30,  // Row 31
    endRowIndex: 34,     // 4 rows
    startColumnIndex: colToIndex('E'),
    endColumnIndex: colToIndex('G') + 1  // 3 columns
  }
}
```

Unmerges both region cells at row 31 (E31:G34 and Y31:AA34)

#### 2. Clear Content
```typescript
await sheets.spreadsheets.values.clear({
  spreadsheetId: TEST_SHEET_ID,
  range: 'Bracket!E31:G34',
});
```

Removes region name text from old cells

#### 3. Reset Formatting
```typescript
// Remove background colors, bold text
repeatCell: {
  range: { ... },
  cell: {
    userEnteredFormat: {
      backgroundColor: { red: 1, green: 1, blue: 1 },  // White
      textFormat: { bold: false, fontSize: 10 },
      horizontalAlignment: 'LEFT',
    }
  }
}

// Clear all borders
updateBorders: {
  range: { ... },
  top: { style: 'NONE' },
  bottom: { style: 'NONE' },
  left: { style: 'NONE' },
  right: { style: 'NONE' },
  innerHorizontal: { style: 'NONE' },
  innerVertical: { style: 'NONE' },
}
```

Returns row 31 cells to default state

#### 4. Write Region Names to Row 47
```typescript
await sheets.spreadsheets.values.update({
  spreadsheetId: TEST_SHEET_ID,
  range: 'Bracket!E47',
  valueInputOption: 'USER_ENTERED',
  requestBody: {
    values: [['=Regions!C2']],  // Formula pulls from Regions tab
  },
});
```

Uses formulas to dynamically pull region names from Regions tab

#### 5. Merge New Cells
```typescript
mergeCells: {
  range: {
    startRowIndex: 46,  // Row 47
    endRowIndex: 50,    // 4 rows (47-50)
    startColumnIndex: colToIndex('E'),
    endColumnIndex: colToIndex('G') + 1,  // 3 columns (E-G)
  },
  mergeType: 'MERGE_ALL',
}
```

Creates 3×4 merged cell block at row 47

#### 6. Apply Formatting
```typescript
repeatCell: {
  range: { ... },
  cell: {
    userEnteredFormat: {
      backgroundColor: REGION_COLORS.BETA,  // Light orange
      textFormat: { bold: true, fontSize: 22 },
      horizontalAlignment: 'CENTER',
      verticalAlignment: 'MIDDLE',
    }
  }
}
```

Applies color, text size, and alignment to new cells

#### 7. Reapply Borders
```typescript
// Read borders from example sheet rows 46-50
const exampleSheetData = await sheets.spreadsheets.get({
  spreadsheetId: EXAMPLE_SHEET_ID,
  ranges: ['Bracket!A46:AF50'],
  includeGridData: true,
});

// Apply to test sheet rows 47-51
updateBorders: {
  range: { startRowIndex: testRow - 1, ... },
  top: borders.top,
  bottom: borders.bottom,
  left: borders.left,
  right: borders.right,
}
```

Copies border patterns from example sheet to ensure proper bracket line connections

## Results

### Before (Incorrect)
```
Row 15: Federation (ALPHA)              Row 15: Romulan Star Empire (GAMMA)
...
Row 31: Klingon Empire (BETA) ❌       Row 31: Dominion (DELTA) ❌
```

### After (Correct)
```
Row 15: Federation (ALPHA)              Row 15: Romulan Star Empire (GAMMA)
...
Row 47: Klingon Empire (BETA) ✅       Row 47: Dominion (DELTA) ✅
```

## Verification

✅ **Old cells cleared:** Row 31 (E31:G34, Y31:AA34) returned to normal
✅ **New cells created:** Row 47 (E47:G50, Y47:AA50) with proper formatting
✅ **Background colors:** BETA (orange), DELTA (salmon) applied
✅ **Text formatting:** 22pt bold, centered
✅ **Borders:** 34 border updates from example sheet applied
✅ **Merged cells:** 3×4 blocks at correct positions

## Updated Scripts

### Main Styling Script Updated

`src/apply-bracket-styling.ts` now creates bottom regions at row 47 from the start:

```typescript
const regionMerges = [
  { startRow: 15, startCol: 'E', endCol: 'G', rows: 4, region: 'ALPHA' },
  { startRow: 15, startCol: 'Y', endCol: 'AA', rows: 4, region: 'GAMMA' },
  { startRow: 47, startCol: 'E', endCol: 'G', rows: 4, region: 'BETA' },    // ← Updated
  { startRow: 47, startCol: 'Y', endCol: 'AA', rows: 4, region: 'DELTA' },  // ← Updated
];
```

## Usage

### One-Time Migration
```bash
npm run move-regions
```

Moves existing bottom regions from row 31 to row 47.

### Future Brackets
```bash
npm run apply-styling
```

Creates regions at correct positions from the start (no migration needed).

## Related Changes

### Files Modified
- `src/move-bottom-regions.ts` - Migration script (new)
- `src/apply-bracket-styling.ts` - Updated to use row 47
- `package.json` - Added "move-regions" command

### Documentation
- `REGION_POSITIONING_FIX.md` - This file

## Technical Details

### Border Connection Points

With regions at row 47, borders connect properly to:
- **Row 34:** Last match of bottom Round 1 (left side)
- **Row 46:** Connector lines from top bracket
- **Row 47-50:** Region name cell borders
- **Row 51:** First match of bottom Elite 8

### Formula References

Region names use formulas to pull from Regions tab:
```
E47: =Regions!C2  (Klingon Empire from column C)
Y47: =Regions!E2  (Dominion from column E)
```

This maintains single source of truth for region names.

## Testing Checklist

✅ **Old row 31 cleared** - No colored cells, no borders, no text
✅ **New row 47 formatted** - Colored backgrounds, 22pt bold text
✅ **Merged cells** - 3×4 blocks at E47:G50 and Y47:AA50
✅ **Borders match example** - 34 border updates applied
✅ **Formulas working** - Region names display from Regions tab
✅ **Bracket lines** - Connections look correct

## Future Considerations

If we eliminate the row 33 separator in the future:
- Bottom regions would move to row 46 (matching example exactly)
- No +1 offset needed
- Update both scripts to use row 46

---

**Status:** ✅ Complete - Bottom regions now at row 47, matching bracket structure
