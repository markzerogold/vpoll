# Discord Integration

**Discord.js v14 patterns and best practices for vPoll**

## Command System

### Command Structure

```typescript
// src/commands/tournament.ts
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tournament')
    .setDescription('Tournament management')
    .addSubcommand(sub =>
      sub
        .setName('create')
        .setDescription('Create tournament from Google Sheets')
        .addStringOption(opt =>
          opt
            .setName('sheet-url')
            .setDescription('Google Sheets URL')
            .setRequired(true)
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'create') {
      const sheetUrl = interaction.options.getString('sheet-url', true);
      // Handle command
    }
  },
};
```

### Command Registration

Commands auto-loaded from `src/commands/` at startup:

```typescript
// src/index.ts
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}
```

Deploy to Discord:
```bash
npm run deploy-commands  # Runs src/deploy-commands.ts
```

## Discord Native Polls

### Creating Polls

```typescript
import { TextChannel } from 'discord.js';

async function createPoll(
  channel: TextChannel,
  question: string,
  answers: string[],
  durationHours: number
) {
  const poll = {
    question: { text: question },
    answers: answers.map(text => ({ poll_media: { text } })),
    duration: durationHours,  // Hours, not minutes!
    allow_multiselect: false,
  };

  const message = await channel.send({ poll });
  return message.id; // Save for tracking
}
```

**See:** [../specifications/discord-poll-duration.md](../specifications/discord-poll-duration.md)

### Poll Event Handling

**Important:** Discord.js v14 has NO poll close event!

**Solution:** Poll every 60 seconds to check status

```typescript
setInterval(async () => {
  for (const activePoll of getActivePolls()) {
    const message = await channel.messages.fetch(activePoll.messageId);

    if (message.poll?.resultsFinalized) {
      await processPollResults(message.poll, activePoll);
    }
  }
}, 60 * 1000); // Check every 60 seconds
```

**See:** [../specifications/poll-close-event-handling.md](../specifications/poll-close-event-handling.md)

## Interaction Patterns

### Deferred Replies

For slow operations (>3 seconds):

```typescript
await interaction.deferReply();

// Do slow work
const tournament = await loadTournamentData(sheetUrl);

await interaction.editReply({
  content: 'Tournament created!',
  embeds: [tournamentEmbed],
});
```

### Ephemeral Responses

Private replies only user sees:

```typescript
await interaction.reply({
  content: 'Error: Invalid sheet URL',
  ephemeral: true,
});
```

### Embeds

Rich formatted responses:

```typescript
import { EmbedBuilder } from 'discord.js';

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

## Event Handling

### Event Structure

```typescript
// src/events/ready.ts
import { Events } from 'discord.js';

module.exports = {
  name: Events.ClientReady,
  once: true,  // Use .once() instead of .on()
  execute(client) {
    console.log(`Logged in as ${client.user.tag}`);
  },
};
```

### Available Events

- `ClientReady` - Bot connected
- `InteractionCreate` - Command or button interaction
- `MessageUpdate` - Message edited (opportunistic poll check)

## Permission Checking

### Validate Bot Permissions

```typescript
async function validateBotPermissions(
  channel: TextChannel
): Promise<{ valid: boolean; missing: string[] }> {
  const permissions = channel.permissionsFor(client.user!);
  const required = [
    'SendMessages',
    'EmbedLinks',
    'CreatePublicThreads',
    'ManageMessages',
  ];

  const missing = required.filter(
    perm => !permissions?.has(perm as PermissionFlagsBits)
  );

  return {
    valid: missing.length === 0,
    missing,
  };
}
```

### Check Admin Permissions

```typescript
function isAdmin(interaction: ChatInputCommandInteraction): boolean {
  return interaction.memberPermissions?.has('Administrator') ?? false;
}
```

## Rate Limiting

Discord.js handles rate limiting automatically, but best practices:

### Batch Operations

```typescript
// Bad: Creates 32 polls rapidly
for (const match of matches) {
  await createPoll(channel, match);
}

// Good: Add small delays
for (const match of matches) {
  await createPoll(channel, match);
  await sleep(1000); // 1 second between polls
}
```

## Related Documentation

- **Architecture Overview:** [overview.md](overview.md)
- **Discord Poll API:** [../api/discord-poll-api.md](../api/discord-poll-api.md)
- **Poll Specs:** [../specifications/discord-poll-duration.md](../specifications/discord-poll-duration.md)
- **Quick Start:** [../../quick-start/common-tasks.md](../../quick-start/common-tasks.md)
