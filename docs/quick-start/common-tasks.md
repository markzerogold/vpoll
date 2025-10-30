# Common Development Tasks

**Frequent workflow patterns for vPoll development**

## 🔧 Adding a New Bot Command

### 1. Create Command File

```bash
# Create new command file
touch src/commands/mycommand.ts
```

### 2. Implement Command

```typescript
// src/commands/mycommand.ts
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mycommand')
    .setDescription('Description of what this command does')
    .addStringOption(option =>
      option
        .setName('parameter')
        .setDescription('Parameter description')
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const paramValue = interaction.options.getString('parameter');

    await interaction.reply({
      content: `You said: ${paramValue}`,
      ephemeral: true, // Only visible to command user
    });
  },
};
```

### 3. Build & Deploy

```bash
npm run build                # Compile TypeScript
npm run deploy-commands      # Register with Discord
# Restart bot (Ctrl+C then npm start, or use npm run dev for auto-reload)
```

### 4. Test in Discord

Type `/mycommand` in your server and verify it appears.

---

## 📝 Working with Google Sheets

### Read Data from Sheet

```typescript
// src/services/sheets.ts or your service file
import { SheetsService } from '../services/sheets';

const sheetsService = new SheetsService();
const spreadsheetId = '1Jm2oRCvsHN1ijeos6Bi1wqzN44C2eMJAO3KvkmCaCmo';

// Read single range
const participants = await sheetsService.readRange(
  spreadsheetId,
  'Participants!A1:D65'
);

// Read multiple ranges at once (more efficient)
const data = await sheetsService.batchReadRanges(
  spreadsheetId,
  ['Participants!A1:D65', 'Config!A:B', 'Regions!A1:E17']
);

console.log(participants); // 2D array of values
```

### Write Data to Sheet

```typescript
// Update specific range
await sheetsService.writeRange(
  spreadsheetId,
  'Results!A2:P2',
  [['R1-ALPHA-M1', 'Round 1', 'ALPHA', 'Spock', 1, 45, 'Kirk', 16, 23, 'Spock', '123456', '2025-01-01T12:00:00Z', '2025-01-02T12:00:00Z', 68, '', '']]
);

// Write TRUE/FALSE for bracket advancement
await sheetsService.writeRange(
  spreadsheetId,
  'Bracket!C10',
  [[true]]  // Winner advances
);
```

### Get Sheet Metadata

```typescript
// Get tab names, sheet properties
const metadata = await sheetsService.getSpreadsheetMetadata(spreadsheetId);

console.log(metadata.sheets?.map(s => s.properties?.title));
// Output: ['Bracket', 'Participants', 'Regions', 'Config', 'Results']
```

---

## 🧪 Testing Your Changes

### Test Google Sheets Connection

```bash
npm run test-sheets
```

Reads from master template to verify:
- Service account authentication
- API permissions
- Sheet structure

### Apply Bracket Borders

```bash
npm run apply-borders
```

Applies proper border formatting to test bracket sheet:
- Copies border patterns from example sheet
- Handles row offset for bottom bracket half
- Adds region name borders
- Autosizes columns and disables text wrapping

**See:** [BRACKET_BORDER_UPDATES.md](../../BRACKET_BORDER_UPDATES.md) for implementation details

### Manual Testing Workflow

1. **Start dev mode** (auto-reload on changes):
   ```bash
   npm run dev
   ```

2. **Make code changes** in `src/`

3. **Test in Discord** - bot auto-restarts on save

4. **Check console** for errors/logs

### Add Debug Logging

```typescript
console.log('[DEBUG] Variable value:', myVariable);
console.error('[ERROR] Something failed:', error);
```

---

## 🎨 Code Style & Quality

### Run Linter

```bash
npm run lint          # Check for style issues
npm run lint:fix      # Auto-fix issues
```

### Format Code

```bash
npm run format        # Format with Prettier
```

### Pre-Commit Checklist

