# Sheet Population & Bracket Formatting Index

**Purpose:** Index of all scripts, templates, and files related to sheet population, bracket generation, and formatting. Use this to keep scripts aligned with master template as we test and apply learnings.

**Last Updated:** 2025-11-12

---

## 🎯 Quick Reference

**Master Template:** [Google Sheets](https://docs.google.com/spreadsheets/d/1Jm2oRCvsHN1ijeos6Bi1wqzN44C2eMJAO3KvkmCaCmo/edit)
**Test Sheet:** [Google Sheets](https://docs.google.com/spreadsheets/d/1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w/edit)
**Example/Reference Sheet:** Sheet ID `1Z83Lr02EW9wvpH3YfBvLwafHMIqyxJLXaO_0D85bMfk` (used for border copying)

**Recommended Command:** `npm run complete-bracket-test <sheet-id>`

---

## 📁 Active Scripts (In Order of Execution)

### 1. Complete Bracket Test (Orchestrator)
**File:** `testing/scripts/active/complete-bracket-test.ts`
**npm script:** `complete-bracket-test`
**Purpose:** Runs all formatting steps in correct order
**Duration:** ~42 seconds

**What it does:**
1. Clears sheet completely (all tabs, all data/formatting)
2. Calls `populate-test-sheet.ts` (data + basic formatting)
3. Calls `fix-bracket-borders.ts` (comprehensive borders)
4. Freezes and bolds Bracket row 1 (custom operation)
5. Updates Championship cell with formula and merge (custom operation)
6. Verifies all formatting

**Formatting Applied Directly:**
- ✅ Bracket row 1 frozen (`frozenRowCount: 1`)
- ✅ Bracket row 1 bolded (columns A-AF)
- ✅ Championship cell merged (O17:O18)
- ✅ Championship cell formatted:
  - Formula: `=Config!B3&" Champion"`
  - Background: Light gold `rgb(1, 0.949, 0.8)`
  - Font: 16pt bold, black
  - Alignment: center/middle
  - Wrap: CLIP

**When to Update:**
- If championship cell location changes
- If championship cell formatting requirements change
- If row 1 formatting requirements change
- If script execution order needs modification

---

### 2. Populate Test Sheet (Data + Basic Formatting)
**File:** `testing/scripts/active/populate-test-sheet.ts`
**npm script:** `populate-test-sheet`
**Purpose:** Create all tabs, populate data, apply basic formatting
**Duration:** ~15 seconds

**What it does:**
1. Creates/renames 6 tabs: Bracket, Results, Participants, Regions, Config, Instructions
2. Populates all tabs with test data (64 Star Trek characters)
3. Applies basic formatting (merges, region names, headers)
4. Generates bracket formulas via `generate-bracket.ts`
5. Adds checkbox validations (126 advancement cells)

**Formatting Applied:**
- ✅ **Cell merging** (10 header ranges)
  - A1:B1 (Round 1), D1:E1 (Round 2), G1:H1 (Sweet 16), J1:K1 (Elite 8)
  - M1:N1 (Final 4), P1:S1 (Championship)
  - U1:V1 (Elite 8 right), X1:Y1 (Sweet 16 right), AA1:AB1 (Round 2 right), AD1:AE1 (Round 1 right)
- ✅ **Region name formatting** (4 cells: E15, E31, Y15, Y31)
  - Left regions: Light blue `rgb(0.812, 0.886, 0.953)`
  - Right regions: Light green `rgb(0.851, 0.918, 0.827)`
  - Font: 24pt bold, black
  - Alignment: center/middle
- ✅ **Row freezing**
  - Participants: 1 row
  - Config: 1 row
  - Regions: 2 rows
  - Results: 1 row
- ✅ **Header bolding**
  - All tabs: Row 1 bolded
  - Regions: Rows 1-2 bolded
  - Instructions: Row 1 (14pt), section headers (12pt)
- ✅ **Column auto-sizing**
  - All tabs EXCEPT Bracket (done by fix-bracket-borders.ts)
- ✅ **Checkbox validation** (126 cells)
  - Initial value: `false`
  - Located at advancement positions in bracket
- ✅ **Grid expansion**
  - Bracket: 100 rows × 35 columns

**When to Update:**
- If master template structure changes (tabs, columns, ranges)
- If mock participant data needs updating
- If tournament config settings change
- If region name formatting requirements change
- If cell merge ranges change
- If checkbox positions change
- After testing reveals formatting issues

**Dependencies:**
- Calls `generate-bracket.ts` for formulas

---

### 3. Generate Bracket (Formulas Only)
**File:** `testing/scripts/active/generate-bracket.ts`
**Purpose:** Generate bracket cell formulas and structure (NO formatting)
**Used by:** `populate-test-sheet.ts`

**What it does:**
1. Generates formula strings for all bracket cells
2. Defines checkbox cell positions
3. Creates VLOOKUP formulas for winner advancement
4. Returns array of `BracketCell` objects

**Formatting Applied:**
- ❌ None (pure data/logic)

**When to Update:**
- If bracket formula logic changes
- If VLOOKUP references need adjustment
- If round progression logic changes
- If checkbox positions change
- After testing reveals formula errors

**Key Formula Patterns:**
```typescript
// Round 1: Direct reference to Regions tab
="(" & Regions!$A$3 & ") " & Regions!$B$3

// Round 2-6: VLOOKUP for winner advancement
=IF(VLOOKUP(TRUE, PrevRound!Range, ColIndex, FALSE)="", "",
    "(" & VLOOKUP(TRUE, PrevRound!Range, SeedCol, FALSE) & ") " &
    VLOOKUP(TRUE, PrevRound!Range, NameCol, FALSE))
```

---

### 4. Fix Bracket Borders (Comprehensive Borders)
**File:** `testing/scripts/active/fix-bracket-borders.ts`
**npm script:** `apply-borders`
**Purpose:** Copy all border formatting from example sheet and apply to test sheet
**Duration:** ~10 seconds

**What it does:**
1. Reads border formatting from example sheet (Sheet ID: `1Z83Lr02EW9wvpH3YfBvLwafHMIqyxJLXaO_0D85bMfk`)
2. Extracts borders from Bracket!A1:AF70
3. Applies row mapping for bottom half offset (+1 for rows ≥33)
4. Clears existing borders
5. Applies ~400+ border cells in batches of 100
6. Adds region name borders (E31, Y31)
7. Auto-resizes Bracket columns
8. Disables text wrapping (CLIP)

**Formatting Applied:**
- ✅ **Borders** (~400+ cells)
  - Copied from example sheet with row offset correction
  - Style: SOLID, various widths, black
  - Applied to all match cells and headers
- ✅ **Region name borders** (2 cells: E31, Y31)
  - Full border: top, bottom, left, right
  - Style: SOLID, 1px, black
- ✅ **Column auto-sizing** (Bracket columns A-AF)
  - Applied AFTER borders for correct sizing
- ✅ **Text wrapping** (Bracket!A1:AF70)
  - Wrap strategy: CLIP (no wrapping)

**When to Update:**
- If master template border pattern changes
- If row offset logic needs adjustment
- If region name border requirements change
- If column sizing requirements change
- After visual inspection reveals border issues

**Example Sheet Dependency:**
- Sheet ID: `1Z83Lr02EW9wvpH3YfBvLwafHMIqyxJLXaO_0D85bMfk`
- If example sheet changes, borders will change
- Keep example sheet aligned with master template

---

## 📋 Supporting Scripts

### Check Bracket Progression
**File:** `testing/scripts/active/check-bracket-progression.ts`
**npm script:** `check-bracket`
**Purpose:** Verify bracket formulas propagate winners correctly

**What it checks:**
- Round 1 ALPHA checkboxes (column A)
- Round 2 ALPHA names (column E)
- Round 1 GAMMA checkboxes (column AE)
- Displays TRUE/FALSE status and names

**When to Use:**
- After running simulation
- To verify formula advancement logic
- To debug winner propagation issues

---

### Check Results
**File:** `testing/scripts/active/check-results.ts`
**npm script:** `check-results`
**Purpose:** View Results tab contents

**What it shows:**
- All completed matches
- Vote counts
- Winners
- Poll IDs and timestamps

**When to Use:**
- After simulation to verify results written correctly
- To check 16-column format
- To verify match ID format

---

### Simulate Tournament
**File:** `testing/scripts/active/simulate-tournament.ts`
**npm script:** `simulate-tournament`
**Purpose:** Run complete 6-round tournament with random winners

**What it does:**
1. Simulates all 6 rounds (Round 1 → Championship)
2. Randomly selects winners
3. Writes TRUE/FALSE to bracket checkboxes
4. Appends results to Results tab
5. Verifies formulas propagate winners correctly

**When to Use:**
- To test full tournament flow
- To verify bracket formulas work through all rounds
- To test Results tab population
- After making bracket formula changes

---

### Test Sheets Connection
**File:** `testing/scripts/active/test-sheets.ts`
**npm script:** `test-sheets`
**Purpose:** Test Google Sheets API connection

**What it tests:**
- Service account authentication
- Read access to master template
- Tab structure verification

**When to Use:**
- To verify API connection
- To test service account permissions
- After changing service account key

---

### Clear Sheet
**File:** `src/clear-sheet.ts`
**Purpose:** Clear all data and formatting from sheet

**What it does:**
- Clears all data (A1:ZZ1000) for each tab
- Clears all formatting (borders, colors, fonts, etc.)
- Prepares sheet for fresh population

**When to Use:**
- Before running populate-test-sheet manually
- To reset test sheet to blank state
- Called automatically by complete-bracket-test

---

## 📊 Master Template Alignment

### When to Update Master Template

After testing and validating changes in test sheet:

1. **Bracket Formulas Changed**
   - Update master template Bracket tab formulas
   - Test with fresh copy
   - Update `generate-bracket.ts` to match

2. **Formatting Requirements Changed**
   - Update master template formatting manually
   - Update `populate-test-sheet.ts` formatting code
   - Update `fix-bracket-borders.ts` if borders changed
   - Test with complete-bracket-test

3. **Tab Structure Changed**
   - Update master template tab names/order
   - Update all scripts that reference tab names
   - Update `populate-test-sheet.ts` tab creation
   - Update validation logic

4. **Config Settings Changed**
   - Update master template Config tab
   - Update `populate-test-sheet.ts` config data
   - Update validation logic

5. **Region Distribution Changed**
   - Update master template Regions tab
   - Update `populate-test-sheet.ts` region logic
   - Update `generate-bracket.ts` if needed

### Master Template Update Checklist

- [ ] Manually update master template with tested changes
- [ ] Update `populate-test-sheet.ts` to generate new format
- [ ] Update `generate-bracket.ts` if formulas changed
- [ ] Update `fix-bracket-borders.ts` if borders changed
- [ ] Update `complete-bracket-test.ts` if flow changed
- [ ] Run `complete-bracket-test` on fresh sheet
- [ ] Verify all formatting matches master template
- [ ] Run `simulate-tournament` to test formulas
- [ ] Update documentation if structure changed
- [ ] Commit all changes with detailed description

---

## 🔧 Formatting Summary

### Complete Formatting Applied (All Scripts Combined)

| Formatting Type | Count | Applied By | Notes |
|----------------|-------|------------|-------|
| **Cell Merges** | 11 ranges | populate-test-sheet (10), complete-bracket-test (1) | Headers + Championship |
| **Borders** | ~400+ cells | fix-bracket-borders | Copied from example sheet |
| **Region Name Borders** | 2 cells | fix-bracket-borders | E31, Y31 full borders |
| **Font Bold** | Multiple | populate-test-sheet, complete-bracket-test | All headers + row 1 |
| **Font Size** | Multiple | populate-test-sheet, complete-bracket-test | 12pt, 14pt, 16pt, 24pt |
| **Background Color** | 5 cells | populate-test-sheet, complete-bracket-test | Region names + Championship |
| **Text Alignment** | 5 cells | populate-test-sheet, complete-bracket-test | Region names + Championship |
| **Column Auto-Sizing** | All tabs | populate-test-sheet (5 tabs), fix-bracket-borders (Bracket) | After borders for Bracket |
| **Row Freezing** | 5 tabs | populate-test-sheet (4), complete-bracket-test (1) | Bracket row 1 last |
| **Text Wrapping** | Bracket | fix-bracket-borders, complete-bracket-test | CLIP (no wrapping) |
| **Checkbox Validation** | 126 cells | populate-test-sheet | Advancement indicators |
| **Grid Expansion** | Bracket | populate-test-sheet | 100 rows × 35 columns |

---

## 🚨 Common Issues & Solutions

### Issue: Borders Don't Match Master Template
**Cause:** Example sheet out of sync with master template
**Solution:** Update example sheet borders, or update master template to match example sheet

### Issue: Formulas Return #REF! Error
**Cause:** VLOOKUP references wrong columns or rows
**Solution:** Check `generate-bracket.ts` column/row calculations, verify with simulate-tournament

### Issue: Championship Cell Shows Wrong Value
**Cause:** Formula incorrect or Config tab name wrong
**Solution:** Verify formula `=Config!B3&" Champion"`, check Config tab B3 has tournament name

### Issue: Column Sizing Wrong
**Cause:** Auto-resize timing (done before borders)
**Solution:** Ensure fix-bracket-borders runs after populate-test-sheet

### Issue: Region Names Not Formatted
**Cause:** Cell positions hardcoded (E15, E31, Y15, Y31)
**Solution:** If bracket layout changes, update positions in populate-test-sheet

### Issue: Checkboxes Not Working
**Cause:** Data validation not applied or wrong cells
**Solution:** Verify checkbox positions in generate-bracket, check validation applied

---

## 📚 Related Documentation

- **Testing Guide:** [testing/README.md](README.md)
- **Bracket Population Flow:** [../requirements/BRACKET_POPULATION_FLOW.md](../requirements/BRACKET_POPULATION_FLOW.md)
- **Complete Test Summary:** [testing/reports/COMPLETE_BRACKET_TEST_SUMMARY.md](reports/COMPLETE_BRACKET_TEST_SUMMARY.md)
- **Google Sheets Spec:** [../docs/requirements/07-google-sheets-spec.md](../docs/requirements/07-google-sheets-spec.md)
- **Formula-Driven Architecture:** [../requirements/WINNER_COPY_REMOVAL.md](../requirements/WINNER_COPY_REMOVAL.md)

---

## 🔄 Workflow for Making Changes

### 1. Make Changes in Test Scripts
```bash
# Edit the appropriate script
code testing/scripts/active/populate-test-sheet.ts

# Test on test sheet
npm run complete-bracket-test 1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w

# Verify formatting
# Open: https://docs.google.com/spreadsheets/d/1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w/edit

# Test full tournament
npm run simulate-tournament 1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w
```

### 2. Validate Changes
- Visual inspection of test sheet
- Run simulation to verify formulas
- Check all 6 rounds work correctly
- Verify championship announcement displays properly

### 3. Apply to Master Template
- Manually update master template with validated formatting
- Test master template with fresh copy
- Document changes in this file

### 4. Update Scripts to Match Master Template
- Update all relevant scripts
- Test again with complete-bracket-test
- Commit changes with detailed description

### 5. Document Changes
- Update this index file
- Update COMPLETE_BRACKET_TEST_SUMMARY.md if needed
- Update PROJECT_STATUS.md if significant changes
- Update requirements docs if structure changed

---

## 📝 Version History

### 2025-11-12: Initial Index Creation
- Created comprehensive index of all sheet population scripts
- Documented complete formatting summary
- Established workflow for keeping scripts aligned with master template
- Removed redundant formatting (Championship cell, Bracket column sizing)

---

**Maintenance:** Update this file whenever scripts change, master template changes, or new formatting requirements are discovered through testing.
