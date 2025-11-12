# Bracket Population Flow - Complete Specification

**Date:** 2025-11-08
**Status:** Definitive specification for bracket behavior

---

## Overview

The bracket is **formula-driven**. vPoll's ONLY job is to mark winners by writing TRUE/FALSE to checkboxes. All participant names and seeds are displayed via formulas.

---

## Step 1: Participants Tab (Source of Truth)

**Structure:**
- Column A: Rank (1-64)
- Column B: Participant Name
- Column C: Notes (optional)
- Column D: Reference Link (optional)

**Example:**
```
Rank | Participant Name              | Notes                    | Reference Link
-----|-------------------------------|--------------------------|---------------
1    | Spock (TOS/TAS/Films/SNW)     | Science Officer          | https://...
2    | Jean-Luc Picard (TNG/Films)   | Captain, USS Enterprise  | https://...
3    | Data (TNG/Films)              | Android                  | https://...
...
64   | Lwaxana Troi (TNG/DS9)        | Daughter of Fifth House  | https://...
```

**User Action:** Tournament Host fills in all 64 participants with unique ranks 1-64.

---

## Step 2: Regions Tab (Seed Distribution)

**Purpose:** Distribute 64 participants across 4 regions (16 per region) in tournament seeding order.

### Column Structure

- **Column A:** "Seed" (renamed from "Rank")
- **Column B:** Region 1 name (e.g., "Federation")
- **Column C:** Region 2 name (e.g., "Klingon Empire")
- **Column D:** Region 3 name (e.g., "Romulan Star Empire")
- **Column E:** Region 4 name (e.g., "Dominion")

### Seed Order (ALWAYS FIXED)

Column A contains seed numbers in this exact order (rows 3-18):
```
Row  | Seed
-----|-----
3    | 1
4    | 16
5    | 8
6    | 9
7    | 5
8    | 12
9    | 4
10   | 13
11   | 6
12   | 11
13   | 3
14   | 14
15   | 7
16   | 10
17   | 2
18   | 15
```

**Why This Order?** This creates the classic tournament bracket matchups:
- Seed 1 vs Seed 16 (rows 3 vs 4)
- Seed 8 vs Seed 9 (rows 5 vs 6)
- Seed 5 vs Seed 12 (rows 7 vs 8)
- Seed 4 vs Seed 13 (rows 9 vs 10)
- Seed 6 vs Seed 11 (rows 11 vs 12)
- Seed 3 vs Seed 14 (rows 13 vs 14)
- Seed 7 vs Seed 10 (rows 15 vs 16)
- Seed 2 vs Seed 15 (rows 17 vs 18)

### Participant Distribution

Participants are distributed across the 4 regions:
- **Rank 1** → Region 1 (Column B, Row 3)
- **Rank 2** → Region 2 (Column C, Row 3)
- **Rank 3** → Region 3 (Column D, Row 3)
- **Rank 4** → Region 4 (Column E, Row 3)
- **Rank 5** → Region 1 (Column B, Row 7)  ← Seed 5 row
- **Rank 6** → Region 2 (Column C, Row 11) ← Seed 6 row
- ... pattern continues

### Formulas in Regions Tab

Each cell in columns B-E contains a VLOOKUP formula referencing the Participants tab:

**Example (Cell B3 - Region 1, Seed 1):**
```
=VLOOKUP(1, Participants!$A$2:$B$65, 2, FALSE)
```

This looks up Rank 1 in Participants tab and returns the participant name.

**Example (Cell C3 - Region 2, Seed 1):**
```
=VLOOKUP(2, Participants!$A$2:$B$65, 2, FALSE)
```

This looks up Rank 2 in Participants tab and returns the participant name.

**Pattern:**
- First 4 ranks (1-4) go to Row 3 across the 4 regions
- Next 4 ranks (5-8) go to Row 7, Row 11, Row 5, Row 9 (matching seeds 5, 6, 8, 4)
- Pattern continues following the seed order

