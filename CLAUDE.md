# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

vPoll is a Discord bot for running tournament-style voting competitions (e.g., "Best Star Trek Character") using:
- **Discord.js v14** for bot functionality and native Discord polls
- **Google Sheets API v4** for tournament data management and results tracking
- **64-participant single elimination** tournament structure with 4 customizable regions

## 📚 Quick Access Documentation

Load on-demand using `@` syntax for efficient context management:

### Getting Started
- **5-Minute Setup:** @docs/quick-start/setup.md
- **All Bot Commands:** @docs/quick-start/commands.md
- **Dev Workflows:** @docs/quick-start/common-tasks.md

### Requirements & Planning
- **Requirements Index:** @docs/requirements/README.md (85% context savings vs full files)
- **Current Tasks:** @docs/implementation/todo-phase1.md (Core Tournament Flow)
- **Future Features:** @docs/reference/FUTURE.md

### Technical Documentation
- **Architecture Overview:** @docs/technical/architecture/overview.md
- **Specifications Index:** @docs/technical/specifications/README.md
- **Google Sheets Tabs:** @docs/reference/google-sheets/README.md
- **API References:** @docs/technical/api/README.md

### Testing & Reference
- **Test Sheet Generation:** @docs/reference/TEST_SHEET_GENERATION.md
- **Discord/Sheets References:** @docs/reference/REFERENCES.md

## Google Sheets Integration

**Service Account (Required):**
- Email: `vpoll-sheets-access@vpoll-475821.iam.gserviceaccount.com`
- Credentials: `keys/vpoll-key.json` (not committed, in .gitignore)
- Scope: `https://www.googleapis.com/auth/spreadsheets`
- Permission: **Editor** access required on tournament sheets

**Template Structure:** 5 tabs (Participants, Regions, Config, Bracket, Results)
- See @docs/reference/google-sheets/README.md for complete tab specifications
- Master template: https://docs.google.com/spreadsheets/d/1Jm2oRCvsHN1ijeos6Bi1wqzN44C2eMJAO3KvkmCaCmo/edit

## Development Commands

### Setup
```bash
npm install                 # Install dependencies
cp .env.example .env        # Create environment file (then edit with credentials)
```

### Running the Bot
```bash
npm run build               # Compile TypeScript to JavaScript (required before first run)
npm run deploy-commands     # Deploy slash commands to Discord (required after adding/changing commands)
npm run test-sheets         # Test Google Sheets API connection (reads template structure)
npm run dev                 # Run in development mode with hot reload
npm start                   # Run in production mode
```

### Code Quality
```bash
npm run lint                # Check code style with ESLint
npm run lint:fix            # Fix linting issues automatically
npm run format              # Format code with Prettier
```

## Project Structure

```
src/
├── commands/           # Slash command definitions (each file exports data + execute)
│   ├── ping.ts        # Example: simple ping command
│   └── poll.ts        # Create polls with buttons for voting
├── events/            # Discord event handlers
│   └── ready.ts       # Fires when bot successfully connects
├── utils/             # Helper functions and utilities
├── config.ts          # Environment variable loading and validation
├── index.ts           # Main bot entry point - loads commands/events
└── deploy-commands.ts # Script to register commands with Discord API
```

## Architecture Patterns

**Command System:** Slash commands using `SlashCommandBuilder`
- Files in `src/commands/` export `data` (builder) and `execute` (handler)
- Auto-loaded at startup, registered via `npm run deploy-commands`

**Event System:** Discord event handlers
- Files in `src/events/` export `name`, `once`, and `execute`
- Auto-loaded and attached to bot client

**Bot Client:** Extended Discord.js Client with commands collection
- Uses `GatewayIntentBits.Guilds` intent
- Central interaction router in `src/index.ts`

See @docs/technical/architecture/overview.md for complete architecture details.

## Adding New Commands

1. Create `src/commands/mycommand.ts` with `data` and `execute` exports
2. `npm run build` → `npm run deploy-commands` → restart bot

## Environment Variables

Copy `.env.example` to `.env` and configure:
- `DISCORD_TOKEN` - Bot token from Developer Portal
- `CLIENT_ID` - Application ID
- `GUILD_ID` - (Optional) Server ID for faster dev deployment

**Required Bot Permissions:** Send Messages, Embed Links, Use Slash Commands
