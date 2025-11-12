# Region Color Update

**Date:** 2025-11-04
**Status:** Complete ✅

## Overview

Updated region cell background colors to a custom color scheme with optimized text colors (black or white) for maximum visibility and contrast.

## Color Scheme

### New Colors

| Region | Name | Background Color | Hex Code | Text Color | Rationale |
|--------|------|------------------|----------|------------|-----------|
| Region 1 | ALPHA/Federation | Firebrick Red | #B22222 | White | Dark background requires white text |
| Region 2 | BETA/Klingon Empire | Amber | #FFB300 | Black | Bright background works with black text |
| Region 3 | GAMMA/Romulan Star Empire | Light Blue | #6699CC | Black | Light background works with black text |
| Region 4 | DELTA/Dominion | Gray | #999999 | White | Medium-dark background requires white text |

### RGB Values (Google Sheets API Format)

```typescript
REGION_COLORS = {
  ALPHA: { red: 0.698, green: 0.133, blue: 0.133 },  // #B22222
  BETA: { red: 1.0, green: 0.702, blue: 0.0 },       // #FFB300
  GAMMA: { red: 0.4, green: 0.6, blue: 0.8 },        // #6699CC
  DELTA: { red: 0.6, green: 0.6, blue: 0.6 },        // #999999
}

REGION_TEXT_COLORS = {
  ALPHA: { red: 1, green: 1, blue: 1 },   // White
  BETA: { red: 0, green: 0, blue: 0 },    // Black
  GAMMA: { red: 0, green: 0, blue: 0 },   // Black
  DELTA: { red: 1, green: 1, blue: 1 },   // White
}
```

## Previous Colors (Replaced)

| Region | Old Background | Old Hex Equivalent |
|--------|---------------|-------------------|
| ALPHA | Light Blue | #CFE4F3 (approx) |
| BETA | Light Orange | #FCE6CC (approx) |
| GAMMA | Light Green | #D9EBD4 (approx) |
| DELTA | Light Salmon | #E6B8B0 (approx) |

All regions previously used black text.

## Implementation

### Script: `update-region-colors.ts`

```typescript
// Define colors
const regionColors = [
  {
    name: 'Region 1 (ALPHA/Federation)',
    backgroundColor: hexToRgb('#B22222'),
    textColor: { red: 1, green: 1, blue: 1 }, // White
  },
  // ... (3 more regions)
];

// Apply to cells
requests.push({
  repeatCell: {
    range: { E15:G18 },  // ALPHA region
    cell: {
      userEnteredFormat: {
        backgroundColor: region.backgroundColor,
        textFormat: {
          foregroundColor: region.textColor,
          bold: true,
          fontSize: 22,
        },
      },
    },
  },
});
```

### Helper Function

```typescript
function hexToRgb(hex: string): { red: number; green: number; blue: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return {
    red: parseInt(result[1], 16) / 255,
    green: parseInt(result[2], 16) / 255,
    blue: parseInt(result[3], 16) / 255,
  };
}
```

## Cell Locations

| Region | Position | Range | Rows |
|--------|----------|-------|------|
| ALPHA (Federation) | Top Left | E15:G18 | 15-18 |
| GAMMA (Romulan Star Empire) | Top Right | Y15:AA18 | 15-18 |
| BETA (Klingon Empire) | Bottom Left | E47:G50 | 47-50 |
| DELTA (Dominion) | Bottom Right | Y47:AA50 | 47-50 |

All cells are:
- Merged (3 columns × 4 rows)
- Bold text
- 22pt font size
- Center-aligned (horizontal and vertical)

## Results

### Before
- Light pastel colors (low contrast)
- All black text
- Lower visual impact
- Less distinct regions

### After
✅ **High contrast colors**
✅ **Optimized text color** (white on dark, black on light)
✅ **Strong visual distinction** between regions
✅ **Professional appearance**
✅ **Maximum readability**

## Text Color Selection Logic

Text color chosen based on background brightness:

- **Dark backgrounds** (#B22222 Firebrick, #999999 Gray): White text
- **Bright/Light backgrounds** (#FFB300 Amber, #6699CC Light Blue): Black text

This ensures optimal contrast and readability in all cases.

## Updated Scripts

### Main Styling Script

`src/apply-bracket-styling.ts` updated to use new colors by default:

```typescript
const REGION_COLORS = {
  ALPHA: { red: 0.698, green: 0.133, blue: 0.133 },
  BETA: { red: 1.0, green: 0.702, blue: 0.0 },
  GAMMA: { red: 0.4, green: 0.6, blue: 0.8 },
  DELTA: { red: 0.6, green: 0.6, blue: 0.6 },
};

const REGION_TEXT_COLORS = {
  ALPHA: { red: 1, green: 1, blue: 1 },
  BETA: { red: 0, green: 0, blue: 0 },
  GAMMA: { red: 0, green: 0, blue: 0 },
  DELTA: { red: 1, green: 1, blue: 1 },
};

// Apply both background and text color
textFormat: {
  foregroundColor: textColor,
  bold: true,
  fontSize: 22,
}
```

Future brackets will use new color scheme automatically.

### One-Time Update Script

`src/update-region-colors.ts` provides one-time update for existing brackets:
- Converts hex colors to RGB
- Applies background colors
- Applies optimal text colors
- Maintains formatting (bold, 22pt, centered)

## Usage

### One-Time Update (Already Applied)
```bash
npm run update-region-colors
```

### Future Brackets
```bash
npm run apply-styling
```

Creates brackets with new color scheme from the start.

## Visual Preview

```
┌─────────────────────┐  ┌─────────────────────┐
│   Federation        │  │   Romulan Star Emp  │
│   (White on Red)    │  │   (Black on Blue)   │
└─────────────────────┘  └─────────────────────┘
     Region 1 (#B22222)      Region 3 (#6699CC)

┌─────────────────────┐  ┌─────────────────────┐
│   Klingon Empire    │  │   Dominion          │
│   (Black on Amber)  │  │   (White on Gray)   │
└─────────────────────┘  └─────────────────────┘
     Region 2 (#FFB300)      Region 4 (#999999)
```

## Files Modified

### Scripts
- `src/update-region-colors.ts` - Color update script (new)
- `src/apply-bracket-styling.ts` - Updated color constants and text color application

### Package.json
Added script:
```json
"update-region-colors": "ts-node src/update-region-colors.ts"
```

### Documentation
- `REGION_COLOR_UPDATE.md` - This file

## Related Work

This completes the bracket visual refinement series:

1. **Bracket Styling** - Initial colors, merges, text formatting
2. **Border Fixes** - Multiple border gap repairs
3. **Championship Updates** - Formula, font size, wrapping
4. **Region Positioning** - Move to correct rows
5. **Region Color Update** - Custom color scheme with optimized text ← **This work**

---

**Status:** ✅ Complete - Region colors updated with optimal text colors for visibility
