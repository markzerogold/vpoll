# Bracket Structure Issues - Analysis

**Date:** 2025-11-07
**Test Sheet:** https://docs.google.com/spreadsheets/d/1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w/edit
**Reference Sheet:** https://docs.google.com/spreadsheets/d/1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o/edit
**Evidence:** debug/Screenshot 2025-11-07 075634.png

## Problems Identified

### 1. Round 2 Row Offset Issue
**Expected (Reference Sheet):**
- Round 1 Match 1: Rows 2-3 (A2:B3)
- Round 2 Match 1: Rows 4-5 (D4:E5)

**Actual (Test Sheet Screenshot):**
- Round 1 Match 1: Rows 2-3 ✓
- Round 2 Match 1: Rows 5-6 ❌ (one row too low!)
- Row 4 in column D appears blank

**Code Analysis (generate-bracket.ts:551):**
```typescript
allCells.push(...generateRound2Region(4, false));  // ALPHA left
```
Code says row 4, but screenshot shows row 5. **Possible cause: Row numbering offset or extra row insertion.**

### 2. Duplicate/Ghost Data at Rows 8-9
**Observed in Screenshot:**
- Rows 8-9 show "FALSE" and "TRUE" as **text** (not checkboxes)
- Same participant names appear: "(1) Spock" and "(4) William Riker"
- This appears to be duplicate data from Round 2 rows 5-6

**This suggests:** Formulas or values are being written to wrong rows, or there's duplicate cell generation.

### 3. Border Positioning Error
**Expected:** Borders around 2-row match boxes (participants 1 and 2)

**Actual:** Borders extend 3 rows instead of 2
- Round 2 Match 1 box borders rows 5-7 (should be 5-6)
- Borders include an extra blank row below each match

**Likely Cause:** Border generation in `apply-bracket-formatting.ts` is calculating row ranges incorrectly.

### 4. Region Name Positioning Wrong
**Expected (Reference Sheet):**
- Row 15: ALPHA and GAMMA region names
- Row 31: BETA and DELTA region names

**Actual (Test Sheet):**
- Row 16: "Federation" (ALPHA) ❌ Should be row 15
- Row 29: "Klingon Empire" (BETA) ❌ Should be row 31

**Code (generate-bracket.ts:56-59):**
```typescript
cells.push({ row: 15, col: 'E', formula: '=Regions!B2' }); // ALPHA
cells.push({ row: 15, col: 'Y', formula: '=Regions!D2' }); // GAMMA
cells.push({ row: 31, col: 'E', formula: '=Regions!C2' }); // BETA
cells.push({ row: 31, col: 'Y', formula: '=Regions!E2' }); // DELTA
```

Code says rows 15 and 31, screenshot shows rows 16 and 29. **Consistent 1-row offset.**

### 5. Region Names Not in Merged Cells
**Expected:** Region names in merged cells spanning multiple columns with colored backgrounds

**Actual:** Region names appear in single cells without merging or special formatting

**Note:** Reference analysis showed headers in row 1 are NOT merged, but region names might be.

## Root Cause Hypothesis

All issues point to **a consistent 1-row offset error**:
- Round 2 appears 1 row too low (row 5 instead of 4)
- Region name ALPHA appears 1 row too low (row 16 instead of 15)
- Region name BETA appears 2 rows too high (row 29 instead of 31)

**Possible causes:**
1. **Excel/Sheets indexing confusion:** Code uses 1-based row numbers, but an offset is applied somewhere
2. **Header row not accounted for:** Extra blank row being inserted after headers
3. **Formula write vs validation write mismatch:** Checkbox values written to different rows than validation

## Investigation Needed

### Check populate-test-sheet.ts
Look for any row number transformations when writing cells:
```typescript
// Does this code transform row numbers?
bracketCells.forEach(cell => {
  const cellAddress = `Bracket!${cell.col}${cell.row}`;
  // Is cell.row used directly, or is there an offset?
});
```

### Check generate-bracket.ts Match Spacing
Round 1 matches should be 4 rows apart:
- Match 1: rows 2-3
- Match 2: rows 6-7
- Match 3: rows 10-11
- etc.

Currently using: `matchStartRow = startRow + (match * 4)` (line 85)

For startRow=2, match=0: row 2 ✓
For startRow=2, match=1: row 6 ✓
For startRow=2, match=2: row 10 ✓

**This looks correct for Round 1.**

Round 2 matches should be 8 rows apart:
- Match 1: rows 4-5
- Match 2: rows 12-13
- Match 3: rows 20-21
- Match 4: rows 28-29

Currently using: `matchStartRow = startRow + (match * 8)` (line 174)

For startRow=4, match=0: row 4 ✓
For startRow=4, match=1: row 12 ✓

**This looks correct for Round 2.**

### Check Border Generation (apply-bracket-formatting.ts)
The borders are extending 1 row too low. Need to check how match box height is calculated.

Expected: 2 rows per match (2 participants)
Actual: 3 rows (includes extra blank row)

## Testing Plan

1. **Compare cell-by-cell:** Read cells D4:E9 from test sheet and compare to expected values
2. **Check for blank rows:** Are there unexpected blank rows being inserted?
3. **Trace row numbers:** Add logging to see what rows are actually being written
4. **Test with minimal bracket:** Generate only 1 match to isolate the issue

## Related Files

- `src/generate-bracket.ts` - Bracket cell generation logic
- `src/populate-test-sheet.ts` - Cell writing to sheet
- `src/apply-bracket-formatting.ts` - Border and formatting application
- `BRACKET_POPULATION_ISSUE_ANALYSIS.md` - Previous checkbox value bug (FIXED)

---

**Status:** Analysis complete, root cause investigation needed
**Next Step:** Add detailed logging to populate script and compare generated cells to written cells
