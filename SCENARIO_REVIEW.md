# vPoll Scenario Conflicts and Overlaps Review

This document identifies overlapping, conflicting, or unclear scenarios that need review and reconciliation.

**Note:** All scenarios are now documented in REQS.md under the "User Scenarios" section.

## Overlapping Scenarios

### Overlap Group 1: Results Sharing (Scenarios 14, 16, 26)
**Issue:** Multiple scenarios cover sharing/displaying results with unclear distinctions

- **Scenario 14**: Admin can share current results in Discord channel (need to define formatting)
- **Scenario 16**: Users can also ask vPoll to share current results
- **Scenario 26**: Admin or users can request bracket image/PDF showing current results

**Questions to Resolve:**
- Are scenarios 14 and 16 the same feature with different permissions?
- Is scenario 26 a different output format (image/PDF) vs. text output (14/16)?
- Should we consolidate into one scenario with options: text summary, detailed text, or bracket image?
- What's the difference between "share results" and "bracket image"?

**Recommendation:**
- Consolidate 14 & 16 into one scenario: "Users can request current results (text format)"
- Keep 26 separate: "Users can request bracket visualization (image/PDF format)"
- Define clear output formats for each

---

### Overlap Group 2: Channel Configuration (Scenarios 2, 28, 29)
**Issue:** Channel configuration appears in multiple places with potential conflicts

- **Scenario 2**: Config tab sets tournament rules (includes Discord Channel ID - from REQS.md)
- **Scenario 28**: Config tab specifies optional Announcements Channel ID
- **Scenario 29**: Config tab configures channel/thread organization

**Questions to Resolve:**
- How do scenarios 2 (Discord Channel ID) and 29 (channel/thread organization) interact?
- If scenario 29 says "run in specific thread", does that override scenario 2's channel setting?
- Can you have polls in a thread (scenario 29) AND announcements in a separate channel (scenario 28)?
- What's the hierarchy: channel → thread → individual poll threads?

**Recommendation:**
- Clarify in scenario 2: "Discord Channel ID" is the PRIMARY poll posting location
- Scenario 28: Announcements go to DIFFERENT channel (or same if not specified)
- Scenario 29: Thread organization is WITHIN the primary channel from scenario 2
- Need clear config precedence rules

---

### Overlap Group 3: Automatic vs Manual Round Advancement (Scenarios 8, 12, 24)
**Issue:** Conflicting scenarios about who/what starts rounds

- **Scenario 8**: Discord admin starts the first round of polls
- **Scenario 12**: Discord admin launches the next round of polls
- **Scenario 24**: Auto-scheduling automatically starts next round after delay

**Questions to Resolve:**
- If auto-scheduling (24) is enabled, do scenarios 8 & 12 still apply?
- Does auto-scheduling only apply to rounds 2+, while round 1 is always manual (scenario 8)?
- What happens if admin tries to manually start a round when auto-scheduling is on?
- Can admin override auto-scheduling for specific rounds?

**Recommendation:**
- Scenario 8: First round is ALWAYS manual (required to start tournament)
- Scenario 24: Auto-scheduling applies to rounds 2+ only
- Scenario 12: Manual launch is available even with auto-scheduling (as override)
- Add config: "Auto-scheduling" with options: "off", "after round 1", "all rounds except 1"

---

### Overlap Group 4: Tournament End Updates (Scenarios 11, 13, 15)
**Issue:** Multiple scenarios trigger at tournament end with unclear order

- **Scenario 11**: vPoll updates Google Sheet when polls complete (ongoing throughout tournament)
- **Scenario 13**: When tournament ends, vPoll updates results tab
- **Scenario 15**: At tournament end, admin can generate winner post

**Questions to Resolve:**
- Isn't scenario 13 redundant if scenario 11 already updates the sheet for every poll?
- Does scenario 13 mean "final summary" update vs ongoing updates (11)?
- What's the sequence: Poll completes → Sheet update (11) → Tournament ends → Final update (13) → Winner post (15)?
- What additional data does scenario 13 add that 11 doesn't already write?

**Recommendation:**
- Scenario 11: Continuous updates for each completed match
- Scenario 13: Final tournament metadata update (end timestamp, final status, etc.)
- Scenario 15: User-triggered action after tournament completion
- Clarify what "final update" in scenario 13 actually adds

---

## Conflicting Scenarios

### Conflict 1: Role Restrictions vs Public Voting (Scenario 19)
**Issue:** Role restrictions may conflict with public voting concept

- **Scenario 19**: Config can require specific Discord role to vote

