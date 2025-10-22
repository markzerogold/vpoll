# vPoll TODO List

This file tracks all pending tasks and implementation work for the vPoll project.

## Documentation Tasks

### Scenarios Needing Definition/Refinement

- [ ] **Scenario 6**: Discord bot setup - Define required permissions
- [ ] **Scenario 7**: Starting tournament - Define command syntax and parameters
- [ ] **Scenario 8**: First round of polls - Define how poll batches work in detail
- [ ] **Scenario 9**: Advertising links - Define advertising thread template format
- [ ] **Scenario 10**: Poll voting process - Ensure Discord native poll behavior is documented
- [ ] **Scenario 11**: Auto-update results - Document the update flow in detail
- [ ] **Scenario 12**: Subsequent rounds - Clarify differences from first round if any
- [ ] **Scenario 13**: Tournament end update - Define final sheet updates
- [ ] **Scenario 14**: Admin sharing results - Define formatting for results display
- [ ] **Scenario 15**: Winner announcement - Define post format and celebratory link options
- [ ] **Scenario 16**: Users sharing results - Same as scenario 14?
- [ ] **Scenario 17**: Sharing sheet link - Simple command to return the Google Sheets URL

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

See `future.txt` for features planned for later versions:
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
- [x] Document 27 scenarios in vpollscen.txt
- [x] Rename Rank tab to Participants tab
- [x] Rename Teams tab to Regions tab
- [x] Create future.txt for deferred features

---

Last updated: 2025-10-22
