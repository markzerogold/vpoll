# Pollbot

A Discord bot for creating and managing polls in your Discord servers.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Fill in your Discord bot credentials:
     - `DISCORD_TOKEN`: Get from [Discord Developer Portal](https://discord.com/developers/applications)
     - `CLIENT_ID`: Your application's client ID
     - `GUILD_ID`: (Optional) Your server ID for faster command deployment during development

3. **Build the project:**
   ```bash
   npm run build
   ```

4. **Deploy commands to Discord:**
   ```bash
   npm run deploy-commands
   ```

5. **Start the bot:**
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

## Commands

- `/ping` - Test command to check if the bot is responding
- `/poll` - Create a poll with custom question and options

## Development

- `npm run dev` - Run in development mode with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm run lint` - Check code style
- `npm run lint:fix` - Fix linting issues automatically
- `npm run format` - Format code with Prettier

## Project Structure

```
pollbot/
├── src/
│   ├── commands/       # Slash command definitions
│   ├── events/         # Discord event handlers
│   ├── utils/          # Helper functions
│   ├── config.ts       # Configuration and environment variables
│   ├── index.ts        # Bot entry point
│   └── deploy-commands.ts  # Command deployment script
├── dist/               # Compiled JavaScript (generated)
└── package.json
```

## Creating New Commands

1. Create a new file in `src/commands/` (e.g., `mycommand.ts`)
2. Export an object with `data` (SlashCommandBuilder) and `execute` function
3. Build the project: `npm run build`
4. Deploy commands: `npm run deploy-commands`
5. Restart the bot

## License

MIT
