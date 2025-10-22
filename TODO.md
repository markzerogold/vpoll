# vPoll TODO List

This file tracks all pending tasks and implementation work for the vPoll project.

## Documentation Tasks

### Scenarios Needing Definition/Refinement

**HIGH PRIORITY - Conflicts/Overlaps (See SCENARIO_REVIEW.md):**
- [ ] **RESOLVE: Results Sharing Overlap** (scenarios 14, 16, 26) - Consolidate or clarify distinctions
- [ ] **RESOLVE: Channel Config Hierarchy** (scenarios 2, 28, 29) - Define precedence rules
- [ ] **RESOLVE: Auto vs Manual Rounds** (scenarios 8, 12, 24) - Define interaction rules
- [ ] **RESOLVE: Role Restrictions Feasibility** (scenario 19) - Research Discord API capabilities

**MEDIUM PRIORITY - Clarifications Needed:**
- [ ] **CLARIFY: Tournament End Flow** (scenarios 11, 13, 15) - Define sequence and what each does
- [ ] **CLARIFY: Advertising vs Announcements** (scenarios 9, 28) - Define clear differences
- [ ] **CLARIFY: Sheet Link Wording** (scenario 17) - Tournament sheet vs template
- [ ] **CLARIFY: Config Tab Organization** - Group 13+ config options into sections

**ORIGINAL SCENARIOS - Still Need Definition:**
- [ ] **Scenario 6**: Discord bot setup - Define required permissions
- [ ] **Scenario 7**: Starting tournament - Define command syntax and parameters
- [ ] **Scenario 8**: First round of polls - Define how poll batches work in detail
- [ ] **Scenario 10**: Poll voting process - Ensure Discord native poll behavior is documented
- [ ] **Scenario 20**: Match preview timing - Define exact timing and format

### New Scenarios Added (Need Implementation Planning)

- [ ] **Scenario 18**: Tournament pause/resume functionality
- [ ] **Scenario 19**: Role-based voting restrictions
- [ ] **Scenario 20**: Match preview posts
- [ ] **Scenario 21**: Live vote count updates
- [ ] **Scenario 22**: Bracket validation before tournament start
- [ ] **Scenario 23**: Automatic tiebreaker using dice rolls
- [ ] **Scenario 24**: Automatic round scheduling
- [ ] **Scenario 25**: Participant reference links
- [ ] **Scenario 26**: Bracket export as image/PDF
- [ ] **Scenario 27**: User notification subscriptions
- [ ] **Scenario 28**: Announcement channel for tournament/round start notifications
- [ ] **Scenario 29**: Channel/thread organization options - NEEDS REVIEW for permissions

### Discord Permissions & Channel Management (NEEDS RESEARCH)

- [ ] **Research Discord permissions for Scenario 29** - Channel/thread organization
  - Does vPoll need "Manage Threads" permission to create threads?
  - Does vPoll need "Manage Channels" permission to create channels?
  - Can bot post to existing channels/threads with just "Send Messages"?
  - What's the best UX: bot auto-creates threads vs. admin pre-creates them?
  - Permission implications for private vs. public bot
  - Should thread/channel creation be MVP or future feature?
  - Alternative: Require admin to manually create channels/threads and provide IDs in config

## Implementation Tasks

### Google Sheets Integration

- [ ] Update test-sheets.ts to read from renamed tabs (Participants, Regions)
- [ ] Add Tiebreaker column to Results tab structure
- [ ] Add Reference Link column (Column D) to Participants tab
- [ ] Implement sheet validation logic (Scenario 22)
- [ ] Implement Results tab writing with all 16 columns
- [ ] Implement Bracket tab TRUE/FALSE winner updates

### Discord Bot Commands

- [ ] Define all slash commands needed for tournament management
- [ ] `/tournament create` - Start new tournament from Google Sheet
- [ ] `/tournament start-round` - Launch polls for a round
- [ ] `/tournament pause` - Pause tournament
- [ ] `/tournament resume` - Resume paused tournament
- [ ] `/tournament results` - Show current results
- [ ] `/tournament winner` - Generate winner announcement
- [ ] `/tournament bracket` - Generate bracket image/PDF
- [ ] `/tournament sheet` - Get Google Sheets link
- [ ] `/tournament advertise` - Generate advertising post
- [ ] `/participant info <name>` - Get reference link for participant
- [ ] `/subscribe` - Subscribe to tournament notifications
- [ ] `/unsubscribe` - Unsubscribe from tournament notifications

### Discord Bot Features

- [ ] Discord poll creation and monitoring
- [ ] Auto-update Google Sheets when polls complete
- [ ] Dice roll tiebreaker implementation
- [ ] Match preview post generation
- [ ] Live vote count update scheduler
- [ ] Bracket validation logic
- [ ] Automatic round scheduling
- [ ] User notification system (DM subscriptions)
- [ ] Bracket image/PDF generation
- [ ] Role-based voting restriction enforcement

### Database/Persistence

