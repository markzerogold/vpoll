# vPoll Product Requirements - User Scenarios (Deferred Features)

[← Back to Main README](../../README.md) | [View Full Requirements](../../REQUIREMENTS.md)

**Document Section:** 6 of 9
**Last Updated:** 2025-10-22
**Status:** In Development - MVP Phase

---

## Navigation

- **Previous:** [User Scenarios - Admin Controls](./05-scenarios-admin.md)
- **Current:** User Scenarios - Deferred Features (Scenarios 20-30)
- **Next:** [Google Sheets Specification](./07-google-sheets-spec.md)
- **See Also:** [FUTURE.md](../../FUTURE.md) for detailed future planning

---

### Advanced Features

#### Scenario 20: Required Voter Role (Deferred to Future)

**Actor:** Tournament Host (TH)
**Goal:** Restrict tournament voting to users with a specific Discord role

**Status:** ⚠️ **DEFERRED** - Not included in MVP

**Why Deferred:**
Discord native polls cannot be restricted to specific roles. Enforcement would require:
- Custom voting implementation (reactions, buttons, or forms) instead of native polls
- Vote validation after-the-fact (removing invalid votes)
- Or channel permission management (locking channel to role holders)

All of these approaches add significant complexity and require major architectural changes.

**MVP Approach:**
- **No config setting** for Required Voter Role
- All server members with channel access can vote
- Tournament Hosts should use Discord's channel permissions to restrict who can see/access the tournament channel

**Future Implementation:**
See FUTURE.md "Role-Based Vote Enforcement During Voting" for planned implementation options.

**Workaround for MVP:**
Tournament Hosts can manually restrict voting by:
1. Creating a private channel only visible to users with specific role
2. Posting tournament polls in that restricted channel
3. vPoll respects existing channel permissions

---

#### Scenario 21: Match Preview Posts (Deferred to Future)

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

#### Scenario 22: Live Vote Count Updates (Deferred to Future)

**Actor:** vPoll (Automated)
**Goal:** Post periodic vote count updates to announcements channel during active polls

**Status:** ⚠️ **DEFERRED** - Not included in MVP

**Why Deferred:**
- Discord native polls already show real-time vote counts to all users who can see the poll
- Additional update posts would be redundant in the same channel
- Adds implementation complexity for minimal MVP value

**MVP Approach:**
- **No config setting** for Live Vote Updates
- Users see live vote counts directly in Discord native polls
- No separate vote count announcements posted

**Future Implementation:**
See FUTURE.md "Real-time Vote Tracking and Display" for planned features:
- Posting vote updates to separate announcements channel
- Including additional analytics (vote velocity, participation rate, trending)
- Sending DM notifications to subscribed users
- Generating vote count visualizations (charts/graphs)

**Why This Could Be Valuable (Future):**
- Updates in announcements channel don't ping everyone in main poll channel
- Historical record of vote progression
- Analytics for tournament organizers
- Hype-building with periodic updates showing close races

**MVP Alternative:**
Users can simply view the Discord poll to see current vote counts at any time.

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

#### Scenario 26: Participant Reference Link Lookup (Deferred to Future)

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

**Actor:** Tournament Host (TH) or Discord User (Voter)
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

#### Scenario 29: Announcements Channel Configuration (Deferred to Future)

**Actor:** Tournament Host (TH)
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

**Actor:** Tournament Host (TH)
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

[← Previous: Admin Controls](./05-scenarios-admin.md) | [Next: Google Sheets Spec →](./07-google-sheets-spec.md)
