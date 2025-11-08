# Bracket Formatting Fix Summary

**Date:** 2025-11-08
**Issue:** Screenshot showed three formatting problems
**Status:** All issues resolved

---

## Problems Identified (Screenshot 2025-11-08 063127.png)

### 1. Headers Not Merged
**Problem:** Row 1 headers (Round 1, Round 2, Sweet 16, etc.) appeared in single cells instead of spanning 2 columns each.

**Root Cause:** populate-test-sheet.ts had code that skipped cell merging with comment "Reference sheet does NOT use merged headers"

**Fix:** Removed skip code, added Step 1.5 to merge 10 header ranges BEFORE data population

### 2. Region Names Incorrectly Formatted
**Problem:** Region names (Federation, Klingon Empire, Romulan Star Empire, Dominion) had:
- White/black background instead of colored backgrounds
- Wrong font size (10pt instead of 24pt)
- Not bold

**Root Cause:** No region name formatting code in populate-test-sheet.ts

**Fix:** Added Step 1.6 to format all 4 region name cells with:
- Correct background colors (light blue for left side, light green for right side)
- Font size 24pt, bold, black text
- Center alignment

### 3. Missing Borders on Columns Y and AA
**Problem:** Right side Round 2 area (columns Y and AA) had no borders around match boxes

**Root Cause:** Border application script only copied borders from main bracket area, missed Y:AA range

**Fix:** Created add-missing-formatting.ts to read and apply 54 additional border cells from example sheet for columns Y:AA

---

## Implementation Details

### Step 1.5: Merge Header Cells (populate-test-sheet.ts lines 428-463)

```typescript
const merges = [
  // Left side headers
  { startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 2 }, // A1:B1 Round 1
  { startRowIndex: 0, endRowIndex: 1, startColumnIndex: 3, endColumnIndex: 5 }, // D1:E1 Round 2
  { startRowIndex: 0, endRowIndex: 1, startColumnIndex: 6, endColumnIndex: 8 }, // G1:H1 Sweet 16
  { startRowIndex: 0, endRowIndex: 1, startColumnIndex: 9, endColumnIndex: 11 }, // J1:K1 Elite 8
  { startRowIndex: 0, endRowIndex: 1, startColumnIndex: 12, endColumnIndex: 14 }, // M1:N1 Final 4
  { startRowIndex: 0, endRowIndex: 1, startColumnIndex: 15, endColumnIndex: 19 }, // P1:S1 Championship
  // Right side headers
  { startRowIndex: 0, endRowIndex: 1, startColumnIndex: 20, endColumnIndex: 22 }, // U1:V1 Elite 8
  { startRowIndex: 0, endRowIndex: 1, startColumnIndex: 23, endColumnIndex: 25 }, // X1:Y1 Sweet 16
  { startRowIndex: 0, endRowIndex: 1, startColumnIndex: 26, endColumnIndex: 28 }, // AA1:AB1 Round 2
  { startRowIndex: 0, endRowIndex: 1, startColumnIndex: 29, endColumnIndex: 31 }, // AD1:AE1 Round 1
];
```

**When:** Step 1.5 - After data written, BEFORE formulas and checkboxes
**Why:** Merging must happen before borders so border calculations use merged cell dimensions

### Step 1.6: Format Region Names (populate-test-sheet.ts lines 465-513)

```typescript
const regionNameFormats = [
  // Federation (E15) - Light blue background
  { row: 14, col: 4, color: { red: 0.8117647, green: 0.8862745, blue: 0.9529412 } },
  // Klingon Empire (E31) - Light blue background
  { row: 30, col: 4, color: { red: 0.8117647, green: 0.8862745, blue: 0.9529412 } },
  // Romulan Star Empire (Y15) - Light green background
  { row: 14, col: 24, color: { red: 0.8509804, green: 0.91764706, blue: 0.827451 } },
  // Dominion (Y31) - Light green background
  { row: 30, col: 24, color: { red: 0.8509804, green: 0.91764706, blue: 0.827451 } },
];

// Apply: 24pt font, bold, black text, center aligned
```

