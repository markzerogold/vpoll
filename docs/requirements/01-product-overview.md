# vPoll Product Requirements - Product Overview

[← Back to Main README](../../README.md) | [View Full Requirements](../../REQUIREMENTS.md)

**Document Section:** 1 of 9
**Last Updated:** 2025-10-22
**Status:** In Development - MVP Phase

---

## Navigation

- **Current:** Product Overview, Problem Statement, Vision & Goals, Solution Overview, User Personas
- **Next:** [Scope & Priorities](./02-scope-priorities.md)
- **See Also:**
  - [User Scenarios - Setup](./03-scenarios-setup.md)
  - [Technical Architecture](./08-technical-architecture.md)

---

## Product Overview

**Product Name:** vPoll
**Product Type:** Discord Bot for Tournament Voting
**Target Users:** Discord server administrators and community managers
**Platform:** Discord (via Discord.js v14)

vPoll is a Discord bot that enables server communities to run tournament-style voting competitions (e.g., "Best Star Trek Character," "Top Pizza Toppings") with automated bracket management, native Discord polls, and Google Sheets integration for transparency and results tracking.

---

## Problem Statement

### Current Pain Points

**Problem:** Discord communities want to run engaging tournament-style voting competitions, but current solutions require extensive manual effort, are error-prone, and lack transparency.

**User Evidence:**
- Server admins manually create 63 individual polls for 64-participant tournaments, taking hours of setup time
- Manual vote counting and bracket updates lead to errors and delays
- External polling tools break Discord's native experience and require users to leave the platform
- Spreadsheet tracking is manual and becomes out-of-sync with actual voting
- No automated progression means tournaments stall between rounds waiting for admin intervention

**Current Workarounds:**
- Manual Discord poll creation with spreadsheet tracking (time-intensive, error-prone)
- External polling websites (poor Discord integration, low participation)
- Reaction-based voting in messages (difficult to count, easy to manipulate)
- Google Forms (requires leaving Discord, lacks real-time engagement)

---

## Vision & Goals

### Product Vision

Enable Discord communities to effortlessly run engaging, transparent tournament-style competitions that bring members together through friendly competition—all without leaving Discord.

### Strategic Goals

1. **Eliminate Manual Overhead:** Automate 95%+ of tournament management tasks (poll creation, results tracking, bracket progression)
2. **Maximize Participation:** Use Discord native polls to keep voting seamless and accessible
3. **Ensure Transparency:** Provide real-time, publicly viewable bracket via Google Sheets
4. **Enable Community Engagement:** Make tournaments easy enough that any server admin can run them regularly

### User Outcomes

**For Server Admins:**
- Set up a complete 64-participant tournament in under 10 minutes
- Launch tournaments that run automatically without manual intervention
- Share transparent, always-current brackets with the community

**For Server Members:**
- Vote in tournaments using familiar Discord poll interface
- View live bracket progress at any time
- Participate in community events without external tools or signups

---

## Solution Overview

### Core Concept

vPoll combines three key technologies to deliver automated tournament management:

1. **Google Sheets** as the tournament source of truth (participant data, configuration, live bracket display)
2. **Discord Native Polls** for seamless voting without leaving Discord
3. **Automated Orchestration** to manage poll creation, result tracking, and bracket progression

### How It Works (High-Level)

```
1. Admin creates Google Sheet from template → Adds 64 participants + config
2. Admin shares sheet with vPoll service account → Sets up permissions
3. Admin runs /tournament create <sheet-url> → vPoll validates and loads tournament
4. Admin runs /tournament start → vPoll launches first round of polls
5. Users vote in Discord polls → Discord tracks votes natively
6. Polls close automatically → vPoll reads results and updates Google Sheet bracket
7. Next round auto-launches → Repeat until champion is crowned
8. vPoll announces winner → Tournament complete with full results in sheet
```

### Key Differentiators

