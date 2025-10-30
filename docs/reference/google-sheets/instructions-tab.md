### Tab 6: Instructions

**Range:** A1:A110 (single column, ~100 rows)
**Purpose:** Built-in documentation for tournament creators

**Content Sections:**

**1. Header & Quick Start Checklist**
- Tournament setup guide title
- 6-step Quick Start checklist covering participant entry, config, sharing, tournament creation, monitoring, and announcements

**2. Order of Operations**
- Phase 1: Sheet Preparation (fill participants, configure settings, customize regions, share with service account)
- Phase 2: Tournament Creation (run `/tournament create` command, verify validation)
- Phase 3: Tournament Execution (monitor bracket, handle tiebreakers if needed)
- Phase 4: Completion (announce winner, review results)

**3. vPoll Commands Reference**
- Setup commands: `/tournament template`, `/tournament create`, `/tournament validate`
- Control commands: `/tournament start`, `/tournament pause`, `/tournament resume`, `/tournament cancel`
- Information commands: `/tournament status`, `/tournament bracket`, `/participant info`

**4. Key Config Settings**
- Poll Length: Hours each poll stays open
- Poll Batches: How many polls launch at once
- Auto-advance: Automatically start next round
- Tie Breaker Rule: How to resolve tied matches
- Match Preview Posts: Post participant info before polls

**5. Troubleshooting Section**
- Common errors: "Permission denied" (sharing issue), "Invalid participant count" (must be exactly 64), "Duplicate names" (all names must be unique), "Invalid Poll Length" (must be positive number)
- Solutions and checks for each error

**6. Service Account Information**
- Service account email: `vpoll-sheets-access@vpoll-475821.iam.gserviceaccount.com`
- Required permission: Editor
- Why Editor permission is needed (vPoll writes results back to sheet)

**7. Tips and Best Practices**
- Use clear, unique participant names
- Add notes and reference links for richer tournament experience
- Test with short poll lengths (1 hour) before launching real tournament
- Monitor first few rounds closely
- Keep sheet open during tournament to watch live updates
- Save original template for future tournaments

**Format:**
- Single column (Column A only)
- Plain text with emoji markers (🏆, ✅, ⚠️, etc.)
- Hierarchical structure with headers, subheadings, and bullet points
- Approximately 100-110 rows total
- All content left-aligned

**Example Structure:**
```
🏆 VPOLL TOURNAMENT SETUP GUIDE 🏆

QUICK START CHECKLIST
☐ 1. Fill in Participants tab (64 participants with ranks, names, notes, links)
☐ 2. Fill in Config tab (all required settings)
...

ORDER OF OPERATIONS
Phase 1: Prepare Your Sheet
  1. Fill in Participants tab
  2. Configure settings in Config tab
...

VPOLL COMMANDS
Setup Commands:
  /tournament template - Get the master template
  /tournament create <url> - Create tournament from your sheet
...
```

**User Interaction:**
- Read-only for users (informational only)
- Not accessed by vPoll bot
- Serves as self-contained reference guide
- Positioned as last tab for easy access without interfering with main tournament tabs

---

[← Previous: Deferred Features](./06-scenarios-deferred.md) | [Next: Technical Architecture →](./08-technical-architecture.md)
