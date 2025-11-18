# Bracket Generation Workflow

**Last Updated:** 2025-11-17

## Evolution of Approach

### Original Problem (2025-11-14)
`copy-bracket-formatting.ts` copied formatting but not VALUES, and `populate-test-sheet.ts` overwrote some formatting. This caused cut-off text, wrong championship format, and improper column sizing.

### First Solution (2025-11-14)
Three-step workflow with `--skip-region-formatting` flag fixed the issues by copying from source sheet.

### Current Solution (2025-11-17)
✅ **STANDALONE GENERATION** - All formatting rules extracted and codified in scripts. No external sheet dependencies required during generation.

**Key Innovation:** `extract-all-formatting.ts` reads source sheet once, generates `apply-formatting-standalone.ts` with all formatting rules as code.

---

## Workflow: Generate Formatted Bracket

### Recommended: One-Command Generation

```bash
npm run complete-bracket-test <sheet-id>
```

**Duration:** ~60 seconds | **Result:** Perfect bracket ready for simulation

---

### Manual Steps (if needed)

#### Step 1: Clear Sheet

```bash
cd testing/scripts/active
npx ts-node clear-sheet.ts <sheet-id>
```

**Duration:** ~5 seconds

---

#### Step 2: Apply Formatting from Codified Rules

```bash
cd testing/scripts/active
npx ts-node apply-formatting-standalone.ts <sheet-id>
```

**What it does:**
- Applies ALL formatting from extracted rules (no external sheet dependency)
- 1995 cells of formatting
- 460 cells with borders
- 16 merged cell ranges
- Freezes row 1

**Duration:** ~15 seconds

**Result:** Blank formatted Bracket tab

---

#### Step 3: Populate Data

**IMPORTANT:** Populate script must use `--skip-region-formatting` flag to preserve applied formatting

```bash
npm run populate-test-sheet <sheet-id> -- --skip-region-formatting
```

**What it does:**
- Creates other tabs (Participants, Config, Regions, Results, Instructions)
- Expands Bracket grid to 100×35
- Writes 64 participants, config settings, regions
- Generates 136 bracket formulas
- Adds 126 checkbox validations
- ✅ **SKIPS region formatting** when `--skip-region-formatting` flag is provided (preserves 4×4 merged blocks from Step 2)

**Duration:** ~15 seconds

**Result:** All tabs populated, region formatting preserved from Step 2

---

#### Step 4: Championship Cell and Column Autosizing

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

## How Formatting Extraction Works

**One-Time Setup:** Extract formatting rules from source sheet into code

```bash
cd testing/scripts/active
npx ts-node extract-all-formatting.ts
```

**What it does:**
1. Reads source sheet (1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w) with `includeGridData`
2. Extracts ALL formatting:
   - 16 merged ranges
   - 460 cells with borders (all 4 sides with style/width/color)
   - 4 region cells with backgrounds, text colors, fonts
   - Row 1 freeze setting
3. Cleans null values from border data
4. Generates `apply-formatting-standalone.ts` with all rules as TypeScript code
5. Saves formatted JSON to `testing/logs/extracted-formatting.json` for inspection

**Result:** Self-contained `apply-formatting-standalone.ts` that applies all formatting without needing source sheet

**Duration:** ~10 seconds | **Needs re-run:** Only if source sheet formatting changes

---

## Complete Workflow (Manual Steps)

**Run these commands in order:**

```bash
# Step 1: Clear sheet
cd testing/scripts/active
npx ts-node clear-sheet.ts <sheet-id>

# Step 2: Apply formatting from codified rules
cd testing/scripts/active
npx ts-node apply-formatting-standalone.ts <sheet-id>

# Step 3: Populate data WITHOUT overwriting formatting
cd ../../..
npm run populate-test-sheet <sheet-id> -- --skip-region-formatting

# Step 4: Championship cell and autosize columns
cd testing/scripts/active
npx ts-node fix-test-sheet.ts <sheet-id>
```

**Total time:** ~40 seconds

**✅ Result:** Perfect bracket generated entirely from scripts, no external sheet dependencies

---

## Files Involved

### Source Sheet (For Reference Only)
**ID:** `1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w`
**Purpose:** Source of truth for formatting - used once to extract rules via `extract-all-formatting.ts`
**Not required during generation:** All formatting rules extracted into `apply-formatting-standalone.ts`

### Active Scripts
1. **extract-all-formatting.ts** - ONE-TIME: Extracts formatting from source sheet, generates standalone code
2. **apply-formatting-standalone.ts** - GENERATED: Applies all 481 formatting rules without external dependencies
3. **populate-test-sheet.ts** - Populates data with `--skip-region-formatting` flag
4. **fix-test-sheet.ts** - Championship cell and column autosizing
5. **complete-bracket-test.ts** - Orchestrates all 4 steps automatically

### Deprecated Scripts (No Longer Used)
- **copy-bracket-formatting.ts** - Replaced by `apply-formatting-standalone.ts`

---

## Key Achievements

### ✅ Standalone Generation (2025-11-17)

**Achievement:** Bracket generation no longer requires external sheet during generation

**Implementation:**
1. Created `extract-all-formatting.ts` - extracts ALL formatting from source sheet into code
2. Generated `apply-formatting-standalone.ts` - self-contained formatting application
3. Updated `complete-bracket-test.ts` - uses standalone formatting instead of copying

**Result:** Perfect brackets generated entirely from scripts

### ✅ Issue 1: populate-test-sheet.ts Overwrites Region Formatting (FIXED 2025-11-14)

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
