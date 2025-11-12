# vPoll

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
- `/tournament template` - Get the master template spreadsheet to create tournaments

## Tournament Setup

vPoll uses Google Sheets for tournament management. To create a tournament:

1. **Get the master template:**
   - Run `/tournament template` in Discord, OR
   - Use this link: https://docs.google.com/spreadsheets/d/1Jm2oRCvsHN1ijeos6Bi1wqzN44C2eMJAO3KvkmCaCmo/edit

2. **Make a copy:**
   - Open the template and click **File → Make a copy**
   - Rename your copy (e.g., "Star Trek Character Battle 2025")

3. **Fill in your tournament data:**
   - Participants tab: 64 participants with ranks, names, and optional notes/links
   - Config tab: Tournament settings (name, poll length, etc.)
   - Regions tab: Customize your 4 region names

4. **Share with service account:**
   - Share your copy with: `vpoll-sheets-access@vpoll-475821.iam.gserviceaccount.com`
   - Give **Editor** permission (required for vPoll to update results)

5. **Create tournament in Discord:**
   - Run `/tournament create <your-sheet-url>` (coming soon)

For detailed instructions, see [TEST_SHEET_GENERATION.md](TEST_SHEET_GENERATION.md) or [REQUIREMENTS.md](REQUIREMENTS.md).

## Development

### Build and Run
- `npm run dev` - Run in development mode with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Run compiled bot in production mode

### Code Quality
- `npm run lint` - Check code style
- `npm run lint:fix` - Fix linting issues automatically
- `npm run format` - Format code with Prettier

### Testing and Utilities
- `npm run test-sheets` - Test Google Sheets API connection
- `npm run populate-test-sheet <sheet-id>` - Populate a blank sheet with test tournament data
- `npm run complete-bracket-test <sheet-id>` - **RECOMMENDED**: Complete bracket generation with all formatting (clear, populate, borders, freeze row 1, championship cell)

### Tournament Simulation and Testing
- `npm run simulate-tournament <sheet-id>` - Simulate complete tournament with random winners (all 6 rounds)
- `npm run check-results <sheet-id>` - View all results written to Results tab
- `npm run check-bracket <sheet-id>` - Verify bracket checkbox updates and winner progression

**Purpose:** Test bracket formulas, TRUE/FALSE advancement logic, and Results tab population.

**Complete Bracket Test (NEW - 2025-11-12):**
```bash
npm run complete-bracket-test <sheet-id>
```

This script performs ALL necessary formatting steps in correct order:
1. Clear sheet completely (all 6 tabs)
2. Populate test data (136 formulas, 64 participants, 126 checkboxes)
3. Apply comprehensive borders (461 borders from example sheet)
4. Freeze and bold Bracket row 1
5. Update Championship cell with formula: `=Config!B3&" Champion"` (merged O17:O18)
6. Verify all formatting

**Duration:** ~42 seconds | **Status:** Fully formatted and ready for use

See `COMPLETE_BRACKET_TEST_SUMMARY.md` for full details.

**Simulation Notes:**
- Simulation now clears Results tab before each run (fresh data starting at row 2)
- Fixed Round 2 cell mapping to read from rows 4, 5, 12, 13, 20, 21, 28, 29
- Added Round 2→3 winner copying to rows 8, 16, 24, 32 (for Round 3 formulas)
- Fixed Round 3 checkbox column from G to D (matching formula expectations)
- Added Round 3→4 winner copying logic

See `SIMULATION_FULL_REPORT.md` for detailed analysis of simulation behavior.

### Bracket Formatting Scripts
- `npm run apply-styling` - Apply comprehensive bracket styling (colors, merges, text)
- `npm run enhance-formatting` - Apply formatting enhancements (frozen rows, formulas, auto-sizing)
- `npm run update-region-colors` - Update region cell colors to custom scheme
- `npm run copy-test-borders` - Read and preserve borders from test sheet
- `npm run update-example-borders` - Update example sheet borders from test sheet
- `npm run fix-all-borders` - Copy all borders from example sheet to test sheet

**Note:** Border scripts have known issues. Manual border correction is recommended. See `BORDER_ISSUE_TODO.md`.

## Project Structure

```
vpoll/
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
