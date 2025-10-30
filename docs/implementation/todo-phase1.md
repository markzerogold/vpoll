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

