# vPoll Project Status

**Last Updated:** 2025-11-14
**Current Phase:** Bracket Formatting with Source Sheet Authority - Ready for Bot Development
**Next Phase:** Implement Discord Bot Commands (MVP Phase 1)

---

## Completed Work ✅

### 1. Formula-Driven Bracket Specification
- Defined complete bracket behavior (requirements/BRACKET_POPULATION_FLOW.md)
- Participants tab → Regions tab → Round 1 (all via formulas)
- Seed order: 1, 16, 8, 9, 5, 12, 4, 13, 6, 11, 3, 14, 7, 10, 2, 15 (FIXED)
- vPoll ONLY writes TRUE/FALSE to checkboxes
- Round 2-6 use VLOOKUP(TRUE,...) to auto-display winners

### 2. Regions Tab Structure
- Column A: "Seed" (not "Rank") with correct order
- Participant distribution across 4 regions (16 each)
- VLOOKUP formulas pull from Participants tab
- Updated documentation (docs/requirements/07-google-sheets-spec.md)

### 3. Round 1 Bracket Formulas
- Format: `="(" & Regions!$A$3 & ") " & Regions!$B$3`
- Displays: `(1) Spock (TOS/TAS/Films/SNW)`
- Verified working for all 64 participants

### 4. Complete Bracket Formatting (2025-11-12)

**Script Created:** `testing/scripts/active/complete-bracket-test.ts`
**Duration:** 41.7 seconds
**Command:** `npm run complete-bracket-test <sheet-id>`

**What It Does:**
1. Clear sheet completely (all tabs)
2. Populate test data (136 formulas, 64 participants, 126 checkboxes)
3. Apply comprehensive borders (461 borders from example sheet)
4. Freeze and bold Bracket row 1
5. Update Championship cell with formula and merge (O17:O18)
6. Verify all formatting

**Formatting Applied:**
- ✅ Row 1 frozen and bolded
- ✅ 461 comprehensive borders (not just 50)
- ✅ Championship cell: `=Config!B3&" Champion"`, merged, 16pt bold, gold background
- ✅ All columns auto-sized (including E and Y)
- ✅ Cell merging (10 header ranges)
- ✅ Region name formatting (4 cells, light blue/green backgrounds, 24pt bold)
- ✅ Text wrapping disabled

**Documentation:**
- testing/reports/COMPLETE_BRACKET_TEST_SUMMARY.md - Full details of test and fixes

### 5. Winner Copy Code Removed
- Removed 114 lines of problematic code (simulate-tournament.ts lines 488-602)
- Code was overwriting region names and formulas
- Bracket is now purely formula-driven

### 6. Round 3 Formula Fixes
- Left side (ALPHA/BETA): Fixed to reference correct Round 2 rows
- Right side (GAMMA/DELTA): Fixed column (AB not X) and VLOOKUP source (W:AA)

### 7. Sheet Population (2025-11-08)
- ✅ Formula-driven bracket specification
- ✅ Regions tab structure with correct seed order
- ✅ Round 1-6 bracket formulas
- ✅ Cell merging and region name formatting
- ✅ Removed problematic winner copy code

### 8. Source Sheet Formatting Authority (2025-11-14)

**Achievement:** Established user's manually-formatted sheet as single source of truth for ALL bracket formatting

**Source Sheet:** `1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w`

**Scripts Created:**
- ✅ `read-bracket-formatting.ts` - Analyzes and documents all formatting from source
- ✅ `copy-bracket-formatting.ts` - Copies 1995 cells + 16 merges with 100% fidelity
- ✅ `fix-test-sheet.ts` - Championship cell and column autosizing only

**Scripts Updated:**
- ✅ `populate-test-sheet.ts` - Added `--skip-region-formatting` flag to preserve copied formatting
- ✅ `generate-bracket.ts` - Fixed region name row positions (E31/Y31 → E47/Y47)
- ✅ `generate-complete-bracket.ts` - Removed region value overwriting, preserves formulas

**Critical Fixes:**
1. **Region name formulas preserved** - No longer overwritten with hardcoded values
   - E15: `=Regions!B2` (not "Federation")
   - E47: `=Regions!C2` (not "Klingon Empire")
   - Y15: `=Regions!D2` (not "Romulan Star Empire")
   - Y47: `=Regions!E2` (not "Dominion")
2. **Region positioning corrected** - Bottom regions moved from row 31 to row 47
3. **Formatting conflicts resolved** - `populate-test-sheet.ts` no longer overwrites merged blocks

