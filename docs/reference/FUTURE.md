# vPoll Future Features

This file is a record of deferred features that will be considered for future versions of vPoll. These features have been identified during requirements analysis but are not part of the initial MVP (Minimum Viable Product) release. They may be implemented in subsequent versions based on user feedback, technical feasibility, and resource availability.

## Tournament Management

### Reseeding Option
Config setting to support reseeding after each round (like NCAA tournament where #1 seed always plays lowest remaining seed) instead of following the original bracket matchups. This would require more complex bracket logic and sheet formulas.

## Statistics & Analytics

### Historical Stats
Track statistics across multiple tournaments: most votes received, win percentages, closest matches, biggest upsets (lower seed beating higher seed). Would require a database or additional sheet to store historical data across tournaments, plus more complex tracking logic.

## Multi-Tournament Support

### Multiple Concurrent Tournaments
Support running multiple tournaments simultaneously in different channels on the same server. Would require tournament ID/name to distinguish them, channel-based or tournament-name-based commands, and tracking multiple tournament states concurrently.

**Command syntax for multi-tournament support:**
```
/tournament start <tournament-name-or-id>
```
Example: `/tournament start "Star Trek Tournament"`

This allows admins to specify which tournament to start when multiple tournaments exist on the server. Would also require similar parameters for other tournament commands like `/tournament pause`, `/tournament results`, etc.

## Voting Enhancements

### Vote Confirmation Messages
**Current State:** MVP uses pure Discord native polls without custom intervention during voting.

**Future Enhancement:** After users vote, vPoll sends ephemeral message (only visible to voter) confirming their vote. Provides user feedback and could include additional information like current standings or links to bracket.

**Considerations:** Requires monitoring vote events in real-time, may increase API usage and complexity.

### Real-time Vote Tracking and Display
**Current State:** Live Vote Updates (Scenario 22) allows periodic vote count posts, but no real-time individual vote tracking.

**Future Enhancement:** vPoll monitors votes in real-time as they come in and can display live leaderboards, voting velocity graphs, or real-time bracket updates.

**Considerations:** High API usage, potential Discord rate limits, increased server load for active tournaments.

### Role-Based Vote Enforcement During Voting
**Current State:** Scenario 20 mentions Required Voter Role config option, but enforcement mechanism undefined for MVP.

**Future Enhancement:** If Required Voter Role is set, vPoll actively validates voters have the required role and prevents/removes votes from unauthorized users.

**Considerations:** May not be technically possible with Discord native polls (polls are built-in Discord feature with limited bot control). Would likely require custom voting implementation using buttons/reactions instead of native polls, which is a major architectural change.

## Visualization & Sharing

### Bracket Image/PDF Generation (Scenario 27)
**Current State:** Users view the live bracket by opening the Google Sheets link. No static image or PDF export is available.

**Future Enhancement:** Generate shareable bracket visualization as image or PDF file.

**Implementation Options:**
- **Option 1: On-Demand Generation** - User runs `/tournament bracket-image` and vPoll generates current bracket state as PNG/PDF
- **Option 2: Automatic Updates** - vPoll automatically generates and posts updated bracket image after each round completes
- **Option 3: External Service** - Integrate with service like Challonge or Battlefy for bracket visualization

**Benefits:**
- Shareable on social media (Twitter, Instagram, Reddit)
- Easier to view on mobile devices
- Can be posted in Discord channels without requiring users to open Google Sheets
- Creates archival snapshots of tournament progression

**Considerations:**
- Image generation requires complex rendering (could use libraries like Puppeteer, Canvas, or Sharp)
- PDF generation adds additional dependencies
- File size and Discord upload limits (8MB for most servers, 25MB for boosted)
- Google Sheets already provides live visualization, so this is a "nice-to-have" rather than essential
- Complexity vs value tradeoff for MVP

**Technical Requirements:**
- Bracket layout engine to position participants/matches
- Image rendering library (Canvas API, Puppeteer for screenshots, or SVG)
- PDF generation library (if PDF support desired)
- Discord file upload handling

**Deferred Because:** Google Sheets provides adequate live bracket visualization for MVP. Image/PDF generation is a valuable enhancement but not critical for core tournament functionality.

---

## Content & Communication

### Match Preview Posts (Scenario 21)
**Current State:** MVP provides no automated pre-poll participant information. Voters must manually open the Google Sheets Participants tab to view notes and reference links before voting.

**Future Enhancement:** Automatically post participant information 60 seconds before each poll goes live, helping voters make informed decisions without leaving Discord.

**Implementation Options:**
- **Option 1: Simple Text Preview** - Post plain text with participant names, seeds, notes, and reference links
- **Option 2: Rich Embeds** - Use Discord embeds with formatted participant info, thumbnail images (if reference links point to images), and clickable links
- **Option 3: Scheduled Threads** - Create temporary threads for each matchup with full participant details and discussion

**Example Preview Message:**
```
🎯 **Upcoming Match** - Spock vs. Kirk

**#1 Spock** (Region: Alpha Quadrant)
📝 Logical Vulcan science officer, first officer of USS Enterprise
🔗 https://memory-alpha.fandom.com/wiki/Spock

**#16 James T. Kirk** (Region: Alpha Quadrant)
📝 Bold captain of USS Enterprise, known for creative solutions
🔗 https://memory-alpha.fandom.com/wiki/James_T._Kirk

Poll opens in 60 seconds! 🗳️
```

**Benefits:**
- Improves voter engagement by providing context directly in Discord
- Reduces friction (voters don't need to switch to Google Sheets)
- Creates anticipation with countdown timer
- Allows voters to discuss matchups before voting opens
- Reference links become clickable and immediately accessible

**Considerations:**
- Adds extra Discord messages (may clutter channel if not using threads)
- 60-second delay before each poll adds time to tournament duration
- Requires fetching participant data from Google Sheets before posting polls
- Image embedding (if reference link is an image) requires additional logic
- May hit Discord rate limits if posting many preview messages rapidly

**Technical Requirements:**
- Read Participants tab data before posting polls
- Schedule preview post 60 seconds before poll creation
- Handle missing notes/links gracefully (don't post blank fields)
- Optional: Detect image URLs and embed as thumbnails
- Config setting: `Match Preview Posts` (boolean, default: false)

**Deferred Because:** Voters can view participant info in Google Sheets. Preview posts are a nice enhancement but not critical for MVP functionality. Adds complexity to poll scheduling and increases Discord API usage.

---

### Participant Info Lookup Command (Scenario 26)
**Current State:** Voters must manually open Google Sheets and search the Participants tab to find information about a specific participant.

**Future Enhancement:** `/participant info <name>` command allows voters to instantly look up participant details directly in Discord.

**Implementation:**
```
Command: /participant info <participant-name>
Example: /participant info Spock
```

**Response Format:**
```
📊 **Participant Info: Spock**

🏆 **Seed:** #1
🌍 **Region:** Alpha Quadrant
📝 **Notes:** Logical Vulcan science officer, first officer of USS Enterprise
🔗 **Reference:** https://memory-alpha.fandom.com/wiki/Spock

**Tournament Status:**
✅ Advanced to Round 3 (Elite Eight)
📈 Record: 2-0 (defeated Khan #16, McCoy #8)
🗳️ Total Votes Received: 127 votes
```

**Benefits:**
- Quick access to participant info without leaving Discord
- Shows current tournament status (wins, losses, vote totals)
- Helps voters research participants before voting
- Useful during live polls when voters want context
- Displays reference links as clickable URLs

**Considerations:**
- Requires fuzzy name matching (users may misspell names)
- Must handle participants with similar names
- Needs access to Results tab to show tournament progress
- Potential for command spam during active voting
- May encourage voters to look up info only for participants they recognize (confirmation bias)

**Technical Requirements:**
- Slash command with autocomplete for participant names
- Read Participants tab for seed, notes, reference link
- Read Results tab to calculate wins/losses/vote totals
- Fuzzy string matching for name lookups
- Handle "not found" errors gracefully

**Deferred Because:** Google Sheets provides complete participant information in a well-organized format. Command is convenient but not essential for MVP. Adds complexity to bot command structure.

---

### Announcements Channel (Scenario 29)
**Current State:** MVP posts all tournament content (polls, results, winner announcements) to a single primary channel specified in Config tab (`Discord Channel ID`).

**Future Enhancement:** Separate announcements channel for tournament updates, keeping the primary channel focused on active polls and voting.

**Implementation:**
- New config setting: `Announcements Channel ID` (optional Discord channel ID)
- If set, vPoll posts tournament announcements to this channel
- If blank, falls back to primary poll channel (MVP behavior)

**Message Routing:**
| Message Type | Primary Channel | Announcements Channel |
|--------------|-----------------|----------------------|
| Active polls | ✅ Posted here | ❌ Not posted |
| Poll results | ✅ Posted here | ✅ Posted here |
| Round start announcements | ✅ Posted here | ✅ Posted here |
| Winner announcement | ✅ Posted here | ✅ Posted here |
| Tournament status updates | ❌ Not posted | ✅ Posted here |
| Error messages | ✅ Posted here | ❌ Not posted |

**Benefits:**
- Keeps primary channel clean and focused on active voting
- Announcements channel becomes tournament "news feed"
- Voters can mute announcements channel but stay subscribed to polls
- Useful for high-volume tournaments with frequent updates
- Allows different channel permissions (e.g., read-only announcements)

**Considerations:**
- Requires bot to have Send Messages permission in two channels
- May confuse voters if announcements and polls are separated
- Some messages (like results) might be duplicated across channels
- Tournament Host must pre-create and configure both channels
- Not useful for small/simple tournaments

**Technical Requirements:**
- Config setting: `Announcements Channel ID` (string, optional)
- Update message posting logic to check config and route appropriately
- Validate both channel IDs during tournament creation
- Handle case where announcements channel is deleted mid-tournament
- Documentation explaining which messages go where

**Deferred Because:** Single-channel posting is simpler and adequate for MVP. Most tournaments don't need separate announcement channels. Adds complexity to message routing logic.

---

### Advertising Template Generation (Scenario 10)
**Current State:** MVP provides master template spreadsheet URL via `/tournament template` command. Tournament Hosts manually write promotional posts to advertise their tournaments.

**Future Enhancement:** Config setting with template string containing placeholders that vPoll automatically fills in to generate shareable promotional posts.

**Implementation:**
- Config setting: `Advertising Template` (string with placeholders)
- Command: `/tournament promo` generates filled-in promotional message
- Placeholders: `{tournament_name}`, `{description}`, `{start_date}`, `{participants_count}`, `{bracket_link}`, `{channel_link}`

**Example Template:**
```
🏆 **{tournament_name}** is starting {start_date}!

{description}

🎯 {participants_count} participants competing across 4 regions
📊 View live bracket: {bracket_link}
🗳️ Vote here: {channel_link}

May the best character win! 🖖
```

**Generated Output:**
```
🏆 **Star Trek Character Battle** is starting January 15, 2025!

Vote for your favorite Star Trek characters in this epic tournament! From Captains to Engineers, Vulcans to Klingons - who will reign supreme?

🎯 64 participants competing across 4 regions
📊 View live bracket: https://docs.google.com/spreadsheets/d/abc123/edit
🗳️ Vote here: https://discord.com/channels/123/456

May the best character win! 🖖
```

**Benefits:**
- Saves Tournament Hosts time writing promotional posts
- Ensures consistent branding across tournaments
- Automatically includes correct links and details
- Hosts can customize template per tournament or use defaults
- Easy to share on social media, other Discord servers, forums

**Considerations:**
- Template syntax must be user-friendly for non-technical hosts
- Placeholder replacement requires careful escaping/validation
- Not all hosts want automated promotional messages (some prefer custom)
- Config tab template field could become very long
- Limited usefulness if tournament is server-internal only

**Technical Requirements:**
- Config setting: `Advertising Template` (string, optional, multi-line)
- `/tournament promo` slash command
- Template parsing and placeholder replacement logic
- Generate Discord channel links from channel IDs
- Copy-to-clipboard or post-as-message options

**Deferred Because:** Tournament Hosts can manually write promotional posts. Template generation is a convenience feature but not essential for running tournaments. Adds complexity to config and command structure.

---

## User Engagement Features

### Advanced User Notification Subscriptions (Scenario 28)
**Current State:** Scenario 28 describes users subscribing to "tournaments they're following" and receiving DM notifications, which implies multi-tournament support.

**Future Enhancement:** Full-featured notification system allowing users to:
- Subscribe to multiple tournaments across different servers (public bot)
- Receive DM notifications when new polls go live
- Customize notification preferences per tournament
- View history of tournaments they've participated in

**For MVP:** Simplify to basic tournament announcements in-channel only, or simple "subscribe to this tournament" for single-tournament private bot use. Full cross-tournament subscription system deferred until public bot deployment.

## Bot Permissions & Automation

### Tournament Host Role Restriction
**Current State:** MVP allows any server member with slash command permissions to create and run tournaments using `/tournament create` and related commands.

**Future Enhancement:** Add optional "Required Tournament Host Role" setting that restricts tournament creation and management to users with a specific Discord role.

**Implementation:**
- New config option (bot-level or per-server): `REQUIRED_TH_ROLE` (Discord role ID)
- When set, vPoll checks if user has the role before allowing:
  - `/tournament create`
  - `/tournament start`
  - `/tournament pause`
  - `/tournament resume`
  - `/tournament cancel`
  - `/tournament next-round`
- Users without the role receive error message: "You need the [Role Name] role to manage tournaments on this server"

**Benefits:**
- Gives server admins control over who can create tournaments
- Prevents tournament spam or unauthorized tournaments
- Useful for larger communities with designated tournament organizers
- Maintains flexibility: if not configured, any member can still create tournaments (MVP behavior)

**Considerations:**
- Role check must happen server-side (bot validates role membership)
- Clear error messaging to help users understand why they're blocked
- Documentation should explain this is an optional restriction
- Server Administrator can still install/configure bot regardless of TH role setting

### Automatic Thread/Channel Creation (Scenario 30)
**Current State:** MVP requires admin to manually pre-create all threads/channels and provide IDs in Config tab. vPoll does not auto-create threads or channels.

**Future Enhancement Options:**
- **Option 1: Bot Auto-Creates Threads Only** - Add "Create Public Threads" permission (already in Standard permissions), allowing vPoll to create threads within existing channels automatically
- **Option 2: Bot Auto-Creates Threads and Channels** - Add "Manage Threads" and "Manage Channels" permissions, allowing vPoll to fully automate channel/thread organization per tournament configuration

**Benefits:** Reduces manual setup burden on admins, enables more dynamic tournament organization
**Considerations:** Requires more invasive permissions, may concern some server admins about bot control

