## 2. Bracket Tab Formula Logic

### Problem Statement
REQUIREMENTS.md mentions "bracket formulas automatically propagate winners" but never explains how these formulas work or what they reference.

### Solution: Formula-Driven Bracket Display

#### Core Formula Pattern

**Participant Display Cells:**
Each bracket position shows participant info using formulas that check advancement cells.

**Example: Round 2, Match 1, Position 1 (winner from R1 Match 1)**

```excel
=IF(R1_ALPHA_M1_W,
    VLOOKUP(R1_ALPHA_M1_P1, Participants!A:D, 2, FALSE),
    "")
```

**Translation:**
- IF the winner cell for R1-ALPHA-M1 is TRUE
- THEN look up the participant name from Participants tab
- ELSE show empty (match not complete)

#### Complete Formula Structure

**Each bracket cell needs:**
1. **Participant Name:** `=IF(advancement_cell, VLOOKUP(...), "")`
2. **Seed Number:** `=IF(advancement_cell, VLOOKUP(..., 1), "")`
3. **Vote Count:** `=IFERROR(VLOOKUP(match_id, Results!A:N, 6, FALSE), "")`

**Example: Round 2, Match 1 display**

Cell showing participant 1 name:
```excel
=IF(R1_ALPHA_M1_W,
    VLOOKUP(INDEX(Results!D:D, MATCH("R1-ALPHA-M1", Results!A:A, 0)), Participants!B:B, 1, 0),
    IF(R1_ALPHA_M1_L,
        VLOOKUP(INDEX(Results!G:G, MATCH("R1-ALPHA-M1", Results!A:A, 0)), Participants!B:B, 1, 0),
        "TBD"))
```

**Simplified logic:**
- If P1 won (W=TRUE): Show P1 name
- Else if P2 won (L=TRUE, meaning P1 lost): Show P2 name
- Else: Show "TBD"

#### Vote Count Display

```excel
=IFERROR(
    IF(R1_ALPHA_M1_W,
        VLOOKUP("R1-ALPHA-M1", Results!A:F, 6, FALSE),
        ""),
    "")
```

**Translation:**
- Look up match ID in Results tab
- Return participant 1 vote count (column 6)
- If error (match not complete): show empty

#### Bracket Tab Layout

**Recommended Layout (Column-based):**

| Column | Content | Width |
|--------|---------|-------|
| A | Round 1 Matchup Labels | 150px |
| B | Round 1 Seed + Name + Votes | 200px |
| C | Round 1 Advancement (TRUE/FALSE - hidden) | 50px (hidden) |
| D | Round 2 Matchup Labels | 150px |
| E | Round 2 Seed + Name + Votes | 200px |
| F | Round 2 Advancement (hidden) | 50px (hidden) |
| ... | Continue pattern through Round 6 | ... |

**Cell Format Example (Round 1, Match 1, Participant 1):**
```
(1) Spock - 45 votes
```

**Formula for this display:**
```excel
=IF(R1_ALPHA_M1_W <> "",
    "(" & VLOOKUP(P1_Name, Participants!B:A, 2, FALSE) & ") " & P1_Name & " - " & P1_Votes & " votes",
    "")
```

#### Template Requirements

**For MVP template creation:**
1. Create 126 named ranges for advancement cells (TRUE/FALSE)
2. Hide advancement cell columns (user never sees them)
3. Display columns use formulas referencing advancement cells
4. Formulas pull participant data from Participants tab
5. Formulas pull vote counts from Results tab

**Protection:**
- Lock all formula cells (prevent user editing)
- Allow editing only of Participants, Config, Regions tabs
- Bracket and Results tabs are formula-driven (read-only)

---
