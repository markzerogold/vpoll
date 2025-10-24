# vPoll Technical Specification

**Version:** 1.0
**Date:** 2025-10-23
**Status:** Draft - Resolving Critical Ambiguities
**Purpose:** Provide concrete technical specifications for ambiguous areas identified in REQUIREMENTS.md

This document resolves the 10 critical/high priority ambiguities that block implementation. It serves as the definitive technical reference for implementation details not fully specified in REQUIREMENTS.md.

---

## Table of Contents

1. [Bracket Tab Cell Mapping](#1-bracket-tab-cell-mapping)
2. [Bracket Tab Formula Logic](#2-bracket-tab-formula-logic)
3. [Match ID Generation Algorithm](#3-match-id-generation-algorithm)
4. [Poll Batches Calculation](#4-poll-batches-calculation)
5. [Discord Poll Duration Format](#5-discord-poll-duration-format)
6. [Poll Close Event Handling](#6-poll-close-event-handling)
7. [Config Tab Parsing Rules](#7-config-tab-parsing-rules)
8. [Auto Scheduling Time Parsing](#8-auto-scheduling-time-parsing)
9. [Service Account Permission Validation](#9-service-account-permission-validation)
10. [Thread ID Configuration Format](#10-thread-id-configuration-format)

---

## 1. Bracket Tab Cell Mapping

### Problem Statement
REQUIREMENTS.md states "vPoll writes TRUE to winner's advancement cell" but never specifies the cell addresses. Implementation cannot proceed without knowing which cells to write to for each of the 63 matches.

### Solution: Named Cell Approach

**Decision:** Use a standardized cell naming convention based on Match IDs.

#### Cell Naming Convention

For each match, two cells control advancement:
- **Winner Cell:** `<MatchID>_W` (e.g., `R1_ALPHA_M1_W`)
- **Loser Cell:** `<MatchID>_L` (e.g., `R1_ALPHA_M1_L`)

**Cell Locations:** Named ranges defined in Google Sheets template.

#### Implementation Strategy

**Template Setup:**
1. Create named ranges for all 126 advancement cells (63 matches × 2 participants)
2. Names follow pattern: `R{round}_{region}_M{match}_W` and `R{round}_{region}_M{match}_L`
3. Named ranges eliminate hardcoded cell addresses

**Bot Implementation:**
```typescript
// Example: Update bracket for Round 1, ALPHA region, Match 1
const matchId = "R1-ALPHA-M1";
const winnerCell = matchId.replace(/-/g, '_') + '_W'; // "R1_ALPHA_M1_W"
const loserCell = matchId.replace(/-/g, '_') + '_L';  // "R1_ALPHA_M1_L"

await sheetsService.writeNamedRange(sheetId, winnerCell, [[true]]);
await sheetsService.writeNamedRange(sheetId, loserCell, [[false]]);
```

#### Complete Named Range List

**Round 1 (32 matches across 4 regions):**
- ALPHA: `R1_ALPHA_M1_W`, `R1_ALPHA_M1_L`, ..., `R1_ALPHA_M8_W`, `R1_ALPHA_M8_L`
- BETA: `R1_BETA_M1_W`, `R1_BETA_M1_L`, ..., `R1_BETA_M8_W`, `R1_BETA_M8_L`
- GAMMA: `R1_GAMMA_M1_W`, `R1_GAMMA_M1_L`, ..., `R1_GAMMA_M8_W`, `R1_GAMMA_M8_L`
- DELTA: `R1_DELTA_M1_W`, `R1_DELTA_M1_L`, ..., `R1_DELTA_M8_W`, `R1_DELTA_M8_L`

**Round 2 (16 matches):** `R2_ALPHA_M1_W`, `R2_ALPHA_M1_L`, ..., `R2_DELTA_M4_W`, `R2_DELTA_M4_L`

**Round 3 (8 matches):** `R3_ALPHA_M1_W`, `R3_ALPHA_M1_L`, ..., `R3_DELTA_M2_W`, `R3_DELTA_M2_L`

**Round 4 (4 matches):** `R4_ALPHA_M1_W`, `R4_ALPHA_M1_L`, ..., `R4_DELTA_M1_W`, `R4_DELTA_M1_L`

**Round 5 (2 matches):**
- `R5_ALPHA_vs_BETA_M1_W`, `R5_ALPHA_vs_BETA_M1_L`
- `R5_GAMMA_vs_DELTA_M1_W`, `R5_GAMMA_vs_DELTA_M1_L`

**Round 6 (1 match):**
- `R6_CHAMPIONSHIP_M1_W`, `R6_CHAMPIONSHIP_M1_L`

#### Validation

**During `/tournament create`:**
```typescript
function validateBracketNamedRanges(sheetId: string): ValidationResult {
  const requiredRanges = generateAllMatchNamedRanges(); // 126 total
  const existingRanges = await sheets.getNamedRanges(sheetId);

  const missing = requiredRanges.filter(r => !existingRanges.includes(r));

  if (missing.length > 0) {
    return {
      valid: false,
      errors: [`Bracket tab missing ${missing.length} named ranges. Template may be corrupted.`]
    };
  }

  return { valid: true };
}
```

#### Alternative: Hardcoded Cell Addresses (Fallback)

If named ranges prove problematic, fallback to hardcoded addresses:

```typescript
const BRACKET_CELLS = {
  R1_ALPHA_M1_W: 'C10',
  R1_ALPHA_M1_L: 'C18',
  // ... 124 more entries
};
```

**Recommendation:** Named ranges preferred for flexibility and maintainability.

---

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

## 3. Match ID Generation Algorithm

### Problem Statement
Round 5 format is "R5-ALPHA_vs_BETA-M1" but we never defined HOW regions are paired. Which region winner faces which?

### Solution: Fixed Region Pairing Algorithm

#### Bracket Structure

**Single Elimination Standard:**
Tournament follows March Madness bracket structure with fixed regional semifinals.

#### Region Pairing Algorithm

**Round 5 (Final Four) - 2 Matches:**

**Match 1:** Winner of Region 1 vs Winner of Region 2
**Match 2:** Winner of Region 3 vs Winner of Region 4

**Region Order:** Determined by column order in Regions tab (columns B, C, D, E)

**Example with custom region names:**
- Regions tab columns: `Federation | Klingon Empire | Romulan Star Empire | Dominion`
- R5-M1: Federation winner vs Klingon Empire winner
- R5-M2: Romulan Star Empire winner vs Dominion winner

#### Match ID Format by Round

```typescript
function generateMatchId(round: number, region: string, matchNumber: number, regions?: string[]): string {
  switch (round) {
    case 1:
    case 2:
    case 3:
    case 4:
      // Within-region matches
      return `R${round}-${region}-M${matchNumber}`;

    case 5:
      // Cross-region semifinals
      if (matchNumber === 1) {
        return `R5-${regions[0]}_vs_${regions[1]}-M1`;
      } else {
        return `R5-${regions[2]}_vs_${regions[3]}-M1`;
      }

    case 6:
      // Championship (no region)
      return `R6-CHAMPIONSHIP-M1`;

    default:
      throw new Error(`Invalid round number: ${round}`);
  }
}
```

#### Complete Match ID List (Example Tournament)

**Assumptions:**
- Regions: ALPHA, BETA, GAMMA, DELTA (default names)
- Standard 64-participant bracket

**Round 1 (32 matches):**
```
R1-ALPHA-M1, R1-ALPHA-M2, ..., R1-ALPHA-M8
R1-BETA-M1, R1-BETA-M2, ..., R1-BETA-M8
R1-GAMMA-M1, R1-GAMMA-M2, ..., R1-GAMMA-M8
R1-DELTA-M1, R1-DELTA-M2, ..., R1-DELTA-M8
```

**Round 2 (16 matches):**
```
R2-ALPHA-M1, R2-ALPHA-M2, R2-ALPHA-M3, R2-ALPHA-M4
R2-BETA-M1, R2-BETA-M2, R2-BETA-M3, R2-BETA-M4
R2-GAMMA-M1, R2-GAMMA-M2, R2-GAMMA-M3, R2-GAMMA-M4
R2-DELTA-M1, R2-DELTA-M2, R2-DELTA-M3, R2-DELTA-M4
```

**Round 3 (8 matches):**
```
R3-ALPHA-M1, R3-ALPHA-M2
R3-BETA-M1, R3-BETA-M2
R3-GAMMA-M1, R3-GAMMA-M2
R3-DELTA-M1, R3-DELTA-M2
```

**Round 4 (4 matches):**
```
R4-ALPHA-M1 (Regional Final)
R4-BETA-M1 (Regional Final)
R4-GAMMA-M1 (Regional Final)
R4-DELTA-M1 (Regional Final)
```

**Round 5 (2 matches):**
```
R5-ALPHA_vs_BETA-M1 (Semifinal 1)
R5-GAMMA_vs_DELTA-M1 (Semifinal 2)
```

**Round 6 (1 match):**
```
R6-CHAMPIONSHIP-M1 (Final)
```

#### Custom Region Names

**Handling spaces and special characters:**

```typescript
function sanitizeRegionName(regionName: string): string {
  // Remove spaces, convert to uppercase, limit length
  return regionName
    .replace(/\s+/g, '_')
    .replace(/[^A-Z0-9_]/gi, '')
    .substring(0, 20)
    .toUpperCase();
}

// Example:
// "Romulan Star Empire" -> "ROMULAN_STAR_EMPIRE"
// "Klingon Empire (TOS)" -> "KLINGON_EMPIRE_TOS"
```

**Match ID with custom names:**
```
R5-FEDERATION_vs_KLINGON_EMPIRE-M1
```

---

## 4. Poll Batches Calculation

### Problem Statement
If "Poll Batches = 6" and there are 32 matches, what happens? The rounding behavior is undefined.

### Solution: Batches-Per-Round Algorithm

#### Interpretation

**"Poll Batches" config means:** Number of separate batches to divide the round into.

**NOT:** Number of polls per batch.

#### Calculation Algorithm

```typescript
function calculateBatches(totalMatches: number, batchConfig: string): number[][] {
  let batchCount: number;

  // Parse config
  if (batchConfig === 'full round') {
    batchCount = 1;
  } else if (batchConfig === 'one per region') {
    batchCount = 4;
  } else if (batchConfig === 'two per region') {
    batchCount = 8;
  } else if (batchConfig === 'half round') {
    batchCount = 2;
  } else if (batchConfig === 'sequential') {
    batchCount = totalMatches; // One batch per match
  } else if (/^\d+$/.test(batchConfig)) {
    // Custom number
    batchCount = parseInt(batchConfig, 10);
  } else {
    throw new Error(`Invalid Poll Batches config: ${batchConfig}`);
  }

  // Distribute matches across batches
  const baseSize = Math.floor(totalMatches / batchCount);
  const remainder = totalMatches % batchCount;

  const batches: number[][] = [];
  let matchIndex = 0;

  for (let i = 0; i < batchCount; i++) {
    // First 'remainder' batches get an extra match
    const batchSize = baseSize + (i < remainder ? 1 : 0);
    const batch: number[] = [];

    for (let j = 0; j < batchSize; j++) {
      batch.push(matchIndex++);
    }

    batches.push(batch);
  }

  return batches;
}
```

#### Examples

**Example 1: 32 matches, Poll Batches = 6**
```
Batch 1: 6 matches (indices 0-5)
Batch 2: 6 matches (indices 6-11)
Batch 3: 6 matches (indices 12-17)
Batch 4: 6 matches (indices 18-23)
Batch 5: 5 matches (indices 24-28)
Batch 6: 3 matches (indices 29-31)
```

**Formula:**
- Base size: floor(32/6) = 5
- Remainder: 32 % 6 = 2
- First 2 batches get +1 match (5+1=6)
- Last 4 batches get base size (5)

Wait, that's wrong. Let me recalculate:
- 32 ÷ 6 = 5 remainder 2
- First 2 batches: 6 matches each (12 total)
- Next 4 batches: 5 matches each (20 total)
- Total: 12 + 20 = 32 ✓

**Correct distribution:**
```
Batch 1: 6 matches
Batch 2: 6 matches
Batch 3: 5 matches
Batch 4: 5 matches
Batch 5: 5 matches
Batch 6: 5 matches
```

**Example 2: 16 matches, Poll Batches = "one per region"**
```
Batch 1 (ALPHA): 4 matches
Batch 2 (BETA): 4 matches
Batch 3 (GAMMA): 4 matches
Batch 4 (DELTA): 4 matches
```

**Example 3: 8 matches, Poll Batches = "two per region"**
```
Batch 1 (ALPHA-1): 2 matches
Batch 2 (ALPHA-2): 2 matches
Batch 3 (BETA-1): 2 matches
Batch 4 (BETA-2): 2 matches
Batch 5 (GAMMA-1): 2 matches
Batch 6 (GAMMA-2): 2 matches
Batch 7 (DELTA-1): 2 matches
Batch 8 (DELTA-2): 0 matches (Round 3 has 8 matches, not 16)
```

Wait, this doesn't work cleanly. Let me revise.

#### Revised: Region-Based Batching

**For "one per region" and "two per region", algorithm is different:**

```typescript
function calculateRegionBatches(matches: Match[], batchConfig: string): Match[][] {
  if (batchConfig === 'one per region') {
    // Group by region
    const byRegion: { [region: string]: Match[] } = {};
    matches.forEach(m => {
      if (!byRegion[m.region]) byRegion[m.region] = [];
      byRegion[m.region].push(m);
    });
    return Object.values(byRegion);
  }

  if (batchConfig === 'two per region') {
    // Split each region into 2 batches
    const byRegion: { [region: string]: Match[] } = {};
    matches.forEach(m => {
      if (!byRegion[m.region]) byRegion[m.region] = [];
      byRegion[m.region].push(m);
    });

    const batches: Match[][] = [];
    Object.values(byRegion).forEach(regionMatches => {
      const mid = Math.ceil(regionMatches.length / 2);
      batches.push(regionMatches.slice(0, mid));
      batches.push(regionMatches.slice(mid));
    });

    return batches;
  }

  // ... numeric batching as before
}
```

---

## 5. Discord Poll Duration Format

### Problem Statement
Config stores poll length as hours (24), but what format does Discord.js poll API actually require?

### Solution: Discord.js Poll API Specification

#### Discord.js v14 Poll API

**Poll creation uses `PollData` interface:**

```typescript
interface PollData {
  question: string;
  answers: PollAnswerData[];
  duration: number; // Duration in HOURS (1-168, max 7 days)
  allowMultiselect?: boolean;
  layoutType?: PollLayoutType;
}
```

**Key Finding:** Discord.js accepts duration in **hours**, NOT minutes or seconds.

#### Implementation

```typescript
async function createPoll(
  channel: TextChannel,
  match: Match,
  pollLengthHours: number
): Promise<Message> {
  const pollData: PollData = {
    question: `Round ${match.round} - ${match.region} - Match ${match.matchNumber}`,
    answers: [
      { text: `(${match.participant1.seed}) ${match.participant1.name}`, emoji: '1️⃣' },
      { text: `(${match.participant2.seed}) ${match.participant2.name}`, emoji: '2️⃣' }
    ],
    duration: pollLengthHours, // Direct from config - no conversion needed
    allowMultiselect: false
  };

  const message = await channel.send({ poll: pollData });
  return message;
}
```

#### Validation

**Config validation:**
```typescript
function validatePollLength(hours: number): ValidationResult {
  if (!Number.isInteger(hours)) {
    return { valid: false, error: 'Poll Length must be a whole number' };
  }

  if (hours < 1 || hours > 168) {
    return { valid: false, error: 'Poll Length must be between 1 and 168 hours (7 days max)' };
  }

  return { valid: true };
}
```

**Discord API Limits:**
- Minimum: 1 hour
- Maximum: 168 hours (7 days)
- Must be integer (no decimals)

---

## 6. Poll Close Event Handling

### Problem Statement
REQUIREMENTS.md claims "vPoll listens for Discord poll close event" but Discord.js v14 documentation doesn't show this event.

### Solution: Hybrid Approach with Polling

#### Discord.js v14 Poll Events

**Reality check:** Discord.js v14 does NOT have a dedicated "poll close" event.

**Available events:**
- `messagePollVoteAdd` - Fires when user votes (not useful for close detection)
- `messageUpdate` - Fires when message updates (including poll end, but unreliable)

**Conclusion:** Primary method must be **polling**, not event listeners.

#### Revised Implementation Strategy

**Primary Method: Scheduled Poll Checking**

```typescript
class PollMonitor {
  private activePolls: Map<string, ActivePoll> = new Map();
  private checkInterval: NodeJS.Timeout;

  constructor(private bot: Client) {
    // Check all active polls every 1 minute
    this.checkInterval = setInterval(() => this.checkAllPolls(), 60000);
  }

  async checkAllPolls(): Promise<void> {
    const now = Date.now();

    for (const [pollId, activePoll] of this.activePolls) {
      // Check if poll should be closed by now
      if (now >= activePoll.closeTime) {
        try {
          await this.processPollResult(activePoll);
          this.activePolls.delete(pollId);
        } catch (error) {
          logger.error(`Failed to process poll ${pollId}:`, error);
          // Keep in activePolls for retry on next check
        }
      }
    }
  }

  async processPollResult(activePoll: ActivePoll): Promise<void> {
    // Fetch latest poll data
    const channel = await this.bot.channels.fetch(activePoll.channelId) as TextChannel;
    const message = await channel.messages.fetch(activePoll.messageId);

    if (!message.poll) {
      throw new Error('Poll not found on message');
    }

    // Check if poll is actually closed
    if (!message.poll.expiresAt || message.poll.expiresAt > new Date()) {
      // Poll not closed yet, check again later
      return;
    }

    // Extract vote counts
    const votes: { [answerId: string]: number } = {};
    message.poll.answers.forEach(answer => {
      votes[answer.text] = answer.voteCount;
    });

    // Determine winner and update Google Sheets
    await this.updateBracket(activePoll, votes);
  }
}
```

**Fallback Method: messageUpdate Event (Opportunistic)**

```typescript
// Listen for message updates (may include poll close)
client.on('messageUpdate', async (oldMessage, newMessage) => {
  if (!newMessage.poll) return;

  const activePoll = pollMonitor.getActivePoll(newMessage.id);
  if (!activePoll) return;

  // Check if poll just ended
  if (newMessage.poll.expiresAt && newMessage.poll.expiresAt <= new Date()) {
    // Poll closed, process immediately (don't wait for next check cycle)
    await pollMonitor.processPollResult(activePoll);
  }
});
```

#### Check Frequency Trade-offs

| Interval | Pros | Cons |
|----------|------|------|
| 10 seconds | Near real-time results | High API usage, rate limit risk |
| 1 minute | Fast enough, reasonable API usage | **Recommended for MVP** |
| 5 minutes | Low API usage | Delayed result processing |
| 10 minutes | Very low API usage | Too slow, poor UX |

**MVP Decision:** Check every **1 minute** (60 seconds).

#### Update REQUIREMENTS.md Documentation

**Replace lines 706-711 with:**
```
1. **Primary Method:** vPoll checks all active polls every 60 seconds
   - Scheduled check runs every minute
   - Fetches poll data and checks if expiry time passed
   - Processes result when poll closed
2. **Opportunistic Method:** Listen for messageUpdate events
   - May detect poll close faster than scheduled check
   - Not reliable (Discord may not fire event), so scheduled check is primary
```

---

## 7. Config Tab Parsing Rules

### Problem Statement
Config tab format (headers, case sensitivity, whitespace handling) is not fully specified.

### Solution: Strict Parsing Rules

#### Config Tab Structure

**Row 1: Header Row**
```
| Setting Name | Value | Description |
```

**Parsing starts at Row 2.**

#### Parsing Algorithm

```typescript
function parseConfigTab(values: string[][]): TournamentConfig {
  // Skip header row (row 1 is index 0)
  const configRows = values.slice(1);

  const config: { [key: string]: string } = {};

  configRows.forEach((row, index) => {
    if (row.length < 2) {
      logger.warn(`Config row ${index + 2} has fewer than 2 columns, skipping`);
      return;
    }

    const key = normalizeConfigKey(row[0]);
    const value = row[1]?.toString().trim() || '';

    if (key) {
      config[key] = value;
    }
  });

  return mapToTournamentConfig(config);
}

function normalizeConfigKey(key: string | undefined): string {
  if (!key) return '';

  return key
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_'); // "Poll Length" -> "poll_length"
}
```

#### Config Key Mapping

**Case-insensitive, whitespace-normalized:**

| User Input | Normalized Key | Config Field |
|------------|----------------|--------------|
| "Tournament Name" | tournament_name | tournamentName |
| "tournament name" | tournament_name | tournamentName |
| "Poll Length" | poll_length | pollLengthHours |
| "poll_length" | poll_length | pollLengthHours |
| "Discord Channel ID" | discord_channel_id | discordChannelId |

#### Required Config Values

**Must be present and non-empty:**
```typescript
const REQUIRED_CONFIG = [
  'tournament_name',
  'tournament_description',
  'start_date',
  'poll_length',
  'poll_batches',
  'discord_channel_id',
  'auto_advance',
  'tie_breaker_rule',
  'results_visibility'
];

function validateRequiredConfig(config: { [key: string]: string }): ValidationResult {
  const missing: string[] = [];

  REQUIRED_CONFIG.forEach(key => {
    if (!config[key] || config[key].trim() === '') {
      missing.push(key.replace(/_/g, ' '));
    }
  });

  if (missing.length > 0) {
    return {
      valid: false,
      errors: [`Missing required config values: ${missing.join(', ')}`]
    };
  }

  return { valid: true };
}
```

#### Unknown Config Keys

**Behavior:** Warn but don't error

```typescript
const KNOWN_CONFIG_KEYS = [
  'tournament_name',
  'tournament_description',
  'start_date',
  'poll_length',
  'poll_batches',
  'discord_channel_id',
  'auto_advance',
  'tie_breaker_rule',
  'results_visibility',
  'auto_round_scheduling',
  'celebratory_gif',
  // Thread IDs (optional, 6 rounds)
  'round_1_thread_id',
  'round_2_thread_id',
  'round_3_thread_id',
  'round_4_thread_id',
  'round_5_thread_id',
  'round_6_thread_id'
];

// Unknown keys generate warnings
configRows.forEach((row, index) => {
  const key = normalizeConfigKey(row[0]);
  if (key && !KNOWN_CONFIG_KEYS.includes(key)) {
    logger.warn(`Unknown config key at row ${index + 2}: "${row[0]}" (normalized: "${key}")`);
  }
});
```

---

## 8. Auto Scheduling Time Parsing

### Problem Statement
Format like "3 days" needs parsing rules for variations (case, singular/plural, decimal values).

### Solution: Flexible Time Parser

#### Supported Formats

```typescript
const TIME_FORMATS = {
  immediate: 0,
  disabled: -1, // Blank or empty

  // Time unit patterns (case-insensitive)
  hours: /^(\d+(?:\.\d+)?)\s*(hours?|hrs?|h)$/i,
  days: /^(\d+(?:\.\d+)?)\s*(days?|d)$/i
};
```

#### Parsing Algorithm

```typescript
function parseAutoRoundScheduling(configValue: string): number {
  // Trim and lowercase for comparison
  const trimmed = configValue.trim().toLowerCase();

  // Check for special values
  if (trimmed === '' || trimmed === 'disabled' || trimmed === 'none') {
    return -1; // Disabled
  }

  if (trimmed === 'immediate') {
    return 0; // Zero delay
  }

  // Try to match hours pattern
  const hoursMatch = trimmed.match(TIME_FORMATS.hours);
  if (hoursMatch) {
    const hours = parseFloat(hoursMatch[1]);
    return hours * 60 * 60 * 1000; // Convert to milliseconds
  }

  // Try to match days pattern
  const daysMatch = trimmed.match(TIME_FORMATS.days);
  if (daysMatch) {
    const days = parseFloat(daysMatch[1]);
    return days * 24 * 60 * 60 * 1000; // Convert to milliseconds
  }

  // Invalid format
  throw new Error(`Invalid Auto Round Scheduling format: "${configValue}". Expected: "immediate", "X hours", or "X days"`);
}
```

#### Examples

| Input | Parsed Delay (ms) | Notes |
|-------|-------------------|-------|
| `""` (empty) | -1 | Disabled |
| `"disabled"` | -1 | Explicitly disabled |
| `"immediate"` | 0 | No delay |
| `"24 hours"` | 86,400,000 | 24 hours in ms |
| `"24 hour"` | 86,400,000 | Singular accepted |
| `"24h"` | 86,400,000 | Short form accepted |
| `"3 days"` | 259,200,000 | 3 days in ms |
| `"3 day"` | 259,200,000 | Singular accepted |
| `"3d"` | 259,200,000 | Short form accepted |
| `"2.5 days"` | 216,000,000 | Decimal values accepted |
| `"48 hours"` | 172,800,000 | Equivalent to 2 days |
| `"3 DAYS"` | 259,200,000 | Case-insensitive |
| `"  3 days  "` | 259,200,000 | Whitespace trimmed |

#### Validation

```typescript
function validateAutoRoundScheduling(delayMs: number): ValidationResult {
  if (delayMs === -1) {
    return { valid: true, message: 'Auto-scheduling disabled (manual advancement only)' };
  }

  if (delayMs === 0) {
    return { valid: true, message: 'Auto-scheduling: immediate (no delay)' };
  }

  if (delayMs < 0) {
    return { valid: false, error: 'Delay cannot be negative' };
  }

  // Warn if delay is very long
  const maxDays = 30;
  if (delayMs > maxDays * 24 * 60 * 60 * 1000) {
    return {
      valid: false,
      error: `Delay exceeds ${maxDays} days. Tournament may be forgotten.`
    };
  }

  return { valid: true };
}
```

---

## 9. Service Account Permission Validation

### Problem Statement
How does vPoll verify Editor permission vs Viewer permission on Google Sheets?

### Solution: Permissions API Check

#### Google Sheets API Approach

**Method:** Use `spreadsheets.get()` with permissions field

```typescript
async function validateServiceAccountPermission(spreadsheetId: string): Promise<ValidationResult> {
  try {
    // Fetch spreadsheet metadata including permissions
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'spreadsheetId,properties.title'
    });

    // If we can read metadata, we at least have Viewer permission
    if (!response.data) {
      return {
        valid: false,
        error: 'Cannot access spreadsheet. Ensure sheet is shared with: vpoll-sheets-access@vpoll-475821.iam.gserviceaccount.com'
      };
    }

    // Test write permission by attempting a write to Results tab
    // Use a test cell that won't affect template data
    const testCell = 'Results!A1000'; // Far below any real data
    const testValue = `vPoll_Access_Test_${Date.now()}`;

    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: testCell,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[testValue]]
        }
      });

      // Write succeeded - we have Editor permission
      // Clean up test value
      await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: testCell
      });

      return { valid: true };

    } catch (writeError: any) {
      // Write failed - likely Viewer permission only
      if (writeError.code === 403) {
        return {
          valid: false,
          error: 'Service account has Viewer permission only. Please grant Editor permission to: vpoll-sheets-access@vpoll-475821.iam.gserviceaccount.com'
        };
      }

      throw writeError; // Re-throw unexpected errors
    }

  } catch (error: any) {
    if (error.code === 404) {
      return {
        valid: false,
        error: 'Spreadsheet not found. Check that URL is correct and sheet is shared.'
      };
    }

    if (error.code === 403) {
      return {
        valid: false,
        error: 'Access denied. Please share sheet with: vpoll-sheets-access@vpoll-475821.iam.gserviceaccount.com'
      };
    }

    throw error;
  }
}
```

#### Alternative: Check Drive Permissions API

**More direct but requires additional API scope:**

```typescript
// Requires: https://www.googleapis.com/auth/drive.metadata.readonly
async function checkDrivePermissions(spreadsheetId: string): Promise<ValidationResult> {
  const drive = google.drive({ version: 'v3', auth: serviceAccountAuth });

  try {
    const response = await drive.files.get({
      fileId: spreadsheetId,
      fields: 'permissions(role,emailAddress)'
    });

    const serviceAccountEmail = 'vpoll-sheets-access@vpoll-475821.iam.gserviceaccount.com';
    const permission = response.data.permissions?.find(
      p => p.emailAddress === serviceAccountEmail
    );

    if (!permission) {
      return {
        valid: false,
        error: `Sheet not shared with service account: ${serviceAccountEmail}`
      };
    }

    if (permission.role !== 'writer' && permission.role !== 'owner') {
      return {
        valid: false,
        error: `Service account has "${permission.role}" permission. "writer" or "owner" required.`
      };
    }

    return { valid: true };

  } catch (error: any) {
    // Handle errors
    return { valid: false, error: error.message };
  }
}
```

**MVP Recommendation:** Use test write method (first approach) - doesn't require additional API scopes.

---

## 10. Thread ID Configuration Format

### Problem Statement
Thread IDs are mentioned but config format not fully specified. How are 6 rounds configured?

### Solution: Optional Per-Round Thread Config

#### Config Keys

**Format:** `Round {X} Thread ID` (where X = 1-6)

**Example Config Tab:**
```
| Setting Name | Value | Description |
|--------------|-------|-------------|
| Round 1 Thread ID | 123456789012345678 | Thread for Round 1 polls |
| Round 2 Thread ID | 234567890123456789 | Thread for Round 2 polls |
| Round 3 Thread ID | | (empty - falls back to primary channel) |
| Round 4 Thread ID | | |
| Round 5 Thread ID | | |
| Round 6 Thread ID | | |
```

#### Parsing

```typescript
interface ThreadConfig {
  [round: number]: string; // round -> threadId
}

function parseThreadConfig(config: { [key: string]: string }): ThreadConfig {
  const threadConfig: ThreadConfig = {};

  for (let round = 1; round <= 6; round++) {
    const key = `round_${round}_thread_id`;
    const threadId = config[key]?.trim();

    if (threadId && threadId !== '') {
      threadConfig[round] = threadId;
    }
  }

  return threadConfig;
}
```

#### Validation

```typescript
async function validateThreadIds(
  client: Client,
  channelId: string,
  threadConfig: ThreadConfig
): Promise<ValidationResult> {
  const errors: string[] = [];

  // Get parent channel
  const channel = await client.channels.fetch(channelId);
  if (!channel || !channel.isTextBased()) {
    return {
      valid: false,
      errors: ['Primary channel is invalid or not text-based']
    };
  }

  // Validate each configured thread ID
  for (const [round, threadId] of Object.entries(threadConfig)) {
    try {
      const thread = await client.channels.fetch(threadId);

      if (!thread || !thread.isThread()) {
        errors.push(`Round ${round} Thread ID is not a valid thread: ${threadId}`);
        continue;
      }

      // Check if thread belongs to primary channel
      if (thread.parentId !== channelId) {
        errors.push(`Round ${round} thread is not in the primary channel (different parent)`);
      }

      // Check bot has permission to post
      const permissions = thread.permissionsFor(client.user!);
      if (!permissions?.has('SendMessages')) {
        errors.push(`Bot lacks SendMessages permission in Round ${round} thread`);
      }

    } catch (error) {
      errors.push(`Cannot access Round ${round} thread: ${threadId}`);
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true };
}
```

#### Usage During Poll Creation

```typescript
function getChannelIdForRound(
  round: number,
  primaryChannelId: string,
  threadConfig: ThreadConfig
): string {
  // Check if thread configured for this round
  const threadId = threadConfig[round];

  if (threadId) {
    logger.info(`Using thread ${threadId} for Round ${round}`);
    return threadId;
  }

  // Fall back to primary channel
  logger.info(`Using primary channel ${primaryChannelId} for Round ${round} (no thread configured)`);
  return primaryChannelId;
}

async function createPollsForRound(round: number): Promise<void> {
  const channelId = getChannelIdForRound(
    round,
    tournamentState.config.discordChannelId,
    tournamentState.config.threadConfig
  );

  const channel = await client.channels.fetch(channelId);

  // Create polls in this channel/thread
  // ...
}
```

#### Optional: Per-Region Thread Support

**For future versions, could support:**
```
Round 1 ALPHA Thread ID | 111111111111111111
Round 1 BETA Thread ID  | 222222222222222222
Round 1 GAMMA Thread ID | 333333333333333333
Round 1 DELTA Thread ID | 444444444444444444
```

**MVP: Not implemented** (per-round only, not per-region)

---

## Summary

This technical specification resolves the 10 critical/high ambiguities identified in REQUIREMENTS.md:

1. ✅ **Bracket Tab Cell Mapping** - Named range approach for 126 advancement cells
2. ✅ **Bracket Tab Formulas** - IF/VLOOKUP pattern referencing advancement cells
3. ✅ **Match ID Generation** - Fixed region pairing algorithm for all 6 rounds
4. ✅ **Poll Batches Calculation** - Distribute matches across batches with remainder handling
5. ✅ **Discord Poll Duration** - Direct hours value (no conversion needed)
6. ✅ **Poll Close Events** - Primary method is 60-second polling (no Discord event)
7. ✅ **Config Parsing** - Case-insensitive, row 2+ parsing with key normalization
8. ✅ **Auto Scheduling Parsing** - Flexible regex pattern accepting hours/days with variants
9. ✅ **Permission Validation** - Test write to Results tab to verify Editor access
10. ✅ **Thread ID Config** - Optional per-round config keys with fallback to primary channel

---

**Next Steps:**

1. Create Google Sheets template implementing bracket tab specifications
2. Begin implementation with these specifications as reference
3. Update REQUIREMENTS.md to reference this document for technical details
4. Add to technical documentation repo for developer onboarding
