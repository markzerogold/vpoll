# Tournament Progression and Cell Mapping

**Date:** 2025-11-05
**Status:** In Progress - Rounds 1-2 working, Round 3+ needs testing

## Overview

This document clarifies how winners progress through tournament rounds and the specific cell mapping for checkboxes and participant names in the Google Sheets bracket.

## Key Discovery: Cascading Copy Pattern

The bracket uses a **cascading copy pattern** where each round's winners must be copied to specific cells for the next round to read:

1. **Round 1:** Formulas populate Column E automatically
2. **Round 2:** Reads from Column E → Writes checkboxes to Column D
3. **Round 3:** Needs winners copied from Round 2 to new cells → Reads from Column E → Writes to Column D
4. **Rounds 4-6:** Similar pattern (needs implementation)

## Cell Mapping by Round

### Round 1 (32 matches)
**Checkboxes:** Column A
- ALPHA: Rows 2/3, 6/7, 10/11, 14/15, 18/19, 22/23, 26/27, 30/31
- BETA: Rows 34/35, 38/39, 42/43, 46/47, 50/51, 54/55, 58/59, 62/63
- GAMMA: Rows 2/3, 6/7, 10/11, 14/15, 18/19, 22/23, 26/27, 30/31 (right side, column AE)
- DELTA: Rows 34/35, 38/39, 42/43, 46/47, 50/51, 54/55, 58/59, 62/63 (right side, column AE)

**Names:** Column B (direct input), Column E (formulas from A)

**Formulas:** `=IFERROR(VLOOKUP(TRUE,$A$2:$B$3,2,FALSE),"")` pattern in Column E

---

### Round 2 (16 matches)
**Participants:** Column E rows 4, 5, 12, 13, 20, 21, 28, 29 (populated by Round 1 formulas)

**Checkboxes:** Column D rows 4, 5, 12, 13, 20, 21, 28, 29
- ALPHA Match 1: D4/D5
- ALPHA Match 2: D12/D13
- ALPHA Match 3: D20/D21
- ALPHA Match 4: D28/D29
- Similar pattern for BETA, GAMMA (right side uses column AB), DELTA

**Winner Copying:** After Round 2 completes, copy winners to:
- E8/E9 (for Round 3 Match 1)
- E16/E17 (for Round 3 Match 2)
- E24/E25 (for Round 3 Match 3)
- E32/E33 (for Round 3 Match 4)

**Pattern:** `sourceRow + 4`

---

### Round 3 (8 matches - Sweet 16)
**Participants:** Column E rows 8, 9, 16, 17, 24, 25, 32, 33 (from Round 2 copy operation)

**Checkboxes:** Column D rows 8, 9, 16, 17, 24, 25, 32, 33
- ALPHA Match 1: D8/D9
- ALPHA Match 2: D16/D17 (NOTE: No formula at E16, needs investigation)
- BETA Match 1: D40/D41 (expected)
- BETA Match 2: D48/D49 (expected)

**Formula Check:**
- H8: `=IFERROR(VLOOKUP(TRUE,$D$8:$E$9,2,FALSE),"")` ✅ Matches our mapping
- H16: NO FORMULA (⚠️ potential issue)

**Winner Copying:** After Round 3 completes, copy winners to:
- H16/H17 (Round 4 ALPHA)
- H48/H49 (Round 4 BETA)
- X16/X17 (Round 4 GAMMA, right side)
- X48/X49 (Round 4 DELTA, right side)

---

### Round 4 (4 matches - Elite 8)
**Status:** Implementation in progress

**Expected Pattern:**
- Participants: Column H rows 16, 17, 48, 49 (left side), Column X (right side)
- Checkboxes: Column G rows 16, 17, 48, 49 (left side), Column Y (right side)

**Formula Check:** K16 has `=IFERROR(VLOOKUP(TRUE,$G$16:$H$17,2,FALSE),"")`
- This expects checkboxes at G16/G17, names at H16/H17

**⚠️ ISSUE:** Current Round 3 copies to H16/H17 (names), but Round 4 expects checkboxes at G16!
- **Solution:** Either copy to G16/H17 OR adjust Round 4 to write checkboxes to G16

---

### Round 5 (2 matches - Final Four)
**Status:** Not yet implemented

**Expected Pattern:**
- Combines region winners (ALPHA vs BETA, GAMMA vs DELTA)
- Checkboxes likely at M31/M32 and S31/S32
- Names likely at N31/N32 and R31/R32 (or similar)

---

### Round 6 (1 match - Championship)
**Status:** Not yet implemented

**Expected Pattern:**
- Checkboxes likely at O26/Q27 (based on `getRound6Matches()`)
- Winner should display at specific cell (O19 mentioned in simulation output)

---

## Current Implementation Status

### ✅ Working
- Round 1: Complete (32 matches)
- Round 2: Complete (16 matches)
- Round 2→3 winner copying

### 🔄 In Progress
- Round 3: Checkbox mapping fixed, needs testing
- Round 3→4 winner copying added

### ⚠️ Needs Work
- Round 4-6 cell mapping
- Verify all formula expectations match simulation writes
- Handle potential missing formulas (e.g., E16, H16)

---

## Key Insights

1. **Formula cells are read-only targets:** H8, K16, etc. contain formulas that read from D/E columns
2. **Intermediate cells have no formulas:** E8, E16, H16 are empty - simulation must write directly
3. **Each round has 2 layers:**
   - **Checkbox layer:** Where simulation writes TRUE/FALSE
   - **Name layer:** Where participant names live (either from formulas or direct writes)
4. **Copy operations are critical:** Winners must be copied to next round's expected positions

---

## Debugging Tools Created

- `src/check-round2-prepopulation.ts` - Check Round 2 cell contents
- `src/analyze-bracket-structure.ts` - Understand bracket layout
- `src/check-round3-after-copy.ts` - Verify Round 3 cells after copy
- `src/check-intermediate-formulas.ts` - Check formula expectations
- `src/map-all-rounds.ts` - Complete bracket structure mapping

---

## Next Steps

1. ✅ Test Round 3 with fixed cell mapping
2. Fix Round 4 cell mapping (G vs H column issue)
3. Add Round 4→5 winner copying
4. Add Round 5→6 winner copying
5. Verify championship winner displays correctly
6. Document complete cell mapping reference

---

**Last Updated:** 2025-11-05
**Sheet:** https://docs.google.com/spreadsheets/d/1GbIyPmw7VyicKSxZmqdLmQvlBO_x8f97EMpyXESv78o/edit
