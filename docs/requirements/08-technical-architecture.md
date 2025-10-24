# vPoll Product Requirements - Technical Architecture

[← Back to Main README](../../README.md) | [View Full Requirements](../../REQUIREMENTS.md)

**Document Section:** 8 of 9
**Last Updated:** 2025-10-22
**Status:** In Development - MVP Phase

---

## Navigation

- **Previous:** [Google Sheets Specification](./07-google-sheets-spec.md)
- **Current:** Technical Architecture
- **Next:** [Dependencies & Risks](./09-dependencies-decisions.md)
- **See Also:** [CLAUDE.md](../../CLAUDE.md) for development guidelines

---

## Technical Architecture

### Technology Stack

**Core Technologies:**
- **Discord.js v14** - Discord bot framework and API client
- **Google Sheets API v4** - Tournament data management
- **Node.js** - Runtime environment
- **TypeScript** - Type-safe development

**Key Libraries:**
- `discord.js` - Discord bot functionality
- `@discordjs/rest` - Discord API interactions
- `googleapis` - Google Sheets integration
- `dotenv` - Environment configuration

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Discord Platform                        │
│  - Native Polls (voting)                                    │
│  - Slash Commands (admin controls)                          │
│  - Event Webhooks (poll close events)                       │
└───────────────┬─────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────┐
│                       vPoll Bot                              │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Command    │  │    Event     │  │   Services   │      │
│  │   Handlers   │  │   Handlers   │  │              │      │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤      │
│  │ /tournament  │  │ - ready      │  │ - Sheets     │      │
│  │   create     │  │ - poll close │  │ - Tournament │      │
│  │ /tournament  │  │ - interaction│  │ - Poll       │      │
│  │   start      │  │              │  │ - Validation │      │
│  │ ...          │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Tournament State (In-Memory)              │  │
│  │  - Active tournament data                            │  │
│  │  - Poll tracking                                     │  │
│  │  - Scheduled tasks                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────┬─────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Google Sheets API                         │
│  - Read tournament configuration                            │
│  - Read participants and bracket                            │
│  - Write results and bracket updates                        │
└─────────────────────────────────────────────────────────────┘
```

### Data Models

#### Tournament State (In-Memory)

```typescript
interface TournamentState {
  id: string;                      // Unique tournament ID
  guildId: string;                 // Discord server ID
  sheetId: string;                 // Google Sheets ID
  config: TournamentConfig;        // From Config tab
  status: 'created' | 'active' | 'paused' | 'completed' | 'canceled';
  currentRound: number;            // 1-6
  regions: Region[];               // 4 regions with names and participants
  activePolls: ActivePoll[];       // Currently running polls
  scheduledTasks: ScheduledTask[]; // Auto-scheduling tasks
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

interface TournamentConfig {
  tournamentName: string;
  description: string;
  startDate: string;
  pollLengthHours: number;
  pollBatches: string;             // "full round", "one per region", etc.
  channelId: string;               // Primary poll channel
  autoAdvance: boolean;
  tieBreakerRule: string;          // "Dice roll"
  resultsVisibility: string;
  requiredVoterRole?: string;      // Optional, not enforced in MVP
  matchPreviewPosts: boolean;
  liveVoteUpdates: string;         // Not enforced in MVP
  autoRoundScheduling?: string;    // e.g., "3 days", "immediate"
  advertisingTemplate?: string;
  announcementsChannelId?: string;
  celebratoryGif: boolean;
}

interface Region {
  name: string;                    // e.g., "ALPHA"
  participants: Participant[];     // 16 participants
}

interface Participant {
  rank: number;                    // 1-64
  name: string;
  notes?: string;                  // Column C
  referenceLink?: string;          // Column D
}

interface ActivePoll {
  pollId: string;                  // Discord poll ID
  matchId: string;                 // e.g., "R1-ALPHA-M1"
  round: number;
  region: string;
  participant1: MatchParticipant;
  participant2: MatchParticipant;
  startTime: Date;
  endTime: Date;
  status: 'active' | 'closed' | 'processed';
}

interface MatchParticipant {
  name: string;
  seed: number;
}

interface ScheduledTask {
  taskId: string;
  type: 'round-start' | 'announcement';
  scheduledTime: Date;
  round?: number;
  data?: any;
}
```

### Google Sheets Integration

#### Service Account Authentication

```typescript
// Service Account Details
const SERVICE_ACCOUNT_EMAIL = 'vpoll-sheets-access@vpoll-475821.iam.gserviceaccount.com';
const KEY_FILE_PATH = './keys/vpoll-key.json';
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Authentication
const auth = new google.auth.GoogleAuth({
  keyFile: KEY_FILE_PATH,
  scopes: SCOPES,
});
const sheets = google.sheets({ version: 'v4', auth });
```

#### Read Operations

```typescript
// Read Participants Tab (A1:D65)
async function readParticipants(spreadsheetId: string): Promise<Participant[]> {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Participants!A1:D65',
  });

  // Parse rows into Participant objects
  // Validate ranks 1-64, unique names, etc.
  return parseParticipants(response.data.values);
}

