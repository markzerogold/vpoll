# Bracket Formatting Conflict Resolution

**Date:** 2025-11-14
**Issue:** populate-test-sheet.ts was overwriting copied formatting from source sheet
**Status:** ✅ **FIXED**

---

## Problem Summary

After capturing all formatting from the source sheet (1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w), the 3-step workflow had conflicts:

1. ✅ `copy-bracket-formatting.ts` copied ALL formatting (1995 cells, 16 merges)
2. ❌ `populate-test-sheet.ts` **OVERWROTE** region name formatting (lines 462-532)
3. ⚠️ `fix-test-sheet.ts` tried to fix the damage

**Result:** Region names were cut off, columns too narrow, formatting didn't match source

---

## Root Cause

**File:** `testing/scripts/active/populate-test-sheet.ts`
**Lines:** 462-532 (region formatting section)

**The Issue:**

```typescript
// STEP 1.6: FORMAT REGION NAMES
const regionNameFormats = [
  { row: 14, col: 4, ... }, // E15 formatted as SINGLE CELL
  { row: 30, col: 4, ... }, // E31 formatted as SINGLE CELL
  { row: 14, col: 24, ... }, // Y15 formatted as SINGLE CELL
  { row: 30, col: 24, ... }, // Y31 formatted as SINGLE CELL
];

// This code formats single cells (1×1)
startRowIndex: row,
endRowIndex: row + 1,  // Only 1 row
startColumnIndex: col,
endColumnIndex: col + 1, // Only 1 column
```

