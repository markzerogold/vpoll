# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

vPoll is a Discord bot for running tournament-style voting competitions (e.g., "Best Star Trek Character") using:
- **Discord.js v14** for bot functionality and native Discord polls
- **Google Sheets API v4** for tournament data management and results tracking
- **64-participant single elimination** tournament structure with 4 customizable regions

## 📚 Documentation Structure

All project documentation is organized in `/docs` for better context management:

- **Requirements:** @docs/requirements/README.md
- **Technical Specs:** @docs/technical/TECHNICAL_SPEC.md
- **Implementation:** @docs/implementation/TODO.md
- **Future Features:** @docs/reference/FUTURE.md
- **Test Sheet Setup:** @docs/reference/TEST_SHEET_GENERATION.md

Use `@docs/requirements/[section].md` to load specific requirement sections (85% context savings vs full file).

## Google Sheets Template Structure

All tournaments use a Google Sheets template with 5 tabs:

### Participants Tab (A1:D65)
- Column A: Rank (1-64, determines seeding)
- Column B: Participant Name
- Column C: Notes (optional context/description)
- Column D: Reference Link (optional image/wiki URL)

### Regions Tab (A1:E17)
- Column A: Rank
- Columns B-E: 4 region columns (customizable names, 16 participants each)
- Distribution: Ranks 1-4 → Regions 1-4, Ranks 5-8 → Regions 1-4, etc.

### Config Tab
Tournament settings (13+ parameters):
- Tournament Name, Description, Start Date
- Poll Length (hours), Poll Batches, Discord Channel ID
- Auto-advance, Tiebreaker, Results Visibility
- Required Voter Role, Match Preview Posts, Live Vote Updates
- Auto Round Scheduling, Announcements Channel

### Bracket Tab
- Formula-driven visual tournament bracket
- Vote display format: `45 (1) Spock` (votes before seed)
- TRUE/FALSE winner indicators

### Results Tab (16 columns per match, chronological order)
Match ID, Round, Region, P1 Name, P1 Seed, P1 Votes, P2 Name, P2 Seed, P2 Votes, Winner, Discord Poll ID, Poll Start Time, Poll End Time, Total Votes, Tiebreaker, Notes

## Service Account
- Email: vpoll-sheets-access@vpoll-475821.iam.gserviceaccount.com
- Credentials: `keys/vpoll-key.json` (not committed)
- Scope: `https://www.googleapis.com/auth/spreadsheets`

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

## Architecture

### Command System
- Commands are slash commands using `SlashCommandBuilder`
- Each command file in `src/commands/` must export:
  - `data`: A `SlashCommandBuilder` instance
  - `execute`: Async function that takes `ChatInputCommandInteraction`
- Commands are auto-loaded by `src/index.ts` at startup
- After creating/modifying commands, run `npm run deploy-commands` to register with Discord

### Event System
- Event files in `src/events/` export:
  - `name`: Discord event name (from `Events` enum)
  - `once`: Boolean - whether to use `.once()` or `.on()`
  - `execute`: Handler function for the event
- Events are auto-loaded by `src/index.ts` at startup

### Bot Client
- Extended `Client` type includes `commands` collection for command storage
- Uses `GatewayIntentBits.Guilds` intent (add more as needed)
- Central interaction handler in `src/index.ts` routes commands to their execute functions

## Adding New Commands

1. Create new file in `src/commands/` (e.g., `mycommand.ts`)
2. Use existing commands as templates - export `data` and `execute`
3. Build: `npm run build`
4. Deploy: `npm run deploy-commands`
5. Restart bot

## Environment Setup

Copy `.env.example` to `.env` and fill in:
- `DISCORD_TOKEN`: Bot token from Discord Developer Portal → Your App → Bot → Token
- `CLIENT_ID`: Application ID from Discord Developer Portal → Your App → General Information
- `GUILD_ID`: (Optional) Right-click your server → Copy Server ID. Used for faster command deployment during development (guild commands update instantly vs global commands taking up to 1 hour)

## Discord Bot Permissions

Required bot permissions:
- Send Messages
- Embed Links
- Use Slash Commands

Invite URL format:
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=2147485696&scope=bot%20applications.commands
```
