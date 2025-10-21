# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

vPoll is a Discord bot for creating and managing polls within Discord servers using discord.js v14.

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
