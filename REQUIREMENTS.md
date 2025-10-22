# vPoll Requirements

This file contains all requirements for the vPoll Discord bot project.
Last updated: 2025-10-21

## Bot Name
Bot name: "vPoll" 

## Use Case
On a Discord server, run tournaments such as "Which Star Trek Character is the best" or "Top Pizza Toppings".
These tournaments are tracked in a Google Sheet and matches are determined by Discord polls.

Example Google Sheet: https://docs.google.com/spreadsheets/d/1Z83Lr02EW9wvpH3YfBvLwafHMIqyxJLXaO_0D85bMfk/edit?usp=sharing

## Core Functionality

### Tournament Creation
- Bot must support command to initiate a tournament from a Google Sheet:
  ```
  /tournament create <Google Sheet link>
  ```

### Poll Creation
- Bot must create polls for tournament matches in Discord using native Discord polls
- Discord Poll Documentation: https://discord.com/developers/docs/resources/poll
- Command to create polls for specific matches:
  ```
  /tournament create poll region 1 round 1
  ```

### Poll Tracking & Updates
- Bot must track poll results from Discord
- Bot must update the Google Sheet to advance the tournament based on poll results

## Tournament Structure

### Overview
- All tournaments have exactly 64 entities (participants/competitors)
- Participants are matched against each other in bracket-style tournament
- Tournament data is managed in a Google Sheet

### Seeding System
- Google Sheet has a "Participants" tab with a ranked list of all tournament participants
- Rankings in the "Participants" tab determine the seeding order
- Ranked participants are distributed into 4 regions

### Regions
- Each tournament has 4 regions
- Each region has customized names (specific to that tournament)
- Seeded participants are distributed across regions by ranking:
  - Distribution is done 4 at a time (one participant per region)
  - 16 participants per region (16 ranks × 4 regions = 64 total)
  - Example distribution:
    - Rank 1 → Region 1
    - Rank 2 → Region 2
    - Rank 3 → Region 3
    - Rank 4 → Region 4
    - Rank 5 → Region 1
    - Rank 6 → Region 2
    - etc.

## Google Sheets Template Structure

### Template Usage
- Both master template and custom templates are supported
- Custom templates must follow the same format as the master template
- Template format will be documented for users who want to create custom sheets

### Sheet Tabs

#### Participants Tab
- Column A: Rank value (1-64)
- Column B: Participant name (string)
- Column C: Notes column - user can add additional data or links (e.g., wiki articles) for more info
- Column D: Reference Link (optional) - image URL or webpage with information about the participant

#### Config Tab
Configuration settings stored as key-value pairs (Column A = setting name, Column B = value):

1. **Tournament Name** - Display name for the tournament
2. **Tournament Description** - Brief description of what's being voted on
3. **Start Date** - When the tournament begins
4. **Poll Length** - Duration in hours (e.g., 24)
5. **Poll Batches** - How many polls to launch at once:
   - "full round" - All matches in a round at once
   - "one per region" - 1 match per region (4 total)
   - "two per region" - 2 matches per region (8 total)
   - "half round" - Launch half the matches, then the other half
   - "sequential" - One poll at a time
   - Custom number - Exact number specified
6. **Discord Channel ID** - Which channel to post polls in
7. **Auto-advance** - Whether to automatically start next round after current round completes (true/false)
8. **Tie Breaker Rule** - Dice roll (automatic)
9. **Results Visibility** - When users can see results (after voting, after poll closes, at tournament end)
10. **Required Voter Role** (optional) - Discord role ID required to vote in polls
11. **Match Preview Posts** - Enable/disable preview posts before each poll showing participant info (true/false)
12. **Live Vote Updates** - Frequency of vote count updates during active polls ("never", "halfway through poll", "when 1 hour remains", "every 6 hours", etc.)
13. **Auto Round Scheduling** (optional) - Automatically start next round after delay (e.g., "3 days", "immediate", or blank for manual)

