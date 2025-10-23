# vPoll Product Requirements Document

**Last Updated:** 2025-10-22
**Status:** In Development - MVP Phase
**Owner:** Product Team

---

## Table of Contents

1. [Product Overview](#product-overview)
2. [Problem Statement](#problem-statement)
3. [Vision & Goals](#vision--goals)
4. [Solution Overview](#solution-overview)
5. [Scope & Priorities](#scope--priorities)
6. [Key Trade-offs & Decisions](#key-trade-offs--decisions)
7. [User Scenarios](#user-scenarios)
8. [Technical Architecture](#technical-architecture)
9. [Google Sheets Template Specification](#google-sheets-template-specification)
10. [Dependencies & Risks](#dependencies--risks)
11. [Decision Log](#decision-log)

---

## Product Overview

**Product Name:** vPoll
**Product Type:** Discord Bot for Tournament Voting
**Target Users:** Discord server administrators and community managers
**Platform:** Discord (via Discord.js v14)

vPoll is a Discord bot that enables server communities to run tournament-style voting competitions (e.g., "Best Star Trek Character," "Top Pizza Toppings") with automated bracket management, native Discord polls, and Google Sheets integration for transparency and results tracking.

---

## Problem Statement

### Current Pain Points

**Problem:** Discord communities want to run engaging tournament-style voting competitions, but current solutions require extensive manual effort, are error-prone, and lack transparency.

**User Evidence:**
- Server admins manually create 63 individual polls for 64-participant tournaments, taking hours of setup time
- Manual vote counting and bracket updates lead to errors and delays
- External polling tools break Discord's native experience and require users to leave the platform
- Spreadsheet tracking is manual and becomes out-of-sync with actual voting
- No automated progression means tournaments stall between rounds waiting for admin intervention

**Current Workarounds:**
- Manual Discord poll creation with spreadsheet tracking (time-intensive, error-prone)
- External polling websites (poor Discord integration, low participation)
- Reaction-based voting in messages (difficult to count, easy to manipulate)
- Google Forms (requires leaving Discord, lacks real-time engagement)

---

## Vision & Goals

### Product Vision

Enable Discord communities to effortlessly run engaging, transparent tournament-style competitions that bring members together through friendly competition—all without leaving Discord.

### Strategic Goals

1. **Eliminate Manual Overhead:** Automate 95%+ of tournament management tasks (poll creation, results tracking, bracket progression)
2. **Maximize Participation:** Use Discord native polls to keep voting seamless and accessible
3. **Ensure Transparency:** Provide real-time, publicly viewable bracket via Google Sheets
4. **Enable Community Engagement:** Make tournaments easy enough that any server admin can run them regularly

### User Outcomes

**For Server Admins:**
- Set up a complete 64-participant tournament in under 10 minutes
- Launch tournaments that run automatically without manual intervention
- Share transparent, always-current brackets with the community

**For Server Members:**
- Vote in tournaments using familiar Discord poll interface
- View live bracket progress at any time
- Participate in community events without external tools or signups

---

## Solution Overview

### Core Concept

vPoll combines three key technologies to deliver automated tournament management:

1. **Google Sheets** as the tournament source of truth (participant data, configuration, live bracket display)
2. **Discord Native Polls** for seamless voting without leaving Discord
3. **Automated Orchestration** to manage poll creation, result tracking, and bracket progression

### How It Works (High-Level)

```
1. Admin creates Google Sheet from template → Adds 64 participants + config
2. Admin shares sheet with vPoll service account → Sets up permissions
3. Admin runs /tournament create <sheet-url> → vPoll validates and loads tournament
4. Admin runs /tournament start → vPoll launches first round of polls
5. Users vote in Discord polls → Discord tracks votes natively
6. Polls close automatically → vPoll reads results and updates Google Sheet bracket
7. Next round auto-launches → Repeat until champion is crowned
8. vPoll announces winner → Tournament complete with full results in sheet
```

### Key Differentiators

- **No External Tools:** Everything happens in Discord using native polls
- **Transparent Brackets:** Anyone can view live Google Sheets bracket (no bot permissions needed)
- **Automated Progression:** Tournaments run hands-free after initial setup
- **Customizable:** Region names, poll timing, batch sizes, auto-advance all configurable
- **Single Elimination Standard:** 64-participant bracket follows familiar March Madness format

---

## User Personas

vPoll serves three distinct user roles, each with different responsibilities and interaction patterns:

### Persona 1: Discord Admin

**Role:** Server administrator who installs and configures vPoll

**Responsibilities:**
- Install vPoll bot on Discord server
- Configure bot permissions (Send Messages, Create Polls, Manage Channels)
- Add vPoll to tournament channel(s)
- May or may not be the Tournament Master

**Technical Level:** Moderate - Comfortable with Discord server settings and bot installation

**Key Actions:**
- Invite vPoll to server via OAuth2 link
- Grant necessary Discord permissions
- Verify bot can post in designated channels

**Pain Points:**
- Ensuring correct permissions are set
- Understanding which channels vPoll needs access to

---

### Persona 2: Tournament Master (TM)

**Role:** Person who creates and manages tournament brackets

**Responsibilities:**
- Create tournament Google Sheet from template
- Fill in 64 participants with rankings, notes, and reference links
- Configure tournament settings (poll length, batches, region names, etc.)
- Share sheet with vPoll service account
- Create tournament in Discord (`/tournament create`)
- Start tournament and manage progression
- Monitor results and troubleshoot issues

**Technical Level:** Moderate - Comfortable with Google Sheets and Discord commands

**Key Actions:**
- Copy master template and customize for their tournament
- Run `/tournament template` to get template link
- Run `/tournament create <sheet-url>` to validate and load tournament
- Run `/tournament start` to begin Round 1
- Run `/tournament next-round` for manual advancement (if auto-advance disabled)
- Run `/tournament pause`, `/tournament resume`, `/tournament cancel` as needed

**Pain Points:**
- Finding and understanding the template structure
- Correctly sharing sheet with service account (Editor permission)
- Understanding configuration options
- Troubleshooting validation errors

**Note:** The TM may be the Discord Admin, but doesn't have to be. Any server member with appropriate permissions can be a TM.

---

### Persona 3: Discord User (Voter)

**Role:** Server member who participates in tournaments by voting

**Responsibilities:**
- Vote in tournament polls
- View live bracket in Google Sheets
- Ask vPoll for tournament information
- Follow tournament progression

**Technical Level:** Low - Basic Discord usage

**Key Actions:**
- Click poll options in Discord to vote
- Run `/tournament bracket` to get Google Sheets link
- Run `/tournament status` to see active polls
- Run `/tournament results` to view recent match outcomes
- Run `/participant info <name>` to learn about participants

**Pain Points:**
- Finding the bracket link
- Understanding tournament rules and progression
- Knowing when new polls are available

**Note:** This persona has the least technical burden - voting should be as simple as clicking a poll option.

---

### Persona 4: vPoll Bot (Automated)

**Role:** Automated system that orchestrates tournaments

**Responsibilities:**
- Validate tournament sheets
- Create and post Discord polls at scheduled times
- Track poll results when polls close
- Update Google Sheets with results
- Advance bracket based on winners
- Post announcements and status updates
- Handle tiebreakers

**Technical Level:** N/A (Automated)

**Key Actions:**
- Read tournament data from Google Sheets
- Write results to Google Sheets Results tab
- Update Bracket tab TRUE/FALSE cells for winner advancement
- Post Discord poll messages
- Read Discord poll results
- Calculate and execute tiebreakers
- Post match result announcements

**Note:** This "persona" represents the automated behavior of vPoll. Most scenarios involving vPoll are triggered by other personas' actions or time-based events.

---

## Scope & Priorities

### In Scope - MVP (Private Bot)

**Phase 1: Core Tournament Flow** ✅ Must Have
- Tournament creation from Google Sheets template (Scenarios 1-7)
- Automated poll creation with configurable batching (Scenario 9)
- Poll result tracking and Google Sheets updates (Scenario 12)
- Bracket progression through all 6 rounds (Scenario 13)
- Winner announcement (Scenario 14)
- Basic validation and error handling (Scenario 23)
- Tiebreaker dice rolls (Scenario 24)

**Phase 2: Admin Controls** ✅ Must Have
- Manual round advancement commands (Scenario 13)
- Tournament pause/resume (Scenario 18)
- Tournament cancellation (Scenario 19)
- Results display commands (Scenarios 15, 17)

**Phase 3: Advanced Configuration** ⚠️ Should Have
- Auto round scheduling (Scenario 25)
- Match preview posts (Scenario 21)
- Announcements channel (Scenario 29)
- Advertising post generation (Scenario 10)

**Phase 4: User Engagement** ⚠️ Should Have
- Participant info lookup with image embeds (Scenario 26)

### Out of Scope - MVP

**Deferred to Future Versions** (See FUTURE.md)
- ❌ Multi-tournament concurrent support
- ❌ Public bot deployment (multi-server architecture)
- ❌ Required voter role enforcement (Scenario 20 - config exists but not enforced)
- ❌ Live vote count updates (Scenario 22)
- ❌ User DM notifications (Scenario 28)
- ❌ Bracket image/PDF generation (Scenario 27)
- ❌ Thread/channel organization (Scenario 30 - admin must pre-create)
- ❌ Custom bracket sizes (only 64-participant supported)
- ❌ Double elimination or other tournament formats

### Non-Goals

- Mobile app or web dashboard
- Monetization or paid features
- Integration with other platforms (Slack, Teams, etc.)
- Real-time streaming or esports integration
- User accounts or persistent profiles
- Tournament matchmaking or participant recruitment

---

## Key Trade-offs & Decisions

### Major Architectural Decisions

#### Decision: Google Sheets vs Database for Tournament Data

**Chosen:** Google Sheets
**Rationale:**
- **Transparency:** Anyone can view live bracket without bot permissions or special access
- **User Control:** Admins own their data and can modify it directly if needed
- **Familiar Interface:** Most users already understand spreadsheets
- **No Backend Required:** Reduces infrastructure costs and complexity for MVP

**Trade-offs Accepted:**
- API quota limits (10,000 requests/day - sufficient for MVP single tournament)
- Slower read/write performance vs database
- Requires service account permission management
- Formula-based bracket display requires template maintenance

#### Decision: Discord Native Polls vs Custom Voting

**Chosen:** Discord Native Polls
**Rationale:**
- **Familiar UX:** Users already know how to use Discord polls
- **Built-in Features:** Auto-close timing, vote counting, results display all handled by Discord
- **Reliability:** Discord manages the voting infrastructure
- **No Database:** Don't need to store/track individual votes

**Trade-offs Accepted:**
- Cannot enforce role-based voting restrictions (anyone in channel can vote)
- Cannot hide results until poll closes (Discord shows live counts)
- Limited customization of poll appearance
- No detailed analytics (voter identities, vote timing, etc.)

#### Decision: Private Bot First (Not Public)

**Chosen:** Private Bot (MVP)
**Rationale:**
- **Simpler Architecture:** Single server = no multi-server state management
- **Lower Costs:** No scaling infrastructure needed
- **Faster Development:** Can hardcode single-server assumptions
- **Target Audience:** Designed for personal use with friends first

**Trade-offs Accepted:**
- Cannot be discovered in bot directories
- Only bot owner can invite to servers
- Limited user base for feedback and testing
- Must refactor for public deployment later

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

**Actor:** Anyone (Discord User, TM, or Discord Admin)
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

**Actor:** Tournament Master (TM)
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

**Actor:** Tournament Master (TM)
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
   - Required Voter Role - Discord role ID (config exists but not enforced in MVP)
   - Match Preview Posts - true/false (see Scenario 21)
   - Live Vote Updates - Frequency (config exists but not enforced in MVP)
   - Auto Round Scheduling - Delay before auto-starting next round (e.g., "3 days", "immediate")
   - Advertising Template - Template for promotion posts (see Scenario 10)
   - Announcements Channel ID - Separate channel for announcements (see Scenario 29)
   - Celebratory GIF - true/false - Include random GIF in winner announcement

**Why This Matters:** These settings control entire tournament behavior without requiring code changes.

**Success Criteria:** All required config values set, Discord Channel ID is valid and bot has access

---

#### Scenario 3: Verify Region Distribution

**Actor:** Tournament Master (TM)
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

**Actor:** Tournament Master (TM)
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

**Actor:** Tournament Master (TM)
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

**Actor:** Discord Admin
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

**Actor:** Tournament Master (TM)
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

**Actor:** Tournament Master (TM)
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

#### Scenario 10: Generate Advertising Post

**Actor:** Tournament Master (TM)
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

**MVP Limitation:** Cannot enforce role restrictions on voting (anyone in channel can vote). "Required Voter Role" config exists but is not enforced.

---

#### Scenario 12: Automated Result Tracking and Sheet Updates

**Actor:** vPoll (Automated)
**Goal:** Monitor polls, determine winners, update Google Sheets bracket

**Trigger:** Discord poll closes (after Poll Length duration)

**Flow:**
1. **Primary Method:** vPoll listens for Discord poll close event
   - Event fires immediately when poll closes
   - vPoll retrieves final vote counts from Discord poll
2. **Fallback Method:** vPoll checks all active poll statuses every 10 minutes
   - Catches any missed poll close events
   - Ensures no results are lost

3. **Result Processing:**
   - vPoll reads final vote counts for both participants
   - Determines winner:
     - If votes differ: Higher vote count wins
     - If tied: Trigger dice roll tiebreaker (see Scenario 24)

4. **Google Sheets Updates (in order):**

   **A. Bracket Tab Update:**
   - Find winner's cell in bracket
   - Write TRUE in winner's advancement cell
   - Write FALSE in loser's advancement cell
   - Bracket formulas automatically propagate winner to next round

   **B. Results Tab Update (append new row):**
   - Column 1: Match ID (e.g., "R1-ALPHA-M1")
   - Column 2: Round (e.g., "Round 1")
   - Column 3: Region (e.g., "ALPHA")
   - Column 4: Participant 1 Name
   - Column 5: Participant 1 Seed
   - Column 6: Participant 1 Votes
   - Column 7: Participant 2 Name
   - Column 8: Participant 2 Seed
   - Column 9: Participant 2 Votes
   - Column 10: Winner (participant name)
   - Column 11: Discord Poll ID
   - Column 12: Poll Start Time (ISO timestamp)
   - Column 13: Poll End Time (ISO timestamp)
   - Column 14: Total Votes (sum of both)
   - Column 15: Tiebreaker (dice roll result if tie, blank otherwise)
   - Column 16: Notes (blank, available for admin comments)

5. **Discord Confirmation:**
   - vPoll posts result message in channel:
     ```
     ✅ Round 1 - ALPHA - Match 1 Complete
     🏆 Winner: (1) Spock - 45 votes
     (16) Nog - 23 votes
     Total participation: 68 voters
     ```

**Why This Matters:** Automatic result tracking eliminates manual vote counting. Google Sheets updates provide real-time bracket progression visible to all.

**Success Criteria:**
- All poll results captured within 10 minutes of close
- Google Sheets updates complete successfully
- Bracket advancement formulas work correctly
- Zero manual intervention required

**Error Handling:**
- If Google Sheets API fails: Retry 3 times with exponential backoff
- If still fails: Post error message in channel and log for admin review
- Poll results stored in bot database as backup

---

#### Scenario 13: Round Advancement (Manual and Automatic)

**Actor:** vPoll (Automated) or Server Admin (Manual)
**Goal:** Launch next round of polls after previous round completes

**Round Completion Criteria:**
A round is considered "complete" when:
- ✅ All polls in that round have closed
- ✅ All results have been written to Google Sheets
- ✅ No pending result processing tasks remain

**Automatic Round Advancement (if enabled):**

**Trigger:** Round completion + Auto Round Scheduling delay elapsed

**Flow (Auto-advance):**
1. Last poll of round closes and results are written (Scenario 12)
2. vPoll checks Auto Round Scheduling config:
   - **"immediate"** → Launch next round immediately (no delay)
   - **"3 days"** → Wait 3 days, then launch next round
   - **blank/disabled** → Do nothing (manual advancement required)
3. If auto-scheduling is enabled:
   - vPoll waits for specified delay (if not immediate)
   - Posts announcement (if Announcements Channel configured):
     ```
     🎊 Round 1 is complete! Round 2 begins in 3 days.
     Check the bracket: [Google Sheets link]
     ```
   - After delay, automatically launches next round polls (same as Scenario 9)

**Manual Round Advancement:**

**Command:**
```
/tournament next-round
```

**Flow (Manual):**
1. Admin runs command
2. vPoll checks if previous round is complete:
   - If incomplete: Error message listing which polls are still pending
     ```
     ❌ Cannot start next round. Round 1 still has active polls:
     - ALPHA Match 3 (closes in 2 hours)
     - BETA Match 7 (closes in 5 hours)
     ```
   - If complete: Proceed to step 3
3. vPoll displays next round preview and asks for confirmation:
   - Round number (e.g., "Round 2")
   - Number of matches (e.g., 16)
   - Poll batches that will be created
4. Admin confirms
5. vPoll launches next round polls (same as Scenario 9)

**Race Condition Prevention:**
- Tournament state tracking prevents simultaneous manual and auto-advancement
- If admin runs `/tournament next-round` while auto-scheduling is counting down, vPoll cancels auto-scheduling and processes manual command
- If admin runs command while results are still being written, returns error (see step 2)

**Why This Matters:**
- Auto-scheduling enables hands-free tournaments
- Manual advancement gives admins control over pacing
- Safeguards prevent broken brackets from incomplete rounds

**Success Criteria:**
- Next round only launches when previous round fully complete
- No duplicate polls created
- Bracket progression is correct

---

#### Scenario 14: Tournament Completion and Winner Announcement

**Actor:** vPoll (Automated)
**Goal:** Announce tournament winner when final poll closes

**Trigger:** Final poll of Round 6 (Championship) closes

**Flow:**
1. vPoll detects final poll closed (only 1 poll in Round 6)
2. vPoll processes final result (same as Scenario 12)
3. vPoll updates tournament status to "completed" in database
4. vPoll retrieves winner data:
   - Winner name from final poll result
   - Final vote count
   - Winner's Reference Link from Participants tab Column D (if provided)
5. vPoll checks "Celebratory GIF" config setting
6. vPoll posts winner announcement in tournament channel:

**Announcement Format (with GIF enabled):**
```
🎉🏆 TOURNAMENT COMPLETE! 🏆🎉

**Star Trek Character Battle Winner:**
👑 (1) Spock 👑

**Championship Match:**
(1) Spock - 127 votes
(2) Picard - 98 votes

Total voters: 225

[Winner's Reference Link - if available]
[Random celebratory GIF from Discord/Tenor]

View full bracket: [Google Sheets link]

Thanks to everyone who participated! 🖖
```

**Announcement Format (GIF disabled):**
```
🏆 Tournament Complete! 🏆

Winner: (1) Spock
Final Match: Spock (127) vs Picard (98)

View full results: [Google Sheets link]
```

7. vPoll updates Google Sheets metadata (if Config tab has designated cells):
   - Tournament Status: "Completed"
   - Completion Date: Current timestamp
   - Winner: Winner name

**Why This Matters:** Automatic winner announcement provides satisfying conclusion to tournament. Reference link (image/wiki) gives visual celebration of winner.

**Success Criteria:**
- Winner announcement posts within 1 minute of final poll close
- Correct winner identified and all data accurate
- Google Sheets status updated

---

#### Scenario 15: Request Tournament Results (Multiple Formats)

**Actor:** Tournament Master (TM) or Discord User (Voter)
**Goal:** View current tournament progress and results

**Available Commands (all users have access):**

**Command 1: Text Summary**
```
/tournament results
```

**Response (Discord Embed):**
```
📊 Star Trek Character Battle - Results

Status: Round 3 of 6 - In Progress

**Current Round:**
✅ ALPHA Region: 4/4 matches complete
✅ BETA Region: 4/4 matches complete
⏳ GAMMA Region: 2/4 matches complete (2 active polls)
⏳ DELTA Region: 1/4 matches complete (3 active polls)

**Recent Results:**
🏆 (1) Spock def. (9) Worf - 78-45
🏆 (3) Data def. (6) Seven of Nine - 56-52
🏆 (2) Picard def. (7) Janeway - 82-61

🔗 Full Bracket: [Google Sheets link]
📅 Next round starts: [Auto-schedule time or "Manual start required"]
```

**Command 2: Google Sheets Link**
```
/tournament bracket
```

**Response:**
```
📊 View the full tournament bracket:
[Google Sheets URL]

All results update in real-time!
```

**Command 3: Bracket Image/PDF** (Deferred to Future)
```
/tournament bracket-image
```

**Response (MVP):**
```
❌ This feature is not yet available.
View the bracket here: [Google Sheets link]
```

**Why This Matters:**
- Democratic access - all users can check results, not just admins
- Multiple formats serve different needs (quick summary vs full bracket)
- No permission restrictions encourage engagement

**Success Criteria:**
- Commands work for both admins and regular users
- Results are accurate and current
- Links are accessible (public view enabled)

---

#### Scenario 16: Manually Post Winner Announcement

**Actor:** Tournament Master (TM)
**Goal:** Re-post winner announcement or post it manually

**Command:**
```
/tournament winner
```

**Flow:**
1. Admin runs command
2. vPoll checks tournament status:
   - If tournament not complete: Error message "Tournament is still in progress (Round X of 6)"
   - If tournament complete: Proceed to step 3
3. vPoll generates same winner announcement as Scenario 14
4. vPoll posts announcement to channel

**Why This Matters:**
- Useful if automatic announcement was missed or needs to be reposted
- Allows admin to share winner in different channels
- Provides fallback if automatic announcement failed

**Success Criteria:**
- Only works after tournament completion
- Generates identical format to automatic announcement
- Can be run multiple times (idempotent)

---

#### Scenario 17: User Access to Results (Clarification)

**Actor:** Discord User (Voter)
**Goal:** Access tournament information without admin permissions

**Context:** This scenario clarifies that regular users have the SAME access to result commands as admins.

**Commands Available to All Users:**
- `/tournament results` - Text summary (Scenario 15)
- `/tournament bracket` - Google Sheets link (Scenario 15)
- `/tournament bracket-image` - Image/PDF (deferred to future)

**Commands Restricted to Admins Only:**
- `/tournament create` - Create new tournament
- `/tournament start` - Start tournament
- `/tournament next-round` - Manually advance rounds
- `/tournament pause` / `/tournament resume` - Pause/resume
- `/tournament cancel` - Cancel tournament
- `/tournament winner` - Manually post winner announcement
- `/tournament advertise` - Generate advertising post

**Permission Check Implementation:**
- Admin commands check for Discord server permissions (Manage Server or Administrator role)
- Result commands have no permission restrictions

**Why This Matters:**
- Encourages engagement when users can freely check results
- Prevents bottleneck of "ask admin for updates"
- Maintains security by restricting control commands

**Success Criteria:**
- Regular users can run result commands without errors
- Regular users get permission denied errors for admin commands

---

#### Scenario 18: Pause and Resume Tournament

**Actor:** Tournament Master (TM)
**Goal:** Temporarily halt tournament progression without canceling

**Pause Command:**
```
/tournament pause
```

**Flow (Pause):**
1. Admin runs command
2. vPoll updates tournament status to "paused"
3. vPoll posts confirmation:
   ```
   ⏸️ Tournament paused.

   - Active polls will continue and complete normally
   - New rounds will NOT auto-start
   - Use /tournament resume to continue
   ```
4. Effects:
   - Active polls continue running and close normally
   - Results are still processed and written to Google Sheets
   - Auto Round Scheduling is suspended (next round will not auto-launch)
   - Manual `/tournament next-round` commands are blocked

**Resume Command:**
```
/tournament resume
```

**Flow (Resume):**
1. Admin runs command
2. vPoll updates tournament status to "active"
3. vPoll posts confirmation:
   ```
   ▶️ Tournament resumed.

   - Auto-scheduling re-enabled (if configured)
   - Manual round advancement available
   - Tournament will continue from current state
   ```
4. Effects:
   - Auto Round Scheduling re-enabled (if configured)
   - Manual `/tournament next-round` commands work again
   - No automatic catch-up (admin must manually start next round if paused between rounds)

**Why This Matters:**
- Allows admin to handle unexpected issues (server events, holidays, etc.)
- Prevents auto-scheduling from launching rounds at inappropriate times
- Maintains tournament state without losing data

**Success Criteria:**
- Pause prevents new rounds from starting
- Active polls complete normally during pause
- Resume restores normal tournament operation

**Edge Case:** If paused during active polls, those polls complete and results are written, but next round won't auto-start even if auto-scheduling is configured.

---

#### Scenario 19: Cancel Tournament

**Actor:** Tournament Master (TM)
**Goal:** Permanently end tournament and prevent further progression

**Command:**
```
/tournament cancel
```

**Flow:**
1. Admin runs command
2. vPoll asks for confirmation:
   ```
   ⚠️ Are you sure you want to CANCEL this tournament?

   This will:
   - Immediately close all active polls
   - Process current results
   - Mark tournament as canceled
   - Prevent any further rounds

   Data will NOT be deleted - results remain in Google Sheets.

   This action cannot be undone.

   [Confirm] [Cancel]
   ```
3. Admin confirms
4. vPoll executes cancellation:
   - Immediately closes all active polls via Discord API
   - Processes results for any polls that had votes
   - Updates tournament status to "canceled" in database
   - Posts cancellation announcement:
     ```
     🛑 Tournament Canceled

     Star Trek Character Battle has been canceled by admin.

     Results through Round 3 are saved here: [Google Sheets link]

     Tournament cannot be resumed.
     ```
5. vPoll updates Google Sheets metadata:
   - Tournament Status: "Canceled"
   - Cancellation Date: Current timestamp
   - Notes: "Canceled by admin"

**Post-Cancellation State:**
- All tournament commands return error: "No active tournament"
- Tournament data remains in Google Sheets and bot database (read-only)
- Admin can create new tournament with `/tournament create`
- Cannot resume canceled tournament (different from pause)

**Why This Matters:**
- Provides clean exit path for tournaments that need to stop
- Preserves data for reference (doesn't delete anything)
- Clear distinction from pause (cancel is permanent)

**Success Criteria:**
- All active polls closed immediately
- Results saved before cancellation
- Tournament cannot be resumed
- New tournament can be created

**Difference from Pause:**
- **Pause:** Temporary, reversible, can resume
- **Cancel:** Permanent, irreversible, must create new tournament

---

### Advanced Features

#### Scenario 20: Required Voter Role (Config Only - Not Enforced)

**Actor:** Tournament Master (TM)
**Goal:** Configure role requirement for voting

**Config Tab Setting:**
```
Required Voter Role | 123456789012345678
```

**MVP Behavior:**
- Config option exists and can be set
- vPoll reads this value during tournament creation
- **NOT ENFORCED:** vPoll does not restrict poll access based on role
- Anyone in the channel can vote (Discord native poll limitation)

**Why Not Enforced:**
Discord native polls cannot be restricted to specific roles. Enforcement would require:
- Custom voting implementation (reactions, buttons, or forms)
- Vote validation after-the-fact
- Or channel permission management (different approach)

**Deferred to Future:** Full enforcement mechanism in FUTURE.md (requires replacing Discord native polls with custom voting system)

**Documentation Note:** Template and docs will note this is a planned feature for future versions.

**Success Criteria:**
- Config value can be set without errors
- vPoll reads value but does not act on it
- No errors occur if role ID is invalid (ignored for MVP)

---

#### Scenario 21: Match Preview Posts

**Actor:** vPoll (Automated)
**Goal:** Post participant information before polls to help voters

**Config Tab Setting:**
```
Match Preview Posts | true
```

**Flow (when enabled):**
1. Before creating each poll (Scenario 9), vPoll posts preview message
2. Preview message contains:
   - Match information (Round, Region, Match #)
   - Participant 1:
     - Name and seed
     - Notes from Participants tab Column C (if available)
     - Reference Link from Column D (if available)
   - Participant 2:
     - Name and seed
     - Notes from Participants tab Column C (if available)
     - Reference Link from Column D (if available)
3. Example preview:

```
🎯 Upcoming Match - Round 1 - ALPHA Region - Match 1

**(1) Spock (TOS/TAS/Films/SNW)**
Science Officer aboard USS Enterprise. Known for logic and iconic Vulcan salute.
📖 More info: https://memory-alpha.fandom.com/wiki/Spock

    VS

**(16) Nog (DS9)**
First Ferengi in Starfleet. Overcame injury to become a capable officer.
📖 More info: https://memory-alpha.fandom.com/wiki/Nog

Poll starting in 1 minute...
```

4. Wait 60 seconds (to allow preview to be seen)
5. Create Discord poll (Scenario 9)

**Timing with Poll Batches:**
- If batching is enabled, previews are posted for all matches in batch
- 60-second delay occurs after ALL previews posted
- Then all polls for that batch are created

**Why This Matters:**
- Helps voters make informed decisions when unfamiliar with participants
- Leverages Notes and Reference Link columns from Participants tab
- Increases engagement by providing context

**Success Criteria:**
- Preview posts before each poll when enabled
- Notes and Reference Links display correctly
- 60-second delay provides time to read preview

**MVP Limitation:**
- Fixed 60-second delay (not configurable)
- Preview is separate message, not embedded in poll

---

#### Scenario 22: Live Vote Count Updates (Config Only - Not Implemented)

**Actor:** vPoll (Automated)
**Goal:** Post periodic vote count updates during active polls

**Config Tab Setting:**
```
Live Vote Updates | every 6 hours
```

**Options:**
- "never" - No updates (default)
- "halfway through poll" - Post once at 50% of poll duration
- "when 1 hour remains" - Post once 1 hour before close
- "every 6 hours" - Post every 6 hours
- "every 12 hours" - Post every 12 hours

**MVP Behavior:**
- Config option exists and can be set
- vPoll reads this value during tournament creation
- **NOT IMPLEMENTED:** vPoll does not post vote count updates
- Discord polls already show live vote counts natively

**Why Not Implemented for MVP:**
- Discord native polls already show real-time vote counts to all users
- Additional update posts would be redundant
- Adds complexity for minimal value

**Deferred to Future:** Could be valuable if:
- Posting updates to separate announcements channel
- Sending DM notifications to subscribed users
- Providing additional analytics (vote velocity, participation rate, etc.)

**Success Criteria:**
- Config value can be set without errors
- vPoll reads value but does not act on it
- No errors occur (silently ignored for MVP)

---

#### Scenario 23: Google Sheets Validation

**Actor:** vPoll (Automated)
**Goal:** Validate sheet structure and data before creating tournament

**Trigger:** `/tournament create <google-sheets-url>` command (Scenario 7)

**Validation Checks:**

**1. Sheet Access:**
- ✅ vPoll service account can access sheet
- ✅ Service account has Editor permission (not just Viewer)
- ❌ Error: "Cannot access sheet. Please share with: vpoll-sheets-access@vpoll-475821.iam.gserviceaccount.com"

**2. Tab Structure:**
- ✅ Required tabs exist by name: Participants, Config, Regions, Bracket, Results
- ℹ️ Tab order does not matter - vPoll finds tabs by name, not position
- ℹ️ Recommended order: Bracket, Participants, Regions, Config, Results (Bracket first for easy viewer access)
- ❌ Error: "Missing required tab: [tab name]"

**3. Participants Tab Validation:**
- ✅ Exactly 64 rows with participant data (rows 1-64)
- ✅ Column A: Ranks 1-64 (all unique, all present)
- ✅ Column B: All participant names are non-empty and unique
- ❌ Error: "Participants tab has duplicate ranks: 5, 12"
- ❌ Error: "Participants tab missing ranks: 33, 47"
- ❌ Error: "Participant names must be unique. Duplicates found: Spock (rows 3, 18)"
- ❌ Error: "Participant name is empty in row 27"

**4. Config Tab Validation:**
- ✅ All required config values are set (non-empty):
  - Tournament Name
  - Tournament Description
  - Start Date
  - Poll Length
  - Poll Batches
  - Discord Channel ID
  - Auto-advance
  - Tie Breaker Rule
  - Results Visibility
- ✅ Discord Channel ID is valid and bot has access
- ✅ Poll Length is a valid number > 0
- ✅ Poll Batches is a valid option
- ❌ Error: "Missing required config values: Tournament Name, Poll Length"
- ❌ Error: "Discord Channel ID is invalid or bot cannot access channel"
- ❌ Error: "Poll Length must be a positive number (found: 'twenty-four')"
- ❌ Error: "Poll Batches invalid. Must be one of: full round, one per region, two per region, half round, sequential, or a number"

**5. Regions Tab Validation:**
- ✅ All 4 region names are set (columns B-E, row 1)
- ✅ Region names are unique
- ✅ Participant distribution matches Participants tab rankings
- ❌ Error: "Region names must be unique. 'ALPHA' used twice"
- ❌ Error: "Region name missing for column D"

**6. Bracket Tab Validation:**
- ✅ Bracket formulas are present and valid
- ⚠️ Warning: "Bracket tab formulas may be modified from template. Results may not display correctly."

**7. Results Tab Validation:**
- ✅ Header row exists with correct 16 column names
- ✅ Tab is empty (no existing results) OR has valid result data
- ⚠️ Warning: "Results tab contains existing data. This may indicate a previous tournament."

**Validation Response:**

**If all checks pass:**
```
✅ Google Sheets validation passed!

Tournament: Star Trek Character Battle
Participants: 64 across 4 regions
Region names: Federation, Klingon Empire, Romulan Star Empire, Dominion

Configuration:
- Poll Length: 24 hours
- Poll Batches: full round (32 polls at once)
- Auto-advance: Enabled
- Channel: #tournament-voting

Ready to create tournament. Use /tournament start when ready.
```

**If validation fails:**
```
❌ Google Sheets validation failed.

Please fix the following issues:

**Config Tab:**
- Missing required value: Tournament Name
- Discord Channel ID is invalid or bot cannot access channel

**Participants Tab:**
- Duplicate participant names: Spock (rows 3, 18)
- Missing rank: 47

After fixing, run /tournament create again.
```

**Why This Matters:**
- Prevents runtime errors during tournament
- Clear error messages help admins fix issues quickly
- Catches most common setup mistakes early

**Success Criteria:**
- All validation checks run completely
- Error messages are specific and actionable
- Tournament only created if all checks pass

---

#### Scenario 24: Tiebreaker Dice Roll

**Actor:** vPoll (Automated)
**Goal:** Determine winner when poll ends in exact tie

**Trigger:** Poll closes with equal vote counts for both participants (Scenario 12)

**Flow:**
1. vPoll detects tie (e.g., both participants have 42 votes)
2. vPoll generates random dice roll (1-100) for each participant:
   - Participant 1 roll: 67
   - Participant 2 roll: 34
3. Higher roll wins
4. vPoll posts tiebreaker announcement:

```
⚖️ TIE! Dice Roll Tiebreaker

Round 2 - BETA Region - Match 3
(4) Worf vs (5) Seven of Nine

Final votes: 42 - 42

🎲 Dice Roll:
Worf: 67
Seven of Nine: 34

🏆 Winner: (4) Worf (dice roll tiebreaker)
```

5. vPoll updates Google Sheets:
   - Bracket tab: Mark winner (TRUE) and loser (FALSE) as normal
   - Results tab: Write result row with Tiebreaker column = "Worf: 67, Seven: 34"

**Edge Case: Tied Dice Rolls**
If both participants roll same number:
- Re-roll immediately until rolls differ
- Announcement includes re-roll count: "Winner determined after 2 re-rolls"

**Why This Matters:**
- Provides fair, transparent resolution for tied matches
- Dice roll is more exciting than arbitrary tiebreakers (alphabetical, seed, etc.)
- Clear communication ensures community accepts outcome

**Success Criteria:**
- Tiebreaker only triggers on exact vote ties
- Dice rolls are truly random
- Result is clearly communicated and logged
- Re-rolls work correctly for tied dice

**Config Dependency:**
- Config tab "Tie Breaker Rule" must be set to "Dice roll"
- MVP only supports dice roll (future versions may add alternatives)

---

#### Scenario 25: Automatic Round Scheduling

**Actor:** vPoll (Automated)
**Goal:** Automatically start next round after delay without admin intervention

**Config Tab Setting:**
```
Auto Round Scheduling | 3 days
```

**Options:**
- **blank/empty** - Disabled (manual advancement only)
- **"immediate"** - Launch next round immediately after previous completes
- **"X days"** (e.g., "3 days") - Wait X days, then launch next round
- **"X hours"** (e.g., "48 hours") - Wait X hours, then launch next round

**Flow:**
1. Round completes (all polls closed, all results written)
2. vPoll reads Auto Round Scheduling config
3. If setting is blank: Do nothing (admin must use `/tournament next-round`)
4. If setting is "immediate":
   - Launch next round immediately (Scenario 9)
5. If setting has delay (e.g., "3 days"):
   - vPoll schedules next round launch for [current time + delay]
   - Posts announcement in Announcements Channel (or tournament channel if not configured):
     ```
     🎊 Round 2 Complete!

     All matches finished. View results: [Google Sheets link]

     ⏰ Round 3 begins in 3 days (October 28, 3:00 PM UTC)
     ```
   - After delay elapses, launch next round automatically
   - Post round start announcement:
     ```
     🚀 Round 3 Starting Now!

     16 matches across 4 regions
     Polls close in 24 hours

     Vote now! 🗳️
     ```

**Interaction with Manual Advancement:**
- If admin runs `/tournament next-round` while auto-scheduling is counting down:
  - Cancel scheduled auto-launch
  - Process manual command immediately
  - Prevents duplicate round launch

**Interaction with Pause:**
- If tournament is paused (Scenario 18):
  - Auto-scheduling countdown is suspended
  - Countdown resumes when tournament is resumed
  - Example: 3-day delay with 1 day remaining → pause → resume after 5 days → next round launches 1 day after resume

**Why This Matters:**
- Enables completely hands-free tournaments after initial start
- Allows multi-day breaks between rounds for sustained engagement
- Prevents admin bottleneck

**Success Criteria:**
- Next round launches automatically at correct time
- Announcements posted at round completion and round start
- Manual override cancels auto-scheduling correctly
- Pause/resume interaction works correctly

**MVP Note:** Scheduling persistence across bot restarts (if bot goes offline during countdown, schedule is lost and admin must manually start next round)

---

#### Scenario 26: Participant Reference Link Lookup

**Actor:** Discord User (Voter)
**Goal:** View information and reference link for specific participant

**Command:**
```
/participant info <participant-name>
```

**Flow:**
1. User runs command with participant name (fuzzy matching supported)
2. vPoll searches Participants tab for matching name
3. vPoll retrieves participant data:
   - Rank/Seed
   - Full name
   - Notes (Column C)
   - Reference Link (Column D)
4. vPoll checks if Reference Link is a direct image URL (.jpg, .png, .gif, .webp)
5. vPoll posts response with embed

**Response Format (with image link):**
```
🔍 Participant Info

**(1) Spock (TOS/TAS/Films/SNW)**

Science Officer aboard USS Enterprise. Known for logic and iconic Vulcan salute.

📖 Reference: https://memory-alpha.fandom.com/wiki/Spock
🌟 Seed: 1

[Embedded image if reference link is direct image URL]
```

**Response Format (with tournament record - if tournament started):**
```
🔍 Participant Info

**(1) Spock (TOS/TAS/Films/SNW)**

Science Officer aboard USS Enterprise. Known for logic and iconic Vulcan salute.

📖 Reference: https://memory-alpha.fandom.com/wiki/Spock
🌟 Seed: 1
🏆 Tournament Record: 4-0 (45 total votes across 4 matches)
```

**Image Detection:**
- If Reference Link ends with image extension (.jpg, .jpeg, .png, .gif, .webp, .bmp), embed image directly in Discord
- If Reference Link is a webpage URL, show as clickable link only
- If Reference Link is empty, omit reference section

**Fuzzy Matching:**
- Partial name matches work (e.g., "Spock" matches "Spock (TOS/TAS/Films/SNW)")
- Case-insensitive search
- If multiple matches found, show list of options
- If no match found, suggest closest match

**Permission Level:** Available to all users (not admin-only)

**Why This Matters:**
- Helps voters make informed decisions
- Provides context for unfamiliar participants
- Visual aid with embedded images increases engagement
- Accessible during and outside of voting periods

**Success Criteria:**
- Command responds within 2 seconds
- Fuzzy matching finds participants with partial names
- Images display correctly for direct image URLs
- Works in any channel/thread where bot has access

**MVP Status:** ✅ Moved to MVP Scope (user request 2025-10-22)

---

#### Scenario 27: Bracket Image/PDF Generation (Deferred to Future)

**Actor:** Tournament Master (TM) or Discord User (Voter)
**Goal:** Generate shareable bracket visualization as image or PDF

**Intended Command:**
```
/tournament bracket-image
```

**Intended Response:**
```
📊 Tournament Bracket

[Attached: bracket-image.png]
OR
[Attached: bracket.pdf]

Generated: October 25, 2025 3:45 PM
View live bracket: [Google Sheets link]
```

**MVP Status:** ❌ Not Implemented

**Deferred to Future:** Bracket visualization requires:
- Rendering library (e.g., Canvas, Puppeteer for screenshots)
- Bracket layout algorithm
- Image generation and Discord file upload
- Significant development time

**Why Deferred:**
- Google Sheets already provides visual bracket
- Not critical for core tournament functionality
- Can be added later without affecting existing features

**Workaround:**
- Users view bracket in Google Sheets (always up-to-date)
- Admin can manually screenshot and share if needed

**Command Behavior in MVP:**
```
/tournament bracket-image

Response:
❌ This feature is not yet available.
View the bracket here: [Google Sheets link]
```

---

#### Scenario 28: User DM Notifications (Deferred to Future)

**Actor:** Discord User (Voter)
**Goal:** Receive direct message notifications when new polls go live

**Intended Commands:**
```
/tournament subscribe
/tournament unsubscribe
```

**Intended Flow:**
1. User runs `/tournament subscribe`
2. vPoll stores user preference in database
3. When new polls launch, vPoll sends DM to subscribed users:
   ```
   🗳️ New polls are live!

   Star Trek Character Battle - Round 3
   16 matches now open for voting

   Vote here: [Channel link]
   Bracket: [Google Sheets link]
   ```
4. User can unsubscribe anytime with `/tournament unsubscribe`

**MVP Status:** ❌ Not Implemented

**Deferred to Future:** Notification system requires:
- User preference database
- DM sending logic with error handling (user may have DMs disabled)
- Subscription management UI
- Privacy considerations

**Why Deferred:**
- Adds database complexity (user preferences)
- DM failures require error handling (many users disable DMs from bots)
- Not critical for MVP (users can enable channel notifications in Discord)
- Better suited for public bot (multi-tournament support)

**Workaround:**
- Users can enable Discord channel notifications for tournament channel
- Admin can use @role mentions in tournament channel (if desired)

**Future Note:** May require multi-tournament support to be valuable (users subscribe to specific tournaments across multiple servers)

---

#### Scenario 29: Announcements Channel Configuration

**Actor:** Tournament Master (TM)
**Goal:** Post tournament announcements to separate channel from polls

**Config Tab Setting:**
```
Announcements Channel ID | 123456789012345678
```

**Flow:**
1. Admin sets Announcements Channel ID in Config tab (optional)
2. vPoll validates channel exists and bot has access during tournament creation
3. Announcement events are posted to Announcements Channel:
   - Tournament start (Scenario 8)
   - Round completion (Scenario 13)
   - Round start (Scenario 13)
   - Tournament completion (Scenario 14)
   - Tournament pause/resume (Scenario 18)
   - Tournament cancellation (Scenario 19)

4. Poll posts and result updates still go to primary Discord Channel ID

**Example Use Case:**
- Primary Channel: #tournament-voting (polls and results)
- Announcements Channel: #general-announcements (tournament updates)
- Result: Polls don't spam general channel, but updates reach wider audience

**Behavior if Not Configured:**
- If Announcements Channel ID is blank: All announcements post to primary Discord Channel ID
- No separate announcements channel (everything in one place)

**Why This Matters:**
- Allows tournament updates in high-visibility channel (e.g., #announcements)
- Keeps polls contained in dedicated voting channel
- Increases tournament awareness without channel spam

**Success Criteria:**
- Announcements post to correct channel when configured
- Polls always post to primary channel
- Falls back to primary channel if announcements channel not configured
- Validation catches invalid channel IDs during tournament creation

---

#### Scenario 30: Channel/Thread Organization (Admin Pre-creates - MVP)

**Actor:** Tournament Master (TM)
**Goal:** Organize tournament polls across channels and threads

**Intended Config Options:**
```
Thread Organization | one thread per round
```

**Intended Options:**
- **blank** - All polls in primary channel (default)
- **"one thread per round"** - Create thread for each round (e.g., "Round 1 Polls")
- **"one thread per region"** - Create thread for each region (e.g., "ALPHA Region")
- **"one thread per poll"** - Create individual thread for each match

**MVP Status:** ⚠️ Partially Supported

**MVP Behavior:**
- Config option exists and can be set
- **Admin must pre-create threads/channels manually**
- Admin provides thread IDs in Config tab (extended config format)
- vPoll posts polls to specified thread IDs
- vPoll does NOT auto-create threads

**Why Limited in MVP:**
- Thread auto-creation adds complexity
- Thread naming and organization preferences vary
- Admin can achieve same result by pre-creating threads
- Focus MVP on core tournament functionality

**Deferred to Future:**
- Automatic thread creation
- Thread archiving after round completes
- Thread pinning and organization

**Workaround:**
Admin manually creates threads:
1. Create threads in Discord (e.g., "Round 1 Polls", "Round 2 Polls")
2. Copy thread IDs (right-click thread → Copy ID)
3. Add extended config to Config tab:
   ```
   Round 1 Thread ID | 987654321098765432
   Round 2 Thread ID | 987654321098765433
   Round 3 Thread ID | 987654321098765434
   ...
   ```
4. vPoll posts polls to correct thread based on current round

**Success Criteria:**
- vPoll can post to pre-created threads when IDs provided
- Falls back to primary channel if thread ID not configured
- Validation catches invalid thread IDs

---

## Technical Architecture

### Technology Stack

**Core Technologies:**
- **Discord.js v14** - Discord bot framework and API client
- **Google Sheets API v4** - Tournament data management
- **Node.js** - Runtime environment
- **TypeScript** - Type-safe development

**Key Libraries:**
- `discord.js` - Discord bot functionality
- `@discordjs/rest` - Discord API interactions
- `googleapis` - Google Sheets integration
- `dotenv` - Environment configuration

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Discord Platform                        │
│  - Native Polls (voting)                                    │
│  - Slash Commands (admin controls)                          │
│  - Event Webhooks (poll close events)                       │
└───────────────┬─────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────┐
│                       vPoll Bot                              │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Command    │  │    Event     │  │   Services   │      │
│  │   Handlers   │  │   Handlers   │  │              │      │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤      │
│  │ /tournament  │  │ - ready      │  │ - Sheets     │      │
│  │   create     │  │ - poll close │  │ - Tournament │      │
│  │ /tournament  │  │ - interaction│  │ - Poll       │      │
│  │   start      │  │              │  │ - Validation │      │
│  │ ...          │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Tournament State (In-Memory)              │  │
│  │  - Active tournament data                            │  │
│  │  - Poll tracking                                     │  │
│  │  - Scheduled tasks                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────┬─────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Google Sheets API                         │
│  - Read tournament configuration                            │
│  - Read participants and bracket                            │
│  - Write results and bracket updates                        │
└─────────────────────────────────────────────────────────────┘
```

### Data Models

#### Tournament State (In-Memory)

```typescript
interface TournamentState {
  id: string;                      // Unique tournament ID
  guildId: string;                 // Discord server ID
  sheetId: string;                 // Google Sheets ID
  config: TournamentConfig;        // From Config tab
  status: 'created' | 'active' | 'paused' | 'completed' | 'canceled';
  currentRound: number;            // 1-6
  regions: Region[];               // 4 regions with names and participants
  activePolls: ActivePoll[];       // Currently running polls
  scheduledTasks: ScheduledTask[]; // Auto-scheduling tasks
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

interface TournamentConfig {
  tournamentName: string;
  description: string;
  startDate: string;
  pollLengthHours: number;
  pollBatches: string;             // "full round", "one per region", etc.
  channelId: string;               // Primary poll channel
  autoAdvance: boolean;
  tieBreakerRule: string;          // "Dice roll"
  resultsVisibility: string;
  requiredVoterRole?: string;      // Optional, not enforced in MVP
  matchPreviewPosts: boolean;
  liveVoteUpdates: string;         // Not enforced in MVP
  autoRoundScheduling?: string;    // e.g., "3 days", "immediate"
  advertisingTemplate?: string;
  announcementsChannelId?: string;
  celebratoryGif: boolean;
}

interface Region {
  name: string;                    // e.g., "ALPHA"
  participants: Participant[];     // 16 participants
}

interface Participant {
  rank: number;                    // 1-64
  name: string;
  notes?: string;                  // Column C
  referenceLink?: string;          // Column D
}

interface ActivePoll {
  pollId: string;                  // Discord poll ID
  matchId: string;                 // e.g., "R1-ALPHA-M1"
  round: number;
  region: string;
  participant1: MatchParticipant;
  participant2: MatchParticipant;
  startTime: Date;
  endTime: Date;
  status: 'active' | 'closed' | 'processed';
}

interface MatchParticipant {
  name: string;
  seed: number;
}

interface ScheduledTask {
  taskId: string;
  type: 'round-start' | 'announcement';
  scheduledTime: Date;
  round?: number;
  data?: any;
}
```

### Google Sheets Integration

#### Service Account Authentication

```typescript
// Service Account Details
const SERVICE_ACCOUNT_EMAIL = 'vpoll-sheets-access@vpoll-475821.iam.gserviceaccount.com';
const KEY_FILE_PATH = './keys/vpoll-key.json';
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Authentication
const auth = new google.auth.GoogleAuth({
  keyFile: KEY_FILE_PATH,
  scopes: SCOPES,
});
const sheets = google.sheets({ version: 'v4', auth });
```

#### Read Operations

```typescript
// Read Participants Tab (A1:D65)
async function readParticipants(spreadsheetId: string): Promise<Participant[]> {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Participants!A1:D65',
  });

  // Parse rows into Participant objects
  // Validate ranks 1-64, unique names, etc.
  return parseParticipants(response.data.values);
}

// Read Config Tab (A:B)
async function readConfig(spreadsheetId: string): Promise<TournamentConfig> {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Config!A:B',
  });

  // Parse key-value pairs into TournamentConfig
  return parseConfig(response.data.values);
}

// Read Regions Tab (A1:E17)
async function readRegions(spreadsheetId: string): Promise<Region[]> {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Regions!A1:E17',
  });

  // Parse region names and participant distribution
  return parseRegions(response.data.values);
}
```

#### Write Operations

```typescript
// Update Bracket Tab (write TRUE/FALSE for winner/loser)
async function updateBracket(
  spreadsheetId: string,
  winnerCell: string,
  loserCell: string
): Promise<void> {
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'RAW',
      data: [
        { range: `Bracket!${winnerCell}`, values: [['TRUE']] },
        { range: `Bracket!${loserCell}`, values: [['FALSE']] },
      ],
    },
  });
}

// Append result row to Results Tab
async function writeResult(
  spreadsheetId: string,
  result: MatchResult
): Promise<void> {
  const row = [
    result.matchId,
    result.round,
    result.region,
    result.participant1Name,
    result.participant1Seed,
    result.participant1Votes,
    result.participant2Name,
    result.participant2Seed,
    result.participant2Votes,
    result.winner,
    result.pollId,
    result.pollStartTime.toISOString(),
    result.pollEndTime.toISOString(),
    result.totalVotes,
    result.tiebreaker || '',
    result.notes || '',
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Results!A:P',
    valueInputOption: 'RAW',
    requestBody: {
      values: [row],
    },
  });
}
```

### Discord Integration

#### Command Registration

```typescript
// Command structure (src/commands/tournament.ts)
export const data = new SlashCommandBuilder()
  .setName('tournament')
  .setDescription('Manage tournament voting competitions')
  .addSubcommand(subcommand =>
    subcommand
      .setName('create')
      .setDescription('Create tournament from Google Sheets')
      .addStringOption(option =>
        option
          .setName('sheet-url')
          .setDescription('Google Sheets URL')
          .setRequired(true)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('start')
      .setDescription('Start the tournament')
  )
  // ... additional subcommands
```

#### Poll Creation

```typescript
// Create Discord native poll
async function createPoll(
  channel: TextChannel,
  match: Match,
  durationHours: number
): Promise<Message> {
  const poll = {
    question: {
      text: `${match.round} - ${match.region} - Match ${match.number}`
    },
    answers: [
      { poll_media: { text: `(${match.participant1.seed}) ${match.participant1.name}` } },
      { poll_media: { text: `(${match.participant2.seed}) ${match.participant2.name}` } }
    ],
    duration: durationHours,
    allow_multiselect: false,
  };

  const message = await channel.send({ poll });
  return message;
}
```

#### Poll Event Handling

```typescript
// Listen for poll close events
client.on('messagePollVoteAdd', async (pollAnswer, userId) => {
  // Poll vote added (not used in MVP - Discord handles counting)
});

client.on('messagePollVoteRemove', async (pollAnswer, userId) => {
  // Poll vote removed (not used in MVP)
});

// Primary method: Check poll status periodically
setInterval(async () => {
  const activePolls = getActivePolls();

  for (const poll of activePolls) {
    const message = await channel.messages.fetch(poll.messageId);

    if (message.poll?.resultsFinalized) {
      // Poll has closed - process results
      await processPollResults(message.poll, poll);
    }
  }
}, 10 * 60 * 1000); // Check every 10 minutes
```

### Error Handling & Resilience

#### Google Sheets API Errors

```typescript
async function safeSheetUpdate(
  updateFn: () => Promise<void>,
  retries: number = 3
): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      await updateFn();
      return; // Success
    } catch (error) {
      if (i === retries - 1) {
        // Final retry failed - log and alert admin
        logger.error('Sheet update failed after retries', error);
        await notifyAdmin('Failed to update Google Sheets - manual intervention required');
        throw error;
      }

      // Exponential backoff
      await sleep(Math.pow(2, i) * 1000);
    }
  }
}
```

#### Discord API Rate Limits

```typescript
// Discord.js handles rate limiting automatically
// But we should batch operations when possible

async function createPollBatch(matches: Match[]): Promise<void> {
  // Create polls with small delays to avoid rate limits
  for (const match of matches) {
    await createPoll(channel, match, config.pollLengthHours);
    await sleep(1000); // 1 second delay between polls
  }
}
```

#### Permission Errors

```typescript
async function validatePermissions(
  guild: Guild,
  channelId: string
): Promise<{ valid: boolean; missing: string[] }> {
  const channel = await guild.channels.fetch(channelId);
  if (!channel) {
    return { valid: false, missing: ['Channel not found'] };
  }

  const permissions = channel.permissionsFor(client.user!);
  const required = [
    'SendMessages',
    'EmbedLinks',
    'CreatePublicThreads',
    'ManageMessages',
    'ReadMessageHistory',
    'AttachFiles',
  ];

  const missing = required.filter(perm => !permissions?.has(perm as PermissionFlagsBits));

  return { valid: missing.length === 0, missing };
}
```

### Development Setup

#### Environment Variables

```bash
# .env file
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_id_here
GUILD_ID=your_test_server_id_here  # Optional - for faster command deployment
```

#### Project Structure

```
vpoll/
├── src/
│   ├── commands/           # Slash command definitions
│   │   ├── ping.ts         # Example: simple ping command
│   │   ├── poll.ts         # Example: poll command
│   │   └── tournament.ts   # Main tournament command
│   ├── events/             # Discord event handlers
│   │   ├── ready.ts        # Bot ready event
│   │   └── interactionCreate.ts  # Command handler
│   ├── services/           # Business logic
│   │   ├── sheets.ts       # Google Sheets integration
│   │   ├── tournament.ts   # Tournament management
│   │   ├── poll.ts         # Poll creation and tracking
│   │   └── validation.ts   # Sheet validation
│   ├── utils/              # Helper functions
│   │   ├── logger.ts       # Logging utility
│   │   └── scheduler.ts    # Task scheduling
│   ├── config.ts           # Environment config loading
│   ├── index.ts            # Main bot entry point
│   └── deploy-commands.ts  # Command deployment script
├── keys/
│   └── vpoll-key.json      # Google service account key (not committed)
├── .env                    # Environment variables (not committed)
├── .env.example            # Example environment file
├── package.json
├── tsconfig.json
└── README.md
```

#### Build and Deployment

```bash
# Development workflow
npm install                 # Install dependencies
npm run build               # Compile TypeScript → JavaScript
npm run deploy-commands     # Deploy commands to Discord
npm run dev                 # Run with hot reload

# Production workflow
npm run build
npm start                   # Run compiled JavaScript

# Testing
npm run test-sheets         # Test Google Sheets connection
npm run lint                # Check code style
npm run format              # Format code with Prettier
```

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

### Tab 2: Participants

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

### Tab 3: Regions

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

### Tab 4: Config

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
| Required Voter Role | String | ⚠️ Optional | Discord role ID | - | Role required to vote (not enforced in MVP) |
| Match Preview Posts | Boolean | ⚠️ Optional | true, false | false | Post participant info before polls |
| Live Vote Updates | String | ⚠️ Optional | See options below | "never" | Frequency of vote count updates (not enforced in MVP) |
| Auto Round Scheduling | String | ⚠️ Optional | "immediate", "X days", "X hours", blank | blank | Delay before auto-starting next round |
| Advertising Template | String | ⚠️ Optional | Template with placeholders | - | Format for promotion posts |
| Announcements Channel ID | String | ⚠️ Optional | Valid Discord channel ID | - | Separate channel for announcements |
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

**Live Vote Updates Valid Values:**
- `"never"` - No updates (default)
- `"halfway through poll"` - Post once at 50% duration
- `"when 1 hour remains"` - Post once 1 hour before close
- `"every 6 hours"` - Post every 6 hours
- `"every 12 hours"` - Post every 12 hours

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

### Tab 5: Results

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

---

## Dependencies & Risks

### External Dependencies

#### Discord Platform

**Dependency:** Discord API and native poll feature
**Risk Level:** 🔴 High
**Impact:** Core functionality depends on Discord

**Specific Risks:**
- Discord may deprecate native polls or change API
- Discord API downtime prevents bot operation
- Rate limits may restrict poll creation for large tournaments

**Mitigation:**
- Monitor Discord API changelog for deprecation notices
- Implement graceful degradation if polls unavailable
- Add retry logic and rate limit handling
- Consider alternative voting mechanisms (buttons, reactions) as fallback

#### Google Sheets API

**Dependency:** Google Sheets API v4 for data storage
**Risk Level:** 🟡 Medium
**Impact:** Tournament data and bracket display

**Specific Risks:**
- API quota limits (10,000 requests/day per project)
- Google Sheets API downtime or degraded performance
- Service account authentication issues
- Quota insufficient for multiple concurrent tournaments

**Mitigation:**
- Implement request caching to reduce API calls
- Batch read/write operations when possible
- Monitor quota usage and alert if approaching limit
- Implement exponential backoff retry logic
- Cache tournament config in memory after initial load

**Quota Analysis (MVP - Single Tournament):**
- Tournament creation: ~10 reads (config, participants, regions)
- Per match result: ~2 writes (bracket update + results append)
- Total per 64-match tournament: ~138 requests
- Daily quota supports ~70 tournaments/day (far exceeds MVP needs)

#### Service Account Permissions

**Dependency:** Users must grant Editor access to service account
**Risk Level:** 🟡 Medium
**Impact:** Cannot read/write tournament data without permission

**Specific Risks:**
- Users forget to share sheet with service account (most common error)
- Users grant Viewer instead of Editor (cannot write results)
- Users revoke access mid-tournament
- Service account email may change (requires user updates)

**Mitigation:**
- Clear setup instructions with screenshots
- Validation during `/tournament create` checks permissions
- Friendly error messages: "Cannot access sheet - check sharing settings"
- Consider creating user-facing alias email (e.g., vpoll@domain.com → service account)

### Technical Risks

#### Bot Uptime & Reliability

**Risk:** Bot downtime causes missed poll close events
**Risk Level:** 🟡 Medium
**Impact:** Results not processed, tournaments stall

**Mitigation:**
- Primary: Poll close event listeners
- Fallback: 10-minute polling to check active polls
- Persistence: Store tournament state to survive restarts
- Monitoring: Alerts for bot downtime

#### Auto-Scheduling Persistence

**Risk:** Scheduled round starts lost if bot restarts
**Risk Level:** 🟢 Low (MVP), 🟡 Medium (Production)
**Impact:** Admin must manually start next round

**Mitigation (MVP):**
- Accept risk: Document that auto-scheduling doesn't survive restarts
- Admin can manually run `/tournament next-round` if needed

**Mitigation (Future):**
- Persist scheduled tasks in database
- Restore schedules on bot startup
- Consider external scheduler (cron, cloud scheduler)

#### Discord Permission Changes

**Risk:** Server admin changes bot permissions mid-tournament
**Risk Level:** 🟢 Low
**Impact:** Bot cannot post polls or updates

**Mitigation:**
- Validate permissions during tournament creation
- Graceful error handling if permissions removed
- Post error message to channel (if SendMessages still available)
- Log errors for admin review

#### Google Sheets Formula Breakage

**Risk:** User modifies bracket formulas, breaking display
**Risk Level:** 🟡 Medium
**Impact:** Bracket doesn't update correctly, vote counts missing

**Mitigation:**
- Provide locked template with protected formula cells
- Validation warning if formulas differ from template
- Documentation: "Do not modify Bracket tab formulas"
- Results tab remains source of truth (readable without formulas)

### User Experience Risks

#### Setup Complexity

**Risk:** Users struggle with Google Sheets setup (64 participants, config, sharing)
**Risk Level:** 🟡 Medium
**Impact:** High abandonment rate, low adoption

**Mitigation:**
- Detailed setup guide with screenshots
- Video tutorial for first-time setup
- Pre-filled example template users can copy
- Validation provides specific, actionable error messages
- Consider future: Simplified setup with fewer required fields

#### Role Restriction Expectations

**Risk:** Users expect Required Voter Role to be enforced (config exists but not enforced)
**Risk Level:** 🟡 Medium
**Impact:** User disappointment, tournaments with unwanted voters

**Mitigation:**
- Clear documentation: "This feature is planned for future versions"
- Config tab includes note: "Not enforced in current version"
- Error message if users ask why role isn't enforced
- Alternative: Use Discord channel permissions to restrict access

### Scaling Risks (Future - Public Bot)

#### Multi-Server State Management

**Risk:** Private bot architecture won't scale to public deployment
**Risk Level:** 🔴 High (if public bot pursued)
**Impact:** Complete refactor required

**Mitigation:**
- Document private bot limitations clearly
- Design tournament state with server ID included
- Plan database migration path (in-memory → persistent)
- See FUTURE.md for public bot architecture planning

#### Google Sheets Quota at Scale

**Risk:** API quota insufficient for multiple servers running tournaments
**Risk Level:** 🔴 High (if public bot pursued)
**Impact:** Rate limit errors, tournaments fail

**Mitigation (Future):**
- Migrate to database for tournament state (sheets for user display only)
- Request quota increase from Google
- Implement caching layer
- Consider alternative: User-provided Google Cloud projects

### Security & Privacy Risks

#### Service Account Key Exposure

**Risk:** Service account key file leaked (vpoll-key.json)
**Risk Level:** 🔴 High
**Impact:** Unauthorized access to all shared Google Sheets

**Mitigation:**
- **NEVER commit keys/vpoll-key.json to git** (in .gitignore)
- Store key securely (environment variables, secret manager)
- Rotate service account key periodically
- Monitor service account activity for unauthorized access
- Use minimal scope: only Sheets API access

#### User Data Privacy

**Risk:** Poll results and participant data visible to anyone with sheet link
**Risk Level:** 🟢 Low
**Impact:** Privacy concern for sensitive tournaments

**Mitigation:**
- Document that sheet data is public (by design for transparency)
- Advise users not to use sensitive/personal data in participant names
- Users control sheet sharing settings (can restrict to specific users if desired)

#### Discord Token Exposure

**Risk:** Bot token leaked (DISCORD_TOKEN in .env)
**Risk Level:** 🔴 High
**Impact:** Unauthorized control of bot, spam, server access

**Mitigation:**
- **NEVER commit .env file to git** (in .gitignore)
- Provide .env.example with placeholder values
- Store token securely (environment variables, secret manager)
- Regenerate token immediately if exposure suspected
- Enable Discord's "Require OAuth2 Code Grant" for additional security

---

## Decision Log

This section tracks key decisions, trade-offs, and resolved conflicts. All decisions are final unless explicitly revisited.

---

### Decision 1: Results Sharing Commands Structure (2025-10-22)

**Status:** ✅ Resolved
**Related Scenarios:** 15, 16, 17

**Context:**
Original requirements had overlapping scenarios for sharing results:
- Scenario 14: Admin shares results
- Scenario 16: Users request results
- Scenario 26: Bracket image/PDF generation

**Decision:**
Consolidate into **three distinct commands** with different purposes:

1. **`/tournament results`** - Text summary embed (all users)
2. **`/tournament bracket`** - Google Sheets link (all users)
3. **`/tournament bracket-image`** - Image/PDF visualization (deferred to future)

**Rationale:**
- Clear separation of format (text vs link vs image)
- All users have democratic access to results (not just admins)
- Each command serves different use case:
  - `results` - Quick status check without leaving Discord
  - `bracket` - Full bracket detail with formulas and history
  - `bracket-image` - Shareable format outside Discord (future)

**Implementation:**
- Scenarios 15 and 17 merged into combined results access scenario
- Scenario 16 (manual winner announcement) renumbered and clarified as distinct feature
- Scenario 27 (bracket image) deferred to FUTURE.md

---

### Decision 2: Channel Configuration Hierarchy (2025-10-22)

**Status:** ✅ Resolved
**Related Scenarios:** 2, 29, 30

**Context:**
Multiple config options affected where posts appear:
- Discord Channel ID (Scenario 2)
- Announcements Channel ID (Scenario 29)
- Thread Organization (Scenario 30)

**Decision:**
Define clear **channel precedence hierarchy**:

1. **Primary Poll Channel** (Discord Channel ID) - Where all polls and poll results post
2. **Announcements Channel** (Announcements Channel ID) - Where tournament updates post (optional, falls back to primary if not set)
3. **Thread Organization** - Threads are WITHIN primary channel (admin pre-creates for MVP)

**Rationale:**
- Prevents ambiguity about where content posts
- Allows separation of high-engagement (polls) and announcements
- Thread organization enhances primary channel without changing announcement behavior

**Configuration Rules:**
- Discord Channel ID is REQUIRED (tournament cannot run without it)
- Announcements Channel ID is OPTIONAL (defaults to primary channel if blank)
- Thread IDs are OPTIONAL (posts to primary channel if not configured)
- If thread ID provided, polls post to thread within primary channel

**Example Configurations:**

*Simple (everything in one channel):*
```
Discord Channel ID: #tournament-voting
Announcements Channel ID: [blank]
Thread IDs: [blank]
→ Polls, results, and announcements all post to #tournament-voting
```

*Separated announcements:*
```
Discord Channel ID: #tournament-voting
Announcements Channel ID: #general-announcements
Thread IDs: [blank]
→ Polls and results in #tournament-voting
→ Tournament updates in #general-announcements
```

*Thread organization:*
```
Discord Channel ID: #tournament-voting
Round 1 Thread ID: [thread within #tournament-voting]
Round 2 Thread ID: [thread within #tournament-voting]
→ Polls post to round-specific threads within #tournament-voting
→ Announcements still post to #general-announcements (if configured)
```

---

### Decision 3: Round Advancement Behavior (2025-10-22)

**Status:** ✅ Resolved
**Related Scenarios:** 8, 13, 25

**Context:**
Conflicting scenarios about manual vs automatic round advancement

**Decision:**
Define clear **round advancement rules**:

1. **Round 1:** ALWAYS manual (requires `/tournament start` command)
2. **Rounds 2-6:** Automatic if Auto Round Scheduling configured, otherwise manual
3. **Manual override:** Admin can use `/tournament next-round` anytime (cancels pending auto-schedule)
4. **Pause interaction:** Auto-scheduling countdown pauses when tournament paused

**Rationale:**
- First round is intentional act (prevents accidental tournament start)
- Auto-scheduling enables hands-free tournaments for rounds 2+
- Manual override provides admin control when needed
- Clear interaction rules prevent race conditions

**Configuration:**
```
Auto Round Scheduling | [blank/empty]
→ Manual advancement only (admin runs /tournament next-round)

Auto Round Scheduling | immediate
→ Next round launches immediately when previous completes

Auto Round Scheduling | 3 days
→ Next round launches 3 days after previous completes
```

**Round Completion Safeguards:**
- Round is "complete" only when:
  - ✅ All polls closed
  - ✅ All results written to Google Sheets
  - ✅ No pending result processing
- Prevents race conditions where next round starts before previous finishes
- Manual `/tournament next-round` blocked until previous round complete

---

### Decision 4: Required Voter Role Implementation (2025-10-22)

**Status:** ⚠️ Partially Resolved (Config Only - Not Enforced)
**Related Scenarios:** 20

**Context:**
Discord native polls cannot restrict voting to specific roles (API limitation)

**Decision:**
**MVP:** Config option exists but is NOT enforced
- Users can set "Required Voter Role" in Config tab
- vPoll reads value but takes no action
- Anyone in channel can vote (Discord native poll behavior)

**Future Options for Full Enforcement:**
1. **Channel Permissions Approach:** Restrict entire channel to specific role (different from per-poll restriction)
2. **Custom Voting Approach:** Replace Discord native polls with button/reaction voting, validate roles
3. **Post-Vote Validation:** Check voter roles after poll closes, invalidate unauthorized votes (complex, poor UX)

**Rationale:**
- Enforcing role restrictions requires replacing Discord native polls (major scope increase)
- MVP prioritizes core tournament flow over access control
- Channel permissions provide workaround for most use cases
- Clear documentation prevents user confusion

**Documentation Requirements:**
- Config tab note: "Not enforced in current version - planned for future"
- Setup guide: "To restrict voting, use Discord channel permissions"
- FAQ: Explain limitation and workarounds

**Future Decision Point:**
If user demand is high, evaluate custom voting implementation (see FUTURE.md)

---

### Decision 5: Tournament End Update Flow (2025-10-22)

**Status:** ✅ Resolved
**Related Scenarios:** 12, 14, 16

**Context:**
Ambiguity about what updates occur at tournament end vs. ongoing updates

**Decision:**
Define clear **tournament completion sequence**:

1. **Ongoing (Scenario 12):** Every poll result triggers:
   - Bracket tab update (TRUE/FALSE)
   - Results tab append (new row)
   - Discord confirmation message

2. **Final Poll Closes (Scenario 14):** Championship match triggers:
   - Standard result processing (same as #1)
   - Tournament status update to "completed"
   - Winner announcement post (automatic)
   - Optional: Celebratory GIF (if configured)
   - Optional: Google Sheets metadata update (completion timestamp, winner)

3. **Manual Winner Post (Scenario 16):** Admin can run `/tournament winner` anytime after completion:
   - Re-posts winner announcement
   - Identical format to automatic announcement
   - Useful if automatic announcement missed or needs sharing to other channels

**Rationale:**
- Continuous updates (12) provide real-time bracket progression
- Final completion (14) is celebratory event with special announcement
- Manual winner post (16) is utility for re-sharing, not part of core flow
- Clear distinction prevents redundant updates

**Implementation Notes:**
- Tournament status field added to state: "created" | "active" | "paused" | "completed" | "canceled"
- Winner announcement only triggers once (on status transition to "completed")
- Manual winner post checks status (must be "completed")

---

### Decision 6: Advertising vs Announcements Distinction (2025-10-22)

**Status:** ✅ Resolved
**Related Scenarios:** 10, 29

**Context:**
Confusion between "advertising" posts (Scenario 10) and announcements channel (Scenario 29)

**Decision:**
Define clear **distinction**:

**Advertising (Scenario 10):**
- **Purpose:** Promote tournament to recruit participants BEFORE/AT start
- **Trigger:** Manual command `/tournament advertise`
- **Content:** Tournament overview, participation details, bracket link, voting channel link
- **Delivery:** Ephemeral response (only admin sees) - admin copies/pastes where desired
- **Use Case:** Post in multiple channels/servers to recruit voters

**Announcements (Scenario 29):**
- **Purpose:** Update tournament status DURING tournament
- **Trigger:** Automatic (tournament start, round completion, round start, winner)
- **Content:** Tournament progress updates, round status, results
- **Delivery:** Posted to Announcements Channel ID (or primary channel if not configured)
- **Use Case:** Keep community informed of progress in announcement channel

**Rationale:**
- Advertising is one-time recruitment (manual, pre-tournament)
- Announcements are ongoing updates (automatic, during tournament)
- Different purposes, different triggers, different delivery methods

**Example Flow:**
1. Admin creates tournament
2. Admin runs `/tournament advertise` → Copies generated message
3. Admin pastes advertising message to #general, #off-topic, other servers, etc.
4. Tournament starts → Automatic announcement posts to Announcements Channel
5. Rounds progress → Automatic announcements continue
6. Tournament completes → Final winner announcement posts

---

### Decision 7: Sheet Link Terminology (2025-10-22)

**Status:** ✅ Resolved
**Related Scenarios:** 17

**Context:**
Original Scenario 17 said "users can ask for template link" - ambiguous (master template vs tournament sheet)

**Decision:**
**Rename and clarify:**
- Command: `/tournament bracket` (not "template")
- Returns: Google Sheets URL for CURRENT TOURNAMENT's sheet (not master template)
- Purpose: Access live bracket with results

**Rationale:**
- "Template" implies master blank template (confusing)
- "Bracket" clearly means current tournament's bracket
- Consistent with other commands (`/tournament results`, `/tournament bracket-image`)

**Implementation:**
- Merged into Scenario 15 (results commands)
- Removed separate scenario 17
- Updated command naming throughout

---

### Decision 8: Match Preview Post Timing (2025-10-22)

**Status:** ✅ Resolved
**Related Scenarios:** 21

**Context:**
Original scenario said "before each poll" but didn't specify timing

**Decision:**
**Fixed timing for MVP:**
- Preview posts 60 seconds before poll creation
- For poll batches: All previews post → 60 second wait → All polls post
- Not configurable in MVP

**Rationale:**
- 60 seconds provides time to read without excessive delay
- Fixed timing simplifies implementation
- Batched behavior prevents long delays between polls in same batch

**Future Enhancement:**
Could add configurable delay in Config tab (e.g., "Match Preview Delay | 120")

**Implementation:**
```
For each match in batch:
  1. Post preview message

Wait 60 seconds

For each match in batch:
  2. Create poll
```

---

### Decision 9: MVP Multi-Tournament Support (2025-10-22)

**Status:** ✅ Resolved
**Related Scenarios:** 27, 28

**Context:**
User notifications (Scenario 28) implied multiple concurrent tournaments

**Decision:**
**MVP assumes single tournament per server:**
- Only one active tournament at a time per Discord server
- Users cannot "subscribe to tournaments" (plural) - subscription meaningless
- DM notifications deferred to future (see FUTURE.md)

**Rationale:**
- Private bot targets single server with single tournament use case
- Multi-tournament support requires database, complex state management
- Simplifies MVP architecture significantly
- Can add later without breaking existing functionality

**MVP Behavior:**
- `/tournament create` fails if tournament already active: "Tournament already in progress. Cancel or complete current tournament first."
- After tournament completes/cancels, admin can create new tournament

**Future (Public Bot):**
- Multi-tournament support per server
- Cross-server tournament tracking
- User notification subscriptions make sense with multiple tournaments
- See FUTURE.md for architecture planning

---

### Decision 10: Config Tab Organization (2025-10-22)

**Status:** ✅ Resolved
**Related Scenarios:** 2, 20-22, 25, 29-30

**Context:**
13+ config settings made Config tab complex and hard to validate

**Decision:**
**Organize config into logical groups:**

**Required Settings (8):**
- Tournament Name
- Tournament Description
- Start Date
- Poll Length
- Poll Batches
- Discord Channel ID
- Auto-advance
- Tie Breaker Rule

**Optional Settings (8):**
- Results Visibility
- Required Voter Role (not enforced MVP)
- Match Preview Posts
- Live Vote Updates (not enforced MVP)
- Auto Round Scheduling
- Advertising Template
- Announcements Channel ID
- Celebratory GIF

**Validation Behavior:**
- Required settings: Must be non-empty and valid
- Optional settings: Can be blank (uses default behavior)
- Invalid optional settings: Warning (not error) - uses default

**Rationale:**
- Clear distinction between must-have and nice-to-have
- Reduces setup friction (only 8 required vs 16 total)
- Optional settings have sensible defaults
- Validation focuses on critical errors first

**Template Presentation:**
Config tab includes section headers (visual grouping):
```
--- REQUIRED TOURNAMENT SETTINGS ---
Tournament Name |
Tournament Description |
...

--- POLL CONFIGURATION ---
Poll Length | 24
Poll Batches | full round
...

--- OPTIONAL FEATURES ---
Match Preview Posts | false
Auto Round Scheduling |
...
```

---

### Decisions Summary

| # | Topic | Status | Impact |
|---|-------|--------|--------|
| 1 | Results Sharing Commands | ✅ Resolved | Scenarios 15, 16, 17 consolidated |
| 2 | Channel Configuration Hierarchy | ✅ Resolved | Clear precedence: primary → announcements → threads |
| 3 | Round Advancement Behavior | ✅ Resolved | Round 1 manual, rounds 2+ auto if configured |
| 4 | Required Voter Role | ⚠️ Config Only | Not enforced in MVP (Discord API limitation) |
| 5 | Tournament End Update Flow | ✅ Resolved | Continuous updates + final celebration |
| 6 | Advertising vs Announcements | ✅ Resolved | Advertising = recruitment, Announcements = updates |
| 7 | Sheet Link Terminology | ✅ Resolved | "Bracket" not "template" |
| 8 | Match Preview Timing | ✅ Resolved | Fixed 60-second delay |
| 9 | MVP Multi-Tournament Support | ✅ Resolved | Single tournament per server (MVP) |
| 10 | Config Tab Organization | ✅ Resolved | 8 required + 8 optional settings |

---

## Document Change History

| Date | Author | Changes |
|------|--------|---------|
| 2025-10-22 | Product Team | Complete restructure following modern PRD best practices. Added Problem Statement, Success Metrics, Solution Overview, Scope, Trade-offs, Technical Architecture, Decision Log. Consolidated scenarios, resolved conflicts, clarified MVP vs Future. |
| 2025-10-21 | Product Team | Original requirements document created with 30 user scenarios and conflict analysis. |

---

## Appendix: Modern PRD References

This document structure follows best practices from:

1. **Marty Cagan (Silicon Valley Product Group)**
   - "Revisiting the Product Spec" (2024)
   - Emphasis on discovery over documentation
   - High-fidelity prototypes as specs
   - Living documents

2. **Modern PRD Templates (2024-2025)**
   - Shorter, more insightful documents
   - Evidence-based problem statements
   - Outcome-focused (why over what)
   - Narrative strength for stakeholder alignment

3. **Product School / Product Compass**
   - Success metrics definition
   - User evidence integration
   - Clear scope and non-goals
   - Decision logs for transparency

**Key Adaptations for vPoll:**
- Combined structure keeps all requirements accessible in one place
- Technical architecture section reflects Discord bot specifics
- Google Sheets template specification documents data contract
- Decision log tracks resolved conflicts and trade-offs
- MVP scope clearly separated from future enhancements (see FUTURE.md)

