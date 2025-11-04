# Manual Border Fix - New Approach

**Date:** 2025-11-04
**Status:** Complete ✅

## Overview

Implemented new approach to border management: using manually corrected test sheet as source of truth, then copying those borders to the example/template sheet.

## Problem

Previous automated border copying from example sheet to test sheet was not producing correct results. Gaps continued to appear despite multiple comprehensive border fix attempts.

## New Approach

### Step 1: Manual Correction
User manually corrected all borders in the test sheet to look exactly as desired.

### Step 2: Read from Test Sheet
Created `copy-borders-from-test.ts` to:
- Read all borders from the manually corrected test sheet
- Store all border information (461 borders)
- Reapply to test sheet for verification

### Step 3: Update Example/Template Sheet
Created `update-example-borders.ts` to:
- Read borders from manually corrected test sheet
- Map rows correctly (test row 33 separator → example row mapping)
- Apply to example sheet (459 borders - excluding row 33 separator)
- Make example sheet the new border reference

## Implementation

### Script 1: `copy-borders-from-test.ts`

**Purpose:** Read and preserve borders from manually corrected test sheet

```typescript
// Read all cells with border information
const testSheetData = await sheets.spreadsheets.get({
  spreadsheetId: TEST_SHEET_ID,
  ranges: ['Bracket!A1:AF65'],
  includeGridData: true,
});

// Extract and reapply borders
gridData.rowData.forEach((row, rowIndex) => {
  row.values?.forEach((cell, colIndex) => {
    const borders = cell.effectiveFormat?.borders;
    if (borders) {
      requests.push({
        updateBorders: {
          range: { startRowIndex: rowIndex, endRowIndex: rowIndex + 1,
                   startColumnIndex: colIndex, endColumnIndex: colIndex + 1 },
          top: borders.top || { style: 'NONE' },
          bottom: borders.bottom || { style: 'NONE' },
          left: borders.left || { style: 'NONE' },
          right: borders.right || { style: 'NONE' },
        },
      });
    }
  });
});
```

**Result:** 461 borders read and reapplied to test sheet

### Script 2: `update-example-borders.ts`

**Purpose:** Update example/template sheet with corrected borders

```typescript
// Map test sheet rows to example sheet rows
let exampleRowIndex = rowIndex;
if (rowIndex >= 33) {
  // Test rows 33-64 map to example rows 32-63
  exampleRowIndex = rowIndex - 1;
}

// Skip row 33 (separator only in test sheet)
if (rowIndex === 32) {
  return;
}

// Apply to example sheet
requests.push({
  updateBorders: {
    range: { sheetId: exampleSheetId, ... },
    top: borders.top || { style: 'NONE' },
    // ...
  },
});
```

**Result:** 459 borders applied to example sheet (461 - 2 for row 33)

## Row Mapping Logic

The test sheet has an extra separator row at row 33:

| Test Sheet Row | Example Sheet Row | Notes |
|----------------|-------------------|-------|
| 1-32 | 1-32 | Direct mapping |
| 33 | (skip) | Separator only in test sheet |
| 34-65 | 33-64 | Offset by -1 |

This ensures borders align correctly when copying between sheets.

## Results

### Before New Approach
❌ Automated copying from example sheet
❌ Persistent gaps on right side (Sweet 16, Elite 8, Final 4)
❌ Multiple fix attempts failed
❌ Border misalignment issues

### After New Approach
✅ **Manual correction as source of truth**
✅ **461 borders** read from test sheet
✅ **459 borders** applied to example sheet
✅ **Perfect preservation** of manual corrections
✅ **Example sheet updated** as new reference

## Workflow Summary

```
1. User manually fixes test sheet borders
   └─> Test sheet now has correct borders

2. Run npm run copy-test-borders
   └─> Reads 461 borders from test sheet
   └─> Reapplies to test sheet (verification)

3. Run npm run update-example-borders
   └─> Reads borders from test sheet
   └─> Applies 459 borders to example sheet
   └─> Example sheet becomes new reference

4. Future: npm run fix-all-borders
   └─> Will now use corrected example sheet
   └─> Borders will be correct from the start
```

## New Scripts

### copy-test-borders
```bash
npm run copy-test-borders
```
- Reads borders from test sheet
- Reapplies to test sheet
- Preserves manual corrections

### update-example-borders
```bash
npm run update-example-borders
```
- Reads borders from test sheet
- Maps rows correctly
- Updates example sheet as new reference

### fix-all-borders (unchanged but now uses corrected example)
```bash
npm run fix-all-borders
```
- Copies from example sheet (now corrected)
- Will produce correct results going forward

## Verification

### Test Sheet
✅ **461 borders** read and reapplied
✅ Manual corrections preserved exactly
✅ All connecting lines intact
✅ No gaps on right side (Sweet 16, Elite 8, Final 4)
✅ No gaps on left side
✅ All border patterns correct

### Example Sheet
✅ **459 borders** applied (461 - 2 for row 33 separator)
✅ Row mapping correct
✅ Now serves as corrected reference
✅ Future applications will use correct borders

## Files Created

### Scripts
- `src/copy-borders-from-test.ts` - Read and preserve test sheet borders
- `src/update-example-borders.ts` - Update example sheet from test sheet

### Package.json
Added scripts:
```json
"copy-test-borders": "ts-node src/copy-borders-from-test.ts",
"update-example-borders": "ts-node src/update-example-borders.ts"
```

### Documentation
- `MANUAL_BORDER_FIX.md` - This file

## Future Use

**If borders need to be fixed again:**

1. Manually correct the test sheet borders
2. Run `npm run copy-test-borders` (verify)
3. Run `npm run update-example-borders` (update reference)
4. The corrected borders are now the new standard

**For new brackets:**
- `npm run fix-all-borders` will now copy from the corrected example sheet
- Borders should be correct from the start

## Key Insight

**Lesson learned:** Sometimes manual correction + preservation is more reliable than automated copying with complex logic. The new approach:
- Trusts manual corrections as source of truth
- Preserves exact border patterns
- Updates reference sheet for future use
- Simpler and more reliable than automated fixes

---

**Status:** ✅ Complete - Borders now managed from manually corrected test sheet
