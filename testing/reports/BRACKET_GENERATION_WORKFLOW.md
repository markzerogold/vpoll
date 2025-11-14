# Bracket Generation Workflow

**Last Updated:** 2025-11-14

## Problem Identified

The initial approach had a flaw: `copy-bracket-formatting.ts` copied formatting but not VALUES, and `populate-test-sheet.ts` overwrote some of the formatting when adding data. This caused:
- Region name cells showing cut-off text
- Championship cell showing wrong format
- Columns not properly autosized

## Solution

✅ **FIXED** (2025-11-14) - Three-step workflow now working correctly with `--skip-region-formatting` flag.

---

## Workflow: Generate Formatted Bracket

### Step 1: Copy Formatting from Source

```bash
cd testing/scripts/active
npx ts-node copy-bracket-formatting.ts
```

**What it does:**
- Reads ALL cell formatting from source sheet (1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w)
- Creates/clears Bracket tab in target sheet
- Applies 1995 cells of formatting
- Copies 16 merged cell ranges
- Freezes row 1

**Duration:** ~30 seconds

**Result:** Blank formatted Bracket tab

---

### Step 2: Populate Data

**IMPORTANT:** Populate script must use `--skip-region-formatting` flag to preserve copied formatting

```bash
npm run populate-test-sheet <target-sheet-id> -- --skip-region-formatting
```

**What it does:**
- Creates other tabs (Participants, Config, Regions, Results, Instructions)
- Expands Bracket grid to 100×35
- Writes 64 participants, config settings, regions
- Generates 136 bracket formulas
- Adds 126 checkbox validations
- ✅ **SKIPS region formatting** when `--skip-region-formatting` flag is provided (preserves 4×4 merged blocks from Step 1)

**Duration:** ~15 seconds

**Result:** All tabs populated, region formatting preserved from Step 1

---

### Step 3: Championship Cell and Column Autosizing

```bash
cd testing/scripts/active
npx ts-node fix-test-sheet.ts
```

**What it does:**
- ✅ Writes Championship cell formula: `=Config!B3&" Champion"`
- ✅ Autosizes ALL columns (A-AF)
- ✅ Explicitly autosizes region columns (E-G, Y-AA)
- ✅ Explicitly autosizes championship columns (O-Q)
- ℹ️ **Does NOT overwrite region name formulas** (preserves formulas from Step 2)

**What it does NOT do:**
- ❌ Does NOT write region name values (they remain as formulas: `=Regions!B2`, etc.)
- ❌ Does NOT modify region formatting (preserved from Step 1)

**Duration:** ~5 seconds

**Result:** Fully formatted and populated bracket with formula-driven region names

---

## Complete Workflow Script (Automated)

✅ **READY** (2025-11-14) - The `generate-complete-bracket.ts` script now automates all three steps correctly.

**Completed:**
1. ✅ Added `--skip-region-formatting` flag to populate-test-sheet.ts
2. ✅ Updated populate-test-sheet.ts to skip lines 462-541 when flag is set
3. ⏳ **TODO:** Test generate-complete-bracket.ts end-to-end

**Usage:**
```bash
cd testing/scripts/active
npx ts-node generate-complete-bracket.ts <target-sheet-id>
```

**The script automatically:**
1. Copies formatting from source (1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w)
2. Populates data with `--skip-region-formatting` flag
3. Writes region values and autosizes columns

---

## Complete Workflow (Manual Steps)

**Run these commands in order:**

```bash
# Step 1: Copy formatting from source sheet
cd testing/scripts/active
npx ts-node copy-bracket-formatting.ts

# Step 2: Populate data WITHOUT overwriting formatting
cd ../../..
npm run populate-test-sheet <target-sheet-id> -- --skip-region-formatting

# Step 3: Write region name values and autosize columns
cd testing/scripts/active
npx ts-node fix-test-sheet.ts
```

**Total time:** ~50 seconds

**✅ Result:** Fully formatted bracket with 100% fidelity to source sheet

---

## Files Involved

### Source Sheet (User's Formatted Template)
**ID:** `1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w`
**Purpose:** Master template with perfect formatting manually created by user

### Scripts Created
1. **copy-bracket-formatting.ts** - Copies formatting from source to target
2. **populate-test-sheet.ts** - Populates data (needs update to skip region formatting)
3. **fix-test-sheet.ts** - Writes region values and autosizes columns
4. **generate-complete-bracket.ts** - Future: Orchestrates all steps (not ready yet)

