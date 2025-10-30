# vPoll Architecture Overview

**High-level system design and component interaction**

## System Architecture

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

## Core Components

### 1. Discord Integration Layer
- **Commands:** Slash commands using Discord.js SlashCommandBuilder
- **Events:** Discord event handlers (ready, interactionCreate, etc.)
- **Polls:** Discord native poll creation and monitoring

**See:** [discord-integration.md](discord-integration.md)

### 2. Business Logic Layer
- **Tournament Service:** State management, round progression
- **Poll Service:** Poll creation, result tracking
- **Validation Service:** Google Sheets validation

**See:** [data-models.md](data-models.md)

### 3. Data Access Layer
- **Sheets Service:** Google Sheets API integration
- **Service Account Auth:** Authentication and permissions

**See:** [sheets-integration.md](sheets-integration.md)

### 4. State Management
- **In-Memory Storage:** Tournament state (MVP approach)
- **Persistence:** Google Sheets as source of truth

**See:** [../decisions/README.md](../decisions/README.md) - Decision on state management

## Data Flow

### Tournament Creation Flow
```
User → /tournament create <url>
  → Validation Service validates sheet structure
  → Sheets Service reads participants/config/regions
  → Tournament Service creates TournamentState
  → Store in memory
  → Reply with confirmation
```

### Poll Creation Flow
```
User → /tournament start
  → Tournament Service calculates matches for Round 1
  → Poll Service batches matches per config
  → For each batch:
      → Discord API creates native poll
      → Store poll ID in TournamentState
  → Reply with confirmation
```

### Result Tracking Flow
```
Discord Poll closes
  → Poll monitor detects close (60-second polling)
  → Poll Service reads final vote counts
  → Determine winner (or trigger tiebreaker)
  → Sheets Service updates Bracket tab (TRUE/FALSE)
  → Sheets Service appends to Results tab
  → Post result announcement
  → Check if round complete
      → If complete & auto-advance: trigger next round
```

## Technology Stack

- **Runtime:** Node.js 18+
- **Language:** TypeScript 5.3+
- **Discord:** Discord.js v14
- **Google Sheets:** googleapis v164+
- **Build:** tsc (TypeScript compiler)

## Design Patterns

### Command Pattern
Each slash command is a self-contained module with:
- `data`: SlashCommandBuilder configuration
- `execute`: Async handler function

**Location:** `src/commands/`

### Event-Driven Architecture
Discord events trigger handlers:
- Bot ready → Load configuration
- Interaction created → Route to command
- Message update → Check for poll close (opportunistic)

**Location:** `src/events/`

### Service Layer Pattern
Business logic encapsulated in services:
- Clear separation of concerns
- Testable units
- Reusable across commands

**Location:** `src/services/`

## Error Handling Strategy

### Google Sheets API
- Retry logic with exponential backoff (3 attempts)
- Graceful degradation if API unavailable
- Clear error messages to user

### Discord API
- Discord.js handles rate limiting automatically
- Deferred replies for slow operations (>3 seconds)
- Permission validation before operations

### User Input
- Validate Google Sheets URL format
- Validate all config values before tournament creation
- Provide specific, actionable error messages

## Scalability Considerations

### MVP (Private Bot)
- Single tournament per server
- In-memory state (lost on restart)
- Direct Google Sheets API calls

### Future (Public Bot)
- Multi-tournament support per server
- Database for persistent state
- Caching layer for Sheets API
- Queue system for poll creation

**See:** [../../reference/FUTURE.md](../../reference/FUTURE.md)

## Security

### API Keys
- Discord token in environment variables
- Google service account key file (not committed to git)
- Both in .gitignore

### Permissions
- Minimal Discord permissions required
- Service account scoped to Sheets API only
- Editor permission on sheets (validated)

### Data Privacy
- No user data collected beyond Discord IDs
- Tournament data controlled by tournament host
- Public sheets are host's choice

## Related Documentation

- **Data Models:** [data-models.md](data-models.md)
- **Discord Integration:** [discord-integration.md](discord-integration.md)
- **Sheets Integration:** [sheets-integration.md](sheets-integration.md)
- **Architecture Decisions:** [../decisions/README.md](../decisions/README.md)
