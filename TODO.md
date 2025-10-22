# vPoll TODO List

This file tracks all pending tasks and implementation work for the vPoll project.

**Last Updated:** 2025-10-22
**Status:** Requirements finalized, implementation planning phase

---

## Critical Gaps & Questions from REQUIREMENTS.md Review

### Architecture & Design Questions

- [ ] **CRITICAL: State Management Strategy**
  - REQUIREMENTS.md Section 9 defines `TournamentState` interface as in-memory
  - Question: How do we persist state across bot restarts?
  - Options:
    - Accept risk for MVP (document that bot restart loses active tournament state)
    - Add simple JSON file persistence
    - Add database (PostgreSQL, SQLite, MongoDB)
  - Decision needed before implementation starts
  - Related: Auto-scheduling persistence (REQUIREMENTS.md Section 11 - Dependencies & Risks)

- [ ] **CRITICAL: Tournament Command Structure**
  - REQUIREMENTS.md shows `/tournament create`, `/tournament start`, `/tournament next-round`, etc.
  - Current code has `/poll` and `/ping` only
  - Question: Should all tournament commands be subcommands of `/tournament`? (e.g., `/tournament create` vs `/create-tournament`)
  - Discord.js supports both patterns - which is better UX?
  - Need to define complete command structure before implementation

- [ ] **CRITICAL: Google Sheets Write Strategy**
  - REQUIREMENTS.md Section 9 shows bracket updates write TRUE/FALSE to specific cells
  - Question: How do we determine WHICH cells to write to?
  - Need bracket cell mapping logic (match → cell location)
  - Is this encoded in formulas? Hardcoded? Dynamic?
  - Current SheetsService has generic writeRange() but no bracket-specific logic

- [ ] **CRITICAL: Poll Event Handling**
  - REQUIREMENTS.md Section 9 shows poll close event handling
  - Current code: No poll event listeners implemented
  - Question: What Discord.js events do we listen to?
    - `messagePollVoteAdd`? `messagePollVoteRemove`?
    - Are there poll close events?
  - Need to research Discord.js v14 poll event API
  - Fallback: 10-minute polling strategy (REQUIREMENTS.md mentions this)

### Missing Implementation Components

- [ ] **Define TypeScript Interfaces**
  - REQUIREMENTS.md Section 9 has comprehensive TypeScript interfaces
  - Need to create: `src/types/tournament.ts` with all interfaces
  - Interfaces needed:
    - `TournamentState`, `TournamentConfig`, `Region`, `Participant`
    - `ActivePoll`, `MatchParticipant`, `ScheduledTask`, `MatchResult`

- [ ] **Create Service Layer**
  - Current: `SheetsService` exists but is generic
  - Need tournament-specific services:
    - `src/services/tournament.ts` - Tournament state management
    - `src/services/poll.ts` - Poll creation and tracking
    - `src/services/validation.ts` - Google Sheets validation (Scenario 23)
    - `src/services/bracket.ts` - Bracket logic and cell mapping

- [ ] **Error Handling & Retry Logic**
  - REQUIREMENTS.md Section 9 shows retry logic for Google Sheets
  - Need to implement: `safeSheetUpdate()` with exponential backoff
  - Discord rate limit handling
  - Permission validation before operations

### Testing Framework (from removed Success Metrics)

- [ ] **Adapt Success Metrics into Testing Requirements**
  - Removed Section 4 (Success Metrics) should become test cases:
    - Setup completion: Can admin create tournament successfully?
    - Tournament completion: Does tournament progress through all 6 rounds?
    - Poll participation: Do polls get created correctly?
    - Setup time: Is validation fast enough (<30 seconds)?
    - Sheet validation pass rate: Are error messages helpful?
    - Poll creation error rate: Do polls create without failures?
    - Round advancement time: Does auto-advance work within 2 minutes?

- [ ] **Create Test Plan Document**
  - Unit tests for each service
  - Integration tests for end-to-end scenarios 1-30
  - Mock Discord API (avoid live Discord during testing)
  - Mock Google Sheets API (avoid quota usage during testing)
  - Test data: Sample tournament sheets for different states

### Documentation Alignment

- [ ] **Update README.md**
  - Current README describes basic poll bot, not tournament bot
  - Add tournament features overview
  - Add setup instructions for Google Sheets service account
  - Add links to REQUIREMENTS.md for detailed specs
  - Add example tournament workflow

- [ ] **Create DEPLOYMENT.md**
  - Private bot deployment instructions (toggle in Discord portal)
  - Environment variables needed
  - Google Sheets service account setup
  - Bot permissions checklist
  - Troubleshooting guide