// Read Config Tab (A:B)
async function readConfig(spreadsheetId: string): Promise<TournamentConfig> {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Config!A:B',
  });

  // Parse key-value pairs into TournamentConfig
  return parseConfig(response.data.values);
}

// Read Regions Tab (A1:E17)
async function readRegions(spreadsheetId: string): Promise<Region[]> {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Regions!A1:E17',
  });

  // Parse region names and participant distribution
  return parseRegions(response.data.values);
}
```

#### Write Operations

```typescript
// Update Bracket Tab (write TRUE/FALSE for winner/loser)
async function updateBracket(
  spreadsheetId: string,
  winnerCell: string,
  loserCell: string
): Promise<void> {
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'RAW',
      data: [
        { range: `Bracket!${winnerCell}`, values: [['TRUE']] },
        { range: `Bracket!${loserCell}`, values: [['FALSE']] },
      ],
    },
  });
}

// Append result row to Results Tab
async function writeResult(
  spreadsheetId: string,
  result: MatchResult
): Promise<void> {
  const row = [
    result.matchId,
    result.round,
    result.region,
    result.participant1Name,
    result.participant1Seed,
    result.participant1Votes,
    result.participant2Name,
    result.participant2Seed,
    result.participant2Votes,
    result.winner,
    result.pollId,
    result.pollStartTime.toISOString(),
    result.pollEndTime.toISOString(),
    result.totalVotes,
    result.tiebreaker || '',
    result.notes || '',
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Results!A:P',
    valueInputOption: 'RAW',
    requestBody: {
      values: [row],
    },
  });
}
```

### Discord Integration

#### Command Registration

```typescript
// Command structure (src/commands/tournament.ts)
export const data = new SlashCommandBuilder()
  .setName('tournament')
  .setDescription('Manage tournament voting competitions')
  .addSubcommand(subcommand =>
    subcommand
      .setName('create')
      .setDescription('Create tournament from Google Sheets')
      .addStringOption(option =>
        option
          .setName('sheet-url')
          .setDescription('Google Sheets URL')
          .setRequired(true)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('start')
      .setDescription('Start the tournament')
  )
  // ... additional subcommands
```

#### Poll Creation

```typescript
// Create Discord native poll
async function createPoll(
  channel: TextChannel,
  match: Match,
  durationHours: number
): Promise<Message> {
  const poll = {
    question: {
      text: `${match.round} - ${match.region} - Match ${match.number}`
    },
    answers: [
      { poll_media: { text: `(${match.participant1.seed}) ${match.participant1.name}` } },
      { poll_media: { text: `(${match.participant2.seed}) ${match.participant2.name}` } }
    ],
    duration: durationHours,
    allow_multiselect: false,
  };

  const message = await channel.send({ poll });
  return message;
}
```

#### Poll Event Handling

```typescript
// Listen for poll close events
client.on('messagePollVoteAdd', async (pollAnswer, userId) => {
  // Poll vote added (not used in MVP - Discord handles counting)
});

client.on('messagePollVoteRemove', async (pollAnswer, userId) => {
  // Poll vote removed (not used in MVP)
});

// Primary method: Check poll status periodically
setInterval(async () => {
  const activePolls = getActivePolls();

  for (const poll of activePolls) {
    const message = await channel.messages.fetch(poll.messageId);

    if (message.poll?.resultsFinalized) {
      // Poll has closed - process results
      await processPollResults(message.poll, poll);
    }
  }
}, 10 * 60 * 1000); // Check every 10 minutes
```

### Error Handling & Resilience

#### Google Sheets API Errors

```typescript
async function safeSheetUpdate(
  updateFn: () => Promise<void>,
  retries: number = 3
): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      await updateFn();
      return; // Success
    } catch (error) {
      if (i === retries - 1) {
        // Final retry failed - log and alert admin
        logger.error('Sheet update failed after retries', error);
        await notifyAdmin('Failed to update Google Sheets - manual intervention required');
        throw error;
      }

      // Exponential backoff
      await sleep(Math.pow(2, i) * 1000);
    }
  }
}
```

#### Discord API Rate Limits

```typescript
// Discord.js handles rate limiting automatically
// But we should batch operations when possible

