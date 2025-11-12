# Backup / Archived Files

**Purpose:** Historical files no longer actively used but preserved for reference

**Last Updated:** 2025-11-12

---

## When to Use This Folder

These files are **archived** and should only be referenced in specific situations:

1. **Historical Context** - Understanding past decisions and approaches
2. **Troubleshooting** - Investigating issues related to old implementations
3. **Reference** - Looking up details from previous formatting attempts

**Do NOT use these files for:**
- Current development work (use active documentation in docs/ instead)
- Running scripts (use testing/scripts/active/ instead)
- Understanding current system (see PROJECT_STATUS.md)

---

## Folder Structure

### `historical-docs/` (20 files)

Historical documentation about bracket formatting, borders, and fixes that are now superseded by current implementations.

**Superseded By:** `COMPLETE_BRACKET_TEST_SUMMARY.md` and `testing/scripts/active/complete-bracket-test.ts`

**Files Include:**
- Bracket formatting fixes (BRACKET_FORMATTING_*.md)
- Border issue tracking (BORDER_*.md)
- Championship cell fixes (CHAMPIONSHIP_*.md)
- Regional positioning (REGION_*.md)
- Round 3 formula fixes (ROUND3_*.md)

**When to Reference:**
- Investigating why specific formatting approaches were tried
- Understanding evolution of bracket formatting
- Troubleshooting edge cases mentioned in old docs

### `deprecated-scripts/` (60 files)

Old TypeScript testing and analysis scripts that have been replaced by newer, more comprehensive tools.

**Superseded By:** `testing/scripts/active/` scripts

**Categories:**
- **Analysis scripts** (analyze-*.ts) - Investigated bracket structure
- **Check scripts** (check-*.ts) - Verified specific cells or formulas
- **Fix scripts** (fix-*.ts) - Applied specific formatting fixes
- **Apply scripts** (apply-*.ts) - Applied borders or styling

**When to Reference:**
- Need to understand how a specific check was performed
- Investigating logic for a specific formula verification
- Looking up how a particular border fix was implemented

**Do NOT Run These:**
- These scripts are outdated and may not work with current sheet structure
- Use `testing/scripts/active/complete-bracket-test.ts` instead

---

## Migration Notes

### What Changed (2025-11-12)

**Problem:** Root directory had 42 markdown files and 77 src/ scripts, making navigation difficult

**Solution:** Consolidated and archived

1. **20 historical docs** moved here from root
2. **60 deprecated scripts** moved here from src/
3. **All logs** moved to testing/logs/
4. **All reports** moved to testing/reports/

**Result:** Root now has 7 essential files, src/ has ~15 core files

### Key Replacements

| Old (Archived) | New (Active) |
|----------------|--------------|
| comprehensive-format-test.ts | complete-bracket-test.ts |
| fix-missing-borders.ts | complete-bracket-test.ts (includes borders) |
| 20+ bracket formatting .md files | COMPLETE_BRACKET_TEST_SUMMARY.md |
| 30+ check-*.ts scripts | check-results.ts, check-bracket-progression.ts |
| 15+ fix-*.ts scripts | complete-bracket-test.ts |

---

## Deleted Files (Not Archived)

The following files were deleted as they were truly obsolete duplicates:

- `REQUIREMENTS_OLD.md` - Ancient version, superseded by docs/requirements/
- `bracket-formatting-summary.md` - Exact duplicate of another file

---

## When to Clean Up This Folder

After 6 months (2025-05-12), consider:
- Deleting files if never referenced
- Further consolidation if patterns emerge
- Moving frequently-referenced files back to active documentation

---

**Questions?** See PROJECT_STATUS.md for current status or docs/ for active documentation