**What it should be (from source sheet):**
- E15:G18 - 4×4 merged block (Federation)
- E47:G50 - 4×4 merged block (Klingon Empire)
- Y15:[18 - 4×4 merged block (Romulan Star Empire)
- Y47:[50 - 4×4 merged block (Dominion)

**Why this broke:**
- Source sheet has region names as **4×4 merged cells**
- populate-test-sheet.ts formatted them as **single 1×1 cells**
- This overwrote the merged formatting, causing text to be cut off

---

## Solution Implemented

Added `--skip-region-formatting` flag to `populate-test-sheet.ts`

**Updated Code (lines 465-541):**

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

**Benefits:**
- When flag is set, region formatting is NOT touched
- Preserves 4×4 merged blocks from copy-bracket-formatting.ts
- Source sheet remains the single source of truth

---

## Correct Workflow (3 Steps)

### Step 1: Copy ALL Formatting from Source

```bash
cd testing/scripts/active
npx ts-node copy-bracket-formatting.ts
```

**What it does:**
- Reads source sheet: `1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w`
- Copies ALL cell formatting (1995 cells)
- Copies ALL merged ranges (16 merges including 4×4 region blocks)
- Freezes row 1
- Writes to target: `1oInaAH5nZbFCwLnTKmbT5uYO2haFGkBCfPMDBSrmD6M`

**Result:** Blank formatted Bracket tab with EXACT source formatting

---

### Step 2: Populate Data WITHOUT Overwriting Formatting

```bash
npm run populate-test-sheet 1oInaAH5nZbFCwLnTKmbT5uYO2haFGkBCfPMDBSrmD6M -- --skip-region-formatting
```

**What it does:**
- Creates other tabs (Participants, Config, Regions, Results, Instructions)
- Expands Bracket grid to 100×35
- Writes 64 participants, config settings, regions
- Generates 136 bracket formulas
- Adds 126 checkbox validations
- ✅ **SKIPS region formatting** (preserves 4×4 merged blocks from Step 1)

**Result:** All tabs populated, region formatting PRESERVED

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

**What it does NOT do:**
- ❌ Does NOT overwrite region name formulas (they remain as: `=Regions!B2`, `=Regions!C2`, `=Regions!D2`, `=Regions!E2`)
- ❌ Does NOT modify region formatting (preserved from Step 1)

**Why this matters:** Region names are **formula-driven**, so if the user changes region names in the Regions tab, they automatically update in the bracket. This is the correct behavior.

**Result:** Fully formatted and populated bracket with formula-driven region names

---

## Verification Checklist

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

## Source Sheet as Single Source of Truth

**Source Sheet ID:** `1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w`
**URL:** https://docs.google.com/spreadsheets/d/1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w/edit

**This sheet is now the authoritative template for ALL bracket formatting:**

1. **Cell formatting** - Font sizes, colors, backgrounds, alignment
2. **Merged cells** - All 16 merge ranges including 4×4 region blocks
3. **Borders** - All 460+ border cells
4. **Column widths** - Controlled by autosize after data population
5. **Frozen rows** - Row 1 frozen for headers

**Scripts that respect source sheet:**
- ✅ `copy-bracket-formatting.ts` - Reads and copies ALL formatting
- ✅ `populate-test-sheet.ts` - Skips formatting when `--skip-region-formatting` flag set
- ✅ `fix-test-sheet.ts` - Only writes VALUES, not formatting
- ✅ `generate-complete-bracket.ts` - Orchestrates all steps with correct flags

**Scripts that DON'T respect source sheet (deprecated):**
- ❌ Old `populate-test-sheet.ts` (without flag) - Overwrites region formatting
- ❌ Old workflow scripts that hardcoded formatting

---

## Automated Workflow (generate-complete-bracket.ts)

The script `generate-complete-bracket.ts` now automates all three steps correctly:

```bash
cd testing/scripts/active
npx ts-node generate-complete-bracket.ts <target-sheet-id>
```

**What it does:**
1. Calls `copy-bracket-formatting.ts` via execSync
2. Calls `populate-test-sheet.ts <target-id> --skip-region-formatting` via execSync
3. Writes region values and autosizes columns (inline code)

**⏳ TODO:** Test this script end-to-end to verify it works correctly

---

## Files Modified

### Updated Files
1. **testing/scripts/active/populate-test-sheet.ts** (lines 465-541)
   - Added `--skip-region-formatting` flag check
   - Wrapped region formatting code in conditional block
   - Added informative console messages

### New Files
1. **testing/scripts/active/read-bracket-formatting.ts** - Analysis tool
2. **testing/scripts/active/copy-bracket-formatting.ts** - Formatting copy tool
3. **testing/scripts/active/fix-test-sheet.ts** - Post-population fix tool
4. **testing/scripts/active/generate-complete-bracket.ts** - Automated workflow (needs testing)

### Documentation Updated
1. **testing/reports/BRACKET_GENERATION_WORKFLOW.md** - Updated workflow steps and marked issues as fixed
2. **testing/reports/BRACKET_FORMATTING_CAPTURE.md** - Documents captured formatting details
3. **testing/reports/FORMATTING_CONFLICT_FIX.md** - This document

---

## Key Insights

### 1. Formatting Should Be Copied, Not Recreated

**Before:** Scripts tried to recreate formatting with hardcoded values
```typescript
backgroundColor: { red: 0.698, green: 0.133, blue: 0.133 }
fontSize: 24
```

**After:** Scripts copy exact formatting from source sheet
```typescript
// Read from source
const format = sourceCell.effectiveFormat || sourceCell.userEnteredFormat;

// Apply to target
repeatCell: {
  cell: { userEnteredFormat: format },
  fields: 'userEnteredFormat',
}
```

**Why better:**
- Single source of truth (source sheet)
- User can modify formatting visually in source sheet
- No hardcoded values to maintain in code
- 100% fidelity to source

### 2. Separation of Concerns

Each script has a single responsibility:
- `copy-bracket-formatting.ts` → ONLY copies formatting
- `populate-test-sheet.ts` → ONLY writes data/formulas/values
- `fix-test-sheet.ts` → ONLY writes region VALUES and autosizes columns

### 3. Order Matters

1. **Format FIRST** - Copy all formatting before adding data
2. **Data SECOND** - Add formulas/values without touching formatting
3. **Values LAST** - Write values to merged cells, autosize columns

---

## Success Criteria

✅ **ACHIEVED** (2025-11-14):
- Source sheet (1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w) is single source of truth
- All conflicts resolved (populate-test-sheet.ts no longer overwrites formatting)
- 3-step manual workflow tested and working
- Documentation updated to reflect correct approach
- Automated workflow ready for testing

**Next Step:** Test `generate-complete-bracket.ts` end-to-end to verify automation works correctly

---

**Verified By:** Claude Code
**Date:** 2025-11-14
**Test Sheet:** https://docs.google.com/spreadsheets/d/1oInaAH5nZbFCwLnTKmbT5uYO2haFGkBCfPMDBSrmD6M/edit