async function createPollBatch(matches: Match[]): Promise<void> {
  // Create polls with small delays to avoid rate limits
  for (const match of matches) {
    await createPoll(channel, match, config.pollLengthHours);
    await sleep(1000); // 1 second delay between polls
  }
}
```

#### Permission Errors

```typescript
async function validatePermissions(
  guild: Guild,
  channelId: string
): Promise<{ valid: boolean; missing: string[] }> {
  const channel = await guild.channels.fetch(channelId);
  if (!channel) {
    return { valid: false, missing: ['Channel not found'] };
  }

  const permissions = channel.permissionsFor(client.user!);
  const required = [
    'SendMessages',
    'EmbedLinks',
    'CreatePublicThreads',
    'ManageMessages',
    'ReadMessageHistory',
    'AttachFiles',
  ];

  const missing = required.filter(perm => !permissions?.has(perm as PermissionFlagsBits));

  return { valid: missing.length === 0, missing };
}
```

### Development Setup

#### Environment Variables

```bash
# .env file
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_id_here
GUILD_ID=your_test_server_id_here  # Optional - for faster command deployment
```

#### Project Structure

```
vpoll/
├── src/
│   ├── commands/           # Slash command definitions
│   │   ├── ping.ts         # Example: simple ping command
│   │   ├── poll.ts         # Example: poll command
│   │   └── tournament.ts   # Main tournament command
│   ├── events/             # Discord event handlers
│   │   ├── ready.ts        # Bot ready event
│   │   └── interactionCreate.ts  # Command handler
│   ├── services/           # Business logic
│   │   ├── sheets.ts       # Google Sheets integration
│   │   ├── tournament.ts   # Tournament management
│   │   ├── poll.ts         # Poll creation and tracking
│   │   └── validation.ts   # Sheet validation
│   ├── utils/              # Helper functions
│   │   ├── logger.ts       # Logging utility
│   │   └── scheduler.ts    # Task scheduling
│   ├── config.ts           # Environment config loading
│   ├── index.ts            # Main bot entry point
│   └── deploy-commands.ts  # Command deployment script
├── keys/
│   └── vpoll-key.json      # Google service account key (not committed)
├── .env                    # Environment variables (not committed)
├── .env.example            # Example environment file
├── package.json
├── tsconfig.json
└── README.md
```

#### Build and Deployment

```bash
# Development workflow
npm install                 # Install dependencies
npm run build               # Compile TypeScript → JavaScript
npm run deploy-commands     # Deploy commands to Discord
npm run dev                 # Run with hot reload

# Production workflow
npm run build
npm start                   # Run compiled JavaScript

# Testing
npm run test-sheets         # Test Google Sheets connection
npm run lint                # Check code style
npm run format              # Format code with Prettier
```

---

[← Previous: Google Sheets Spec](./07-google-sheets-spec.md) | [Next: Dependencies & Risks →](./09-dependencies-decisions.md)
