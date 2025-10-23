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

