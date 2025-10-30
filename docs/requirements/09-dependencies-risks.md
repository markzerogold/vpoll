# vPoll Product Requirements - Dependencies, Risks & Decision Log

[← Back to Main README](../../README.md) | [View Full Requirements](../../REQUIREMENTS.md)

**Document Section:** 9 of 9 (Final)
**Last Updated:** 2025-10-22
**Status:** In Development - MVP Phase

---

## Navigation

- **Previous:** [Technical Architecture](./08-technical-architecture.md)
- **Current:** Dependencies & Risks, Decision Log
- **Complete Index:**
  1. [Product Overview](./01-product-overview.md)
  2. [Scope & Priorities](./02-scope-priorities.md)
  3. [User Scenarios - Setup](./03-scenarios-setup.md)
  4. [User Scenarios - Core](./04-scenarios-core.md)
  5. [User Scenarios - Admin](./05-scenarios-admin.md)
  6. [User Scenarios - Deferred](./06-scenarios-deferred.md)
  7. [Google Sheets Spec](./07-google-sheets-spec.md)
  8. [Technical Architecture](./08-technical-architecture.md)
  9. **Dependencies & Risks** (Current)

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

**Risk:** Users want to restrict voting to specific roles but MVP doesn't support this
**Risk Level:** 🟡 Medium
**Impact:** User disappointment, tournaments with unwanted voters

**Mitigation:**
- Clear documentation in Scenario 20 explaining the manual workaround
- Instructions tab explains Discord channel permission alternative
- Future feature documented in FUTURE.md for transparency
- Tournament Hosts can use Discord's built-in channel permissions to control access

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

