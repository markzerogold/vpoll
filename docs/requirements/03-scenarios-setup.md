# vPoll Product Requirements - User Scenarios (Setup Phase)

[← Back to Main README](../../README.md) | [View Full Requirements](../../REQUIREMENTS.md)

**Document Section:** 3 of 9
**Last Updated:** 2025-10-22
**Status:** In Development - MVP Phase

---

## Navigation

- **Previous:** [Scope & Priorities](./02-scope-priorities.md)
- **Current:** User Scenarios - Setup Phase (Scenarios 0-11)
- **Next:** [User Scenarios - Core Operations](./04-scenarios-core.md)
- **See Also:**
  - [Admin Scenarios](./05-scenarios-admin.md)
  - [Deferred Scenarios](./06-scenarios-deferred.md)

---

## User Scenarios

This section describes the complete end-to-end workflows for vPoll users.

### Scenario Flow Overview

```
Setup Phase (Scenarios 1-9)
    └─> Tournament Operations (Scenarios 10-19)
            └─> Advanced Features (Scenarios 20-30)
```

---

### Setup Phase: Google Sheets Preparation

#### Scenario 0: Get Master Template

**Actor:** Anyone (Discord User, TH, or Server Administrator)
**Goal:** Obtain the vPoll master template spreadsheet link

**Command:**
```
/tournament template
```

**Flow:**
1. User runs `/tournament template` in Discord (works in any server where vPoll is installed)
2. vPoll responds with an embedded message containing:
   - Direct link to master template spreadsheet
   - Instructions to make a copy (File → Make a copy)
   - Service account email for sharing
   - Next steps for tournament setup
3. User clicks the link to view or copy the template

**Why This Matters:** Makes it easy for anyone to get started with vPoll without searching documentation. Users can explore the template structure or start creating their own tournament immediately.

**Success Criteria:** User receives template link and instructions within 1 second

---

#### Scenario 1: Fill Out Participants

**Actor:** Tournament Host (TH)
**Goal:** Define the 64 tournament participants with rankings

**Pre-requisite:** Get the master template
- In Discord, run `/tournament template` to get the master template link
- Open the link and click File → Make a copy
- Rename the copy (e.g., "Star Trek Character Battle 2025")

**Flow:**
1. Admin has a copy of the vPoll template spreadsheet
2. In Participants tab (rows 1-64), admin fills:
   - Column A: Rank (1-64) - determines seeding order
   - Column B: Participant name (e.g., "Spock (TOS/TAS/Films/SNW)")
   - Column C: Notes (optional) - additional context or description
   - Column D: Reference Link (optional) - image URL or wiki link

**Why This Matters:** Rankings determine bracket seeding (higher rank = easier path). Column C/D provide context for voters unfamiliar with participants.

**Success Criteria:** All 64 rows have unique participant names and valid rank numbers 1-64

---

#### Scenario 2: Configure Tournament Settings

**Actor:** Tournament Host (TH)
**Goal:** Set tournament rules and behavior

**Flow:**
1. In Config tab, admin sets key-value pairs:
   - **Tournament Name** - Display name (e.g., "Star Trek Character Battle")
   - **Tournament Description** - Brief description (e.g., "Vote for the best character across all series")
   - **Start Date** - When tournament begins
   - **Poll Length** - Duration in hours (e.g., 24)
   - **Poll Batches** - How many polls launch at once (see Scenario 9)
   - **Discord Channel ID** - Where to post polls (right-click channel → Copy ID)
   - **Auto-advance** - true/false - Automatically start next round after current completes
   - **Tie Breaker Rule** - "Dice roll" (only option for MVP)
   - **Results Visibility** - When users see results (see Scenario 11)

**Optional Settings:**
   - Auto Round Scheduling - Delay before auto-starting next round (e.g., "3 days", "immediate")
   - Celebratory GIF - true/false - Include random GIF in winner announcement

**Why This Matters:** These settings control entire tournament behavior without requiring code changes.

**Success Criteria:** All required config values set, Discord Channel ID is valid and bot has access

---

#### Scenario 3: Verify Region Distribution

**Actor:** Tournament Host (TH)
**Goal:** Review how participants are distributed across 4 regions