---

## Step 3: Bracket Round 1 (First Round Matches)

**Purpose:** Display Round 1 matches with seeds and participant names.

### Format

Each Round 1 cell displays: `(seed) Participant Name`

**Example:** `(1) Spock (TOS/TAS/Films/SNW)`

### Formulas Reference Regions Tab

Round 1 participant cells contain formulas that pull from the Regions tab:

**Left Side Example (Region 1/ALPHA):**
- Cell B4 (Match 1, Participant 1): `="(" & Regions!A3 & ") " & Regions!B3`
  - Displays: `(1) Spock (TOS/TAS/Films/SNW)`
- Cell B5 (Match 1, Participant 2): `="(" & Regions!A4 & ") " & Regions!B4`
  - Displays: `(16) Kathryn Janeway (VOY)`

This creates the first match: **Seed 1 vs Seed 16**

**Pattern for all Round 1 matches:**
- Match 1: Row 3 vs Row 4 (Seeds 1 vs 16)
- Match 2: Row 5 vs Row 6 (Seeds 8 vs 9)
- Match 3: Row 7 vs Row 8 (Seeds 5 vs 12)
- Match 4: Row 9 vs Row 10 (Seeds 4 vs 13)
- Match 5: Row 11 vs Row 12 (Seeds 6 vs 11)
- Match 6: Row 13 vs Row 14 (Seeds 3 vs 14)
- Match 7: Row 15 vs Row 16 (Seeds 7 vs 10)
- Match 8: Row 17 vs Row 18 (Seeds 2 vs 15)

### Checkboxes in Round 1

Each Round 1 participant has a checkbox in the adjacent column:
- Column A: Checkboxes for left side (Regions 1-2 / ALPHA-BETA)
- Column W: Checkboxes for right side (Regions 3-4 / GAMMA-DELTA)

**Initial State:** All checkboxes are FALSE

**vPoll's Action:** After voting, vPoll writes:
- TRUE to winner's checkbox
- FALSE to loser's checkbox

---

## Step 4: Round 2-6 (Formula-Driven Advancement)

**Purpose:** Automatically display winners from previous round.

### Round 2 Formulas

Round 2 cells use VLOOKUP to find the winner from Round 1:

**Example (Round 2, Match 1, Participant 1):**
```
=IFERROR(VLOOKUP(TRUE, $A$4:$B$5, 2, FALSE), "")
```

**How it works:**
- Looks at Round 1 Match 1 checkboxes (A4:A5) and names (B4:B5)
- Finds the row where checkbox = TRUE
- Returns the participant name from that row
- If no TRUE found (match not complete), displays empty string

### Round 3-6 Formulas

Same pattern - each round's formulas look at the previous round's checkbox + name columns:

- **Round 3** looks at Round 2 (columns D:E)
- **Round 4** looks at Round 3 (columns G:H)
- **Round 5** looks at Round 4 (columns J:K)
- **Round 6** looks at Round 5 (columns M:N)

---

## vPoll's Role (ONLY Checkbox Updates)

### What vPoll Does

1. **Tournament Creation:**
   - Validates Participants tab (64 unique participants, ranks 1-64)
   - Validates Regions tab (4 unique region names)
   - Validates Config settings

2. **Tournament Start:**
   - Creates Discord polls for Round 1 matches
   - Tracks poll results

3. **After Each Poll Closes:**
   - Determines winner from vote counts
   - **Writes TRUE to winner's checkbox**
   - **Writes FALSE to loser's checkbox**
   - Appends match result to Results tab (for records)

4. **Next Round:**
   - Creates Discord polls for next round
   - Formulas automatically populate participant names
   - Repeat steps 3-4

### What vPoll Does NOT Do

- ❌ Write participant names to bracket cells (formulas handle this)
- ❌ Copy winners to next round (formulas handle this)
- ❌ Overwrite any formulas
- ❌ Modify Participants or Regions tabs

---

