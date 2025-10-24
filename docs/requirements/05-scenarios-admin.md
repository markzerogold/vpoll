# vPoll Product Requirements - User Scenarios (Admin Controls)

[← Back to Main README](../../README.md) | [View Full Requirements](../../REQUIREMENTS.md)

**Document Section:** 5 of 9
**Last Updated:** 2025-10-22
**Status:** In Development - MVP Phase

---

## Navigation

- **Previous:** [User Scenarios - Core Operations](./04-scenarios-core.md)
- **Current:** User Scenarios - Admin Controls (Scenarios 15-19)
- **Next:** [User Scenarios - Deferred Features](./06-scenarios-deferred.md)

---

#### Scenario 15: Request Tournament Results (Multiple Formats)

**Actor:** Tournament Host (TH) or Discord User (Voter)
**Goal:** View current tournament progress and results

**Available Commands (all users have access):**

**Command 1: Text Summary**
```
/tournament results
```

**Response (Discord Embed):**
```
📊 Star Trek Character Battle - Results

Status: Round 3 of 6 - In Progress

**Current Round:**
✅ ALPHA Region: 4/4 matches complete
✅ BETA Region: 4/4 matches complete
⏳ GAMMA Region: 2/4 matches complete (2 active polls)
⏳ DELTA Region: 1/4 matches complete (3 active polls)

**Recent Results:**
🏆 (1) Spock def. (9) Worf - 78-45
🏆 (3) Data def. (6) Seven of Nine - 56-52
🏆 (2) Picard def. (7) Janeway - 82-61

🔗 Full Bracket: [Google Sheets link]
📅 Next round starts: [Auto-schedule time or "Manual start required"]
```

**Command 2: Google Sheets Link**
```
/tournament bracket
```

**Response:**
```
📊 View the full tournament bracket:
[Google Sheets URL]

All results update in real-time!
```

**Command 3: Bracket Image/PDF** (Deferred to Future)
```
/tournament bracket-image
```

**Response (MVP):**
```
❌ This feature is not yet available.
View the bracket here: [Google Sheets link]
```

**Why This Matters:**
- Democratic access - all users can check results, not just admins
- Multiple formats serve different needs (quick summary vs full bracket)
- No permission restrictions encourage engagement

**Success Criteria:**
- Commands work for both admins and regular users
- Results are accurate and current
- Links are accessible (public view enabled)

---

#### Scenario 16: Manually Post Winner Announcement

**Actor:** Tournament Host (TH)
**Goal:** Re-post winner announcement or post it manually

**Command:**
```
/tournament winner
```

**Flow:**
1. Admin runs command
2. vPoll checks tournament status:
   - If tournament not complete: Error message "Tournament is still in progress (Round X of 6)"
   - If tournament complete: Proceed to step 3
3. vPoll generates same winner announcement as Scenario 14
4. vPoll posts announcement to channel

**Why This Matters:**
- Useful if automatic announcement was missed or needs to be reposted
- Allows admin to share winner in different channels
- Provides fallback if automatic announcement failed

**Success Criteria:**
- Only works after tournament completion
- Generates identical format to automatic announcement
- Can be run multiple times (idempotent)

---

#### Scenario 17: User Access to Results (Clarification)

**Actor:** Discord User (Voter)
**Goal:** Access tournament information without admin permissions

**Context:** This scenario clarifies that regular users have the SAME access to result commands as admins.

**Commands Available to All Users:**
- `/tournament results` - Text summary (Scenario 15)
- `/tournament bracket` - Google Sheets link (Scenario 15)
- `/tournament bracket-image` - Image/PDF (deferred to future)

**Commands Restricted to Admins Only:**
- `/tournament create` - Create new tournament
- `/tournament start` - Start tournament
- `/tournament next-round` - Manually advance rounds
- `/tournament pause` / `/tournament resume` - Pause/resume
- `/tournament cancel` - Cancel tournament
- `/tournament winner` - Manually post winner announcement
- `/tournament advertise` - Generate advertising post

**Permission Check Implementation:**
- Admin commands check for Discord server permissions (Manage Server or Administrator role)
- Result commands have no permission restrictions