#### Regions Tab
- Column A: Rank
- Columns B-E: Region names (customizable per tournament)
- Example region names: ALPHA, BETA, GAMMA, DELTA
- Shows how the 64 participants are distributed across 4 regions based on seeding
- Seeding is referenced/pulled from the Participants tab

#### Bracket Tab
- Complex formula-driven structure that displays tournament bracket
- Shows participant names with seed numbers
- After match completion, displays vote counts: `[votes] (seed) Participant Name`
  - Example before match: `(1) Spock (TOS/TAS/Films/SNW)`
  - Example after match: `45 (1) Spock (TOS/TAS/Films/SNW)`
- Vote counts are pulled from Results tab via formulas
- vPoll writes TRUE/FALSE winner indicators to advance the bracket

#### Results Tab
Each completed match is added as a new row (chronologically, oldest first) with these columns:

1. Match ID - Unique identifier for the match
2. Round - Round name/number (Round 1, Round 2, Sweet 16, Elite 8, etc.)
3. Region - Region name (ALPHA, BETA, GAMMA, DELTA, or FINAL for finals)
4. Participant 1 Name
5. Participant 1 Seed
6. Participant 1 Votes
7. Participant 2 Name
8. Participant 2 Seed
9. Participant 2 Votes
10. Winner - Name of winning participant
11. Discord Poll ID - Discord's poll ID for reference
12. Poll Start Time - Timestamp when poll started
13. Poll End Time - Timestamp when poll completed
14. Total Votes - Sum of all votes cast
15. Tiebreaker - Dice roll result if match ended in a tie (blank if no tie)
16. Notes - Additional information or comments

### Google Sheets Sharing
- User shares completed template with vPoll service account: vpoll-sheets-access@vpoll-475821.iam.gserviceaccount.com
- Sheet must be shared with "Editor" permissions so vPoll can update results
- Note: Service account email may change to a new alias in the future

## Deployment Strategy

### Private Bot (MVP)
- **Discord Developer Portal**: Set "Public Bot" toggle to **OFF** in Bot settings
- Only the bot owner can invite the bot to servers
- Others cannot generate invite links even if they have the Client ID
- Designed for single server use with friends
- Simpler architecture: no multi-server state management needed
- Lower costs: no scaling infrastructure required
- Optional: Add code validation to restrict bot to specific server ID

### Public Bot (Future Consideration)
- **Discord Developer Portal**: Set "Public Bot" toggle to **ON**
- Anyone can invite the bot to their servers
- Requires multi-server support architecture
- Need per-server tournament state management in database
- Higher Google Sheets API quota requirements
- Scaling infrastructure needed (see TODO.md for detailed planning)

## User Scenarios

This section describes the end-to-end user workflows for vPoll.

### Google Sheets Setup (Scenarios 1-5)

1. In google sheets, the user fills out a copy of the template, adding participants, ranking participants, and naming regions
2. In google sheets, the user sets the tournament rules in the config tab
3. The google sheet uses the ranking to fill out the seed groups that are used to fill out the bracket
4. In google sheets, the user shares the completed copy of the template with the VPoll service account email (vpoll-sheets-access@vpoll-475821.iam.gserviceaccount.com). This may be a new email alias in the future
5. In google sheets, the user sets the sheet's general link sharing to 'Anyone with the link can view' so that Discord users can access the bracket without needing Google account permissions

### Discord Bot Setup and Tournament Launch (Scenarios 6-8)

6. In discord, the discord admin adds the bot and sets permissions (need to define these)
7. In discord, the discord admin starts the tournament with a command that specified the the template to use
8. In discord, the discord admin starts the first round of polls based on the poll batches parameter

### Tournament Operations (Scenarios 9-17)