**Questions to Resolve:**
- Does this break Discord's native poll behavior (anyone in channel can vote)?
- Can we actually restrict who sees/votes in Discord native polls by role?
- Or do we need to validate after-the-fact and reject votes from non-permitted users?
- If we can't technically restrict Discord polls by role, is this scenario viable?

**Recommendation:**
- Research Discord Poll API limitations
- May need to change to: "Bot validates voters have role and warns if unauthorized voting detected"
- Or: "Use Discord channel permissions to restrict who can see poll channel" (different approach)

---

### Conflict 2: Private Bot vs Multi-Tournament Features (Scenario 27)
**Issue:** User notification subscriptions imply multi-tournament support

- **Scenario 27**: Users subscribe to tournament notifications (plural "tournaments they're following")

**Questions to Resolve:**
- Private bot (MVP) supports one server with one tournament at a time
- Does scenario 27 imply multiple concurrent tournaments?
- Or does "tournaments they're following" mean historical/sequential tournaments?
- Is this feature only for public bot (future)?

**Recommendation:**
- For MVP (private bot): Scenario 27 is "subscribe to THIS tournament's notifications"
- For public bot: Scenario 27 is "subscribe to specific tournaments across multiple servers"
- Flag as future feature unless simplified for single-tournament use

---

## Unclear/Ambiguous Scenarios

### Ambiguity 1: Scenario 9 - Advertising Link
**Issue:** "Advertising link" is vague

- **Scenario 9**: Admin can generate "advertising" link to share tournament in other threads/channels

**Questions to Resolve:**
- Is this a Discord invite link? A message template? A tournament info post?
- What's in the advertising content? Tournament name, participants, schedule?
- Is it a shareable URL or a formatted message?
- How is it different from scenario 28 (announcements)?

**Recommendation:**
- Rename to "Tournament Promotion Post/Template"
- Define exact content: tournament name, description, how to participate, link to polls channel
- Clarify difference from announcements (28): advertising is for recruiting, announcements are updates

---

### Ambiguity 2: Scenario 17 - Sheet Link
**Issue:** What exactly is being shared?

- **Scenario 17**: Users can ask for "the link to the sheet template"

**Questions to Resolve:**
- Is it the template (master) or the tournament's specific sheet copy?
- Should say "tournament sheet link" not "template link"
- Template implies the master blank template, not the active tournament

**Recommendation:**
- Change to: "Users can request the Google Sheets link for the current tournament's bracket"
- Clarify it's the active tournament sheet, not the blank template

---

### Ambiguity 3: Scenario 20 - Match Preview Posts
**Issue:** When exactly are previews posted?

- **Scenario 20**: Preview posted "before each poll starts"

**Questions to Resolve:**
- How long before? Immediately before? Hours before?
- If poll batches launch multiple polls at once, are previews batched too?
- Do previews get their own posts or embedded in poll post?

**Recommendation:**
- Clarify timing: "Immediately before poll is created" or "X minutes before poll starts"
- Clarify format: Separate preview post, then poll post

---

## Config Tab Organization Issues

**Issue:** Many scenarios add config options without clear organization

Scenarios adding config options: 2, 19, 20, 21, 24, 28, 29

**Questions to Resolve:**
- Are all these config options in Config tab, or some in code/defaults?
- Is Config tab getting too complex with 13+ settings?
- Should we group configs: "Tournament Settings", "Poll Settings", "Notification Settings", "Channel Settings"?
- Which configs are required vs optional vs have defaults?

**Recommendation:**
- Create config groups/sections in the Config tab
- Define required vs optional for each setting
- Consider config validation checklist (scenario 22)

---

## Summary of Action Items

### High Priority - Must Resolve Before Implementation
1. **Consolidate Results Sharing** (scenarios 14, 16, 26) - Define clear distinctions
2. **Channel Configuration Hierarchy** (scenarios 2, 28, 29) - Define precedence rules
3. **Auto vs Manual Round Advancement** (scenarios 8, 12, 24) - Define interaction rules
4. **Role Restriction Feasibility** (scenario 19) - Research Discord API capabilities

### Medium Priority - Clarify Before MVP
5. **Tournament End Flow** (scenarios 11, 13, 15) - Define sequence and purpose
6. **Advertising vs Announcements** (scenarios 9, 28) - Define clear differences
7. **Sheet Link Terminology** (scenario 17) - Fix ambiguous wording
8. **Config Tab Organization** - Group and structure all config options

### Low Priority - Can Defer
9. **Multi-Tournament Support** (scenario 27) - Simplify for MVP or defer to public bot
10. **Preview Post Timing** (scenario 20) - Define exact timing and format

---

Last updated: 2025-10-22
