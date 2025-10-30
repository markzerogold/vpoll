## Decision Log

This section tracks key decisions, trade-offs, and resolved conflicts. All decisions are final unless explicitly revisited.

---

### Decision 1: Results Sharing Commands Structure (2025-10-22)

**Status:** ✅ Resolved
**Related Scenarios:** 15, 16, 17

**Context:**
Original requirements had overlapping scenarios for sharing results:
- Scenario 14: Admin shares results
- Scenario 16: Users request results
- Scenario 26: Bracket image/PDF generation

**Decision:**
Consolidate into **three distinct commands** with different purposes:

1. **`/tournament results`** - Text summary embed (all users)
2. **`/tournament bracket`** - Google Sheets link (all users)
3. **`/tournament bracket-image`** - Image/PDF visualization (deferred to future)

**Rationale:**
- Clear separation of format (text vs link vs image)
- All users have democratic access to results (not just admins)
- Each command serves different use case:
  - `results` - Quick status check without leaving Discord
  - `bracket` - Full bracket detail with formulas and history
  - `bracket-image` - Shareable format outside Discord (future)

**Implementation:**
- Scenarios 15 and 17 merged into combined results access scenario
- Scenario 16 (manual winner announcement) renumbered and clarified as distinct feature
- Scenario 27 (bracket image) deferred to FUTURE.md

---

### Decision 2: Channel Configuration Hierarchy (2025-10-22)

**Status:** ✅ Resolved
**Related Scenarios:** 2, 29, 30

**Context:**
Multiple config options affected where posts appear:
- Discord Channel ID (Scenario 2)
- Announcements Channel ID (Scenario 29)
- Thread Organization (Scenario 30)

**Decision:**
Define clear **channel precedence hierarchy**:

1. **Primary Poll Channel** (Discord Channel ID) - Where all polls and poll results post
2. **Announcements Channel** (Announcements Channel ID) - Where tournament updates post (optional, falls back to primary if not set)
3. **Thread Organization** - Threads are WITHIN primary channel (admin pre-creates for MVP)

**Rationale:**
- Prevents ambiguity about where content posts
- Allows separation of high-engagement (polls) and announcements
- Thread organization enhances primary channel without changing announcement behavior

**Configuration Rules:**
- Discord Channel ID is REQUIRED (tournament cannot run without it)
- Announcements Channel ID is OPTIONAL (defaults to primary channel if blank)
- Thread IDs are OPTIONAL (posts to primary channel if not configured)
- If thread ID provided, polls post to thread within primary channel

**Example Configurations:**

*Simple (everything in one channel):*
```
Discord Channel ID: #tournament-voting
Announcements Channel ID: [blank]
Thread IDs: [blank]
→ Polls, results, and announcements all post to #tournament-voting
```

*Separated announcements:*
```
Discord Channel ID: #tournament-voting
Announcements Channel ID: #general-announcements
Thread IDs: [blank]
→ Polls and results in #tournament-voting
→ Tournament updates in #general-announcements
```

*Thread organization:*
```
Discord Channel ID: #tournament-voting
Round 1 Thread ID: [thread within #tournament-voting]
Round 2 Thread ID: [thread within #tournament-voting]
→ Polls post to round-specific threads within #tournament-voting
→ Announcements still post to #general-announcements (if configured)
```

---

### Decision 3: Round Advancement Behavior (2025-10-22)

**Status:** ✅ Resolved
**Related Scenarios:** 8, 13, 25

**Context:**
Conflicting scenarios about manual vs automatic round advancement

**Decision:**
Define clear **round advancement rules**:

1. **Round 1:** ALWAYS manual (requires `/tournament start` command)
2. **Rounds 2-6:** Automatic if Auto Round Scheduling configured, otherwise manual
3. **Manual override:** Admin can use `/tournament next-round` anytime (cancels pending auto-schedule)
4. **Pause interaction:** Auto-scheduling countdown pauses when tournament paused

**Rationale:**
- First round is intentional act (prevents accidental tournament start)
- Auto-scheduling enables hands-free tournaments for rounds 2+
- Manual override provides admin control when needed
- Clear interaction rules prevent race conditions

**Configuration:**
```
Auto Round Scheduling | [blank/empty]
→ Manual advancement only (admin runs /tournament next-round)

Auto Round Scheduling | immediate
→ Next round launches immediately when previous completes

Auto Round Scheduling | 3 days
→ Next round launches 3 days after previous completes
```

**Round Completion Safeguards:**
- Round is "complete" only when:
  - ✅ All polls closed
  - ✅ All results written to Google Sheets
  - ✅ No pending result processing
- Prevents race conditions where next round starts before previous finishes
- Manual `/tournament next-round` blocked until previous round complete

---

### Decision 4: Required Voter Role Implementation (2025-10-22)