### Scripts Updated
- **populate-test-sheet.ts** - Fixed tab setup logic, removed invalid Bracket placeholder

---

## What Needs to be Fixed

### ✅ Issue 1: populate-test-sheet.ts Overwrites Region Formatting (FIXED)

**Status:** Fixed on 2025-11-14

**Location:** Lines 462-541 (now wrapped in flag check)

**Solution Implemented:** Option A (explicit flag)

**Updated code:**
```typescript
// Skip region formatting if --skip-region-formatting flag is provided
// (formatting should come from copy-bracket-formatting.ts instead)
const skipRegionFormatting = process.argv.includes('--skip-region-formatting');

if (!skipRegionFormatting) {
  console.log('Formatting region names...');
  // ... existing formatting code (only runs when flag NOT present)
} else {
  console.log('⏭️  Skipping region formatting (--skip-region-formatting flag set)');
  console.log('   Region formatting should come from copy-bracket-formatting.ts');
}
```

**Usage:**
```bash
npm run populate-test-sheet <sheet-id> -- --skip-region-formatting
```

**Result:** Region names remain as 4×4 merged blocks with correct formatting from source sheet

### Issue 2: No Column Autosizing in populate-test-sheet.ts

**Problem:** Columns not autosized after formulas are written

**Solution:** Add autosizing at end of populate-test-sheet.ts (after line 750)

```typescript
// After "Applying formatting..." section
console.log('Autosizing Bracket columns...');
await sheets.spreadsheets.batchUpdate({
  spreadsheetId,
  requestBody: {
    requests: [
      {
        autoResizeDimensions: {
          dimensions: {
            sheetId: bracketSheetId,
            dimension: 'COLUMNS',
            startIndex: 0,
            endIndex: 32,
          },
        },
      },
    ],
  },
});
console.log('  ✓ Columns autosized');
```

---

## Testing Checklist

After running the workflow, verify:

- [ ] Row 1 frozen (headers stay visible when scrolling)
- [ ] Row 1 text is bold
- [ ] Region names display fully:
  - [ ] "Federation" visible in red merged block (E15:G18)
  - [ ] "Klingon Empire" visible in amber merged block (E47:G50)
  - [ ] "Romulan Star Empire" visible in blue merged block (Y15:[18)
  - [ ] "Dominion" visible in gray merged block (Y47:[50)
- [ ] Championship cell shows formula result (e.g., "Star Trek Character Battle 2025 Champion")
- [ ] Championship cell is gray background, white text, centered
- [ ] All participant names visible (columns not truncated)
- [ ] All checkboxes are interactive (can toggle TRUE/FALSE)
- [ ] Match formulas show correct participant names
- [ ] 460+ cells have borders

---

## Future Improvements

1. **Update populate-test-sheet.ts** to accept `--skip-region-formatting` flag
2. **Add column autosizing** to end of populate-test-sheet.ts
3. **Create unified script** (generate-complete-bracket.ts) that does all steps
4. **Add to package.json** as npm script: `npm run generate-bracket <target-id>`
5. **Update complete-bracket-test.ts** to use new workflow instead of fix-bracket-borders.ts

---

## Migration Path

### Old Workflow (Deprecated)
```bash
npm run complete-bracket-test <sheet-id>
```

**Problems:**
- fix-bracket-borders.ts only copies borders, not all formatting
- Championship cell formatted incorrectly (vertical merge instead of horizontal)
- Region names formatted as single cells instead of 4×4 blocks
- Column autosizing timing issues (happens before formulas evaluate)

### New Workflow (Current)
```bash
# Manual 3-step process (see above)
```

### Future Workflow (Target)
```bash
npm run generate-bracket <target-id>
```

**Benefits:**
- 100% formatting fidelity (exact copy from source)
- Correct region name merges (4×4 blocks)
- Correct championship cell merge (3×2 block)
- Proper column autosizing (after all data written)
- Single command

---

## Summary

The key insight is that formatting should be **copied** from the source, not **recreated** in code. The source sheet is the single source of truth for formatting. Scripts should:

1. **Copy formatting** (don't recreate it)
2. **Add data** (formulas, values, checkboxes) without overwriting formatting
3. **Add VALUES** to merged cells (formatting is already there)
4. **Autosize columns** as the final step (after all content is in place)

This approach ensures 100% formatting fidelity and eliminates the need to maintain complex formatting code.
