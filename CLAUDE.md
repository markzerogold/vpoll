# vPoll - Claude Code Instructions

**Load documentation on-demand using `@filename.md` syntax to minimize context usage**

## Project Overview

vPoll is a Discord bot for running 64-participant single elimination tournament voting using Discord.js v14 polls and Google Sheets for data management.

**Current Phase:** Bracket formatting complete (Nov 2025) - Ready to begin MVP Discord bot development

## 📋 Where to Start

**New Session?** → Check @PROJECT_STATUS.md first

**Current Tasks:** @ACTION_ITEMS.md

**Project Navigation:** @README.md

## 📚 On-Demand Documentation

### Quick Start (Load when needed)
- **Setup Guide:** @docs/quick-start/setup.md
- **Bot Commands:** @docs/quick-start/commands.md
- **Common Tasks:** @docs/quick-start/common-tasks.md

### Requirements & Planning
- **Requirements Index:** @docs/requirements/README.md
- **MVP Tasks:** @docs/implementation/todo-phase1.md
- **Future Features:** @docs/reference/FUTURE.md

### Technical Specs
- **Architecture:** @docs/technical/architecture/overview.md
- **Google Sheets:** @docs/reference/google-sheets/README.md
- **API Reference:** @docs/technical/api/README.md

### Testing
- **Testing Scripts:** @testing/README.md
- **Test Generation:** @docs/reference/TEST_SHEET_GENERATION.md

### Archived Files
- **Historical Docs:** @backup/README.md

## 🔑 Essential Info

**Google Service Account:**
- Email: `vpoll-sheets-access@vpoll-475821.iam.gserviceaccount.com`
- Key: `keys/vpoll-key.json` (not committed)
- Requires **Editor** permission on tournament sheets

**Master Template:** https://docs.google.com/spreadsheets/d/1Jm2oRCvsHN1ijeos6Bi1wqzN44C2eMJAO3KvkmCaCmo/edit

## ⚡ Quick Commands

```bash
# Development
npm install                      # Install dependencies
npm run build                    # Compile TypeScript
npm run deploy-commands          # Deploy slash commands to Discord
npm run dev                      # Run with hot reload

# Testing
npm run test-sheets              # Test Google Sheets API
npm run complete-bracket-test <sheet-id>  # Full bracket test

# Code Quality
npm run lint                     # Check code style
npm run format                   # Format code
```

## 📁 Project Structure

```
vpoll/
├── src/                         # Core bot code
├── testing/                     # Test scripts, logs, reports (@testing/README.md)
├── docs/                        # Complete documentation (@docs/)
├── backup/                      # Archived files (@backup/README.md)
├── keys/                        # Service account credentials (not committed)
└── [root files]                 # Status, actions, READMEs
```

**Full navigation:** See @README.md for complete file index

## 🏗️ Architecture

- **Commands:** `src/commands/` - Slash command files (`data` + `execute` exports)
- **Events:** `src/events/` - Discord event handlers
- **Services:** `src/services/` - Business logic (sheets, tournament, polls)

**Details:** @docs/technical/architecture/overview.md

## 🔐 Environment Setup

Required `.env` variables:
- `DISCORD_TOKEN` - Bot token
- `CLIENT_ID` - Application ID
- `GUILD_ID` - (Optional) Server ID for dev

**Setup guide:** @docs/quick-start/setup.md
