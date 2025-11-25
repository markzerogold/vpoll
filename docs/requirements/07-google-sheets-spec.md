# vPoll Product Requirements - Google Sheets Template Specification

[← Back to Main README](../../README.md) | [View Full Requirements](../../REQUIREMENTS.md)

**Document Section:** 7 of 9
**Last Updated:** 2025-10-22
**Status:** In Development - MVP Phase

---

## Navigation

- **Previous:** [User Scenarios - Deferred Features](./06-scenarios-deferred.md)
- **Current:** Google Sheets Template Specification
- **Next:** [Technical Architecture](./08-technical-architecture.md)

---

## Google Sheets Template Specification

### Template Overview

**Template Type:** Google Sheets
**Required Tabs:** 6 (Bracket, Results, Participants, Regions, Config, Instructions)
**Template Access:** Public view, admin creates copy for each tournament
**Service Account:** vpoll-sheets-access@vpoll-475821.iam.gserviceaccount.com (Editor permission required)

### Tab 1: Bracket

**Range:** Complex formula-driven layout (varies by template design)
**Purpose:** Visual tournament bracket showing all rounds and matchups

**Structure:**
- Formula-driven cells display participant names and seeds
- Vote counts appear after matches complete (pulled from Results tab via formulas)
- Winner/loser advancement controlled by TRUE/FALSE cells

**Display Format:**

*Before match:*
```
(1) Spock (TOS/TAS/Films/SNW)
```

*After match:*
```
45 (1) Spock (TOS/TAS/Films/SNW)
```
*(vote count before seed number)*

**vPoll Write Operations:**
- vPoll writes TRUE to winner's advancement cell
- vPoll writes FALSE to loser's advancement cell
- Bracket formulas automatically propagate winners to next round

**Read-Only for vPoll:**
- vPoll READS participant names and matchups
- vPoll READS bracket structure to determine matches
- vPoll does NOT modify participant names or formulas

**User Visibility:**
- Users view this tab for live bracket visualization
- Updates in real-time as vPoll writes TRUE/FALSE values
- Vote counts update automatically via formulas reading Results tab

**Template Maintenance:**
- Bracket formulas must reference Results tab correctly
- Modification of formulas may break bracket display
- Use provided template for consistent structure

### Tab 3: Participants

**Range:** A1:D65 (65 rows including header)
**Purpose:** Define all 64 tournament participants with rankings and metadata

| Column | Header | Data Type | Required | Description |
|--------|--------|-----------|----------|-------------|
| A | Rank | Integer (1-64) | ✅ Yes | Seeding position - determines bracket placement |
| B | Participant Name | String | ✅ Yes | Display name for polls and bracket (must be unique) |
| C | Notes | String | ⚠️ Optional | Additional context or description for match previews |
| D | Reference Link | URL | ⚠️ Optional | Image URL or webpage for winner announcements |

**Validation Rules:**
- Exactly 64 data rows (excluding header)
- Ranks must be integers 1-64 (all present, all unique, no gaps)
- Participant names must be non-empty and unique
- Notes and Reference Link can be empty
- No duplicate ranks or participant names allowed

**Example Data:**
```
Rank | Participant Name              | Notes                                      | Reference Link
-----|-------------------------------|--------------------------------------------|---------------------------------
1    | Spock (TOS/TAS/Films/SNW)     | Science Officer, USS Enterprise           | https://memory-alpha.fandom.com/wiki/Spock
2    | Jean-Luc Picard (TNG/Films)   | Captain, USS Enterprise-D                  | https://memory-alpha.fandom.com/wiki/Picard
3    | Data (TNG/Films)              | Android, USS Enterprise-D                  | https://memory-alpha.fandom.com/wiki/Data
...
64   | Lwaxana Troi (TNG/DS9)        | Daughter of the Fifth House                | https://memory-alpha.fandom.com/wiki/Lwaxana_Troi
```

### Tab 4: Regions

**Range:** A1:E18 (18 rows including 2 header rows)
**Purpose:** Distribute 64 participants across 4 tournament regions in proper seeding order

**Header Structure:**
- **Row 1 (Generic Headers):** "Seed", Region 1, Region 2, Region 3, Region 4 - Column headers remain constant across all tournaments
- **Row 2 (Seed + Region Names):** "Seed", plus customizable region names per tournament (e.g., "Federation", "Klingon Empire", "Romulan Star Empire", "Dominion")
- **Rows 3-18 (Seed + Participant Data):** 16 seed values and participants distributed across 4 regions

| Column | Row 1 Header | Row 2 Content | Data Type | Description |
|--------|--------------|---------------|-----------|-------------|
| A | Seed | Seed | Integer | "Seed" label in rows 1-2, seed values in tournament order in rows 3-18 |
| B | Region 1 | Custom Name | String | Generic "Region 1" label in row 1, customizable name in row 2, participants in rows 3-18 |
| C | Region 2 | Custom Name | String | Generic "Region 2" label in row 1, customizable name in row 2, participants in rows 3-18 |
| D | Region 3 | Custom Name | String | Generic "Region 3" label in row 1, customizable name in row 2, participants in rows 3-18 |
| E | Region 4 | Custom Name | String | Generic "Region 4" label in row 1, customizable name in row 2, participants in rows 3-18 |

