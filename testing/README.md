# Testing Materials

**Purpose:** All testing scripts, logs, and reports in one organized location

**Last Updated:** 2025-11-12

---

## Quick Start

### Run Complete Bracket Test
```bash
npm run complete-bracket-test <spreadsheet-id>
```

This runs the comprehensive test that:
1. Clears sheet completely
2. Populates test data (136 formulas, 64 participants)
3. Applies 461 comprehensive borders
4. Freezes and bolds row 1
5. Updates Championship cell
6. Verifies formatting

**Duration:** ~42 seconds

---

## Folder Structure

### `scripts/active/` (9 scripts) ✅ USE THESE

**Primary Tool:**
- **complete-bracket-test.ts** - All-in-one sheet generation and formatting

**Component Scripts (used by complete-bracket-test):**
- **populate-test-sheet.ts** - Populate data and basic formatting
- **fix-bracket-borders.ts** - Apply comprehensive borders from example sheet
- **generate-bracket.ts** - Generate bracket formulas

**Standalone Utilities:**
- **clear-sheet.ts** - Clear all data and formatting
- **test-sheets.ts** - Test Google Sheets API connection

**Simulation:**
- **simulate-tournament.ts** - Run complete tournament with random winners
- **check-results.ts** - View results written to Results tab
- **check-bracket-progression.ts** - Verify bracket winner progression

**Usage:**
```bash
npm run complete-bracket-test <sheet-id>    # Recommended
npm run simulate-tournament <sheet-id>       # Test tournament flow
npm run check-results <sheet-id>             # View results
npm run test-sheets                          # Test API connection
```

### `logs/` (28+ files)

Test execution logs, population logs, simulation logs.

**Naming Convention:**
- `*-log.txt` - Execution logs
- `*-run2-log.txt`, `*-run3-log.txt` - Multiple runs
- `*-summary.md` - Summary reports (should be .txt)

**Not Committed:**
- Logs are in .gitignore
- Only committed logs are in debug/ folder (key debugging screenshots)

**When to Check:**
- Debugging test failures
- Comparing test run outputs
- Investigating historical test behavior

### `reports/` (5 files)

Simulation and population analysis reports.

**Files:**
- **SIMULATION_FULL_REPORT.md** - Complete simulation analysis
- **SIMULATION_RESULTS.md** - Simulation outcomes
- **SIMULATION_COLUMN_MAPPING_BUG.md** - Bug investigation
- **TOURNAMENT_PROGRESSION.md** - Tournament flow analysis
- **POPULATION_REPORT.md** - Sheet population verification

**When to Reference:**
- Understanding bracket formula behavior
- Investigating simulation issues
- Verifying tournament progression logic

---

## Available npm Scripts

```json
{
  "complete-bracket-test": "Complete sheet generation and formatting",
  "populate-test-sheet": "Populate data only (no comprehensive borders)",
  "apply-borders": "Apply borders from example sheet",
  "simulate-tournament": "Run full 6-round tournament simulation",
  "check-results": "View Results tab contents",
  "check-bracket": "Verify bracket progression",
  "test-sheets": "Test Google Sheets API connection"
}
```

---

## Test Sheet

**Current Test Sheet:**
- **ID:** 1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w
- **URL:** https://docs.google.com/spreadsheets/d/1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w/edit

**Last Generated:** 2025-11-12
**Status:** Fully formatted, ready for simulation

---

## Testing Workflow

### 1. Generate New Test Sheet

```bash
# Complete test (recommended)
npm run complete-bracket-test <sheet-id>
```

### 2. Verify Formatting

Open sheet and check:
- ✅ Row 1 frozen and bolded
- ✅ All columns properly sized
- ✅ Championship cell: "Star Trek Character Battle 2025 Champion"
- ✅ Borders present on all match cells
- ✅ Region names formatted (colored backgrounds)

### 3. Run Simulation

```bash
npm run simulate-tournament <sheet-id>
```

**What it does:**
- Simulates all 6 rounds (Round 1 → Championship)
- Randomly selects winners
- Writes TRUE/FALSE to bracket checkboxes
- Appends results to Results tab
- Verifies formulas propagate winners correctly

### 4. Check Results

```bash
npm run check-results <sheet-id>
npm run check-bracket <sheet-id>
```

### 5. Iterate

If issues found:
- Document in ACTION_ITEMS.md
- Create targeted fix script if needed
- Re-run complete-bracket-test
- Re-test

---

## Deprecated Scripts

**Location:** `../backup/deprecated-scripts/` (60 files)

These are old testing and analysis scripts that have been replaced:
- analyze-* scripts
- check-* scripts (30+ individual checkers)
- fix-* scripts (15+ specific fixes)
- apply-* scripts

**Do NOT use these.** They are archived for reference only.

**Use instead:** `scripts/active/complete-bracket-test.ts`

---

## Common Issues

### Issue: Script can't find keys/vpoll-key.json

**Fix:**
```typescript
// In moved scripts, update import path:
const keyPath = path.join(__dirname, '../../keys/vpoll-key.json');
```

### Issue: npm script not found

**Fix:** Check that package.json paths are updated:
```json
"complete-bracket-test": "ts-node testing/scripts/active/complete-bracket-test.ts"
```

### Issue: Import errors in TypeScript

**Fix:** Update relative imports in moved scripts:
```typescript
// Old:
import '../services/sheets'

// New:
import '../../src/services/sheets'
```

---

## Next Steps

After testing phase complete:
1. Update production templates with final config
2. Archive test logs (keep only recent)
3. Document production deployment process
4. Begin MVP Discord bot development

---

**Questions?** See docs/quick-start/common-tasks.md for development workflows