## Column Layout by Round

| Round | Left Side Checkbox | Left Side Name | Right Side Checkbox | Right Side Name |
|-------|-------------------|----------------|---------------------|-----------------|
| Round 1 | A | B | W | AA |
| Round 2 | D | E | W | AA |
| Round 3 | G | H | Y | AB |
| Round 4 | J | K | U | V |
| Round 5 | M | N | R | S |
| Round 6 (Championship) | O | P | - | - |

**Note:** Right side Round 2 shares columns with Round 1 (W:AA) because Round 1 data is no longer needed after Round 2 starts.

---

## Verification Checklist

### For populate-test-sheet.ts

- [ ] Regions tab has "Seed" column (A) not "Rank"
- [ ] Regions tab seed order: 1, 16, 8, 9, 5, 12, 4, 13, 6, 11, 3, 14, 7, 10, 2, 15
- [ ] Regions tab formulas use VLOOKUP to pull from Participants tab
- [ ] Participant distribution: ranks 1-4 → row 3 across regions, ranks 5-8 → rows 7,11,5,9
- [ ] Round 1 formulas reference Regions tab cells
- [ ] Round 1 format: `(seed) Name` via concatenation formula
- [ ] Round 2-6 formulas use VLOOKUP(TRUE, ...) to find winners

### For simulate-tournament.ts

- [ ] Only writes TRUE/FALSE to checkboxes
- [ ] Does NOT write participant names to any cells
- [ ] Appends results to Results tab
- [ ] No "winner copy" code exists

### For generate-bracket.ts

- [ ] Generates Round 1 formulas referencing Regions tab
- [ ] Generates Round 2-6 VLOOKUP formulas
- [ ] Uses correct column mappings per round
- [ ] Creates checkbox cells with initial FALSE value

---

## Example: Complete Flow for One Match

### Setup (One-Time)

**Participants tab:**
```
Rank | Name
-----|---------------------
1    | Spock (TOS/TAS/Films/SNW)
16   | Kathryn Janeway (VOY)
```

**Regions tab (Row 3-4, Region 1):**
```
Seed | Region 1
-----|---------------------
1    | =VLOOKUP(1,Participants!$A$2:$B$65,2,FALSE)  → Displays: Spock (TOS/TAS/Films/SNW)
16   | =VLOOKUP(16,Participants!$A$2:$B$65,2,FALSE) → Displays: Kathryn Janeway (VOY)
```

**Bracket Round 1 (Row 4-5):**
```
A (Checkbox) | B (Name)
-------------|---------------------
FALSE        | ="(" & Regions!A3 & ") " & Regions!B3  → Displays: (1) Spock (TOS/TAS/Films/SNW)
FALSE        | ="(" & Regions!A4 & ") " & Regions!B4  → Displays: (16) Kathryn Janeway (VOY)
```

### vPoll Creates Poll

Discord poll created with options:
- `(1) Spock (TOS/TAS/Films/SNW)`
- `(16) Kathryn Janeway (VOY)`

### Poll Closes

Results: Spock wins 45-23

### vPoll Updates Checkboxes

```
A (Checkbox) | B (Name)
-------------|---------------------
TRUE         | (1) Spock (TOS/TAS/Films/SNW)    ← vPoll wrote TRUE
FALSE        | (16) Kathryn Janeway (VOY)       ← vPoll wrote FALSE
```

### Round 2 Formula Pulls Winner

**Round 2 bracket (Row 4):**
```
D (Checkbox) | E (Name)
-------------|---------------------
FALSE        | =IFERROR(VLOOKUP(TRUE,$A$4:$B$5,2,FALSE),"")  → Displays: (1) Spock (TOS/TAS/Films/SNW)
```

The formula found TRUE in A4, returned B4's value.

### Next Match

Spock appears in Round 2 automatically. vPoll did NOT copy the name - the formula did.

---

**Status:** This is the definitive specification. All scripts and documentation must follow this flow.