**Flow:**
1. Regions tab automatically populates based on Participants tab rankings
2. Admin reviews distribution:
   - Row 1 contains generic headers: (blank), Region 1, Region 2, Region 3, Region 4
   - Row 2 contains "Rank" header + customizable region names (e.g., "Rank", "Federation", "Klingon Empire", "Romulan Star Empire", "Dominion")
   - Rows 3-18 contain participant distribution:
     - Rank 1 → Region 1 (Column B)
     - Rank 2 → Region 2 (Column C)
     - Rank 3 → Region 3 (Column D)
     - Rank 4 → Region 4 (Column E)
     - Rank 5 → Region 1 (Column B)
     - [Pattern repeats: 16 participants per region]

3. Admin customizes region names in row 2 (e.g., "ALPHA", "BETA", "GAMMA", "DELTA" or themed names)

**Why This Matters:** Region names add thematic flavor while keeping generic headers consistent across all tournaments. The two-row header structure makes it clear that columns represent bracket regions.

**Success Criteria:** All 4 regions have custom names in row 2, distribution looks balanced, headers are frozen for easy scrolling

---

#### Scenario 4: Share Sheet with vPoll Service Account

**Actor:** Tournament Host (TH)
**Goal:** Grant vPoll permission to read/write tournament data

**Flow:**
1. Click Share button in Google Sheets
2. Add email: `vpoll-sheets-access@vpoll-475821.iam.gserviceaccount.com`
3. Set permission: **Editor** (required for vPoll to update results)
4. Click Send

**Why This Matters:** Without Editor access, vPoll cannot update bracket or results tab. This is the most common setup error.

**Success Criteria:** Service account appears in sharing list with Editor role

---

#### Scenario 5: Enable Public Viewing

**Actor:** Tournament Host (TH)
**Goal:** Allow Discord users to view bracket without Google account

**Flow:**
1. Click Share button
2. Change general access to: "Anyone with the link" → Viewer
3. This allows public read-only access without requiring Google sign-in

**Why This Matters:** Discord users can click bracket links and immediately see results without authentication friction.

**Success Criteria:** Sheet link opens in incognito browser without requiring sign-in

---

### Setup Phase: Discord Bot Configuration

#### Scenario 6: Add Bot to Discord Server

**Actor:** Server Administrator
**Goal:** Install vPoll bot with required permissions