**Seed Order (ALWAYS FIXED):**

Column A contains seed numbers in this exact order to create proper bracket matchups:
```
Row  | Seed | Matchup
-----|------|------------------------
3    | 1    | Seed 1 vs Seed 16
4    | 16   |
5    | 8    | Seed 8 vs Seed 9
6    | 9    |
7    | 5    | Seed 5 vs Seed 12
8    | 12   |
9    | 4    | Seed 4 vs Seed 13
10   | 13   |
11   | 6    | Seed 6 vs Seed 11
12   | 11   |
13   | 3    | Seed 3 vs Seed 14
14   | 14   |
15   | 7    | Seed 7 vs Seed 10
16   | 10   |
17   | 2    | Seed 2 vs Seed 15
18   | 15   |
```

**This seed order creates the standard tournament bracket:**
- Top seed (1) plays bottom seed (16)
- Seeds are distributed to avoid top seeds meeting early
- Pattern matches NCAA tournament, March Madness, etc.

**Participant Distribution Across Regions:**

Participants from the Participants tab are distributed by rank:
- **Rank 1** → Region 1 Seed 1 (Column B, Row 3)
- **Rank 2** → Region 2 Seed 1 (Column C, Row 3)
- **Rank 3** → Region 3 Seed 1 (Column D, Row 3)
- **Rank 4** → Region 4 Seed 1 (Column E, Row 3)
- **Rank 5** → Region 1 Seed 5 (Column B, Row 7)
- **Rank 6** → Region 2 Seed 6 (Column C, Row 11)
- **Rank 7** → Region 3 Seed 7 (Column D, Row 15)
- **Rank 8** → Region 4 Seed 8 (Column E, Row 5)
- ... pattern continues for all 64 participants (16 per region)

**Region Name Customization:**
- Row 2 contains customizable region names (editable)
- Region names must be unique
- Column A in row 2 contains "Seed" label
- Typical examples: "ALPHA", "BETA", "GAMMA", "DELTA" OR "Federation", "Klingon Empire", "Romulan Star Empire", "Dominion"

**Formulas:**
- Cells B3:E18 contain VLOOKUP formulas referencing Participants tab (implemented in populate-test-sheet.ts as of 2025-11-25)
- Automatically populate based on Participants tab Rank column
- Do not manually edit participant names in this tab
- Example formulas:
  - B3: `=VLOOKUP(1,Participants!$A$2:$B$65,2,FALSE)` pulls Rank 1 participant
  - C3: `=VLOOKUP(2,Participants!$A$2:$B$65,2,FALSE)` pulls Rank 2 participant
  - D3: `=VLOOKUP(3,Participants!$A$2:$B$65,2,FALSE)` pulls Rank 3 participant
  - E3: `=VLOOKUP(4,Participants!$A$2:$B$65,2,FALSE)` pulls Rank 4 participant

**Formatting:**
- Both header rows (rows 1-2) are frozen for scrolling visibility
- Both header rows (rows 1-2) are bold

**Example:**
```
Seed | Federation                  | Klingon Empire              | Romulan Star Empire         | Dominion
-----|-----------------------------|-----------------------------|-----------------------------|--------------------------
1    | Spock (TOS/TAS/Films/SNW)   | Jean-Luc Picard (TNG/Films) | Data (TNG/Films)            | Worf (TNG/DS9/Films)
16   | Kathryn Janeway (VOY)       | Benjamin Sisko (DS9)        | James T. Kirk (TOS)         | Seven of Nine (VOY)
8    | Julian Bashir (DS9)         | Jadzia Dax (DS9)            | Leonard McCoy (TOS)         | Quark (DS9)
9    | Deanna Troi (TNG/Films)     | Kira Nerys (DS9)            | The Doctor (VOY)            | Odo (DS9)
...
```

**Purpose:** This tab serves as the source for Round 1 bracket formulas, which reference these cells to display "(seed) Participant Name" in the bracket.

### Tab 5: Config

**Range:** A:B (variable rows, key-value pairs)
**Purpose:** Tournament settings and behavior configuration

| Setting Name | Data Type | Required | Valid Values | Default | Description |
|--------------|-----------|----------|--------------|---------|-------------|
| Tournament Name | String | ✅ Yes | Any non-empty string | - | Display name for tournament |
| Tournament Description | String | ✅ Yes | Any non-empty string | - | Brief description of competition |
| Start Date | String | ✅ Yes | Date string | - | When tournament begins (display only) |
| Poll Length | Number | ✅ Yes | Positive integer (hours) | 24 | How long each poll stays open |
| Poll Batches | String | ✅ Yes | See options below | "full round" | How many polls launch at once |
| Discord Channel ID | String | ✅ Yes | Valid Discord channel ID | - | Where to post polls |
| Auto-advance | Boolean | ✅ Yes | true, false | false | Automatically start next round when current completes |
| Tie Breaker Rule | String | ✅ Yes | "Dice roll" | "Dice roll" | How to resolve tied matches |
| Results Visibility | String | ✅ Yes | See options below | "after voting" | When users can see results |
| Auto Round Scheduling | String | ⚠️ Optional | "immediate", "X days", "X hours", blank | blank | Delay before auto-starting next round |
| Celebratory GIF | Boolean | ⚠️ Optional | true, false | false | Include random GIF in winner announcement |