**Status:** ✅ Resolved (Feature Deferred to Future)
**Related Scenarios:** 20

**Context:**
Discord native polls cannot restrict voting to specific roles (API limitation)

**Decision:**
**MVP:** NO config option for Required Voter Role
- Config setting removed from template (was confusing since it wasn't enforced)
- Anyone in channel can vote (Discord native poll behavior)
- Tournament Hosts use Discord's channel permissions as workaround

**Manual Workaround (Documented in Scenario 20):**
1. Create private channel visible only to users with specific role
2. Post tournament polls in that restricted channel
3. vPoll respects existing channel permissions

**Future Options for Automated Enforcement:**
1. **Channel Permissions Approach:** vPoll automatically restricts channel to specific role
2. **Custom Voting Approach:** Replace Discord native polls with button/reaction voting, validate roles
3. **Post-Vote Validation:** Check voter roles after poll closes, invalidate unauthorized votes (complex, poor UX)

**Rationale:**
- Config setting that does nothing creates poor UX and user confusion
- MVP prioritizes core tournament flow over access control automation
- Discord's built-in channel permissions provide adequate workaround
- Future feature can add automated channel restriction or custom voting

**Future Decision Point:**
If user demand is high, evaluate custom voting implementation (see FUTURE.md)

---

### Decision 5: Tournament End Update Flow (2025-10-22)

**Status:** ✅ Resolved
**Related Scenarios:** 12, 14, 16

**Context:**
Ambiguity about what updates occur at tournament end vs. ongoing updates

**Decision:**
Define clear **tournament completion sequence**:

1. **Ongoing (Scenario 12):** Every poll result triggers:
   - Bracket tab update (TRUE/FALSE)
   - Results tab append (new row)
   - Discord confirmation message

2. **Final Poll Closes (Scenario 14):** Championship match triggers:
   - Standard result processing (same as #1)
   - Tournament status update to "completed"
   - Winner announcement post (automatic)
   - Optional: Celebratory GIF (if configured)
   - Optional: Google Sheets metadata update (completion timestamp, winner)

3. **Manual Winner Post (Scenario 16):** Admin can run `/tournament winner` anytime after completion:
   - Re-posts winner announcement
   - Identical format to automatic announcement
   - Useful if automatic announcement missed or needs sharing to other channels

**Rationale:**
- Continuous updates (12) provide real-time bracket progression
- Final completion (14) is celebratory event with special announcement
- Manual winner post (16) is utility for re-sharing, not part of core flow
- Clear distinction prevents redundant updates

**Implementation Notes:**
- Tournament status field added to state: "created" | "active" | "paused" | "completed" | "canceled"
- Winner announcement only triggers once (on status transition to "completed")
- Manual winner post checks status (must be "completed")

---

### Decision 6: Advertising vs Announcements Distinction (2025-10-22)

**Status:** ✅ Resolved
**Related Scenarios:** 10, 29

**Context:**
Confusion between "advertising" posts (Scenario 10) and announcements channel (Scenario 29)

**Decision:**
Define clear **distinction**:

**Advertising (Scenario 10):**
- **Purpose:** Promote tournament to recruit participants BEFORE/AT start
- **Trigger:** Manual command `/tournament advertise`
- **Content:** Tournament overview, participation details, bracket link, voting channel link
- **Delivery:** Ephemeral response (only admin sees) - admin copies/pastes where desired
- **Use Case:** Post in multiple channels/servers to recruit voters

**Announcements (Scenario 29):**
- **Purpose:** Update tournament status DURING tournament
- **Trigger:** Automatic (tournament start, round completion, round start, winner)
- **Content:** Tournament progress updates, round status, results
- **Delivery:** Posted to Announcements Channel ID (or primary channel if not configured)
- **Use Case:** Keep community informed of progress in announcement channel

**Rationale:**
- Advertising is one-time recruitment (manual, pre-tournament)
- Announcements are ongoing updates (automatic, during tournament)
- Different purposes, different triggers, different delivery methods

**Example Flow:**
1. Admin creates tournament
2. Admin runs `/tournament advertise` → Copies generated message
3. Admin pastes advertising message to #general, #off-topic, other servers, etc.
4. Tournament starts → Automatic announcement posts to Announcements Channel
5. Rounds progress → Automatic announcements continue
6. Tournament completes → Final winner announcement posts

---

### Decision 7: Sheet Link Terminology (2025-10-22)

**Status:** ✅ Resolved
**Related Scenarios:** 17

**Context:**
Original Scenario 17 said "users can ask for template link" - ambiguous (master template vs tournament sheet)

**Decision:**
**Rename and clarify:**
- Command: `/tournament bracket` (not "template")
- Returns: Google Sheets URL for CURRENT TOURNAMENT's sheet (not master template)
- Purpose: Access live bracket with results

**Rationale:**
- "Template" implies master blank template (confusing)
- "Bracket" clearly means current tournament's bracket
- Consistent with other commands (`/tournament results`, `/tournament bracket-image`)

**Implementation:**
- Merged into Scenario 15 (results commands)
- Removed separate scenario 17
- Updated command naming throughout

---

### Decision 8: Match Preview Post Timing (2025-10-22)

**Status:** ✅ Resolved
**Related Scenarios:** 21

**Context:**
Original scenario said "before each poll" but didn't specify timing

**Decision:**
**Fixed timing for MVP:**
- Preview posts 60 seconds before poll creation
- For poll batches: All previews post → 60 second wait → All polls post
- Not configurable in MVP

**Rationale:**
- 60 seconds provides time to read without excessive delay
- Fixed timing simplifies implementation
- Batched behavior prevents long delays between polls in same batch

**Future Enhancement:**
Could add configurable delay in Config tab (e.g., "Match Preview Delay | 120")

**Implementation:**
```
For each match in batch:
  1. Post preview message

Wait 60 seconds

For each match in batch:
  2. Create poll
```

---

### Decision 9: MVP Multi-Tournament Support (2025-10-22)

**Status:** ✅ Resolved
**Related Scenarios:** 27, 28

**Context:**
User notifications (Scenario 28) implied multiple concurrent tournaments

**Decision:**
**MVP assumes single tournament per server:**
- Only one active tournament at a time per Discord server
- Users cannot "subscribe to tournaments" (plural) - subscription meaningless
- DM notifications deferred to future (see FUTURE.md)

**Rationale:**
- Private bot targets single server with single tournament use case
- Multi-tournament support requires database, complex state management
- Simplifies MVP architecture significantly
- Can add later without breaking existing functionality

**MVP Behavior:**
- `/tournament create` fails if tournament already active: "Tournament already in progress. Cancel or complete current tournament first."
- After tournament completes/cancels, admin can create new tournament

**Future (Public Bot):**
- Multi-tournament support per server
- Cross-server tournament tracking
- User notification subscriptions make sense with multiple tournaments
- See FUTURE.md for architecture planning

---

### Decision 10: Config Tab Organization (2025-10-22)

**Status:** ✅ Resolved
**Related Scenarios:** 2, 20-22, 25, 29-30

**Context:**
13+ config settings made Config tab complex and hard to validate

**Decision:**
**Organize config into logical groups:**

**Required Settings (8):**
- Tournament Name
- Tournament Description
- Start Date
- Poll Length
- Poll Batches
- Discord Channel ID
- Auto-advance
- Tie Breaker Rule

**Optional Settings (2):**
- Auto Round Scheduling
- Celebratory GIF

**Validation Behavior:**
- Required settings: Must be non-empty and valid
- Optional settings: Can be blank (uses default behavior)
- Invalid optional settings: Warning (not error) - uses default

**Rationale:**
- Clear distinction between must-have and nice-to-have
- Reduces setup friction (only 8 required vs 16 total)
- Optional settings have sensible defaults
- Validation focuses on critical errors first

**Template Presentation:**
Config tab includes section headers (visual grouping):
```
--- REQUIRED TOURNAMENT SETTINGS ---
Tournament Name |
Tournament Description |
...

--- POLL CONFIGURATION ---
Poll Length | 24
Poll Batches | full round
...

--- OPTIONAL FEATURES ---
Match Preview Posts | false
Auto Round Scheduling |
...
```

---

### Decisions Summary

| # | Topic | Status | Impact |
|---|-------|--------|--------|
| 1 | Results Sharing Commands | ✅ Resolved | Scenarios 15, 16, 17 consolidated |
| 2 | Channel Configuration Hierarchy | ✅ Resolved | Clear precedence: primary → announcements → threads |
| 3 | Round Advancement Behavior | ✅ Resolved | Round 1 manual, rounds 2+ auto if configured |
| 4 | Required Voter Role | ⚠️ Config Only | Not enforced in MVP (Discord API limitation) |
| 5 | Tournament End Update Flow | ✅ Resolved | Continuous updates + final celebration |
| 6 | Advertising vs Announcements | ✅ Resolved | Advertising = recruitment, Announcements = updates |
| 7 | Sheet Link Terminology | ✅ Resolved | "Bracket" not "template" |
| 8 | Match Preview Timing | ✅ Resolved | Fixed 60-second delay |
| 9 | MVP Multi-Tournament Support | ✅ Resolved | Single tournament per server (MVP) |
| 10 | Config Tab Organization | ✅ Resolved | 8 required + 8 optional settings |

---

[← Previous: Technical Architecture](./08-technical-architecture.md) | [Back to Main README](../../README.md)

---

**End of Requirements Documentation**

For future features and enhancements, see [FUTURE.md](../../FUTURE.md)