9. In discord, the discord admin can use vPoll to generate an "advertising" link share the tournament in other threads of channels (Need to config advertising thread template)
10. In discord, the polls run based on their configured duration, discord users vote in the polls
11. In discord, vPoll monitors the polls, when they complete, vPoll updates the google sheet template copy for the tournament, setting the winner in the Bracket tab and recording how many votes each participant got in the Results tab of the sheet (need to define the results tab layout)
12. In discord, the discord admin launches the next round of polls, vPoll follows the same patterns as the first round
13. In discord, when the tournament ends, vPoll updates the results tab of the google sheet
14. In discord, at any time, the discord admin can use vPoll to share the current results in the discord channel (need to define formatting)
15. In discord, at the end of the tournament, the discord admin can use vPoll to generate a post about the winner and optionally include a celebratory link
16. In discord, at any time, users can also ask vPoll to share the current results
17. In discord, at any time, users or the discord admin can ask vPoll for the link to the sheet template so they can view the Bracket

### Advanced Features (Scenarios 18-29)

18. In discord, the discord admin can pause an active tournament (marking it as paused status), which prevents new rounds from starting but allows active polls to finish. Admin can resume the tournament later to continue
19. In the config tab, the user can optionally specify a Discord role requirement for voting - only users with that role can participate in polls
20. In the config tab, the user can enable match preview posts - when enabled, vPoll posts a preview message before each poll starts, showing participant names and any additional info from the Notes column (Participants tab Column C)
21. In the config tab, the user can configure live vote count updates with options like "never", "halfway through poll", "when 1 hour remains", "every 6 hours", etc. When enabled, vPoll posts current vote counts for active polls at the specified intervals
22. In discord, when the admin starts a tournament, vPoll validates the Google Sheet has all required data (64 participants in Participants tab, all required config values set, 4 regions named in Regions tab, etc.). If validation fails, vPoll sends the admin a warning message detailing what is missing or incorrect
23. In discord, when a poll ends in a tie, vPoll uses a dice roll to determine the winner, posts a message in the channel announcing the tie and dice roll result, and logs the dice roll result in a "Tiebreaker" column in the Results tab
24. In the config tab, the user can enable automatic round scheduling - when enabled, vPoll automatically starts the next round after a specified delay (e.g., "3 days after previous round ends" or "immediate"). This allows tournaments to run automatically without manual admin intervention for each round
25. In the Participants tab, Column D is an optional Reference Link for each participant - this can be an image URL or a webpage with information about the participant. During a tournament, users can ask vPoll for the reference link for any participant via a command
26. In discord, at any time during or after the tournament, the admin or users can request vPoll to generate and share a bracket image/PDF showing all current results, making it easy to share tournament progress
27. In discord, users can opt-in to receive DM notifications when new polls go live in tournaments they're following. Users can subscribe/unsubscribe from tournament notifications via commands, and vPoll stores these preferences in a database
28. In the config tab, the user can optionally specify an Announcements Channel ID where vPoll will automatically post tournament start announcements and round start announcements (separate from the channel where polls are posted). This allows tournament updates to be shared in a general announcement channel while keeping polls in a dedicated channel
29. In the config tab, the user can configure channel/thread organization with options including: run tournament in a specific channel, run tournament in a specific thread, create separate threads for each round's polls, or create separate threads for each individual poll. NEEDS REVIEW: Determine if vPoll needs channel/thread creation permissions when added to Discord, or if admin must pre-create channels/threads

## Scenario Conflicts and Overlaps Review

This section identifies overlapping, conflicting, or unclear scenarios that need review and reconciliation before implementation.

### Overlapping Scenarios

#### Overlap Group 1: Results Sharing (Scenarios 14, 16, 26)
**Issue:** Multiple scenarios cover sharing/displaying results with unclear distinctions

- **Scenario 14**: Admin can share current results in Discord channel (need to define formatting)
- **Scenario 16**: Users can also ask vPoll to share current results
- **Scenario 26**: Admin or users can request bracket image/PDF showing current results

**Questions to Resolve:**
- Are scenarios 14 and 16 the same feature with different permissions?
- Is scenario 26 a different output format (image/PDF) vs. text output (14/16)?
- Should we consolidate into one scenario with options: text summary, detailed text, or bracket image?
- What's the difference between "share results" and "bracket image"?

**Recommendation:**
- Consolidate 14 & 16 into one scenario: "Users can request current results (text format)"
- Keep 26 separate: "Users can request bracket visualization (image/PDF format)"
- Define clear output formats for each

