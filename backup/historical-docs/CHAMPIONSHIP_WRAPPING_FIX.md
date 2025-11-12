# Championship Label Text Wrapping Fix

**Date:** 2025-11-03
**Status:** Complete ✅

## Overview

Updated the championship label in the Bracket tab to wrap text after the tournament name, creating a cleaner multi-line display.

## Implementation

### Formula Change

**Before:** `=Config!B3&" Champion"`

**After:** `=Config!B3&CHAR(10)&"Champion"`

**Key Change:** Using `CHAR(10)` (line feed character) to insert a line break between the tournament name and "Champion"

### Visual Result

**Before (single line):**
```
Star Trek Character Battle 2025 Champion
```

**After (two lines):**
```
Star Trek Character Battle 2025
Champion
```

## Technical Details

### 1. Formula Update

The `CHAR(10)` function inserts a line break character (ASCII 10 - line feed):

```typescript
await sheets.spreadsheets.values.update({
  spreadsheetId: TEST_SHEET_ID,
  range: 'Bracket!O18',
  valueInputOption: 'USER_ENTERED',
  requestBody: {
    values: [['=Config!B3&CHAR(10)&"Champion"']],
  },
});
```

### 2. Enable Text Wrapping

Column O (merged range O18:Q18) must have `wrapStrategy: 'WRAP'` to display line breaks:

```typescript
repeatCell: {
  range: {
    sheetId,
    startRowIndex: 17,
    endRowIndex: 18,
    startColumnIndex: colToIndex('O'),
    endColumnIndex: colToIndex('Q') + 1
  },
  cell: {
    userEnteredFormat: {
      wrapStrategy: 'WRAP',  // ← Required for line breaks to display
      textFormat: { bold: true, fontSize: 16 },
      horizontalAlignment: 'CENTER',
      verticalAlignment: 'MIDDLE',
    },
  },
}
```

### 3. Auto-Size Columns

Columns O, P, and Q (the merged range) are auto-sized to fit the wrapped text:

```typescript
// Auto-size each column in the merged range
autoResizeDimensions: {
  dimensions: {
    sheetId,
    dimension: 'COLUMNS',
    startIndex: colToIndex('O'),
    endIndex: colToIndex('O') + 1,
  }
}
```

### 4. Selective Text Wrapping

**Column O (merged O18:Q18):** Text wrapping **ENABLED** (WRAP strategy)
- Displays line breaks from `CHAR(10)`
- Auto-sizes to fit wrapped content

**All other columns:** Text wrapping **DISABLED** (CLIP strategy)
- Single-line display
- No wrapping for participant names, round headers, etc.

Implementation:
```typescript
// Columns A-N: CLIP
repeatCell: {
  range: { startColumnIndex: 0, endColumnIndex: colToIndex('O') },
  cell: { userEnteredFormat: { wrapStrategy: 'CLIP' } }
}

// Column O-Q: WRAP (set in step 2)

// Columns R-AF: CLIP
repeatCell: {
  range: { startColumnIndex: colToIndex('R'), endColumnIndex: 32 },
  cell: { userEnteredFormat: { wrapStrategy: 'CLIP' } }
}
```

## Benefits

1. **Better Visual Hierarchy:** "Champion" on separate line draws attention
2. **Cleaner Layout:** Easier to read, especially with long tournament names
3. **Consistent Width:** Column O doesn't need excessive width for one long line
4. **Professional Appearance:** Multi-line centered text looks polished

## Usage

### Apply the Fix

```bash
npm run fix-championship-wrap
```

This script:
1. Updates O18 formula to use `CHAR(10)`
2. Enables text wrapping for merged range O18:Q18
3. Auto-sizes columns O, P, Q
4. Verifies the change

### Main Enhancement Script

The `enhance-bracket-formatting.ts` script has been updated to include this wrapping behavior by default:

```bash
npm run enhance-formatting
```

Now applies:
- Line break in championship formula
- Text wrapping for column O
- Text clipping for all other columns

## Example Output

### Tournament Name Examples

**Short name:**
```
Best Pizza Toppings
Champion
```

**Medium name:**
```
Star Trek Character Battle 2025
Champion
```

**Long name:**
```
The Ultimate Science Fiction Television Series Character Tournament Championship
Champion
```

All variants display cleanly with "Champion" on its own line.

## Files Modified

### Scripts
- `src/fix-championship-wrapping.ts` - One-time fix script
- `src/enhance-bracket-formatting.ts` - Updated to apply wrapping by default

### Documentation
- `CHAMPIONSHIP_WRAPPING_FIX.md` - This file
- `BRACKET_FORMATTING_ENHANCEMENTS.md` - (needs update)

### Package.json
Added script:
```json
"fix-championship-wrap": "ts-node src/fix-championship-wrapping.ts"
```

## Verification

✅ **Formula:** `=Config!B3&CHAR(10)&"Champion"`

✅ **Display:**
```
Star Trek Character Battle 2025
Champion
```

✅ **Wrap Strategy:** WRAP for column O, CLIP for others

✅ **Auto-sizing:** Columns O-Q sized to fit wrapped content

## Related Documentation

- **BRACKET_FORMATTING_ENHANCEMENTS.md** - Main formatting documentation
- **BRACKET_STYLING_UPDATES.md** - Cell merging and colors
- **BRACKET_BORDER_UPDATES.md** - Border formatting

---

**Status:** ✅ Complete - Championship label now wraps after tournament name
