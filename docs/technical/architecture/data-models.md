# Data Models

**TypeScript interfaces and type definitions for vPoll**

## Core Interfaces

### TournamentState

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
```

### TournamentConfig

```typescript
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
  autoRoundScheduling?: string;    // e.g., "3 days", "immediate"
  celebratoryGif: boolean;
}
```

### Region

```typescript
interface Region {
  name: string;                    // e.g., "ALPHA"
  participants: Participant[];     // 16 participants
}
```

### Participant

```typescript
interface Participant {
  rank: number;                    // 1-64
  name: string;
  notes?: string;                  // Column C
  referenceLink?: string;          // Column D
}
```

### ActivePoll

```typescript
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
```

### MatchParticipant

```typescript
interface MatchParticipant {
  name: string;
  seed: number;
}
```

### MatchResult

```typescript
interface MatchResult {
  matchId: string;
  round: string;                   // "Round 1", "Round 2", etc.
  region: string;
  participant1Name: string;
  participant1Seed: number;
  participant1Votes: number;
  participant2Name: string;
  participant2Seed: number;
  participant2Votes: number;
  winner: string;
  pollId: string;
  pollStartTime: Date;
  pollEndTime: Date;
  totalVotes: number;
  tiebreaker?: string;             // Dice roll result if applicable
  notes?: string;
}
```

### ScheduledTask

```typescript
interface ScheduledTask {
  taskId: string;
  type: 'round-start' | 'announcement';
  scheduledTime: Date;
  round?: number;
  data?: any;
}
```

## Validation Interfaces

### ValidationResult

```typescript
interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}
```

## Implementation Location

All interfaces should be defined in: `src/types/tournament.ts`

**To create:**
```bash
mkdir -p src/types
touch src/types/tournament.ts
```

**Import example:**
```typescript
import { TournamentState, TournamentConfig } from '../types/tournament';
```

## Related Documentation

- **Architecture Overview:** [overview.md](overview.md)
- **Config Parsing Spec:** [../specifications/config-tab-parsing.md](../specifications/config-tab-parsing.md)
- **Requirements:** [../../requirements/08-technical-architecture.md](../../requirements/08-technical-architecture.md)
