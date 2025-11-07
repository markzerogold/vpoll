# Bracket Population Issue - Root Cause Analysis
**Date:** 2025-11-07
**Issue:** Bracket population missing elements and showing incorrect format

## Problem Summary

The generated bracket in https://docs.google.com/spreadsheets/d/1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w/edit shows:
1. TRUE/FALSE text visible instead of checkbox behavior
2. Wrong layout structure
3. Missing proper formatting
4. Region headers not properly positioned

**Evidence:** `debug/bad-Screenshot 2025-11-07 072152.png`

## Reference Sheet (Correct Format)

**URL:** https://docs.google.com/spreadsheets/d/1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o/edit

### Correct Structure (From Analysis)

**Round 1 Format:**
- Column A: Checkboxes (boolean TRUE/FALSE, not text)
- Column B: Participant formulas: `="("&Regions!$A$3&") "&Regions!$B$3`
- Row 2: Participant 1
- Row 3: Participant 2

**Round 2 Format:**
- Column D: Checkboxes
- Column E: **Winner lookup formulas**: `=IFERROR(VLOOKUP(TRUE,$A$2:$B$3,2,FALSE),"")`
  - This automatically pulls winners from Round 1!
  - Searches for TRUE in checkbox column, returns corresponding participant name

**Key Insight:** Round 2+ uses VLOOKUP formulas that reference previous round checkboxes. When a checkbox is marked TRUE, the formula automatically displays that participant in the next round.

## Root Cause: Checkbox Values Not Written

**File:** `src/populate-test-sheet.ts`

**Lines 416-497:** The populate logic has a critical bug:

```typescript
// Lines 416-435: Cells are categorized
bracketCells.forEach(cell => {
  if (cell.isCheckbox) {
    checkboxCells.push({ range: cellAddress, value: cell.value ?? false });
  } else if (cell.formula) {
    formulaCells.push({ range: cellAddress, values: [[cell.formula]] });
  } else if (cell.value !== undefined) {
    valueCells.push({ range: cellAddress, values: [[cell.value]] });
  }
});

// Lines 438-447: Only formulas and values are written
await sheets.spreadsheets.values.batchUpdate({
  spreadsheetId,
  requestBody: {
    valueInputOption: 'USER_ENTERED',
    data: [...formulaCells, ...valueCells], // ❌ checkboxCells NOT included!
  },
});

// Lines 450-497: Only data validation is added to checkboxes
await sheets.spreadsheets.batchUpdate({
  spreadsheetId,
  requestBody: {
    requests: checkboxRequests, // Only adds BOOLEAN validation
  },
});
```

**The Problem:**
1. Checkbox cells are collected in `checkboxCells` array
2. Only `formulaCells` and `valueCells` are written (line 444)
3. `checkboxCells` are only used for data validation (lines 452-497)
4. **Initial FALSE values are never written to cells**

**Result:**
- Checkboxes exist (validation added)
- But cells are empty (no initial value)
- VLOOKUP formulas in Round 2+ fail because they're looking for TRUE in empty cells
- Display shows strange behavior

## Fix Required

### Option 1: Write Checkbox Values Before Validation
```typescript
// Write checkbox initial values first
if (checkboxCells.length > 0) {
  const checkboxValueUpdates = checkboxCells.map(cell => ({
    range: cell.range,
    values: [[false]] // Write FALSE as initial value
  }));

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data: checkboxValueUpdates,
    },
  });
}

// Then add checkbox validation
// ... existing validation code ...
```

### Option 2: Include Checkboxes in valueCells
```typescript
bracketCells.forEach(cell => {
  if (cell.isCheckbox) {
    // Add to valueCells instead of separate array
    valueCells.push({
      range: cellAddress,
      values: [[false]]
    });
    checkboxCells.push({ range: cellAddress }); // For validation only
  } else if (cell.formula) {
    // ... rest of code
  }
});
```

### Option 3: Combined Write
```typescript
// Write all at once: formulas, values, AND checkbox values
await sheets.spreadsheets.values.batchUpdate({
  spreadsheetId,
  requestBody: {
    valueInputOption: 'USER_ENTERED',
    data: [
      ...formulaCells,
      ...valueCells,
      ...checkboxCells.map(cb => ({ range: cb.range, values: [[false]] }))
    ],
  },
});
```

## Additional Issues Found

### 1. Merged Cells Not Created
**User Request:** "merge cells before populating the formulas and borders, so the row calculations are not off"

**Current State:** No merge operations found in populate script

**Fix Needed:** Add merge cell requests for:
- Round headers (row 1)
- Region name headers
- Championship section

**Implementation:**
```typescript
const mergeRequests = [
  // Round 1 header (A1:C1)
  {
    mergeCells: {
      range: {
        sheetId: bracketSheetId,
        startRowIndex: 0,
        endRowIndex: 1,
        startColumnIndex: 0,
        endColumnIndex: 3,
      },
      mergeType: 'MERGE_ALL',
    },
  },
  // ... more merges for other headers
];

// Apply BEFORE writing formulas
await sheets.spreadsheets.batchUpdate({
  spreadsheetId,
  requestBody: { requests: mergeRequests },
});
```

### 2. Checkbox Count Discrepancy
**Observed:** Populate log says "136 formulas" but formatting finds "126 checkboxes"

**Investigation Needed:**
- Are 10 cells being written with formulas that shouldn't be checkboxes?
- Are some checkbox validations failing silently?
- Check generate-bracket.ts output cell counts

### 3. Region Header Positioning
**Reference sheet row 17:** Region names should be in specific cells with proper formatting

**Current code (lines 56-59 of generate-bracket.ts):**
```typescript
cells.push({ row: 15, col: 'E', formula: '=Regions!B2' }); // ALPHA
cells.push({ row: 15, col: 'Y', formula: '=Regions!D2' }); // GAMMA
cells.push({ row: 31, col: 'E', formula: '=Regions!C2' }); // BETA
cells.push({ row: 31, col: 'Y', formula: '=Regions!E2' }); // DELTA
```

**Verify:** Do these match the reference sheet's region header locations?

## Files Involved

1. **`src/populate-test-sheet.ts`** - Main populate script with checkbox bug
2. **`src/generate-bracket.ts`** - Generates bracket cell layout (appears correct)
3. **`src/apply-bracket-formatting.ts`** - Applies borders/colors (runs after populate)

## Testing Steps After Fix

1. Create fresh blank sheet
2. Run populate script with fixes:
   - ✅ Merge cells first
   - ✅ Write checkbox values
   - ✅ Add checkbox validation
   - ✅ Write formulas and other values
3. Verify in sheet:
   - ✅ Checkboxes show as checkboxes (not TRUE/FALSE text)
   - ✅ Round 1 formulas display participant names
   - ✅ Round 2+ formulas show empty (no winners yet)
   - ✅ Region headers properly positioned and merged
   - ✅ Round headers merged across correct columns
4. Run simulation test
5. Check that marking checkboxes TRUE makes Round 2 display winners

## Related Issues

- Tournament simulation Round 3+ progression bug (separate issue)
- Winner pairing logic in simulate-tournament.ts (documented in run2-comprehensive-summary.md)

## Priority

**HIGH** - Blocks ability to create working test sheets for simulation testing

## Recommended Approach

1. **First:** Fix checkbox value writing (Option 3 - Combined Write)
2. **Second:** Add merged cell operations before formula writing
3. **Third:** Verify region header positioning matches reference sheet
4. **Fourth:** Test with fresh sheet population
5. **Fifth:** Run simulation to verify VLOOKUP formulas work correctly

---

**Next Session:** Implement fixes and test with fresh sheet population