**Workflow (3 Steps):**
```bash
# Step 1: Copy ALL formatting from source
cd testing/scripts/active && npx ts-node copy-bracket-formatting.ts

# Step 2: Populate data WITHOUT overwriting formatting
npm run populate-test-sheet <sheet-id> -- --skip-region-formatting

# Step 3: Championship cell and autosize columns
cd testing/scripts/active && npx ts-node fix-test-sheet.ts
```

**Duration:** ~50 seconds | **Result:** 100% formatting fidelity to source sheet

**Documentation:**
- testing/reports/BRACKET_FORMATTING_CAPTURE.md - Complete formatting specification
- testing/reports/BRACKET_GENERATION_WORKFLOW.md - 3-step workflow details
- testing/reports/FORMATTING_CONFLICT_FIX.md - How conflicts were resolved

### 9. Standalone Formatting Generation (2025-11-17)

**Achievement:** Bracket generation now works entirely from scripts - no external sheet dependencies required during generation

**Source Sheet:** `1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w` (used once to extract rules, not needed for generation)

**Scripts Created:**
- ✅ `extract-all-formatting.ts` - ONE-TIME: Extracts all formatting from source, generates standalone code
- ✅ `apply-formatting-standalone.ts` - GENERATED: Self-contained formatting (481 requests, 9000+ lines)

**Scripts Updated:**
- ✅ `complete-bracket-test.ts` - Now uses `apply-formatting-standalone.ts` instead of `copy-bracket-formatting.ts`
- ✅ `fix-test-sheet.ts` - Accepts command-line sheet ID argument

**Key Innovation:**
- Formatting rules extracted once from source sheet into TypeScript code
- All 1995 cells, 460 borders, 16 merges codified
- Championship cell (O17) and winner cell (O19) formatting codified
- Proper null handling for Google Sheets API responses
- No external sheet access required during bracket generation

**Workflow (4 Steps):**
```bash
# Recommended: One command
npm run complete-bracket-test <sheet-id>

# Manual steps if needed:
# 1. Clear sheet
cd testing/scripts/active && npx ts-node clear-sheet.ts <sheet-id>

# 2. Apply formatting from codified rules (NO external sheet dependency)
cd testing/scripts/active && npx ts-node apply-formatting-standalone.ts <sheet-id>

# 3. Populate data WITHOUT overwriting formatting
npm run populate-test-sheet <sheet-id> -- --skip-region-formatting

# 4. Championship cell and autosize columns
cd testing/scripts/active && npx ts-node fix-test-sheet.ts <sheet-id>
```

**Duration:** ~60 seconds | **Result:** Perfect bracket generated entirely from scripts

**Benefits:**
- ✅ No external sheet dependencies during generation
- ✅ All formatting rules version-controlled in code
- ✅ Faster (no API calls to read source sheet)
- ✅ More reliable (no network dependency on source sheet)
- ✅ Complete independence from external resources

**Documentation:**
- testing/reports/STANDALONE_FORMATTING_ACHIEVEMENT.md - Complete achievement summary
- testing/reports/BRACKET_GENERATION_WORKFLOW.md - Updated with extraction process
- testing/reports/CHAMPIONSHIP_FORMATTING_FIX.md - Championship cell (O17) formatting fix
- testing/reports/WINNER_CELL_FORMATTING_FIX.md - Winner cell (O19) formatting fix

**Verification Scripts Created:**
- ✅ `check-source-championship.ts` - Verify O17 formatting in source
- ✅ `check-target-championship.ts` - Verify O17 formatting in target
- ✅ `check-source-o19.ts` - Verify O19 formatting in source
- ✅ `check-target-o19.ts` - Verify O19 formatting in target

**Scripts Deprecated:**
- `copy-bracket-formatting.ts` - Replaced by standalone approach

---

## Active Tasks

### High Priority - MVP Development (Critical)

**Status:** ⚠️ Not Started
**Priority:** Critical for core functionality

#### Tournament Commands
- [ ] `/tournament create <sheet-url>` - Parse URL, validate, load tournament
- [ ] `/tournament start` - Display summary, confirm, launch Round 1 polls
- [ ] `/tournament next-round` - Manual round advancement

#### Poll Management
- [ ] Create `src/services/poll.ts`
- [ ] Implement Discord native poll creation
- [ ] Implement poll batching logic
- [ ] Implement poll monitoring (60-second polling, no Discord event exists)

#### Result Tracking
- [ ] Implement automatic result processing
- [ ] Update Bracket tab TRUE/FALSE
- [ ] Append to Results tab (16 columns)
- [ ] Implement tiebreaker dice roll

