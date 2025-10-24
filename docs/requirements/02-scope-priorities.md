# vPoll Product Requirements - Scope & Priorities

[← Back to Main README](../../README.md) | [View Full Requirements](../../REQUIREMENTS.md)

**Document Section:** 2 of 9
**Last Updated:** 2025-10-22
**Status:** In Development - MVP Phase

---

## Navigation

- **Previous:** [Product Overview](./01-product-overview.md)
- **Current:** Scope & Priorities, Key Trade-offs & Decisions
- **Next:** [User Scenarios - Setup](./03-scenarios-setup.md)

---

## Scope & Priorities

### In Scope - MVP (Private Bot)

**Phase 1: Core Tournament Flow** ✅ Must Have
- Tournament creation from Google Sheets template (Scenarios 1-7)
- Automated poll creation with configurable batching (Scenario 9)
- Poll result tracking and Google Sheets updates (Scenario 12)
- Bracket progression through all 6 rounds (Scenario 13)
- Winner announcement (Scenario 14)
- Basic validation and error handling (Scenario 23)
- Tiebreaker dice rolls (Scenario 24)

**Phase 2: Admin Controls** ✅ Must Have
- Manual round advancement commands (Scenario 13)
- Tournament pause/resume (Scenario 18)
- Tournament cancellation (Scenario 19)
- Results display commands (Scenarios 15, 17)

**Phase 3: Advanced Configuration** ⚠️ Should Have
- Auto round scheduling (Scenario 25)
- Thread/channel organization - manual setup (Scenario 30)

### Out of Scope - MVP

**Deferred to Future Versions** (See FUTURE.md)
- ❌ Multi-tournament concurrent support
- ❌ Public bot deployment (multi-server architecture)
- ❌ Required voter role enforcement (Scenario 20 - use Discord channel permissions instead)
- ❌ Live vote count updates (Scenario 22 - Discord polls show live counts natively)
- ❌ Match preview posts (Scenario 21 - voters can view Google Sheets for participant info)
- ❌ Participant info lookup command (Scenario 26 - voters can view Google Sheets directly)
- ❌ User DM notifications (Scenario 28)
- ❌ Bracket image/PDF generation (Scenario 27)
- ❌ Announcements channel (Scenario 29 - all posts go to primary poll channel)
- ❌ Automatic thread/channel creation (Scenario 30 - admin must pre-create, vPoll uses existing)
- ❌ Advertising template generation (Scenario 10 - hosts manually write promotional posts)
- ❌ Custom bracket sizes (only 64-participant supported)
- ❌ Double elimination or other tournament formats

### Non-Goals

- Mobile app or web dashboard
- Monetization or paid features
- Integration with other platforms (Slack, Teams, etc.)
- Real-time streaming or esports integration
- User accounts or persistent profiles
- Tournament matchmaking or participant recruitment

---

## Key Trade-offs & Decisions

### Major Architectural Decisions

#### Decision: Google Sheets vs Database for Tournament Data

**Chosen:** Google Sheets
**Rationale:**
- **Transparency:** Anyone can view live bracket without bot permissions or special access
- **User Control:** Admins own their data and can modify it directly if needed
- **Familiar Interface:** Most users already understand spreadsheets
- **No Backend Required:** Reduces infrastructure costs and complexity for MVP

**Trade-offs Accepted:**
- API quota limits (10,000 requests/day - sufficient for MVP single tournament)
- Slower read/write performance vs database
- Requires service account permission management
- Formula-based bracket display requires template maintenance

#### Decision: Discord Native Polls vs Custom Voting

**Chosen:** Discord Native Polls
**Rationale:**
- **Familiar UX:** Users already know how to use Discord polls
- **Built-in Features:** Auto-close timing, vote counting, results display all handled by Discord
- **Reliability:** Discord manages the voting infrastructure
- **No Database:** Don't need to store/track individual votes

**Trade-offs Accepted:**
- Cannot enforce role-based voting restrictions (anyone in channel can vote)
- Cannot hide results until poll closes (Discord shows live counts)
- Limited customization of poll appearance
- No detailed analytics (voter identities, vote timing, etc.)

#### Decision: Private Bot First (Not Public)

**Chosen:** Private Bot (MVP)
**Rationale:**
- **Simpler Architecture:** Single server = no multi-server state management
- **Lower Costs:** No scaling infrastructure needed
- **Faster Development:** Can hardcode single-server assumptions
- **Target Audience:** Designed for personal use with friends first

**Trade-offs Accepted:**
- Cannot be discovered in bot directories
- Only bot owner can invite to servers
- Limited user base for feedback and testing
- Must refactor for public deployment later

---

[← Previous: Product Overview](./01-product-overview.md) | [Next: User Scenarios - Setup →](./03-scenarios-setup.md)
