# Border Issue - TODO

**Date:** 2025-11-04
**Status:** ⚠️ Known Issue - Fix Pending

## Problem

After running `copy-test-borders` and `update-example-borders`, the borders were broken again (see `debug/bad-Screenshot 2025-11-04 065440.png`).

## Observation

The scripts that read and reapply borders appear to be modifying them during the read/reapply process, even though they should be preserving them exactly.

## Suspected Cause

The read-and-reapply approach may be:
1. Reading borders with different API calls than writing
2. Losing some border information in translation
3. Applying borders in a way that overwrites existing borders incorrectly

## What Was Tried

1. **Automated copying from example sheet** - Did not work correctly, gaps remained
2. **Manual correction + read/reapply** - Reading and reapplying appears to break the borders

## Screenshot Reference

- **Good borders (manual):** `debug/good-Screenshot 2025-11-04 065206.png`
- **Broken borders (after script):** `debug/bad-Screenshot 2025-11-04 065440.png`

## Next Steps to Try

### Option 1: Don't Touch Manual Corrections
- User manually corrects borders
- **DO NOT run any scripts**
- Manually copy the example sheet as a backup
- Use manual corrections directly, no scripting

### Option 2: Different API Approach
- Use `copyPaste` API instead of reading/reapplying
- Copy borders from one range to another as a block operation
- May preserve formatting better than cell-by-cell operations

### Option 3: Use Conditional Formatting or Border Styles
- Define border styles at sheet level
- Apply styles by reference rather than explicit borders
- May be more stable across operations

## Recommendation

**For now:** Keep borders manually corrected in test sheet, don't run border scripts.

**For future:** Investigate why read/reapply breaks borders, or find alternative approach that doesn't modify during preservation.

---

**Status:** ⚠️ Issue documented - fix deferred to future session
