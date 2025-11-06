# Bracket Formatting Fix Summary
**Date:** 2025-11-06
**Sheet:** https://docs.google.com/spreadsheets/d/1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w/edit

## Problem

The bracket tab was populated without proper formatting:
- ❌ No borders around matches
- ❌ No merged cells for round headers
- ❌ No background colors for region names
- ❌ No font sizing or bold formatting
- ❌ Plain appearance like a raw data table

See: `debug/new-test-Screenshot 2025-11-06 063920.png`

## Solution Created

Created comprehensive formatting script: `src/apply-bracket-formatting.ts`

This script applies:

### 1. Round Headers (Row 1)
- **Merged cells** across columns for each round
- **Bold text** + **Centered** alignment  
- **Font size 12**

Rounds formatted:
- Round 1 (columns A-B)
- Round 2 (columns D-F)
- Sweet 16 (columns G-I)
- Elite 8 (columns J-L)
- Final 4 (columns M-O)
- Championship (columns P-T)
- Final 4 (columns U-W)
- Elite 8 (columns X-Z)
- Sweet 16 (columns AA-AC)
- Round 2 (columns AD-AF)
- Round 1 (columns AG-AI)

### 2. Region Name Headers
- **Background colors:**
  - Federation (row 17): Light green (#D9EAD3)
  - Klingon Empire (row 49): Light red (#F4CCCC)
  - Romulan Star Empire (row 17, right): Light blue (#D9E2F3)
  - Dominion (row 49, right): Light orange (#FCE5CD)
- **Bold text** + **Centered**
- **Font size 11**

### 3. Match Borders
- **Solid borders** around each match (2 participants)
- **Width 2px** for outer box
- **Width 1px** for middle divider between participants
- Applied to all 68 matches across 6 rounds

### 4. Championship Label
- "The Greatest" centered and bold
- **Font size 14**

## Execution Results

```
✅ Found 136 checkboxes (68 matches × 2 participants)
✅ Generated 335 border requests
✅ Generated 27 formatting requests
✅ Applied 362 total formatting requests in 4 batches
```

## Technical Details

### How It Works

1. **Find checkboxes** - Scans Bracket tab for all boolean cells
2. **Group by column** - Groups checkboxes by column letter
3. **Generate borders** - Creates border requests for each pair of checkboxes (match)
4. **Generate formatting** - Creates merge, color, and font requests
5. **Apply in batches** - Sends requests in batches of 100 to avoid API limits

### Key Fix: SheetId 0 Issue

Original code treated sheetId 0 as falsy (like false/null):
```typescript
if (!bracketSheet || !bracketSheet.properties?.sheetId) {
  // This fails when sheetId is 0!
}
```

Fixed to explicitly check for undefined/null:
```typescript
if (!bracketSheet || bracketSheet.properties?.sheetId === undefined || bracketSheet.properties?.sheetId === null) {
  // Now correctly handles sheetId 0
}
```

## NPM Command Added

```bash
npm run format-bracket <spreadsheet-id>
```

Example:
```bash
npm run format-bracket 1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w
```

## Usage Workflow

### For New Sheets
1. Create blank Google Sheet
2. Share with service account (Editor)
3. `npm run populate-test-sheet <id>` - Adds data and checkboxes
4. `npm run format-bracket <id>` - Adds borders, colors, merges
5. Sheet is now fully formatted!

### For Existing Sheets
Can run `npm run format-bracket` on any sheet with checkboxes to apply borders and formatting.

## View Results

**Direct link:** https://docs.google.com/spreadsheets/d/1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w/edit#gid=0

The bracket tab should now have:
- ✅ Clean borders around all matches
- ✅ Merged, bold round headers  
- ✅ Colored region name backgrounds
- ✅ Proper championship formatting
- ✅ Professional tournament bracket appearance

## Files Modified/Created

1. **Created:** `src/apply-bracket-formatting.ts` (428 lines)
2. **Modified:** `package.json` - Added `format-bracket` script
3. **Log:** `bracket-formatting-log.txt` - Execution log

## Related Issues

This also addresses the broader problem that `populate-test-sheet.ts` doesn't apply formatting automatically. Options:

### Option A: Keep Separate (Current)
- `populate-test-sheet` = data only
- `format-bracket` = formatting only
- Pros: Modular, can reformat existing sheets
- Cons: Two-step process

### Option B: Integrate
- Have `populate-test-sheet` call formatting at the end
- Pros: One command does everything
- Cons: Harder to re-run just formatting

**Recommendation:** Keep separate for now, add combined command later if needed.
