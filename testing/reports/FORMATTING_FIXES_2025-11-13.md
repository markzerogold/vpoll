# Bracket Formatting Fixes - November 13, 2025

**Date:** 2025-11-13
**Issue:** Multiple formatting problems identified in test bracket
**Status:** ✅ All fixes implemented, awaiting testing confirmation

---

## Issues Identified from Screenshot

Based on screenshot `Screenshot 2025-11-13 063308.png`, the following issues were found:

1. ❌ **Column E text cutoff** - "Sweet 16" displayed as "Sweet 1"
2. ❌ **Column Y text cutoff** - "Sweet 16" displayed as "Sweet 1", "Romulan Star Empire" truncated
3. ❌ **Border gaps in row 33** - Missing/incomplete borders around row 33
4. ❌ **Missing right borders** - Columns S, V, Y missing right-side borders
5. ❌ **Championship cell incorrect merge** - Merged vertically (O17:O18) instead of horizontally (O17:Q17)
6. ❌ **Championship cell no autosize** - Columns not sized to fit variable text

---

## Fixes Implemented

### 1. Column Autosizing Fix (`fix-bracket-borders.ts`)

**Problem:** Columns E and Y were not properly autosized, causing text overflow.

**Solution:**
- Split autosizing into separate operations
- First: Disable text wrapping for all cells
- Second: Autosize all columns A-AF
- Third: Explicitly autosize critical columns E, Y, S, V

**Code Changes:**
```typescript
// Explicitly autosize critical columns E, Y, S, V (Sweet 16, Elite 8, Championship)
console.log('  Autosizing critical columns E, Y, S, V explicitly...');
await sheets.spreadsheets.batchUpdate({
  spreadsheetId: TEST_SHEET_ID,
  requestBody: {
    requests: [
      { autoResizeDimensions: { dimensions: { sheetId, dimension: 'COLUMNS', startIndex: 4, endIndex: 5 } } }, // E
      { autoResizeDimensions: { dimensions: { sheetId, dimension: 'COLUMNS', startIndex: 18, endIndex: 19 } } }, // S
      { autoResizeDimensions: { dimensions: { sheetId, dimension: 'COLUMNS', startIndex: 21, endIndex: 22 } } }, // V
      { autoResizeDimensions: { dimensions: { sheetId, dimension: 'COLUMNS', startIndex: 24, endIndex: 25 } } }, // Y
    ],
  },
});
```

**Files Modified:**
- `testing/scripts/active/fix-bracket-borders.ts` - Lines 232-298

---

### 2. Missing Right Borders Fix (`fix-bracket-borders.ts`)

**Problem:** Columns S, V, Y were missing right-side borders, causing bracket lines to appear incomplete.

**Solution:** Added new function `addMissingRightBorders()` to explicitly add right borders to these columns.

**Code Changes:**
```typescript
async function addMissingRightBorders(sheets: any, sheetId: number): Promise<void> {
  console.log('📝 Adding missing right borders (columns S, V, Y)...');

  const borderStyle = {
    style: 'SOLID',
    width: 1,
    color: { red: 0, green: 0, blue: 0 },
  };

  const columnsToFix = [
    { index: 18, letter: 'S' },  // Championship
    { index: 21, letter: 'V' },  // Elite 8 right
    { index: 24, letter: 'Y' },  // Sweet 16 right
  ];

  for (const col of columnsToFix) {
    requests.push({
      updateBorders: {
        range: {
          sheetId,
          startRowIndex: 0,
          endRowIndex: 70,
          startColumnIndex: col.index,
          endColumnIndex: col.index + 1,
        },
        right: borderStyle,
      },
    });
  }
}
```

**Main Function Updated:**
```typescript
// Add missing right borders to columns S, V, Y
await addMissingRightBorders(sheets, sheetId);
```

**Files Modified:**
- `testing/scripts/active/fix-bracket-borders.ts` - Lines 232-279 (new function)
- `testing/scripts/active/fix-bracket-borders.ts` - Line 426 (call in main)

---

### 3. Championship Cell Merge Fix (`complete-bracket-test.ts`)

**Problem:** Championship cell was merged vertically (O17:O18) instead of horizontally (O17:Q17), causing incorrect layout.

**Solution:** Changed merge range from 2 rows × 1 column to 1 row × 3 columns.

**Code Changes:**

**Before:**
```typescript
// Update O18 with formula
await sheets.spreadsheets.values.update({
  spreadsheetId,
  range: 'Bracket!O18',
  valueInputOption: 'USER_ENTERED',
  requestBody: {
    values: [['=Config!B3&" Champion"']],
  },
});

// Merge O17:O18 for Championship label
mergeCells: {
  range: {
    sheetId,
    startRowIndex: 16, // Row 17 (0-indexed)
    endRowIndex: 18,   // Row 18
    startColumnIndex: 14, // Column O
    endColumnIndex: 15,
  },
  mergeType: 'MERGE_ALL',
}
```