- [ ] `npm run lint` - No errors
- [ ] `npm run build` - Compiles successfully
- [ ] Manual testing in Discord
- [ ] Console shows no errors

---

## 🔄 Working with Discord Interactions

### Reply to Commands

```typescript
// Simple reply
await interaction.reply('Hello!');

// Ephemeral reply (only user sees)
await interaction.reply({
  content: 'This is private!',
  ephemeral: true,
});

// Reply with embed
const embed = new EmbedBuilder()
  .setColor(0x0099FF)
  .setTitle('Tournament Status')
  .setDescription('Round 1 in progress')
  .addFields(
    { name: 'Active Polls', value: '32' },
    { name: 'Completed', value: '0' }
  );

await interaction.reply({ embeds: [embed] });
```

### Deferred Replies (for slow operations)

```typescript
// Defer immediately (prevents "Interaction failed" error)
await interaction.deferReply();

// Do slow work (Google Sheets API calls, etc.)
const data = await loadTournamentData();

// Send actual reply
await interaction.editReply({
  content: 'Tournament created!',
  embeds: [tournamentEmbed],
});
```

### Follow-up Messages

```typescript
await interaction.reply('First message');

// Send additional messages
await interaction.followUp('Second message');
await interaction.followUp({ content: 'Third message', ephemeral: true });
```

---

## 📦 Adding New Dependencies

### Install Package

```bash
npm install package-name
npm install --save-dev @types/package-name  # If TypeScript types needed
```

### Update package.json

Automatically updated by `npm install`.

### Import in Code

```typescript
import { Something } from 'package-name';
```

### Rebuild

```bash
npm run build
```

---

## 🗂️ Project Structure Patterns

### Where to Put New Files

| Type | Location | Example |
|------|----------|---------|
| Bot commands | `src/commands/` | `tournament.ts` |
| Event handlers | `src/events/` | `ready.ts` |
| Business logic | `src/services/` | `sheets.ts`, `tournament.ts` |
| Type definitions | `src/types/` | `tournament.ts` (interfaces) |
| Utilities | `src/utils/` | `logger.ts`, `validator.ts` |
| Scripts | `src/` (root) | `deploy-commands.ts`, `test-sheets.ts` |

### Naming Conventions

- **Commands:** Lowercase, descriptive (`tournament.ts`, `poll.ts`)
- **Services:** PascalCase class names (`SheetsService`, `TournamentService`)
- **Types/Interfaces:** PascalCase (`TournamentState`, `MatchResult`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_PARTICIPANTS`, `API_SCOPES`)

---

## 🐛 Debugging Common Issues

### Bot not responding to commands

**Check:**
1. Bot is online (green dot in Discord)
2. Commands deployed: `npm run deploy-commands`
3. Bot has permissions in channel
4. Console shows no errors

**Fix:**
```bash
npm run build
npm run deploy-commands
npm start
```

---

### TypeScript compilation errors

**Check:**
1. All imports have correct paths
2. Types match function signatures
3. Required properties on interfaces

**Fix:**
```bash
npm run build  # See specific errors
```

Common fixes:
- Add `!` for non-null assertion: `client.user!.tag`
- Add type annotation: `const value: string = getString()`
- Check import paths: `../services/sheets` not `services/sheets`

---

### Google Sheets API errors

**403 Forbidden:**
- Service account doesn't have access to sheet
- Share sheet with service account email (Editor permission)

**404 Not Found:**
- Spreadsheet ID is incorrect
- Sheet tab name doesn't exist

**429 Rate Limit:**
- Too many API requests
- Add exponential backoff retry logic

---

## 📚 Next Steps

- **Command reference:** [commands.md](commands.md)
- **Architecture details:** [../technical/architecture/overview.md](../technical/architecture/overview.md)
- **Implementation tasks:** [../implementation/todo-phase1.md](../implementation/todo-phase1.md)
- **API references:** [../technical/api/README.md](../technical/api/README.md)
