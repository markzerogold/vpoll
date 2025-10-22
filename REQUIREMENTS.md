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

## Technical Requirements
- Integration with Google Sheets API to read tournament data and write results
- Use Discord's native poll feature for voting
- Track poll results and automatically update tournament progression