**When:** Step 1.6 - After merging, BEFORE formulas
**Why:** Region names are static text that needs styling before borders applied

### Standalone Formatting Script (add-missing-formatting.ts)

Created for applying missing formatting to already-populated sheets:

1. **Merge header cells** - Same 10 ranges as populate script
2. **Format region names** - Reads example sheet, applies to test sheet
3. **Apply Y:AA borders** - Reads 54 border cells from example sheet, applies to test sheet

**Usage:**
```bash
npx ts-node src/add-missing-formatting.ts <sheet-id>
```

---

## Correct Population Order

### Old (Broken) Order
1. Populate data
2. Skip merging
3. Apply borders ← Wrong! Borders calculated on unmerged cells
4. No region formatting

### New (Fixed) Order
1. Populate data
2. **Merge header cells** ← Step 1.5
3. **Format region names** ← Step 1.6
4. Generate and write formulas/checkboxes
5. Apply borders ← Separate script, uses correct merged dimensions

---

## Verification Results

### Merged Cells
```
Total: 10 ranges
- A1:B1, D1:E1, G1:H1, J1:K1, M1:N1 (left side)
- P1:S1 (championship)
- U1:V1, X1:Y1, AA1:AB1, AD1:AE1 (right side)
```

### Region Name Formatting
```
E15 (Federation):
  Background: RGB(0.812, 0.886, 0.953) - Light blue
  Font: 24pt, bold, black
  Align: CENTER

E31 (Klingon Empire):
  Background: RGB(0.812, 0.886, 0.953) - Light blue
  Font: 24pt, bold, black
  Align: CENTER

Y15 (Romulan Star Empire):
  Background: RGB(0.851, 0.918, 0.827) - Light green
  Font: 24pt, bold, black
  Align: CENTER

Y31 (Dominion):
  Background: RGB(0.851, 0.918, 0.827) - Light green
  Font: 24pt, bold, black
  Align: CENTER
```

### Borders
```
Main bracket: 459 cells
Columns Y:AA: 54 cells
Region names: 4 cells (E31, Y31 added by fix-bracket-borders.ts)
Total: 517 border cells
```

---

## Files Modified

### Core Scripts
- **src/populate-test-sheet.ts** - Added Steps 1.5 (merging) and 1.6 (region formatting)
- **src/fix-bracket-borders.ts** - Updated to accept sheet ID from argv

### New Utility Scripts
- **src/clear-sheet.ts** - Clears all data and formatting from sheet
- **src/add-missing-formatting.ts** - Adds missing formatting to populated sheets
- **src/verify-population.ts** - Verifies Regions tab seed order and bracket formulas
- **src/check-formatting.ts** - Checks merges, borders, backgrounds

### Package.json Scripts
No changes needed - existing scripts work:
- `npm run populate-test-sheet <sheet-id>`
- `npm run apply-borders <sheet-id>`

---

## Testing Commands

### Full Population from Scratch
```bash
# Clear existing data
npx ts-node src/clear-sheet.ts

# Populate with all formatting
npm run populate-test-sheet 1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w

# Apply borders (after merging)
npm run apply-borders 1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w

# Verify result
npx ts-node src/check-formatting.ts
```

### Fix Existing Sheet
```bash
# Add missing formatting to already-populated sheet
npx ts-node src/add-missing-formatting.ts 1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w

# Then apply borders
npm run apply-borders 1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w
```

---

## Related Documentation

- **BRACKET_POPULATION_FLOW.md** - Complete bracket population specification
- **POPULATION_REPORT.md** - Latest population verification report
- **docs/requirements/07-google-sheets-spec.md** - Regions tab seed order specification

---

**Status:** ✅ ALL FORMATTING ISSUES RESOLVED
**Verified:** 2025-11-08
**Test Sheet:** https://docs.google.com/spreadsheets/d/1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w/edit
