# Winner Copy Code Removal - Root Cause Analysis

**Date:** 2025-11-08
**Files Modified:** src/simulate-tournament.ts, src/generate-bracket.ts
**Impact:** Fixed region name overwrites and Round 3 right side formulas

## Problems Solved

### Problem 1: Region Names Overwritten During Simulation

**Evidence:** Screenshot 2025-11-08 051713.png showed "Federation" region name at E15 being overwritten with participant data.

**Root Cause:** Lines 488-602 in simulate-tournament.ts contained "winner copy" code that wrote participant names directly to cells:
- Round 2 winners → wrote to column E rows 8, 16, 24, 32
- This included row 15 where region name "Federation" was located
- Round 3 winners → wrote to column H/X rows 16, 48

**Why This Was Wrong:**
1. Overwrote region names
2. Overwrote formulas that should handle advancement automatically
3. Wrote to wrong columns (wrote to E but Round 3 formulas are in H)
4. Completely unnecessary - VLOOKUP formulas automatically display winners when checkboxes are TRUE/FALSE

**Fix Applied:** Removed lines 488-602 entirely, replaced with comment explaining why winner copying is wrong.

**Result:** The bracket is now purely formula-driven. We only write TRUE/FALSE to checkboxes.

---

### Problem 2: Round 3 Right Side Formulas Missing/Wrong

**Evidence:** Round 3 GAMMA/DELTA matches showing "participants not ready" in simulation.

**Investigation:**
- Left side (ALPHA/BETA) Round 3 formulas in column H worked correctly
- Right side (GAMMA/DELTA) Round 3 formulas were:
  - Written to column X instead of AB
  - Looking at wrong Round 2 columns (AB instead of W)

**Root Cause:** generate-bracket.ts line 275 had:
```typescript
const nameCol = 'X';  // ❌ WRONG
```

Should be:
```typescript
const nameCol = 'AB';  // ✓ CORRECT
```

And formulas were looking at `$AB$` instead of `$W$` for Round 2 right side data.

**Fix Applied:**
- Changed nameCol from 'X' to 'AB'
- Changed VLOOKUP range from `$AB$${r2Match1Start}:$AB$${r2Match1End}` to `$W$${r2Match1Start}:$W$${r2Match1End}`
- Changed VLOOKUP range from `$AB$${r2Match2Start}:$AB$${r2Match2End}` to `$W$${r2Match2Start}:$W$${r2Match2End}`

**Status:** Fix applied but not yet verified. Round 3 right side still showing issues in latest test.

---

## Code Removed

**File:** src/simulate-tournament.ts
**Lines:** 488-602 (114 lines)

### Round 2 to Round 3 Winner Copy (Removed)
```typescript
if (roundNum === 2 && checkboxUpdates.length > 0) {
  // Wrote participant names to column E rows 8, 16, 24, 32
  // This overwrote region name at E15!
}
```

### Round 3 to Round 4 Winner Copy (Removed)
```typescript
if (roundNum === 3 && checkboxUpdates.length > 0) {
  // Wrote participant names to columns H/X rows 16, 48
  // Unnecessary - formulas handle this
}
```

---

## Why Winner Copying Was Wrong

The bracket is **FORMULA-DRIVEN**. Here's how it actually works:

1. **Round 1:** Participants are hardcoded in cells (seeded 1-64)
2. **Round 2-6:** Participants appear via VLOOKUP formulas
3. **Example:** Round 3 formula `=IFERROR(VLOOKUP(TRUE,$D$4:$E$5,2,FALSE),"")`
   - Looks at Round 2 checkbox (D4) and name (E5)
   - When D4 = TRUE, displays the name from E5
   - When D4 = FALSE, displays empty string

**The simulation only needs to:**
- Write TRUE to winner's checkbox
- Write FALSE to loser's checkbox
- Let the formulas do the rest

**The simulation should NOT:**
- Write participant names to cells
- Copy winners to next round
- Overwrite any formulas

---

## Remaining Issues

### Round 3 Right Side (GAMMA/DELTA)
- Formulas now written to correct column (AB)
- Formulas now look at correct Round 2 columns (W:AA)
- But simulation still shows "participants not ready"
- Need to verify formulas are actually being written correctly

### Next Steps
1. Verify Round 3 right side formulas exist in column AB
2. Verify they reference correct Round 2 cells (W36:AA37, etc.)
3. Check if Round 2 right side is writing to correct columns (W:AA)
4. Run full simulation after verification

---

## Related Fixes

This completes the bracket formula fixes chain:
1. ✅ Checkbox values written (CHECKBOX_FIX_VERIFICATION.md)
2. ✅ Simulation column mapping fixed (SIMULATION_COLUMN_MAPPING_BUG.md)
3. ✅ Round 3 left side formulas fixed (ROUND3_FORMULA_FIX.md)
4. ✅ Winner copy code removed (this document)
5. ⚠️ Round 3 right side formulas - partially fixed, needs verification

---

**Status:** Partially complete - winner copy removed, right side fix applied but not verified
**Files Modified:** src/simulate-tournament.ts, src/generate-bracket.ts
**Test Required:** Full sheet repopulation + simulation + verification
