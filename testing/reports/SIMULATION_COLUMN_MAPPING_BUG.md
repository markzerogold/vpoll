# Simulation Column Mapping Bug - Root Cause Analysis

**Date:** 2025-11-07
**File:** src/simulate-tournament.ts
**Impact:** Round 3+ matches write to wrong columns, corrupting bracket

## Problem Summary

The simulation script uses incorrect column letters for Round 3, 4, 5 matches, causing them to overwrite Round 2 data and appear in wrong positions.

## Evidence

### Diagnostic Results

```
Row 4: D="TRUE", E="(1) Spock"        ← Round 2 Match 1 ✓
Row 5: D="FALSE", E="(4) William Riker"
Row 8: D="FALSE", E="(1) Spock"       ← DUPLICATE! Should be in column G (Round 3)
Row 9: D="TRUE", E="(4) William Riker"
```

### Generated Cells Check

Bracket generation (generate-bracket.ts) correctly creates:
- Round 2: Columns D-E ✓
- Round 3: Columns G-H ✓
- Round 4: Columns J-K ✓

But simulation writes checkboxes to:
- Round 2: Column D ✓
- Round 3: Column D ❌ (should be G!)
- Round 4: Column J ✓

## Root Cause

**File:** src/simulate-tournament.ts
**Functions:** getRound3Matches(), getRound4Matches(), getRound5Matches()

### Bug #1: Round 3 Wrong Columns

**Current (WRONG):**
```typescript
function getRound3Matches(): Match[] {
  const checkboxCol = isRightSide ? 'AB' : 'D';  // ❌ Left should be 'G' not 'D'!
```

**Should Be:**
```typescript
const checkboxCol = isRightSide ? 'Y' : 'G';  // ✓ Matches generate-bracket.ts:301
```

**Impact:** Round 3 writes to column D (Round 2's column), corrupting rows 8-9, 24-25, 40-41, 56-57

### Bug #2: Round 4 Wrong Right-Side Column

**Current:**
```typescript
function getRound4Matches(): Match[] {
  const checkboxCol = isRightSide ? 'V' : 'J';  // ❌ Right should be 'U' not 'V'!
```

**Should Be:**
```typescript
const checkboxCol = isRightSide ? 'U' : 'J';  // ✓ Matches generate-bracket.ts
```

### Bug #3: Round 5 Wrong Columns

**Current:**
```typescript
function getRound5Matches(): Match[] {
  // Hard-coded to columns M and N
  checkboxCell: `M${baseRow}`  // ❌ Should check left vs right side!
```

**Should Be:**
```typescript
const checkboxCol = isRightSide ? 'R' : 'M';  // ✓ Matches generate-bracket.ts
```

### Bug #4: Round 6 Wrong Column

**Current:**
```typescript
function getRound6Match(): Match[] {
  checkboxCell: 'P18',  // ❌ Championship column
  checkboxCell: 'P19'
```

**Should Be:**
```typescript
checkboxCell: 'P18',  // ✓ This is actually correct!
```

## Correct Column Mapping

Based on generate-bracket.ts analysis:

| Round | Left Side (ALPHA/BETA) | Right Side (GAMMA/DELTA) |
|-------|------------------------|--------------------------|
| 1 | A | AE |
| 2 | D | AB |
| 3 | G | Y |
| 4 | J | U |
| 5 | M | R |
| 6 | P (Championship) | P (Championship) |

## Fix Required

Update simulate-tournament.ts with correct column mappings:

```typescript
// Round 3
const checkboxCol = isRightSide ? 'Y' : 'G';  // Was: isRightSide ? 'AB' : 'D'

// Round 4
const checkboxCol = isRightSide ? 'U' : 'J';  // Was: isRightSide ? 'V' : 'J'

// Round 5
const checkboxCol = matchNum === 1 ? 'M' : 'R';  // Was: hard-coded 'M' and 'N'
```

## Verification After Fix

Run simulation and check:
1. Round 2 data remains at D4:E5, D12:E13, etc. ✓
2. Round 3 data appears at G8:H9, G24:H25, etc. (NOT D8:D9!) ✓
3. No duplicate data in columns ✓
4. Bracket progresses correctly through all 6 rounds ✓

## Related Issues

This bug explains:
- ❌ Round 3+ simulation failures (writing to wrong cells)
- ❌ "Duplicate" data at D8:D9 (actually Round 3 in wrong column)
- ❌ Round 2 looking corrupted after simulation (overwritten by Round 3)

But does NOT explain:
- ⚠️ Region names at wrong rows (separate issue)
- ⚠️ Border extending extra row (separate issue)

---

**Status:** Root cause identified, fix needed in simulate-tournament.ts
**Files to Modify:** src/simulate-tournament.ts (3 functions)