**Poll Batches Valid Values:**
- `"full round"` - All matches at once (32 for Round 1)
- `"one per region"` - 1 match per region (4 at a time)
- `"two per region"` - 2 matches per region (8 at a time)
- `"half round"` - Half the matches (16 for Round 1)
- `"sequential"` - One match at a time
- Number (e.g., `6`) - Exact count specified

**Results Visibility Valid Values:**
- `"after voting"` - Immediately after user votes (Discord native behavior)
- `"after poll closes"` - After poll duration ends
- `"at tournament end"` - Only when tournament completes
- *Note: MVP uses Discord native polls which always show live results*

**Example Config Tab:**
```
Setting Name               | Value
---------------------------|----------------------------------------
Tournament Name            | Star Trek Character Battle
Tournament Description     | Vote for the best character across all series
Start Date                 | October 25, 2025
Poll Length                | 24
Poll Batches               | full round
Discord Channel ID         | 1234567890123456789
Auto-advance               | true
Tie Breaker Rule           | Dice roll
Results Visibility         | after voting
Match Preview Posts        | true
Auto Round Scheduling      | 3 days
Announcements Channel ID   | 9876543210987654321
Celebratory GIF            | true
```

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

### Tab 6: Instructions

**Range:** A1:A110 (single column, ~100 rows)
**Purpose:** Built-in documentation for tournament creators

**Content Sections:**

**1. Header & Quick Start Checklist**
- Tournament setup guide title
- 6-step Quick Start checklist covering participant entry, config, sharing, tournament creation, monitoring, and announcements

**2. Order of Operations**
- Phase 1: Sheet Preparation (fill participants, configure settings, customize regions, share with service account)
- Phase 2: Tournament Creation (run `/tournament create` command, verify validation)
- Phase 3: Tournament Execution (monitor bracket, handle tiebreakers if needed)
- Phase 4: Completion (announce winner, review results)

**3. vPoll Commands Reference**
- Setup commands: `/tournament template`, `/tournament create`, `/tournament validate`
- Control commands: `/tournament start`, `/tournament pause`, `/tournament resume`, `/tournament cancel`
- Information commands: `/tournament status`, `/tournament bracket`, `/participant info`

**4. Key Config Settings**
- Poll Length: Hours each poll stays open
- Poll Batches: How many polls launch at once
- Auto-advance: Automatically start next round
- Tie Breaker Rule: How to resolve tied matches
- Match Preview Posts: Post participant info before polls

**5. Troubleshooting Section**
- Common errors: "Permission denied" (sharing issue), "Invalid participant count" (must be exactly 64), "Duplicate names" (all names must be unique), "Invalid Poll Length" (must be positive number)
- Solutions and checks for each error

**6. Service Account Information**
- Service account email: `vpoll-sheets-access@vpoll-475821.iam.gserviceaccount.com`
- Required permission: Editor
- Why Editor permission is needed (vPoll writes results back to sheet)

**7. Tips and Best Practices**
- Use clear, unique participant names
- Add notes and reference links for richer tournament experience
- Test with short poll lengths (1 hour) before launching real tournament
- Monitor first few rounds closely
- Keep sheet open during tournament to watch live updates
- Save original template for future tournaments

**Format:**
- Single column (Column A only)
- Plain text with emoji markers (🏆, ✅, ⚠️, etc.)
- Hierarchical structure with headers, subheadings, and bullet points
- Approximately 100-110 rows total
- All content left-aligned

**Example Structure:**
```
🏆 VPOLL TOURNAMENT SETUP GUIDE 🏆

QUICK START CHECKLIST
☐ 1. Fill in Participants tab (64 participants with ranks, names, notes, links)
☐ 2. Fill in Config tab (all required settings)
...

ORDER OF OPERATIONS
Phase 1: Prepare Your Sheet
  1. Fill in Participants tab
  2. Configure settings in Config tab
...

VPOLL COMMANDS
Setup Commands:
  /tournament template - Get the master template
  /tournament create <url> - Create tournament from your sheet
...
```

**User Interaction:**
- Read-only for users (informational only)
- Not accessed by vPoll bot
- Serves as self-contained reference guide
- Positioned as last tab for easy access without interfering with main tournament tabs

---

[← Previous: Deferred Features](./06-scenarios-deferred.md) | [Next: Technical Architecture →](./08-technical-architecture.md)