#### Winner Announcement
- [ ] Detect Round 6 completion
- [ ] Post winner announcement with formatting

**See:** docs/implementation/todo-phase1.md for complete checklist

### Medium Priority - Testing & Verification

**Status:** Partially Complete

#### Bracket Formula Testing
- [ ] Investigate why Round 3 GAMMA/DELTA formulas show empty
- [ ] Fix Round 3 right side VLOOKUP references
- [ ] Verify fix with simulation

#### Full Tournament Simulation
- [ ] Run complete 64-participant tournament (all 6 rounds)
- [ ] Verify bracket formulas work through Championship
- [ ] Verify Results tab population
- [ ] Verify winner announcement logic

#### Edge Case Testing
- [ ] Test tiebreaker dice rolls
- [ ] Test with non-standard participant names (special characters)
- [ ] Test with very long participant names
- [ ] Test poll batching variations

### Medium Priority - Code Quality

**Status:** Partially Complete

#### Service Account Validation
- [ ] Create `src/services/validation.ts`
- [ ] Validate tab structure (6 required tabs)
- [ ] Validate Participants tab (64 unique, ranks 1-64)
- [ ] Validate Config tab (required settings)
- [ ] Check service account permissions
- [ ] Check Discord channel access

#### Results Tab Writing
- [ ] Implement 16-column result row writing
- [ ] Test with actual poll results
- [ ] Verify timestamp formatting

#### Bracket Cell Mapping
- [ ] Document named range approach for TRUE/FALSE cells
- [ ] Implement match ID → cell location mapping
- [ ] Test with all 6 rounds

### Low Priority - Documentation

**Status:** Not Started

#### Documentation Cleanup
- [ ] Consolidate formatting docs
- [ ] Archive old formatting fix summaries
- [ ] Keep only current/relevant docs
- [ ] Create single source of truth for formatting process

#### Update Quick Start Guide
- [ ] Update docs/quick-start/setup.md with complete-bracket-test
- [ ] Update common-tasks.md with new scripts
- [ ] Remove references to deprecated scripts

#### API Documentation
- [ ] Complete Discord poll API docs
- [ ] Complete Google Sheets API patterns
- [ ] Add code examples

---

## Known Issues

### 1. Bracket Formatting Issues (RESOLVED)

**Date Identified:** 2025-11-12
**Status:** ✅ **FIXED** 2025-11-14
**Priority:** ~~Medium~~ Complete

**Original Issues:**
- Region names cut off
- Column auto-sizing issues
- Formatting conflicts between scripts
- Region name formulas being overwritten with hardcoded values

