# vPoll Bot Commands Reference

**Complete reference of all Discord slash commands**

## 🔧 Currently Implemented

### `/ping`
Test command to verify bot is responsive.

**Usage:** `/ping`

**Response:** "Pong!" with latency

---

### `/poll`
Create a custom Discord poll with question and options.

**Usage:** `/poll`

**Response:** Interactive poll creation interface

---

### `/tournament template`
Get the master Google Sheets template to create tournaments.

**Usage:** `/tournament template`

**Response:** Embed with:
- Template link
- Service account email
- Setup instructions

---

## 📋 Planned Commands (MVP Phase 1)

### `/tournament create <sheet-url>`
Create a new tournament from Google Sheets.

**Parameters:**
- `sheet-url` (required) - Google Sheets URL

**Flow:**
1. Validates sheet structure (5 tabs, 64 participants, config settings)
2. Checks service account has Editor permission
3. Loads tournament data into bot memory
4. Returns confirmation with tournament details

**Example:** `/tournament create https://docs.google.com/spreadsheets/d/abc123/edit`

---

### `/tournament start`
Begin the tournament and launch Round 1 polls.

**Flow:**
1. Displays tournament summary (name, participants, poll config)
2. Asks for confirmation
3. Creates first round polls based on Poll Batches setting
4. Posts confirmation message

**Requirements:** Tournament must be created first with `/tournament create`

---

### `/tournament next-round`
Manually advance to the next round (if auto-advance disabled).

**Flow:**
1. Checks if previous round is complete
2. Shows next round preview (match count, poll batches)
3. Asks for confirmation
4. Launches next round polls

**Error if:** Previous round still has active polls

---

## 📊 Planned Commands (MVP Phase 2 - Admin Controls)

### `/tournament pause`
Temporarily halt tournament progression.

**Effects:**
- Active polls continue and close normally
- Auto-scheduling suspended
- Manual `/tournament next-round` blocked
- Use `/tournament resume` to continue

---

### `/tournament resume`
Resume a paused tournament.

**Effects:**
- Auto-scheduling re-enabled (if configured)
- Manual round advancement allowed again

---

### `/tournament cancel`
Permanently end the tournament.

**Flow:**
1. Asks for confirmation (destructive action)
2. Closes all active polls immediately
3. Processes current results
4. Marks tournament as canceled
5. Posts cancellation announcement

**Note:** Data preserved in Google Sheets (not deleted)

---

### `/tournament results`
View current tournament progress as text summary.

**Response:** Discord embed showing:
- Current round status
- Active/completed matches per region
- Recent results (last 3-5 matches)
- Google Sheets bracket link

**Available to:** All users (not just admins)

---

### `/tournament bracket`
Get the Google Sheets bracket link.

**Response:** Direct link to tournament's Google Sheets

**Available to:** All users (not just admins)

---

### `/tournament winner`
Manually post winner announcement (after tournament completes).

**Flow:**
1. Checks tournament status (must be "completed")
2. Generates winner announcement (same format as automatic)
3. Posts to channel

**Use case:** Re-post winner or post to different channels

---

## 🎯 Planned Commands (MVP Phase 3 - Advanced)

### `/tournament status`
View detailed tournament status information.

**Response:** Embed with:
- Tournament name and description
- Current round (X of 6)
- Active polls count
- Next round timing (if auto-scheduled)
- Pause/resume status

---

### `/tournament validate <sheet-url>`
Validate Google Sheets structure without creating tournament.

**Use case:** Check for errors before tournament creation

**Response:** Validation results (pass/fail with specific errors)

---

## 🚫 Deferred Commands (Post-MVP)

### `/participant info <name>`
Look up participant details and tournament record.

**See:** [FUTURE.md](../reference/FUTURE.md) for deferred features

---

### `/tournament bracket-image`
Generate shareable bracket visualization as image/PDF.

**See:** [FUTURE.md](../reference/FUTURE.md) for deferred features

---

### `/tournament advertise`
Generate promotional post template.

**See:** [FUTURE.md](../reference/FUTURE.md) for deferred features

---

## 🔐 Permission Requirements

### Admin-Only Commands
Require Discord "Manage Server" or "Administrator" permission:
- `/tournament create`
- `/tournament start`
- `/tournament next-round`
- `/tournament pause` / `/tournament resume`
- `/tournament cancel`
- `/tournament winner` (manual post)

### All Users
No special permissions required:
- `/ping`
- `/poll`
- `/tournament template`
- `/tournament results`
- `/tournament bracket`
- `/tournament status`

---

## 📚 Related Documentation

- **Setup Guide:** [setup.md](setup.md)
- **Command Implementation:** [../implementation/todo-phase1.md](../implementation/todo-phase1.md)
- **User Scenarios:** [../requirements/README.md](../requirements/README.md)
- **Future Commands:** [../reference/FUTURE.md](../reference/FUTURE.md)
