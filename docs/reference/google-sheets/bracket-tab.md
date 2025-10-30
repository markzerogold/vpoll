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