- [ ] Design database schema for tournament state tracking
- [ ] User notification preferences storage
- [ ] Active tournament tracking
- [ ] Poll-to-match mapping
- [ ] Tournament status (active/paused/completed)

### Configuration

- [ ] Add all new config parameters to Config tab reading logic
- [ ] Validate all required config values are present
- [ ] Handle optional config values (defaults)

### Testing & Quality Assurance

- [ ] **Create comprehensive test plan**
  - Unit tests for Google Sheets integration
  - Unit tests for Discord poll creation and monitoring
  - Integration tests for end-to-end tournament flow
  - Test scenarios for all 27 documented scenarios
  - Edge cases: ties, validation failures, missing data
  - Automated testing framework (Jest, pytest, or similar)
  - Use logs to verify correct behavior at each step
  - Test data: Sample Google Sheets for different tournament states
  - Mock Discord API responses for testing without live server
  - Performance testing: API call limits, response times
  - Regression testing suite for future changes

- [ ] **Design scalable logging framework**
  - Choose logging library (winston, pino, or built-in)
  - Define log levels (error, warn, info, debug, trace)
  - Log structure and format (JSON for easy parsing?)
  - What to log:
    - All Google Sheets API calls (read/write operations)
    - All Discord API calls (poll creation, updates)
    - Tournament state changes (start, pause, round advancement)
    - User commands and actions
    - Errors and exceptions with full context
    - Performance metrics (API latency, processing time)
  - Log storage strategy:
    - Local files for development
    - Cloud logging for production (CloudWatch, Stackdriver, etc.)
    - Log rotation and retention policies
  - Privacy considerations: Don't log sensitive user data
  - Searchability and monitoring: structured logs for easy querying
  - Alerting: critical errors trigger notifications
  - Cost considerations for cloud logging at scale

## Deployment & Scaling Planning

- [ ] **Define MVP (Minimum Viable Product) features**
  - Identify core essential features for first working version
  - Review all 27 scenarios and mark as MVP vs. future enhancement
  - Reconsider each feature through lens of:
    - **Cost**: Google Sheets API calls, database operations, compute resources
    - **Scalability**: Does it work for 1 server? 10 servers? 100 servers?
    - **Complexity**: Implementation effort vs. value provided
    - **Dependencies**: External services, quota limits, rate limits
  - Features to evaluate for MVP inclusion:
    - Scenarios 1-17 (original core scenarios) - Which are truly essential?
    - Scenario 18: Pause/resume - Nice to have or essential?
    - Scenario 19: Role restrictions - Security concern or optional?
    - Scenario 20: Match previews - Core feature or enhancement?
    - Scenario 21: Live vote updates - High API cost, is it worth it?
    - Scenario 22: Validation - Essential for good UX
    - Scenario 23: Tiebreaker - Essential for tournament completion
    - Scenario 24: Auto-scheduling - Convenience vs. API monitoring costs
    - Scenario 25: Reference links - Low cost, high value
    - Scenario 26: Bracket export - Image generation cost/complexity
    - Scenario 27: User notifications - Database + DM costs
  - Create MVP feature list and v2/v3 roadmap

- [ ] **Brainstorm deployment architecture** - How will the bot work when deployed?
  - Initial use case: Private bot for one Discord server with friends
    - **Discord Developer Portal**: Turn OFF "Public Bot" toggle in Bot settings
    - Only bot owner can invite the bot to servers
    - Others cannot generate invite links even with Client ID
    - Optional: Add code to restrict bot to specific server ID
    - Simpler implementation, no multi-server architecture needed
    - Lower costs, no scaling concerns for MVP
  - Public bot considerations (for future if/when we go public):
    - Multi-server support architecture
    - Google Sheets API quota limits and costs
    - Service account scalability (one service account vs. per-server accounts)
    - Database hosting and costs (user preferences, tournament states)
    - Bot hosting costs (VPS, cloud functions, etc.)
    - Rate limiting and anti-abuse measures
    - Privacy and data storage compliance
    - Support/maintenance burden
  - Cost implications analysis:
    - Google Cloud API pricing
    - Database hosting (PostgreSQL, MongoDB, etc.)
    - Bot hosting infrastructure
    - Storage for bracket images/PDFs
    - Bandwidth costs
  - Scaling thresholds: At what point does private → public make sense?

## Future Features (Deferred)

See `FUTURE.md` for features planned for later versions:
- Reseeding after each round
- Historical statistics across tournaments
- Multiple concurrent tournaments per server

## Completed Tasks

- [x] Document Google Sheets template structure
- [x] Define Participants tab columns (A-D)
- [x] Define Config tab parameters (1-13)
- [x] Define Regions tab structure
- [x] Define Bracket tab behavior
- [x] Define Results tab columns (1-16)
- [x] Document 29 scenarios in SCENARIOS.md
- [x] Rename Rank tab to Participants tab
- [x] Rename Teams tab to Regions tab
- [x] Create future.txt for deferred features

---

Last updated: 2025-10-22
