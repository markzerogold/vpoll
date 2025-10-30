### Tab 2: Results

**Range:** A:P (16 columns, rows append chronologically)
**Purpose:** Complete match history with vote counts and metadata

**Column Specification:**

| Col | Header | Data Type | Description |
|-----|--------|-----------|-------------|
| A | Match ID | String | Unique identifier (e.g., "R1-ALPHA-M1") |
| B | Round | String | Round name (e.g., "Round 1", "Round 2", "Sweet 16", "Elite 8", "Final Four", "Championship") |
| C | Region | String | Region name (e.g., "ALPHA") or "FINAL" for finals |
| D | Participant 1 Name | String | First participant name |
| E | Participant 1 Seed | Integer | First participant seed (1-64) |
| F | Participant 1 Votes | Integer | Vote count for first participant |
| G | Participant 2 Name | String | Second participant name |
| H | Participant 2 Seed | Integer | Second participant seed (1-64) |
| I | Participant 2 Votes | Integer | Vote count for second participant |
| J | Winner | String | Winning participant name |
| K | Discord Poll ID | String | Discord's unique poll ID |
| L | Poll Start Time | ISO 8601 Timestamp | When poll was created |
| M | Poll End Time | ISO 8601 Timestamp | When poll closed |
| N | Total Votes | Integer | Sum of both participants' votes |
| O | Tiebreaker | String | Dice roll result if tie (blank if no tie) |
| P | Notes | String | Admin comments or additional info (blank by default) |

**Write Pattern:**
- vPoll appends new row for each completed match
- Rows are chronological (oldest first, newest last)
- Header row (row 1) is permanent
- Data starts at row 2

**Match ID Format:**
- Round 1-4: `R{round}-{region}-M{match_number}` (e.g., "R1-ALPHA-M1")
- Round 5 (Final Four): `R5-{region1}_vs_{region2}-M{match_number}` (e.g., "R5-ALPHA_vs_BETA-M1")
- Round 6 (Championship): `R6-FINAL-M1`

**Round Names:**
- Round 1: "Round 1" (32 matches per region, 8 per region)
- Round 2: "Round 2" (16 matches total, 4 per region)
- Round 3: "Sweet 16" (8 matches total, 2 per region)
- Round 4: "Elite 8" (4 matches total, 1 per region)
- Round 5: "Final Four" (2 matches, region winners)
- Round 6: "Championship" (1 match, final)

**Example Data:**
```
Match ID    | Round    | Region | P1 Name | P1 Seed | P1 Votes | P2 Name | P2 Seed | P2 Votes | Winner | Discord Poll ID | Poll Start | Poll End | Total | Tiebreaker | Notes
------------|----------|--------|---------|---------|----------|---------|---------|----------|--------|-----------------|------------|----------|-------|------------|------
R1-ALPHA-M1 | Round 1  | ALPHA  | Spock   | 1       | 45       | Nog     | 16      | 23       | Spock  | 12345678901234  | 2025-10... | 2025-10..| 68    |            |
R1-ALPHA-M2 | Round 1  | ALPHA  | Worf    | 4       | 42       | Seven   | 5       | 42       | Worf   | 12345678901235  | 2025-10... | 2025-10..| 84    | Worf: 67, Seven: 34 |
...
```

**Tiebreaker Format (if applicable):**
```
{Winner Name}: {Dice Roll}, {Loser Name}: {Dice Roll}
Example: "Worf: 67, Seven of Nine: 34"
```

**Bracket Integration:**
- Bracket tab formulas read vote counts from this tab
- Vote counts appear in bracket: `{votes} ({seed}) {name}`
- Results tab is source of truth for all match data

