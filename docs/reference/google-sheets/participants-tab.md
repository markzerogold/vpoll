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

