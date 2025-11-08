# Round 3 Formula Fix - Root Cause Analysis

**Date:** 2025-11-07
**File:** src/generate-bracket.ts
**Impact:** Round 3 formulas referenced wrong Round 2 rows

## Problem

Round 3 VLOOKUP formulas were looking at the wrong Round 2 source cells:

**Before Fix:**
```
H8:  =IFERROR(VLOOKUP(TRUE,$D$8:$E$9,2,FALSE),"")    ❌ Wrong! D8:E9 is empty
H9:  =IFERROR(VLOOKUP(TRUE,$D$16:$E$17,2,FALSE),"")  ❌ Wrong! D16:E17 is empty
H24: =IFERROR(VLOOKUP(TRUE,$D$24:$E$25,2,FALSE),"")  ❌ Wrong! D24:E25 is empty
H25: =IFERROR(VLOOKUP(TRUE,$D$32:$E$33,2,FALSE),"")  ❌ Wrong! D32:E33 is empty
```

**After Fix:**
```
H8:  =IFERROR(VLOOKUP(TRUE,$D$4:$E$5,2,FALSE),"")    ✓ Correct! Round 2 Match 1
H9:  =IFERROR(VLOOKUP(TRUE,$D$12:$E$13,2,FALSE),"")  ✓ Correct! Round 2 Match 2
H24: =IFERROR(VLOOKUP(TRUE,$D$20:$E$21,2,FALSE),"")  ✓ Correct! Round 2 Match 3
H25: =IFERROR(VLOOKUP(TRUE,$D$28:$E$29,2,FALSE),"")  ✓ Correct! Round 2 Match 4
```

## Root Cause

**File:** generate-bracket.ts, function generateRound3Region(), lines 265-268

**Buggy Code:**
```typescript
const r2Match1Start = startRow + (match * 16);  // ❌ Used Round 3 startRow (8)!
const r2Match2Start = r2Match1Start + 8;
```

For `startRow=8, match=0`:
- r2Match1Start = 8 + 0 = **8** ❌ Should be **4** (Round 2 row)
- r2Match2Start = 8 + 8 = **16** ❌ Should be **12**

**Problem:** The code used Round 3's `startRow` (8) as the base, but Round 2 actually starts at row 4!

## Fix Applied

**File:** generate-bracket.ts lines 265-270

**Fixed Code:**
```typescript
// Round 2 starts at row 4 (top half) or row 36 (bottom half), matches 8 rows apart
const r2BaseRow = startRow <= 20 ? 4 : 36;  // FIX: Round 2 base row
const r2Match1Start = r2BaseRow + (match * 2 * 8);  // FIX: First of two R2 matches
const r2Match1End = r2Match1Start + 1;
const r2Match2Start = r2Match1Start + 8;  // FIX: Second R2 match (8 rows after first)
const r2Match2End = r2Match2Start + 1;
```

**Calculation for startRow=8 (ALPHA top), match=0:**
- r2BaseRow = 4 (top half)
- r2Match1Start = 4 + (0 * 2 * 8) = **4** ✓
- r2Match2Start = 4 + 8 = **12** ✓

**Calculation for startRow=8, match=1:**
- r2Match1Start = 4 + (1 * 2 * 8) = **20** ✓
- r2Match2Start = 20 + 8 = **28** ✓

## Verification

Ran check-round3-formulas.ts:
```
H8:  $D$4:$E$5    ✓
H9:  $D$12:$E$13  ✓
H24: $D$20:$E$21  ✓
H25: $D$28:$E$29  ✓
```

All formulas now reference correct Round 2 cells!

## Impact

This fix should enable:
- ✅ Round 3 formulas to pull Round 2 winners automatically
- ✅ Round 3 matches to run in simulation
- ✅ Tournament progression through Sweet 16

## Related Fixes

This completes the bracket formula fixes chain:
1. ✅ Checkbox values written (CHECKBOX_FIX_VERIFICATION.md)
2. ✅ Simulation column mapping fixed (SIMULATION_COLUMN_MAPPING_BUG.md)
3. ✅ Round 3 formulas fixed (this document)

## Next Steps

1. Repopulate test sheet with fixed formulas
2. Run simulation and verify Round 3 completes
3. Check if similar bugs exist in Round 4, 5, 6 formulas

---

**Status:** Fix applied and verified
**File Modified:** src/generate-bracket.ts
**Test Required:** Full sheet repopulation + simulation