**Flow:**
1. Admin uses invite URL provided by bot owner (private bot)
2. Selects target Discord server
3. Grants required permissions:
   - Send Messages
   - Embed Links
   - Create Public Threads
   - Use Slash Commands
   - Add Reactions
   - Manage Messages (edit/delete bot's own messages)
   - Read Message History
   - Attach Files

**Why This Matters:** Missing permissions will cause command failures. "Manage Messages" is often forgotten but needed for editing poll preview posts.

**Success Criteria:** Bot appears in server member list with green "online" status

---

#### Scenario 7: Create Tournament from Google Sheet

**Actor:** Tournament Host (TH)
**Goal:** Load tournament data into vPoll

**Command:**
```
/tournament create <google-sheets-url>
```

**Flow:**
1. Admin runs command with Google Sheets URL
2. vPoll validates sheet structure (see Scenario 23):
   - Checks for Participants, Config, Regions, Bracket, Results tabs
   - Verifies 64 participants exist in Participants tab
   - Validates all required Config values are set
   - Confirms service account has Editor access
   - Verifies Discord channel ID is valid and accessible
3. If validation passes:
   - vPoll loads tournament data into memory
   - Responds with confirmation message showing:
     - Tournament name (from Config tab)
     - Number of participants (64)
     - Region names
     - Start date
     - Poll configuration summary
4. If validation fails:
   - vPoll responds with detailed error message listing what's missing/incorrect
   - Tournament is NOT created

**Why This Matters:** Early validation prevents runtime errors during tournament. Clear error messages help admins fix issues before starting.

**Success Criteria:** Validation passes, tournament data loaded, confirmation message posted

**Common Errors:**
- "Cannot access sheet" → Service account not granted Editor permission
- "Missing Config values" → Required settings not filled in Config tab
- "Invalid channel ID" → Bot cannot access specified channel

---

#### Scenario 8: Start Tournament and Launch First Round

**Actor:** Tournament Host (TH)
**Goal:** Begin tournament and create first round polls

**Command:**
```
/tournament start
```

**Flow:**
1. Admin runs command
2. vPoll displays tournament summary and asks for confirmation:
   - Tournament name and description
   - 64 participants across 4 regions
   - Poll length (e.g., 24 hours)
   - Poll batches configuration (e.g., "full round" = 32 polls at once)
   - Auto-advance setting
3. Admin confirms
4. vPoll immediately launches Round 1 polls based on Poll Batches setting (see Scenario 9)
5. vPoll posts confirmation: "Round 1 has begun! 32 polls created."

**Why This Matters:** Confirmation step prevents accidental tournament starts. First round always requires manual start (auto-scheduling only applies to rounds 2+).

**Success Criteria:** Round 1 polls appear in configured Discord channel

**Assumption:** MVP assumes single tournament per server. If tournament already active, command returns error.

---

#### Scenario 9: Automated Poll Creation (Batching)

**Actor:** vPoll (Automated)
**Goal:** Create Discord polls according to batching configuration

**Trigger:** Tournament start (Scenario 8) or next round launch (Scenario 13)

**Batching Options (from Config tab):**

| Poll Batches Setting | Behavior | Polls Per Batch | Total Batches (Round 1) |
|---------------------|----------|-----------------|------------------------|
| **"full round"** | All matches at once | 32 | 1 |
| **"one per region"** | 1 match per region | 4 | 8 |
| **"two per region"** | 2 matches per region | 8 | 4 |
| **"half round"** | Half the matches | 16 | 2 |
| **"sequential"** | One at a time | 1 | 32 |
| **Custom number** (e.g., "6") | Exact count specified | 6 | 6 (rounded) |

**Flow (for each batch):**
1. vPoll reads next set of matches from Bracket tab
2. For each match, vPoll creates Discord native poll:
   - Poll question: "Round 1 - [Region Name] - Match [#]"
   - Poll options:
     - "(1) Participant Name" (showing seed number)
     - "(16) Participant Name"
   - Poll duration: From Config tab (e.g., 24 hours)
   - Allow multiselect: false (only one vote)
3. vPoll posts poll to configured Discord channel
4. vPoll records Discord Poll ID in internal state (for later result tracking)

**Batch Timing:**
- If batches > 1: Next batch launches when previous batch completes (all polls closed)
- vPoll monitors poll close events to trigger next batch

**Why This Matters:** Batching prevents channel spam (32 polls at once can overwhelm channels) and allows tournaments to run sequentially for extended engagement.

**Success Criteria:** All polls created successfully with correct participants and seeding

---

### Tournament Operations: Voting & Results

#### Scenario 10: Generate Advertising Post (Deferred to Future)

**Actor:** Tournament Host (TH)
**Goal:** Create formatted promotion post for other channels

**Command:**
```
/tournament advertise
```

**Flow:**
1. Admin runs command
2. vPoll reads "Advertising Template" from Config tab
3. vPoll replaces placeholders with actual data:
   - `{tournament_name}` → "Star Trek Character Battle"
   - `{description}` → "Vote for the best character across all series"
   - `{start_date}` → "October 25, 2025"
   - `{participants_count}` → "64"
   - `{bracket_link}` → Google Sheets URL
   - `{channel_link}` → Discord channel link where polls are posted
4. vPoll posts generated message (ephemeral - only visible to admin)
5. Admin copies and pastes to desired channels/threads

**Example Template:**
```
🏆 **{tournament_name}** is starting {start_date}!

{description}

🎯 {participants_count} participants competing across 4 regions
📊 View live bracket: {bracket_link}
🗳️ Vote here: {channel_link}

May the best win!
```

**Why This Matters:** Standardized promotion messaging saves time and ensures consistent communication. Ephemeral response prevents channel spam.

**Success Criteria:** Generated message contains all correct data and proper formatting

---

#### Scenario 11: Users Vote in Discord Polls

**Actor:** Discord User (Voter)
**Goal:** Cast votes in tournament matches

**Flow:**
1. Discord poll appears in tournament channel
2. User reads poll question and participant names with seeds
3. User clicks preferred participant option
4. Discord registers vote immediately
5. Discord displays current vote counts (live results visible)
6. Poll automatically closes after configured Poll Length (e.g., 24 hours)

**Discord Native Poll Behavior:**
- Users can change vote before poll closes
- Vote counts update in real-time (cannot be hidden in MVP)
- Closed polls show final results and prevent new votes
- No special permissions required to vote (anyone in channel can vote)

**Why This Matters:** Using Discord native polls means zero custom voting logic needed. Familiar UX increases participation.

**Success Criteria:** Users can vote without errors, votes are counted by Discord

**MVP Limitation:** Cannot enforce role restrictions on voting (anyone in channel can vote). Use Discord's channel permissions to control who can access the tournament channel. See Scenario 20 for workaround.

---

[← Previous: Scope & Priorities](./02-scope-priorities.md) | [Next: Core Operations →](./04-scenarios-core.md)