- [ ] **Create TESTING.md**
  - How to run test suite
  - How to create test tournament sheets
  - Manual testing checklist for each scenario
  - Performance testing guidelines

---

## Documentation Tasks (RESOLVED)

### ✅ Completed - All scenario conflicts resolved in REQUIREMENTS.md Decision Log

- [x] **RESOLVED: Results Sharing Overlap** (Decision 1) - Three distinct commands: `/tournament results`, `/tournament bracket`, `/tournament bracket-image`
- [x] **RESOLVED: Channel Config Hierarchy** (Decision 2) - Primary channel → Announcements channel → Threads
- [x] **RESOLVED: Auto vs Manual Rounds** (Decision 3) - Round 1 manual, rounds 2+ auto if configured
- [x] **RESOLVED: Role Restrictions** (Decision 4) - Config only, not enforced in MVP
- [x] **RESOLVED: Tournament End Flow** (Decision 5) - Continuous updates + final celebration
- [x] **RESOLVED: Advertising vs Announcements** (Decision 6) - Recruitment vs updates
- [x] **RESOLVED: Sheet Link Wording** (Decision 7) - "Bracket" not "template"
- [x] **RESOLVED: Match Preview Timing** (Decision 8) - Fixed 60-second delay
- [x] **RESOLVED: Multi-Tournament Support** (Decision 9) - Single tournament per server (MVP)
- [x] **RESOLVED: Config Tab Organization** (Decision 10) - 8 required + 8 optional settings

---

## Implementation Tasks

### Phase 1: Core Tournament Flow (MUST HAVE - MVP)

**Priority:** Critical for basic functionality

#### Google Sheets Integration
- [ ] Create `src/services/validation.ts` - Implement Scenario 23 validation
  - Validate tab structure (5 required tabs)
  - Validate Participants tab (64 unique participants, ranks 1-64)
  - Validate Config tab (8 required settings)
  - Validate Regions tab (4 unique region names)
  - Check service account permissions
  - Check Discord channel access
- [ ] Update `SheetsService` to handle new tab names
  - Update test-sheets.ts to read "Participants" (not "Rank")
  - Update test-sheets.ts to read "Regions" (not "Teams")
- [ ] Implement Results tab writing (16 columns per match)
- [ ] Implement Bracket tab TRUE/FALSE winner updates
  - Need bracket cell mapping logic (match ID → cell location)
  - Research: Are cell locations in template? Hardcoded? Formula-driven?

#### Tournament Commands (Phase 1 MVP)
- [ ] `/tournament create <sheet-url>` - Scenario 7
  - Parse Google Sheets URL to extract spreadsheet ID
  - Call validation service (Scenario 23)
  - Load tournament config and participants
  - Store tournament state (in-memory for MVP)
  - Return confirmation with tournament details
- [ ] `/tournament start` - Scenario 8
  - Display tournament summary
  - Confirm with admin
  - Launch first round polls (call poll service)
- [ ] `/tournament next-round` - Scenario 13 (manual advancement)
  - Check if previous round complete
  - Display next round preview
  - Confirm with admin
  - Launch next round polls

#### Poll Management
- [ ] Create `src/services/poll.ts`
  - `createPoll()` - Create Discord native poll (Scenario 9)
  - `createPollBatch()` - Handle batching (full round, one per region, etc.)
  - `monitorPolls()` - 10-minute fallback polling
  - `processPollResults()` - Scenario 12 result processing
- [ ] Research Discord.js v14 poll events
  - What events exist for poll close?
  - How to listen for poll completion?
  - Fallback strategy if events missed
- [ ] Implement poll creation with batching (Scenario 9)
  - Parse "Poll Batches" config (full round, one per region, sequential, etc.)
  - Create appropriate number of polls
  - Track active polls in tournament state

#### Result Tracking & Bracket Updates
- [ ] Implement automatic result processing (Scenario 12)
  - Listen for poll close events (primary method)
  - Fallback: Check active polls every 10 minutes
  - Determine winner from vote counts
  - Handle ties → dice roll (Scenario 24)
  - Update Bracket tab (TRUE/FALSE)
  - Append row to Results tab (16 columns)
  - Post confirmation message in Discord
- [ ] Implement tiebreaker dice roll (Scenario 24)
  - Generate random 1-100 for each participant
  - Re-roll if tied
  - Post announcement message
  - Log in Results tab Tiebreaker column