**After:**
```typescript
// Update O17 with formula (merged cell stores formula in top-left)
await sheets.spreadsheets.values.update({
  spreadsheetId,
  range: 'Bracket!O17',
  valueInputOption: 'USER_ENTERED',
  requestBody: {
    values: [['=Config!B3&" Champion"']],
  },
});

// Merge O17:Q17 horizontally for Championship label
mergeCells: {
  range: {
    sheetId,
    startRowIndex: 16, // Row 17 (0-indexed)
    endRowIndex: 17,   // Row 17 (exclusive end)
    startColumnIndex: 14, // Column O (0-indexed)
    endColumnIndex: 17,   // Column Q (0-indexed, exclusive end)
  },
  mergeType: 'MERGE_ALL',
}
```

**Files Modified:**
- `testing/scripts/active/complete-bracket-test.ts` - Lines 211-293

---

### 4. Championship Cell Autosize (`complete-bracket-test.ts`)

**Problem:** Championship columns (O, P, Q) were not autosized to fit the variable-length championship text.

**Solution:** Added explicit autosizing for championship columns after merge and formatting.

**Code Changes:**
```typescript
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
```

**Files Modified:**
- `testing/scripts/active/complete-bracket-test.ts` - Lines 274-293

---

### 5. Verification Fix (`complete-bracket-test.ts`)

**Problem:** Verification was checking O18 for the championship formula, but the formula is now in O17 (top-left of merged range).

**Solution:** Updated verification to read from O17 instead of O18.

**Code Changes:**
```typescript
// Check Championship cell formula (merged cell O17:Q17)
const champCellValue = await sheets.spreadsheets.values.get({
  spreadsheetId,
  range: 'Bracket!O17',
});
```

**Files Modified:**
- `testing/scripts/active/complete-bracket-test.ts` - Lines 349-362

---

### 6. Documentation Updates

Updated all references to championship cell merge in documentation:

**Files Modified:**
- `testing/scripts/active/populate-test-sheet.ts` - Line 516 (comment update)
- `testing/reports/COMPLETE_BRACKET_TEST_SUMMARY.md` - Lines 39, 81, 115 (O17:O18 → O17:Q17)

---

## Testing Required

After these fixes, the following should be verified:

### Column Sizing
- [ ] Column E displays full "Sweet 16" text without cutoff
- [ ] Column Y displays full "Sweet 16" text without cutoff
- [ ] Column Y displays full region name (e.g., "Romulan Star Empire") without truncation
- [ ] Columns S, V also properly sized

### Borders
- [ ] Row 33 has complete borders with no gaps
- [ ] Column S has right border along full height
- [ ] Column V has right border along full height
- [ ] Column Y has right border along full height
- [ ] All bracket match cells have proper borders

### Championship Cell
- [ ] Championship cell is merged horizontally (O17:Q17)
- [ ] Championship cell is NOT merged vertically
- [ ] Formula displays correctly: "[Tournament Name] Champion"
- [ ] Cell is centered, 16pt bold, light gold background
- [ ] Columns O, P, Q are sized to fit the text
- [ ] Text does not wrap or overflow

---

## Summary of Script Changes

| Script | Changes | Lines Modified |
|--------|---------|----------------|
| `fix-bracket-borders.ts` | - Split column autosizing into 3 operations<br>- Added explicit autosizing for E, Y, S, V<br>- Added `addMissingRightBorders()` function<br>- Called new function in main() | 232-298, 426 |
| `complete-bracket-test.ts` | - Changed championship merge from O17:O18 to O17:Q17<br>- Moved formula from O18 to O17<br>- Added championship column autosizing<br>- Updated verification to check O17 | 211-293, 349-362 |
| `populate-test-sheet.ts` | - Updated comment to reflect O17:Q17 merge | 516 |
| `COMPLETE_BRACKET_TEST_SUMMARY.md` | - Updated all references to O17:Q17<br>- Added autosize details | 39, 81, 115-118 |

---

## Expected Test Results

When `npm run complete-bracket-test <sheet-id>` is run, the output should show:

```
✅ Columns autosized, text wrapping disabled
  Autosizing critical columns E, Y, S, V explicitly...
✅ Right borders added to columns S, V, Y
✅ Cells O17:Q17 merged (horizontal)
  ✓ Autosizing championship columns (O, P, Q)...
✅ Championship cell complete
  Championship cell formula: =Config!B3&" Champion"
  ✅ Championship cell has correct content
```

---

## Files Modified Summary

### Scripts
1. `testing/scripts/active/fix-bracket-borders.ts` - Border and column autosizing fixes
2. `testing/scripts/active/complete-bracket-test.ts` - Championship cell merge and autosize
3. `testing/scripts/active/populate-test-sheet.ts` - Documentation comment update

### Documentation
4. `testing/reports/COMPLETE_BRACKET_TEST_SUMMARY.md` - Updated championship cell references
5. `testing/reports/FORMATTING_FIXES_2025-11-13.md` - This file

---

**Status:** ✅ Ready for testing
**Next Step:** Run `npm run complete-bracket-test <sheet-id>` and verify all issues are resolved