**Why This Matters:**
- Encourages engagement when users can freely check results
- Prevents bottleneck of "ask admin for updates"
- Maintains security by restricting control commands

**Success Criteria:**
- Regular users can run result commands without errors
- Regular users get permission denied errors for admin commands

---

#### Scenario 18: Pause and Resume Tournament

**Actor:** Tournament Host (TH)
**Goal:** Temporarily halt tournament progression without canceling

**Pause Command:**
```
/tournament pause
```

**Flow (Pause):**
1. Admin runs command
2. vPoll updates tournament status to "paused"
3. vPoll posts confirmation:
   ```
   ⏸️ Tournament paused.

   - Active polls will continue and complete normally
   - New rounds will NOT auto-start
   - Use /tournament resume to continue
   ```
4. Effects:
   - Active polls continue running and close normally
   - Results are still processed and written to Google Sheets
   - Auto Round Scheduling is suspended (next round will not auto-launch)
   - Manual `/tournament next-round` commands are blocked

**Resume Command:**
```
/tournament resume
```

**Flow (Resume):**
1. Admin runs command
2. vPoll updates tournament status to "active"
3. vPoll posts confirmation:
   ```
   ▶️ Tournament resumed.

   - Auto-scheduling re-enabled (if configured)
   - Manual round advancement available
   - Tournament will continue from current state
   ```
4. Effects:
   - Auto Round Scheduling re-enabled (if configured)
   - Manual `/tournament next-round` commands work again
   - No automatic catch-up (admin must manually start next round if paused between rounds)

**Why This Matters:**
- Allows admin to handle unexpected issues (server events, holidays, etc.)
- Prevents auto-scheduling from launching rounds at inappropriate times
- Maintains tournament state without losing data

**Success Criteria:**
- Pause prevents new rounds from starting
- Active polls complete normally during pause
- Resume restores normal tournament operation

**Edge Case:** If paused during active polls, those polls complete and results are written, but next round won't auto-start even if auto-scheduling is configured.

---

#### Scenario 19: Cancel Tournament

**Actor:** Tournament Host (TH)
**Goal:** Permanently end tournament and prevent further progression

**Command:**
```
/tournament cancel
```

**Flow:**
1. Admin runs command
2. vPoll asks for confirmation:
   ```
   ⚠️ Are you sure you want to CANCEL this tournament?

   This will:
   - Immediately close all active polls
   - Process current results
   - Mark tournament as canceled
   - Prevent any further rounds

   Data will NOT be deleted - results remain in Google Sheets.

   This action cannot be undone.

   [Confirm] [Cancel]
   ```
3. Admin confirms
4. vPoll executes cancellation:
   - Immediately closes all active polls via Discord API
   - Processes results for any polls that had votes
   - Updates tournament status to "canceled" in database
   - Posts cancellation announcement:
     ```
     🛑 Tournament Canceled

     Star Trek Character Battle has been canceled by admin.

     Results through Round 3 are saved here: [Google Sheets link]

     Tournament cannot be resumed.
     ```
5. vPoll updates Google Sheets metadata:
   - Tournament Status: "Canceled"
   - Cancellation Date: Current timestamp
   - Notes: "Canceled by admin"

**Post-Cancellation State:**
- All tournament commands return error: "No active tournament"
- Tournament data remains in Google Sheets and bot database (read-only)
- Admin can create new tournament with `/tournament create`
- Cannot resume canceled tournament (different from pause)

**Why This Matters:**
- Provides clean exit path for tournaments that need to stop
- Preserves data for reference (doesn't delete anything)
- Clear distinction from pause (cancel is permanent)

**Success Criteria:**
- All active polls closed immediately
- Results saved before cancellation
- Tournament cannot be resumed
- New tournament can be created

**Difference from Pause:**
- **Pause:** Temporary, reversible, can resume
- **Cancel:** Permanent, irreversible, must create new tournament

---

[← Previous: Core Operations](./04-scenarios-core.md) | [Next: Deferred Features →](./06-scenarios-deferred.md)