#### Overlap Group 2: Channel Configuration (Scenarios 2, 28, 29)
**Issue:** Channel configuration appears in multiple places with potential conflicts

- **Scenario 2**: Config tab sets tournament rules (includes Discord Channel ID)
- **Scenario 28**: Config tab specifies optional Announcements Channel ID
- **Scenario 29**: Config tab configures channel/thread organization

**Questions to Resolve:**
- How do scenarios 2 (Discord Channel ID) and 29 (channel/thread organization) interact?
- If scenario 29 says "run in specific thread", does that override scenario 2's channel setting?
- Can you have polls in a thread (scenario 29) AND announcements in a separate channel (scenario 28)?
- What's the hierarchy: channel → thread → individual poll threads?

**Recommendation:**
- Clarify in scenario 2: "Discord Channel ID" is the PRIMARY poll posting location
- Scenario 28: Announcements go to DIFFERENT channel (or same if not specified)
- Scenario 29: Thread organization is WITHIN the primary channel from scenario 2
- Need clear config precedence rules

#### Overlap Group 3: Automatic vs Manual Round Advancement (Scenarios 8, 12, 24)
**Issue:** Conflicting scenarios about who/what starts rounds

- **Scenario 8**: Discord admin starts the first round of polls
- **Scenario 12**: Discord admin launches the next round of polls
- **Scenario 24**: Auto-scheduling automatically starts next round after delay

**Questions to Resolve:**
- If auto-scheduling (24) is enabled, do scenarios 8 & 12 still apply?
- Does auto-scheduling only apply to rounds 2+, while round 1 is always manual (scenario 8)?
- What happens if admin tries to manually start a round when auto-scheduling is on?
- Can admin override auto-scheduling for specific rounds?

**Recommendation:**
- Scenario 8: First round is ALWAYS manual (required to start tournament)
- Scenario 24: Auto-scheduling applies to rounds 2+ only
- Scenario 12: Manual launch is available even with auto-scheduling (as override)
- Add config: "Auto-scheduling" with options: "off", "after round 1", "all rounds except 1"

#### Overlap Group 4: Tournament End Updates (Scenarios 11, 13, 15)
**Issue:** Multiple scenarios trigger at tournament end with unclear order

- **Scenario 11**: vPoll updates Google Sheet when polls complete (ongoing throughout tournament)
- **Scenario 13**: When tournament ends, vPoll updates results tab
- **Scenario 15**: At tournament end, admin can generate winner post

**Questions to Resolve:**
- Isn't scenario 13 redundant if scenario 11 already updates the sheet for every poll?
- Does scenario 13 mean "final summary" update vs ongoing updates (11)?
- What's the sequence: Poll completes → Sheet update (11) → Tournament ends → Final update (13) → Winner post (15)?
- What additional data does scenario 13 add that 11 doesn't already write?

**Recommendation:**
- Scenario 11: Continuous updates for each completed match
- Scenario 13: Final tournament metadata update (end timestamp, final status, etc.)
- Scenario 15: User-triggered action after tournament completion
- Clarify what "final update" in scenario 13 actually adds

### Conflicting Scenarios

#### Conflict 1: Role Restrictions vs Public Voting (Scenario 19)
**Issue:** Role restrictions may conflict with public voting concept

- **Scenario 19**: Config can require specific Discord role to vote

**Questions to Resolve:**
- Does this break Discord's native poll behavior (anyone in channel can vote)?
- Can we actually restrict who sees/votes in Discord native polls by role?
- Or do we need to validate after-the-fact and reject votes from non-permitted users?
- If we can't technically restrict Discord polls by role, is this scenario viable?

**Recommendation:**
- Research Discord Poll API limitations
- May need to change to: "Bot validates voters have role and warns if unauthorized voting detected"
- Or: "Use Discord channel permissions to restrict who can see poll channel" (different approach)

#### Conflict 2: Private Bot vs Multi-Tournament Features (Scenario 27)
**Issue:** User notification subscriptions imply multi-tournament support

- **Scenario 27**: Users subscribe to tournament notifications (plural "tournaments they're following")

