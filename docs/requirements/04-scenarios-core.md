# vPoll Product Requirements - User Scenarios (Core Operations)

[← Back to Main README](../../README.md) | [View Full Requirements](../../REQUIREMENTS.md)

**Document Section:** 4 of 9
**Last Updated:** 2025-10-22
**Status:** In Development - MVP Phase

---

## Navigation

- **Previous:** [User Scenarios - Setup](./03-scenarios-setup.md)
- **Current:** User Scenarios - Core Operations (Scenarios 12-14)
- **Next:** [User Scenarios - Admin Controls](./05-scenarios-admin.md)

---

#### Scenario 12: Automated Result Tracking and Sheet Updates

**Actor:** vPoll (Automated)
**Goal:** Monitor polls, determine winners, update Google Sheets bracket

**Trigger:** Discord poll closes (after Poll Length duration)

**Flow:**
1. **Primary Method:** vPoll listens for Discord poll close event
   - Event fires immediately when poll closes
   - vPoll retrieves final vote counts from Discord poll
2. **Fallback Method:** vPoll checks all active poll statuses every 10 minutes
   - Catches any missed poll close events
   - Ensures no results are lost

3. **Result Processing:**
   - vPoll reads final vote counts for both participants
   - Determines winner:
     - If votes differ: Higher vote count wins
     - If tied: Trigger dice roll tiebreaker (see Scenario 24)

4. **Google Sheets Updates (in order):**

   **A. Bracket Tab Update:**
   - Find winner's cell in bracket
   - Write TRUE in winner's advancement cell
   - Write FALSE in loser's advancement cell
   - Bracket formulas automatically propagate winner to next round

   **B. Results Tab Update (append new row):**
   - Column 1: Match ID (e.g., "R1-ALPHA-M1")
   - Column 2: Round (e.g., "Round 1")
   - Column 3: Region (e.g., "ALPHA")
   - Column 4: Participant 1 Name
   - Column 5: Participant 1 Seed
   - Column 6: Participant 1 Votes
   - Column 7: Participant 2 Name
   - Column 8: Participant 2 Seed
   - Column 9: Participant 2 Votes
   - Column 10: Winner (participant name)
   - Column 11: Discord Poll ID
   - Column 12: Poll Start Time (ISO timestamp)
   - Column 13: Poll End Time (ISO timestamp)
   - Column 14: Total Votes (sum of both)
   - Column 15: Tiebreaker (dice roll result if tie, blank otherwise)
   - Column 16: Notes (blank, available for admin comments)

5. **Discord Confirmation:**
   - vPoll posts result message in channel:
     ```
     ✅ Round 1 - ALPHA - Match 1 Complete
     🏆 Winner: (1) Spock - 45 votes
     (16) Nog - 23 votes
     Total participation: 68 voters
     ```

**Why This Matters:** Automatic result tracking eliminates manual vote counting. Google Sheets updates provide real-time bracket progression visible to all.

**Success Criteria:**
- All poll results captured within 10 minutes of close
- Google Sheets updates complete successfully
- Bracket advancement formulas work correctly
- Zero manual intervention required

**Error Handling:**
- If Google Sheets API fails: Retry 3 times with exponential backoff
- If still fails: Post error message in channel and log for admin review
- Poll results stored in bot database as backup

---

#### Scenario 13: Round Advancement (Manual and Automatic)

**Actor:** vPoll (Automated) or Server Admin (Manual)
**Goal:** Launch next round of polls after previous round completes

**Round Completion Criteria:**
A round is considered "complete" when:
- ✅ All polls in that round have closed
- ✅ All results have been written to Google Sheets
- ✅ No pending result processing tasks remain

**Automatic Round Advancement (if enabled):**

**Trigger:** Round completion + Auto Round Scheduling delay elapsed

**Flow (Auto-advance):**
1. Last poll of round closes and results are written (Scenario 12)
2. vPoll checks Auto Round Scheduling config:
   - **"immediate"** → Launch next round immediately (no delay)
   - **"3 days"** → Wait 3 days, then launch next round
   - **blank/disabled** → Do nothing (manual advancement required)
3. If auto-scheduling is enabled:
   - vPoll waits for specified delay (if not immediate)
   - Posts announcement (if Announcements Channel configured):
     ```
     🎊 Round 1 is complete! Round 2 begins in 3 days.
     Check the bracket: [Google Sheets link]
     ```
   - After delay, automatically launches next round polls (same as Scenario 9)

**Manual Round Advancement:**

**Command:**
```
/tournament next-round
```

**Flow (Manual):**
1. Admin runs command
2. vPoll checks if previous round is complete:
   - If incomplete: Error message listing which polls are still pending
     ```
     ❌ Cannot start next round. Round 1 still has active polls:
     - ALPHA Match 3 (closes in 2 hours)
     - BETA Match 7 (closes in 5 hours)
     ```
   - If complete: Proceed to step 3
3. vPoll displays next round preview and asks for confirmation:
   - Round number (e.g., "Round 2")
   - Number of matches (e.g., 16)
   - Poll batches that will be created
4. Admin confirms
5. vPoll launches next round polls (same as Scenario 9)

**Race Condition Prevention:**
- Tournament state tracking prevents simultaneous manual and auto-advancement
- If admin runs `/tournament next-round` while auto-scheduling is counting down, vPoll cancels auto-scheduling and processes manual command
- If admin runs command while results are still being written, returns error (see step 2)

**Why This Matters:**
- Auto-scheduling enables hands-free tournaments
- Manual advancement gives admins control over pacing
- Safeguards prevent broken brackets from incomplete rounds

**Success Criteria:**
- Next round only launches when previous round fully complete
- No duplicate polls created
- Bracket progression is correct

---

#### Scenario 14: Tournament Completion and Winner Announcement

**Actor:** vPoll (Automated)
**Goal:** Announce tournament winner when final poll closes

**Trigger:** Final poll of Round 6 (Championship) closes

**Flow:**
1. vPoll detects final poll closed (only 1 poll in Round 6)
2. vPoll processes final result (same as Scenario 12)
3. vPoll updates tournament status to "completed" in database
4. vPoll retrieves winner data:
   - Winner name from final poll result
   - Final vote count
   - Winner's Reference Link from Participants tab Column D (if provided)
5. vPoll checks "Celebratory GIF" config setting
6. vPoll posts winner announcement in tournament channel:

**Announcement Format (with GIF enabled):**
```
🎉🏆 TOURNAMENT COMPLETE! 🏆🎉

**Star Trek Character Battle Winner:**
👑 (1) Spock 👑

**Championship Match:**
(1) Spock - 127 votes
(2) Picard - 98 votes

Total voters: 225

[Winner's Reference Link - if available]
[Random celebratory GIF from Discord/Tenor]

View full bracket: [Google Sheets link]

Thanks to everyone who participated! 🖖
```

**Announcement Format (GIF disabled):**
```
🏆 Tournament Complete! 🏆

Winner: (1) Spock
Final Match: Spock (127) vs Picard (98)

View full results: [Google Sheets link]
```

7. vPoll updates Google Sheets metadata (if Config tab has designated cells):
   - Tournament Status: "Completed"
   - Completion Date: Current timestamp
   - Winner: Winner name

**Why This Matters:** Automatic winner announcement provides satisfying conclusion to tournament. Reference link (image/wiki) gives visual celebration of winner.

**Success Criteria:**
- Winner announcement posts within 1 minute of final poll close
- Correct winner identified and all data accurate
- Google Sheets status updated

---

[← Previous: Setup Scenarios](./03-scenarios-setup.md) | [Next: Admin Controls →](./05-scenarios-admin.md)
