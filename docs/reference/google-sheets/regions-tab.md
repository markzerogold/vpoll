### Tab 4: Regions

**Range:** A1:E18 (18 rows including 2 header rows)
**Purpose:** Show participant distribution across 4 tournament regions

**Header Structure:**
- **Row 1 (Generic Headers):** (blank), Region 1, Region 2, Region 3, Region 4 - Column headers remain constant across all tournaments
- **Row 2 (Rank + Region Names):** "Rank", plus customizable region names per tournament (e.g., "Federation", "Klingon Empire", "Romulan Star Empire", "Dominion")
- **Rows 3-18 (Participant Data):** 16 participants distributed across 4 regions

| Column | Row 1 Header | Row 2 Content | Data Type | Description |
|--------|--------------|---------------|-----------|-------------|
| A | (blank) | Rank | Integer (1-16) | "Rank" label in row 2, sequential rank values in rows 3-18 |
| B | Region 1 | Custom Name | String | Generic "Region 1" label in row 1, customizable name in row 2, participants in rows 3-18 |
| C | Region 2 | Custom Name | String | Generic "Region 2" label in row 1, customizable name in row 2, participants in rows 3-18 |
| D | Region 3 | Custom Name | String | Generic "Region 3" label in row 1, customizable name in row 2, participants in rows 3-18 |
| E | Region 4 | Custom Name | String | Generic "Region 4" label in row 1, customizable name in row 2, participants in rows 3-18 |

**Distribution Pattern:**
- Rank 1 → Region 1 (Column B, Row 3)
- Rank 2 → Region 2 (Column C, Row 3)
- Rank 3 → Region 3 (Column D, Row 3)
- Rank 4 → Region 4 (Column E, Row 3)
- Rank 5 → Region 1 (Column B, Row 4)
- [Pattern repeats: 16 participants per region]

**Region Name Customization:**
- Row 2 contains customizable region names (editable)
- Region names must be unique
- Column A in row 2 should remain blank
- Typical examples: "ALPHA", "BETA", "GAMMA", "DELTA" OR "Federation", "Klingon Empire", "Romulan Star Empire", "Dominion"

**Formulas:**
- Cells B3:E18 contain VLOOKUP formulas referencing Participants tab
- Automatically populate based on Participants tab Rank column
- Do not manually edit participant names in this tab

**Formatting:**
- Both header rows (rows 1-2) are frozen for scrolling visibility
- Both header rows (rows 1-2) are bold

**Example:**
```
         | Region 1   | Region 2        | Region 3             | Region 4
---------|------------|-----------------|----------------------|------------------
Rank     | Federation | Klingon Empire  | Romulan Star Empire  | Dominion
1        | Spock      | Picard          | Data                 | Worf
2        | Janeway    | Sisko           | Kirk                 | Seven of Nine
3        | Riker      | O'Brien         | Quark                | Odo
...
```

