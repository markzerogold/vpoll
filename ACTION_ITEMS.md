# Action Items - vPoll Project

**Last Updated:** 2025-11-12
**Status:** Active Development

---

## High Priority - Bracket Formatting Issues

### Issues Introduced by complete-bracket-test.ts

**Date Identified:** 2025-11-12
**Status:** ⚠️ Deferred (To Fix Later)

The new `complete-bracket-test.ts` script fixed several formatting issues but introduced new problems:

1. **Championship Cell Issues**
   - Formula verification shows `undefined` (may be due to merged cell reading)
   - Need to verify formula is actually working in the sheet
   - May need to adjust how merged cells are read/written

2. **Potential Border Conflicts**
   - Script applies borders from example sheet with row offset
   - May not match current test sheet structure exactly
   - Need to verify all borders are in correct locations

3. **Column Auto-Sizing**
   - Auto-resize applied twice (once in populate, once in borders)
   - May cause inconsistent column widths
   - Should consolidate to single auto-resize pass

4. **Unknown Additional Issues**
   - User noted "introduces new ones" without specifics
   - Need manual visual inspection of generated sheet
   - Document specific issues when identified

**Action Required:**
- [ ] Manual visual inspection of test sheet
- [ ] Document specific new issues discovered
- [ ] Create targeted fix scripts for each issue
- [ ] Update complete-bracket-test.ts to prevent issues

**Priority:** Medium (bracket works functionally, formatting not perfect)

---

## High Priority - MVP Development

### Discord Bot Commands (Not Started)

**From:** docs/implementation/todo-phase1.md

1. **Tournament Commands**
   - [ ] `/tournament create <sheet-url>` - Parse URL, validate, load tournament
   - [ ] `/tournament start` - Display summary, confirm, launch Round 1 polls
   - [ ] `/tournament next-round` - Manual round advancement

2. **Poll Management**
   - [ ] Create `src/services/poll.ts`
   - [ ] Implement Discord native poll creation
   - [ ] Implement poll batching logic
   - [ ] Implement poll monitoring (60-second polling, no Discord event exists)

3. **Result Tracking**
   - [ ] Implement automatic result processing
   - [ ] Update Bracket tab TRUE/FALSE
   - [ ] Append to Results tab (16 columns)
   - [ ] Implement tiebreaker dice roll

4. **Winner Announcement**
   - [ ] Detect Round 6 completion
   - [ ] Post winner announcement with formatting

**Priority:** Critical (core MVP functionality)

---

## Medium Priority - Testing & Verification

### Bracket Formula Testing

**Status:** Partially Complete

1. **Round 3 Right Side Issue** (Outstanding from previous work)
   - [ ] Investigate why GAMMA/DELTA formulas show empty
   - [ ] Fix Round 3 right side VLOOKUP references
   - [ ] Verify fix with simulation

2. **Full Tournament Simulation**
   - [ ] Run complete 64-participant tournament (all 6 rounds)
   - [ ] Verify bracket formulas work through Championship
   - [ ] Verify Results tab population
   - [ ] Verify winner announcement logic

3. **Edge Case Testing**
   - [ ] Test tiebreaker dice rolls
   - [ ] Test with non-standard participant names (special characters)
   - [ ] Test with very long participant names
   - [ ] Test poll batching variations

**Priority:** Medium (needed before production use)

---

## Medium Priority - Code Quality

### Google Sheets Integration

**Status:** Partially Complete

1. **Service Account Validation**
   - [ ] Create `src/services/validation.ts`
   - [ ] Validate tab structure (6 required tabs)
   - [ ] Validate Participants tab (64 unique, ranks 1-64)
   - [ ] Validate Config tab (required settings)
   - [ ] Check service account permissions
   - [ ] Check Discord channel access

2. **Results Tab Writing**
   - [ ] Implement 16-column result row writing
   - [ ] Test with actual poll results
   - [ ] Verify timestamp formatting

3. **Bracket Cell Mapping**
   - [ ] Document named range approach for TRUE/FALSE cells
   - [ ] Implement match ID → cell location mapping
   - [ ] Test with all 6 rounds

**Priority:** Medium (needed for bot functionality)

---

## Low Priority - Documentation

### Documentation Cleanup

1. **Consolidate Formatting Docs**
   - [ ] Archive old formatting fix summaries
   - [ ] Keep only current/relevant docs
   - [ ] Create single source of truth for formatting process

2. **Update Quick Start Guide**
   - [ ] Update docs/quick-start/setup.md with complete-bracket-test
   - [ ] Update common-tasks.md with new scripts
   - [ ] Remove references to deprecated scripts

3. **API Documentation**
   - [ ] Complete Discord poll API docs
   - [ ] Complete Google Sheets API patterns
   - [ ] Add code examples

**Priority:** Low (nice to have)

---

## Completed ✅

### Bracket Formatting (2025-11-12)
- ✅ Created complete-bracket-test.ts script
- ✅ Fixed row 1 freeze and bold
- ✅ Fixed column auto-sizing (E, Y)
- ✅ Fixed Championship cell formula and merge
- ✅ Applied comprehensive borders (461 borders)
- ✅ Documented complete process in COMPLETE_BRACKET_TEST_SUMMARY.md

### Sheet Population (2025-11-08)
- ✅ Formula-driven bracket specification
- ✅ Regions tab structure with correct seed order
- ✅ Round 1-6 bracket formulas
- ✅ Cell merging and region name formatting
- ✅ Removed problematic winner copy code

---

## Deferred (Post-MVP)

See FUTURE.md for complete list of deferred features:
- Multi-tournament support
- Match preview posts
- Participant info lookup command
- Bracket image/PDF generation
- Role-based voting enforcement
- Announcements channel
- And more...

---

## Notes

- Keep this file updated as new issues are discovered
- Mark items complete when done
- Add new sections as needed
- Reference specific files/line numbers when possible
