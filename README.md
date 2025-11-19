# vPoll

**Discord bot for running 64-participant single elimination tournament voting**

Uses Discord.js v14 native polls + Google Sheets for tournament data management and bracket visualization.

**Repository:** https://github.com/markzerogold/vpoll

---

## 🚀 New Session? Start Here

**Project Status & Tasks:** @PROJECT_STATUS.md
**Latest Test Report:** @testing/reports/COMPLETE_BRACKET_TEST_SUMMARY.md

---

## 📁 Project Structure

```
vpoll/
├── .claude/                     # Claude Code configuration
│   └── agents/                  # Specialized subagents for development
│       ├── discord-bot-dev.md   # Discord.js v14 & poll expertise
│       └── sheets-integration.md # Google Sheets API v4 expertise
│
├── src/                         # Core Discord bot code
│   ├── commands/                # Slash command definitions
│   ├── events/                  # Discord event handlers
│   └── services/                # Business logic (sheets, polls, etc.)
│
├── requirements/                # High-level requirement documents
│   ├── REQUIREMENTS.md          # Index to all requirements
│   ├── BRACKET_POPULATION_FLOW.md  # Bracket behavior specification
│   └── WINNER_COPY_REMOVAL.md   # Formula-driven architecture decision
│
├── testing/                     # All testing materials
│   ├── scripts/active/          # Current testing scripts (9 files)
│   ├── logs/                    # Test execution logs (not committed)
│   ├── reports/                 # Simulation and analysis reports (6 files)
│   └── README.md                # Testing documentation
│
├── docs/                        # Complete project documentation
│   ├── quick-start/             # Setup, commands, common tasks
│   ├── requirements/            # Detailed product requirements (9 sections)
│   ├── implementation/          # MVP task lists
│   ├── technical/               # Architecture, specs, API docs
│   └── reference/               # Sheets structure, future features
│
├── backup/                      # Archived historical files
│   ├── historical-docs/         # Old markdown files (20 files)
│   └── deprecated-scripts/      # Old testing scripts (60 files)
│   └── README.md                # Why files are archived
│
├── keys/                        # Google service account credentials
│   └── vpoll-key.json           # (Not committed to git)
│
└── [Root Files]                 # Status and configuration
    ├── PROJECT_STATUS.md        # Current phase, tasks, completed work, known issues
    ├── CLAUDE.md                # Instructions for Claude Code
    └── README.md                # This file
```

**Detailed Navigation:** See each folder's README.md for complete index

---

## ⚡ Quick Commands

### Development
```bash
npm install                      # Install dependencies
npm run build                    # Compile TypeScript
npm run deploy-commands          # Deploy slash commands to Discord
npm run dev                      # Run with hot reload
npm start                        # Run in production
```

### Testing
```bash
npm run test-sheets              # Test Google Sheets API connection
npm run complete-bracket-test <sheet-id>  # Full bracket generation (~42s)
npm run simulate-tournament <sheet-id>    # Simulate 6-round tournament
npm run check-results <sheet-id>          # View Results tab
```

**All testing scripts:** See @testing/README.md
**Sheet population & formatting:** See @testing/SHEET_POPULATION_INDEX.md

### Code Quality
```bash
npm run lint                     # Check code style
npm run lint:fix                 # Auto-fix issues
npm run format                   # Format with Prettier
```

---

## 📚 Documentation

**Quick Start:**
- 5-Minute Setup: @docs/quick-start/setup.md
- Bot Commands: @docs/quick-start/commands.md
- Dev Workflows: @docs/quick-start/common-tasks.md

**Requirements & Planning:**
- High-Level Requirements: @requirements/REQUIREMENTS.md
- Detailed Requirements: @docs/requirements/README.md
- MVP Tasks: @docs/implementation/todo-phase1.md
- Future Features: @docs/reference/FUTURE.md

**Technical:**
- Architecture: @docs/technical/architecture/overview.md
- Google Sheets Spec: @docs/reference/google-sheets/README.md
- API References: @docs/technical/api/README.md

**Testing:**
- Testing Guide: @testing/README.md
- Test Sheet Setup: @docs/reference/TEST_SHEET_GENERATION.md

**Archived:**
- Historical Files: @backup/README.md

---

## 🔑 Google Sheets Integration

**Service Account (Required):**
- Email: `vpoll-sheets-access@vpoll-475821.iam.gserviceaccount.com`
- Key File: `keys/vpoll-key.json` (not committed)
- Required Permission: **Editor** on tournament sheets

**Master Template:**
https://docs.google.com/spreadsheets/d/1Jm2oRCvsHN1ijeos6Bi1wqzN44C2eMJAO3KvkmCaCmo/edit

**Get Template in Discord:** `/tournament template`

**Detailed Setup:** @docs/quick-start/setup.md

---

## 🧪 Testing Workflow

**Generate Test Bracket:**
```bash
npm run complete-bracket-test 1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w
```

**What it does:**
1. Clears sheet completely
2. Populates 64 participants with test data
3. Applies 461 comprehensive borders
4. Freezes and bolds Bracket row 1
5. Updates Championship cell with formula

**Duration:** ~42 seconds | **Result:** Fully formatted bracket ready for simulation

**Run Simulation:**
```bash
npm run simulate-tournament 1ako1JgzwNxjG7TfkfwdJDfw6fvr1gL9Svrr8mvBCO_w
```

**Detailed Guide:** @testing/README.md

---

## 🤖 Claude Code Agents

**Specialized AI subagents assist with development tasks**

vPoll includes two expert subagents that automatically help with implementation:

### discord-bot-dev
**Expertise:** Discord.js v14, slash commands, native polls, event handlers

**Auto-invoked for:**
- Implementing `/tournament` commands
- Creating and monitoring Discord polls (no close event, 60s polling)
- Setting up interaction responses and error handling
- Permission validation

**Key knowledge:**
- Poll duration is in HOURS (not minutes)
- No poll close event exists (requires polling)
- vPoll's command structure and requirements

### sheets-integration
**Expertise:** Google Sheets API v4, service accounts, formula debugging

**Auto-invoked for:**
- Sheet validation during tournament creation
- Batch operations for efficiency
- Writing to Results tab (16 columns per match)
- Updating bracket TRUE/FALSE cells
- Formula-driven architecture (vPoll never overwrites formulas)

**Key knowledge:**
- 6-tab template structure (Bracket, Results, Participants, Regions, Config, Instructions)
- Named ranges for bracket advancement
- Match ID format (R1-ALPHA-M1, etc.)

### How They Work

**Automatic:** Claude Code invokes agents based on task context
```
"Implement /tournament create" → discord-bot-dev auto-invoked
"Add sheet validation" → sheets-integration auto-invoked
```

**Explicit:** Request a specific agent
```
"Use discord-bot-dev to implement poll monitoring"
"Use sheets-integration to debug bracket formulas"
```

**View agents:** Run `/agents` command in Claude Code

**Location:** `.claude/agents/` (version controlled)

---

## 🔐 Environment Setup

**Required `.env` variables:**
```env
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_application_id
GUILD_ID=your_server_id_optional
```

**Full Setup Guide:** @docs/quick-start/setup.md

---

## 📝 License

MIT