#### Winner Announcement
- [ ] Implement tournament completion detection (Scenario 14)
  - Detect when Round 6 (Championship) poll closes
  - Update tournament status to "completed"
  - Retrieve winner's Reference Link (if available)
  - Check Celebratory GIF config
  - Post winner announcement with all details

### Phase 2: Admin Controls (MUST HAVE - MVP)

**Priority:** Essential for tournament management

- [ ] `/tournament pause` - Scenario 18
  - Update tournament status to "paused"
  - Suspend auto-scheduling (if enabled)
  - Block manual next-round commands
  - Active polls continue and complete normally
- [ ] `/tournament resume` - Scenario 18
  - Update tournament status to "active"
  - Re-enable auto-scheduling (if configured)
  - Allow manual commands again
- [ ] `/tournament cancel` - Scenario 19
  - Confirm with admin (destructive action)
  - Close all active polls immediately
  - Process current results
  - Update status to "canceled"
  - Post cancellation announcement
  - Preserve data (don't delete)
- [ ] `/tournament results` - Scenario 15 (text summary)
  - Display current round status
  - Show active/completed matches per region
  - Show recent results (last 3-5 matches)
  - Link to Google Sheets
- [ ] `/tournament bracket` - Scenario 15 (sheets link)
  - Return Google Sheets URL
  - Simple command, just post link
- [ ] `/tournament winner` - Scenario 16 (manual winner post)
  - Check tournament status (must be "completed")
  - Generate same announcement as Scenario 14
  - Allow re-posting winner

### Phase 3: Advanced Configuration (SHOULD HAVE - MVP)

**Priority:** Nice to have, adds polish

- [ ] Auto round scheduling (Scenario 25)
  - Parse "Auto Round Scheduling" config (immediate, X days, X hours)
  - Schedule next round launch after delay
  - Post announcement when round completes
  - Post announcement when next round starts
  - Handle manual override (cancel scheduled launch)
  - Handle pause interaction (suspend countdown)
  - **NOTE:** Scheduling lost on bot restart (documented risk)
- [ ] Match preview posts (Scenario 21)
  - Read Notes (Column C) and Reference Link (Column D) from Participants
  - Post preview 60 seconds before poll
  - For batches: All previews → wait 60s → all polls
- [ ] Announcements channel (Scenario 29)
  - Read "Announcements Channel ID" from Config
  - Post tournament/round announcements to separate channel
  - Fall back to primary channel if not configured
- [ ] Advertising post generation (Scenario 10)
  - Read "Advertising Template" from Config
  - Replace placeholders ({tournament_name}, {description}, etc.)
  - Post ephemeral message (admin only)
  - Admin copies/pastes to desired channels

### Phase 4: Deferred Features (OUT OF SCOPE - MVP)

**See FUTURE.md for details**

- [ ] Multi-tournament concurrent support (Decision 9)
- [ ] Required voter role enforcement (Decision 4 - not technically feasible with native polls)
- [ ] Live vote count updates (Scenario 22 - high API cost)
- [ ] User DM notifications (Scenario 28 - requires database)
- [ ] Bracket image/PDF generation (Scenario 27 - rendering complexity)
- [ ] Participant reference link lookup (Scenario 26 - low priority)
- [ ] Thread/channel auto-creation (Scenario 30 - admin pre-creates for MVP)

---

## Testing & Quality Assurance

### Test Infrastructure Setup

- [ ] **Choose testing framework**
  - Options: Jest (most popular), Vitest (fast), Mocha+Chai
  - Decision: Jest recommended for Discord.js projects
  - Install: `npm install --save-dev jest @types/jest ts-jest`
  - Configure: Create `jest.config.js`

- [ ] **Create test utilities**
  - Mock Discord client and interactions
  - Mock Google Sheets API responses
  - Test data: Sample tournament configurations
  - Test data: Sample participant lists (64 participants)
  - Test helpers: Create tournament state objects

### Unit Tests (Per Service)

- [ ] `SheetsService` tests
  - Test readRange() with valid/invalid spreadsheet IDs
  - Test writeRange() with various data formats
  - Test batchReadRanges() with multiple ranges
  - Test error handling and retries
  - Mock Google Sheets API to avoid quota usage

- [ ] `ValidationService` tests (Scenario 23)
  - Test with valid Google Sheets → passes validation
  - Test with missing tabs → returns specific errors
  - Test with invalid participants (duplicates, wrong ranks) → errors
  - Test with missing config values → errors
  - Test with invalid Discord channel → errors
  - Test permission checking (service account access)

- [ ] `PollService` tests
  - Test createPoll() with different match configurations
  - Test createPollBatch() with all batching options
  - Test processPollResults() with winner determination
  - Test tie detection and dice roll tiebreaker
  - Mock Discord API to avoid live Discord calls

- [ ] `TournamentService` tests
  - Test tournament state management
  - Test round progression logic
  - Test pause/resume functionality
  - Test status transitions (created → active → completed)

### Integration Tests (End-to-End Scenarios)

- [ ] Scenario 1-7: Setup flow
  - Test: Create tournament from valid Google Sheet
  - Expected: Tournament loaded, config validated, participants distributed
- [ ] Scenario 8: Start tournament
  - Test: Launch first round of polls
  - Expected: 32 polls created (or per batching config)
- [ ] Scenario 12-13: Result tracking and advancement
  - Test: Poll closes → results processed → bracket updated → next round
  - Expected: Winner determined, sheets updated, ready for next round
- [ ] Scenario 14: Tournament completion
  - Test: Final poll closes → winner announced
  - Expected: Correct winner, announcement posted, status = completed
- [ ] Scenario 18: Pause/resume
  - Test: Pause during active round → resume
  - Expected: Auto-scheduling suspended, polls continue, can resume
- [ ] Scenario 24: Tiebreaker
  - Test: Poll ends in exact tie
  - Expected: Dice roll executed, winner determined, logged in results

### Performance & Load Tests

- [ ] Google Sheets API quota monitoring
  - Test: Track API calls during full tournament (63 matches)
  - Expected: <200 requests total (well under 10,000 daily limit)
- [ ] Discord rate limit handling
  - Test: Create 32 polls rapidly (full round batch)
  - Expected: No rate limit errors, 1-second delays between polls
- [ ] Round advancement timing
  - Test: Time from last poll close to next round start
  - Expected: <2 minutes (per removed Success Metrics)

### Edge Case Tests

- [ ] Missing Google Sheets permissions
- [ ] Invalid Google Sheets URL format
- [ ] Bot kicked from Discord server mid-tournament
- [ ] Discord channel deleted mid-tournament
- [ ] Bot restart during active tournament
- [ ] Multiple admins trying to control tournament simultaneously
- [ ] Empty Participants tab
- [ ] Non-numeric Poll Length config
- [ ] Invalid batching option

---

## Logging Framework

### Logging Setup

- [ ] **Choose logging library**
  - Options: winston (most popular), pino (fastest), bunyan
  - Decision: winston recommended for Discord bots
  - Install: `npm install winston`
  - Create `src/utils/logger.ts`

- [ ] **Define log levels and usage**
  - **error**: Failures that prevent operation (API errors, invalid state)
  - **warn**: Concerning but recoverable (missed poll event, retry triggered)
  - **info**: Normal operations (tournament created, round started, poll closed)
  - **debug**: Detailed operation info (poll IDs, sheet ranges, state changes)
  - **trace**: Very verbose (every API call, every function entry/exit)

- [ ] **Define what to log**
  - ✅ Tournament lifecycle events (create, start, pause, resume, cancel, complete)
  - ✅ Google Sheets API calls (method, range, success/failure)
  - ✅ Discord API calls (command executed, poll created, message posted)
  - ✅ Poll events (created, closed, results processed)
  - ✅ Errors with full context (stack trace, request data, tournament state)
  - ✅ Performance metrics (API latency, processing time)
  - ❌ Do NOT log: User IDs (privacy), API keys/tokens (security)

- [ ] **Configure log output**
  - Development: Console output with colors (winston.transports.Console)
  - Production: File output with rotation (winston.transports.File)
  - Format: JSON for structured logging and easy parsing
  - Include: timestamp, level, message, metadata (tournamentId, guildId, etc.)

## Deployment & Scaling Planning

- [ ] **Learn GitHub for deployment and collaboration**
  - Understand GitHub basics: repositories, branches, commits, pull requests
  - Learn how to push local git repository to GitHub
  - Understand GitHub Actions for CI/CD (automated testing, deployment)
  - Learn about GitHub releases and versioning
  - Understand how to collaborate with others (if project becomes public)
  - Explore GitHub hosting options for bot deployment:
    - GitHub Actions for scheduled tasks
    - Integration with cloud hosting providers
    - Secrets management for API keys and tokens
  - Review GitHub's free tier vs paid features
  - Learn GitHub Pages for documentation hosting (if needed)

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
- [x] Document 29 scenarios in REQUIREMENTS.md (User Scenarios section)
- [x] Rename Rank tab to Participants tab
- [x] Rename Teams tab to Regions tab
- [x] Create future.txt for deferred features

---

Last updated: 2025-10-22