**Questions to Resolve:**
- Private bot (MVP) supports one server with one tournament at a time
- Does scenario 27 imply multiple concurrent tournaments?
- Or does "tournaments they're following" mean historical/sequential tournaments?
- Is this feature only for public bot (future)?

**Recommendation:**
- For MVP (private bot): Scenario 27 is "subscribe to THIS tournament's notifications"
- For public bot: Scenario 27 is "subscribe to specific tournaments across multiple servers"
- Flag as future feature unless simplified for single-tournament use

### Unclear/Ambiguous Scenarios

#### Ambiguity 1: Scenario 9 - Advertising Link
**Issue:** "Advertising link" is vague

- **Scenario 9**: Admin can generate "advertising" link to share tournament in other threads/channels

**Questions to Resolve:**
- Is this a Discord invite link? A message template? A tournament info post?
- What's in the advertising content? Tournament name, participants, schedule?
- Is it a shareable URL or a formatted message?
- How is it different from scenario 28 (announcements)?

**Recommendation:**
- Rename to "Tournament Promotion Post/Template"
- Define exact content: tournament name, description, how to participate, link to polls channel
- Clarify difference from announcements (28): advertising is for recruiting, announcements are updates

#### Ambiguity 2: Scenario 17 - Sheet Link
**Issue:** What exactly is being shared?

- **Scenario 17**: Users can ask for "the link to the sheet template"

**Questions to Resolve:**
- Is it the template (master) or the tournament's specific sheet copy?
- Should say "tournament sheet link" not "template link"
- Template implies the master blank template, not the active tournament

**Recommendation:**
- Change to: "Users can request the Google Sheets link for the current tournament's bracket"
- Clarify it's the active tournament sheet, not the blank template

#### Ambiguity 3: Scenario 20 - Match Preview Posts
**Issue:** When exactly are previews posted?

- **Scenario 20**: Preview posted "before each poll starts"

**Questions to Resolve:**
- How long before? Immediately before? Hours before?
- If poll batches launch multiple polls at once, are previews batched too?
- Do previews get their own posts or embedded in poll post?

**Recommendation:**
- Clarify timing: "Immediately before poll is created" or "X minutes before poll starts"
- Clarify format: Separate preview post, then poll post

### Config Tab Organization Issues

**Issue:** Many scenarios add config options without clear organization

Scenarios adding config options: 2, 19, 20, 21, 24, 28, 29

**Questions to Resolve:**
- Are all these config options in Config tab, or some in code/defaults?
- Is Config tab getting too complex with 13+ settings?
- Should we group configs: "Tournament Settings", "Poll Settings", "Notification Settings", "Channel Settings"?
- Which configs are required vs optional vs have defaults?

**Recommendation:**
- Create config groups/sections in the Config tab
- Define required vs optional for each setting
- Consider config validation checklist (scenario 22)

### Resolution Action Items

#### High Priority - Must Resolve Before Implementation
1. **Consolidate Results Sharing** (scenarios 14, 16, 26) - Define clear distinctions
2. **Channel Configuration Hierarchy** (scenarios 2, 28, 29) - Define precedence rules
3. **Auto vs Manual Round Advancement** (scenarios 8, 12, 24) - Define interaction rules
4. **Role Restriction Feasibility** (scenario 19) - Research Discord API capabilities

#### Medium Priority - Clarify Before MVP
5. **Tournament End Flow** (scenarios 11, 13, 15) - Define sequence and purpose
6. **Advertising vs Announcements** (scenarios 9, 28) - Define clear differences
7. **Sheet Link Terminology** (scenario 17) - Fix ambiguous wording
8. **Config Tab Organization** - Group and structure all config options

#### Low Priority - Can Defer
9. **Multi-Tournament Support** (scenario 27) - Simplify for MVP or defer to public bot
10. **Preview Post Timing** (scenario 20) - Define exact timing and format

## Technical Requirements
- Integration with Google Sheets API to read tournament data and write results
- Use Discord's native poll feature for voting
- Track poll results and automatically update tournament progression
