# Debug Screenshots and Diagnostic Tools

This folder contains screenshots and diagnostic information for troubleshooting bracket border alignment issues.

## Screenshots

### bracket-Screenshot 2025-10-30 190555.png
**Issue identified:** Border misalignment in test bracket sheet
- Match borders were one row too high in bottom bracket half
- Region name borders missing for Klingon Empire (E31) and Dominion (Y31)
- Gap at row 33/34 transition

**Root cause:** Test sheet has different row spacing than example sheet
- Example: Continuous rows, BETA region starts at row 33
- Test: Empty separator at row 33, BETA region starts at row 34

### Earlier Screenshots
- `bracket-Screenshot 2025-10-24 070936.png` - Earlier bracket state
- `results-Screenshot 2025-10-24 071235.png` - Results tab reference

## Diagnostic Scripts

Created to analyze and fix the border alignment issues:

### Analysis Tools
- **`compare-bracket-layouts.ts`** - Compare checkbox positions between example and test sheets
- **`check-row33.ts`** - Verify borders around row 33 transition point
- **`find-region-names.ts`** - Locate region name cells in both sheets
- **`check-region-borders.ts`** - Check borders around specific region name cells
- **`check-example-region-borders.ts`** - Scan example sheet for region border patterns
- **`find-all-region-borders.ts`** - Find all cells with complete borders (boxed cells)

### Key Findings

**Checkbox Positions:**
```
Example Sheet          Test Sheet
─────────────────     ─────────────────
ALPHA: Rows 2-31      ALPHA: Rows 2-31 (matches ✅)
Row 33: BETA starts   Row 33: Empty separator
BETA: Rows 33-64      BETA: Rows 34-65 (+1 offset ❌)
```

**Region Name Positions:**
```
Example Sheet          Test Sheet
─────────────────     ─────────────────
ALPHA: E15 ✅          Federation: E15 ✅
GAMMA: Y15 ✅          Romulan Star Empire: Y15 ✅
BETA: E46              Klingon Empire: E31 (different position ❌)
DELTA: Y46             Dominion: Y31 (different position ❌)
```

## Solution Implemented

See [BRACKET_BORDER_UPDATES.md](../BRACKET_BORDER_UPDATES.md) for complete implementation details.

**Key fix:**
```typescript
function mapRow(exampleRow: number): number {
  if (exampleRow >= 33) {
    return exampleRow + 1; // +1 offset for bottom half
  }
  return exampleRow;
}
```

Plus explicit borders added for E31 and Y31 region names.

## Running Diagnostics

```bash
# Compare layouts
npx ts-node src/compare-bracket-layouts.ts

# Check specific rows
npx ts-node src/check-row33.ts

# Find region names
npx ts-node src/find-region-names.ts

# Apply fixed borders
npm run apply-borders
```