- **No External Tools:** Everything happens in Discord using native polls
- **Transparent Brackets:** Anyone can view live Google Sheets bracket (no bot permissions needed)
- **Automated Progression:** Tournaments run hands-free after initial setup
- **Customizable:** Region names, poll timing, batch sizes, auto-advance all configurable
- **Single Elimination Standard:** 64-participant bracket follows familiar March Madness format

---

## User Personas

vPoll serves three distinct user roles, each with different responsibilities and interaction patterns:

### Persona 1: Server Administrator

**Role:** Discord server administrator who installs and configures vPoll

**Responsibilities:**
- Install vPoll bot on Discord server
- Configure bot permissions (Send Messages, Create Polls, Manage Channels)
- Add vPoll to tournament channel(s)
- May or may not be the Tournament Host

**Technical Level:** Moderate - Comfortable with Discord server settings and bot installation

**Key Actions:**
- Invite vPoll to server via OAuth2 link
- Grant necessary Discord permissions
- Verify bot can post in designated channels

**Pain Points:**
- Ensuring correct permissions are set
- Understanding which channels vPoll needs access to

---

### Persona 2: Tournament Host (TH)

**Role:** Person who creates and manages tournament brackets

**Responsibilities:**
- Create tournament Google Sheet from template
- Fill in 64 participants with rankings, notes, and reference links
- Configure tournament settings (poll length, batches, region names, etc.)
- Share sheet with vPoll service account
- Create tournament in Discord (`/tournament create`)
- Start tournament and manage progression
- Monitor results and troubleshoot issues

**Technical Level:** Moderate - Comfortable with Google Sheets and Discord commands

**Key Actions:**
- Copy master template and customize for their tournament
- Run `/tournament template` to get template link
- Run `/tournament create <sheet-url>` to validate and load tournament
- Run `/tournament start` to begin Round 1
- Run `/tournament next-round` for manual advancement (if auto-advance disabled)
- Run `/tournament pause`, `/tournament resume`, `/tournament cancel` as needed

**Pain Points:**
- Finding and understanding the template structure
- Correctly sharing sheet with service account (Editor permission)
- Understanding configuration options
- Troubleshooting validation errors

**Note:** The TH does NOT need to be a Server Administrator. Any server member can create and run tournaments, as long as:
- They have access to the tournament channel(s) where vPoll will post polls
- They have permission to use slash commands in those channels
- They can create and share Google Sheets
- The server has vPoll bot installed (done by Server Administrator)

---

### Persona 3: Discord User (Voter)

**Role:** Server member who participates in tournaments by voting

**Responsibilities:**
- Vote in tournament polls
- View live bracket in Google Sheets
- Ask vPoll for tournament information
- Follow tournament progression

**Technical Level:** Low - Basic Discord usage

**Key Actions:**
- Click poll options in Discord to vote
- Run `/tournament bracket` to get Google Sheets link
- Run `/tournament status` to see active polls
- Run `/tournament results` to view recent match outcomes
- Run `/participant info <name>` to learn about participants

**Pain Points:**
- Finding the bracket link
- Understanding tournament rules and progression
- Knowing when new polls are available

**Note:** This persona has the least technical burden - voting should be as simple as clicking a poll option.

---

### Persona 4: vPoll Bot (Automated)

**Role:** Automated system that orchestrates tournaments

**Responsibilities:**
- Validate tournament sheets
- Create and post Discord polls at scheduled times
- Track poll results when polls close
- Update Google Sheets with results
- Advance bracket based on winners
- Post announcements and status updates
- Handle tiebreakers

**Technical Level:** N/A (Automated)

**Key Actions:**
- Read tournament data from Google Sheets
- Write results to Google Sheets Results tab
- Update Bracket tab TRUE/FALSE cells for winner advancement
- Post Discord poll messages
- Read Discord poll results
- Calculate and execute tiebreakers
- Post match result announcements

**Note:** This "persona" represents the automated behavior of vPoll. Most scenarios involving vPoll are triggered by other personas' actions or time-based events.

---

[Next: Scope & Priorities →](./02-scope-priorities.md)