**Resolution:**
- Created source sheet formatting authority workflow (see Completed Work #8)
- `copy-bracket-formatting.ts` copies ALL formatting with 100% fidelity
- `populate-test-sheet.ts` preserves formatting with `--skip-region-formatting` flag
- `fix-test-sheet.ts` no longer overwrites region name formulas
- All formatting comes from user's source sheet: `1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w`

**Documentation:**
- testing/reports/FORMATTING_CONFLICT_FIX.md - Complete resolution details

### 2. Round 3 Right Side (Outstanding from Previous Work)

**Status:** ⚠️ Needs Investigation
**Priority:** Medium

- Formulas exist in column AB but show (empty)
- Left side Round 3 works correctly
- Needs investigation of VLOOKUP formula references

### 3. Rounds 4-6 Not Fully Tested

**Status:** ❌ Not Tested
**Priority:** High

- Only tested through Round 3
- Need to verify Round 4, 5, 6 formulas work correctly
- Full tournament simulation pending

---

## Testing Status

### ✅ Verified Working
- Participants tab population (64 participants)
- Regions tab structure (seed order, distribution)
- Round 1 formulas (all 64 participants display correctly)
- Round 2 formulas (syntax correct)
- Checkbox initialization (all FALSE)
- Cell merging (10 ranges)
- Region name formatting (4 cells)
- Border application (461 cells)
- Row 1 freeze and bold (Bracket tab)
- Championship cell formatting and merge
- Column auto-sizing (all columns A-AE)

### ⚠️ Partially Working
- Round 3 left side (ALPHA/BETA) - formulas correct
- Round 3 right side (GAMMA/DELTA) - formulas exist but empty

### ❌ Not Yet Tested
- Round 4 formulas
- Round 5 formulas
- Round 6 (Championship) formula
- Full tournament simulation (all 6 rounds)
- Winner announcement
- Tiebreaker dice rolls
- Result tab population via bot

---

## Deferred (Post-MVP)

See docs/reference/FUTURE.md for complete list of deferred features:
- Multi-tournament support
- Match preview posts
- Participant info lookup command
- Bracket image/PDF generation
- Role-based voting enforcement
- Announcements channel
- Advanced statistics and analytics
- Historical tournament tracking
- And more...

---

## Files Created/Modified (Recent)

### New Files (2025-11-14)
- `testing/scripts/active/read-bracket-formatting.ts` - Analyzes source sheet formatting
- `testing/scripts/active/copy-bracket-formatting.ts` - Copies ALL formatting from source sheet
- `testing/scripts/active/fix-test-sheet.ts` - Championship cell and column autosizing
- `testing/reports/BRACKET_FORMATTING_CAPTURE.md` - Complete formatting specification from source
- `testing/reports/BRACKET_GENERATION_WORKFLOW.md` - 3-step workflow documentation
- `testing/reports/FORMATTING_CONFLICT_FIX.md` - How formatting conflicts were resolved

### Modified Files (2025-11-14)
- `testing/scripts/active/populate-test-sheet.ts` - Added `--skip-region-formatting` flag (lines 465-541)
- `testing/scripts/active/generate-bracket.ts` - Fixed region row positions (31 → 47)
- `testing/scripts/active/generate-complete-bracket.ts` - Removed region value overwriting, preserves formulas
- `PROJECT_STATUS.md` - Added section 8 (Source Sheet Formatting Authority), updated Known Issues

### New Files (2025-11-12)
- `testing/scripts/active/complete-bracket-test.ts` - Comprehensive formatting test (REPLACES comprehensive-format-test.ts)
- `testing/reports/COMPLETE_BRACKET_TEST_SUMMARY.md` - Full documentation of formatting fixes
- `.claude/agents/discord-bot-dev.md` - Discord.js v14 expert subagent
- `.claude/agents/sheets-integration.md` - Google Sheets API v4 expert subagent
- `requirements/REQUIREMENTS.md` - High-level requirements index
- `requirements/BRACKET_POPULATION_FLOW.md` - Moved from root
- `requirements/WINNER_COPY_REMOVAL.md` - Moved from root

### Modified Files (2025-11-12)
- `package.json` - Added `complete-bracket-test` script
- `README.md` - Added agents section, updated structure, removed ACTION_ITEMS reference
- `CLAUDE.md` - Added agents section, updated references, removed ACTION_ITEMS
- `PROJECT_STATUS.md` - Merged with ACTION_ITEMS.md for single source of truth
- `testing/README.md` - Updated reports section

### Removed Files (2025-11-12)
- `ACTION_ITEMS.md` - Merged into PROJECT_STATUS.md

### Core Bracket Generation (Previous)
- `src/generate-bracket.ts` - Fixed Round 3 right side formulas
- `src/populate-test-sheet.ts` - Added cell merging and region formatting

### Simulation (Previous)
- `src/simulate-tournament.ts` - Removed winner copy code (lines 488-602)

### Utilities (Previous)
- `src/clear-sheet.ts` - Clear all data/formatting from sheet
- `src/fix-bracket-borders.ts` - Apply comprehensive borders from example sheet
- `src/fix-missing-borders.ts` - Apply 50 specific border fixes (superseded)
- `src/verify-population.ts` - Verify Regions tab and formulas
- `src/check-formatting.ts` - Check merges, borders, backgrounds
- `src/check-round3-formulas.ts` - Verify Round 3 VLOOKUP formulas

### Documentation (Previous)
- `requirements/BRACKET_POPULATION_FLOW.md` - Complete bracket specification
- `FORMATTING_FIX_SUMMARY.md` - Details of formatting fixes (Nov 10)
- `FORMATTING_FIX_SUMMARY_2025-11-10.md` - Nov 10 specific fixes
- `POPULATION_REPORT.md` - Latest population verification
- `requirements/WINNER_COPY_REMOVAL.md` - Why winner copy code was removed
- `ROUND3_FORMULA_FIX.md` - Round 3 formula fix details
- Updated `docs/requirements/07-google-sheets-spec.md` - Regions tab spec

---

## Next Steps

### Immediate Priority: Begin MVP Development

The bracket formatting is complete with source sheet authority established. The project is ready to start Discord bot implementation.

**Critical Path:**
1. Implement `/tournament create` and validation (see Active Tasks above)
2. Implement `/tournament start` and poll creation
3. Implement result tracking and bracket updates
4. Test full tournament flow

**Alternative Path (Testing First):**
1. Run full tournament simulation to verify Rounds 4-6
2. Fix any issues discovered
3. Then begin bot implementation

**Recommended:** Start bot implementation. Testing can happen in parallel as features are developed.

---

## Test Sheets

### Source Sheet (Authority)
**ID:** 1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w
**URL:** https://docs.google.com/spreadsheets/d/1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w/edit
**Status:** Master template - Single source of truth for ALL bracket formatting

### Target Sheet (Generated)
**ID:** 1oInaAH5nZbFCwLnTKmbT5uYO2haFGkBCfPMDBSrmD6M
**URL:** https://docs.google.com/spreadsheets/d/1oInaAH5nZbFCwLnTKmbT5uYO2haFGkBCfPMDBSrmD6M/edit
**Status:** Fully formatted with source sheet workflow (2025-11-14), ready for simulation testing
**Last Generated:** 2025-11-14
**Generation Time:** ~50 seconds (3-step workflow)
**Formatting Fidelity:** 100% match to source sheet

---

## Commands Reference

### Sheet Population (SINGLE COMMAND - USE THIS) ✅

```bash
# Complete bracket generation and formatting - ONE COMMAND
npm run complete-bracket-test <sheet-id>

# Example:
npm run complete-bracket-test 1oInaAH5nZbFCwLnTKmbT5uYO2haFGkBCfPMDBSrmD6M
```

**What it does (5 automated steps):**
1. ✅ Clears sheet completely
2. ✅ Copies formatting from source sheet (79 cells, 16 merges, row freeze)
3. ✅ Populates pizza tournament data (136 formulas, 126 checkboxes, 64 participants)
4. ✅ Fixes championship cell formula and autosizes columns
5. ✅ Applies comprehensive borders from example sheet (459 borders)

**Result:** Perfectly formatted bracket, ready for simulation or use
**Duration:** ~2 minutes
**Column structure:** Round 3 names in column X (no conflicts with AB checkboxes)

### Sheet Population (Manual 5-Step Workflow - Only for Debugging)

```bash
# Step 1: Clear sheet
cd testing/scripts/active && npx ts-node clear-sheet.ts <sheet-id>

# Step 2: Copy formatting from source
cd testing/scripts/active && npx ts-node copy-bracket-formatting.ts

# Step 3: Populate data (skip region formatting to preserve source formatting)
npm run populate-test-sheet <sheet-id> -- --skip-region-formatting

# Step 4: Fix championship and autosize
cd testing/scripts/active && npx ts-node fix-test-sheet.ts

# Step 5: Apply comprehensive borders
npm run apply-borders <sheet-id>
```

### Verification

```bash
npx ts-node src/verify-population.ts     # Check data
npx ts-node src/check-formatting.ts      # Check formatting
npx ts-node src/check-round3-formulas.ts # Check Round 3
```

### Simulation

```bash
npm run simulate-tournament 1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w
npm run check-results 1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w
```

---

## Key Decisions

### Architecture
- ✅ **Bracket is formula-driven** - vPoll only writes checkboxes
- ✅ **Regions tab uses fixed seed order** - 1,16,8,9,5,12,4,13,6,11,3,14,7,10,2,15
- ✅ **Cell merging before borders** - Ensures correct calculations
- ✅ **No winner copying** - Formulas handle advancement
- ✅ **Comprehensive border script** - Use fix-bracket-borders.ts (461 borders), not fix-missing-borders.ts (50 borders)
- ✅ **Freeze and bold Bracket row 1** - Done in complete-bracket-test.ts
- ✅ **Championship cell with formula** - =Config!B3&" Champion", merged O17:O18

### Process
- ✅ **Clear → Data → Borders → Row1 → Championship** - Defined order in complete-bracket-test.ts
- ✅ **Single script for all formatting** - complete-bracket-test.ts handles everything
- ✅ **Populate includes basic formatting** - Merging and region names built-in
- ✅ **Borders applied from example sheet** - Copied with row offset correction

### Project Organization
- ✅ **Separate requirements folders** - High-level (requirements/) vs detailed (docs/requirements/)
- ✅ **Test reports in testing/reports/** - Historical analysis and verification
- ✅ **Single status file** - PROJECT_STATUS.md merged with ACTION_ITEMS.md
- ✅ **Claude Code subagents** - discord-bot-dev and sheets-integration in .claude/agents/

---

**Status:** Bracket formatting complete with minor issues deferred. Ready to begin MVP Discord bot development.

**Next Major Milestone:** Implement `/tournament create` and `/tournament start` commands.
