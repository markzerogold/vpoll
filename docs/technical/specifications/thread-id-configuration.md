## 10. Thread ID Configuration Format

### Problem Statement
Thread IDs are mentioned but config format not fully specified. How are 6 rounds configured?

### Solution: Optional Per-Round Thread Config

#### Config Keys

**Format:** `Round {X} Thread ID` (where X = 1-6)

**Example Config Tab:**
```
| Setting Name | Value | Description |
|--------------|-------|-------------|
| Round 1 Thread ID | 123456789012345678 | Thread for Round 1 polls |
| Round 2 Thread ID | 234567890123456789 | Thread for Round 2 polls |
| Round 3 Thread ID | | (empty - falls back to primary channel) |
| Round 4 Thread ID | | |
| Round 5 Thread ID | | |
| Round 6 Thread ID | | |
```

#### Parsing

```typescript
interface ThreadConfig {
  [round: number]: string; // round -> threadId
}

function parseThreadConfig(config: { [key: string]: string }): ThreadConfig {
  const threadConfig: ThreadConfig = {};

  for (let round = 1; round <= 6; round++) {
    const key = `round_${round}_thread_id`;
    const threadId = config[key]?.trim();

    if (threadId && threadId !== '') {
      threadConfig[round] = threadId;
    }
  }

  return threadConfig;
}
```

#### Validation

```typescript
async function validateThreadIds(
  client: Client,
  channelId: string,
  threadConfig: ThreadConfig
): Promise<ValidationResult> {
  const errors: string[] = [];

  // Get parent channel
  const channel = await client.channels.fetch(channelId);
  if (!channel || !channel.isTextBased()) {
    return {
      valid: false,
      errors: ['Primary channel is invalid or not text-based']
    };
  }

  // Validate each configured thread ID
  for (const [round, threadId] of Object.entries(threadConfig)) {
    try {
      const thread = await client.channels.fetch(threadId);

      if (!thread || !thread.isThread()) {
        errors.push(`Round ${round} Thread ID is not a valid thread: ${threadId}`);
        continue;
      }

      // Check if thread belongs to primary channel
      if (thread.parentId !== channelId) {
        errors.push(`Round ${round} thread is not in the primary channel (different parent)`);
      }

      // Check bot has permission to post
      const permissions = thread.permissionsFor(client.user!);
      if (!permissions?.has('SendMessages')) {
        errors.push(`Bot lacks SendMessages permission in Round ${round} thread`);
      }

    } catch (error) {
      errors.push(`Cannot access Round ${round} thread: ${threadId}`);
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true };
}
```

#### Usage During Poll Creation

```typescript
function getChannelIdForRound(
  round: number,
  primaryChannelId: string,
  threadConfig: ThreadConfig
): string {
  // Check if thread configured for this round
  const threadId = threadConfig[round];

  if (threadId) {
    logger.info(`Using thread ${threadId} for Round ${round}`);
    return threadId;
  }

  // Fall back to primary channel
  logger.info(`Using primary channel ${primaryChannelId} for Round ${round} (no thread configured)`);
  return primaryChannelId;
}

async function createPollsForRound(round: number): Promise<void> {
  const channelId = getChannelIdForRound(
    round,
    tournamentState.config.discordChannelId,
    tournamentState.config.threadConfig
  );

  const channel = await client.channels.fetch(channelId);

  // Create polls in this channel/thread
  // ...
}
```

#### Optional: Per-Region Thread Support

**For future versions, could support:**
```
Round 1 ALPHA Thread ID | 111111111111111111
Round 1 BETA Thread ID  | 222222222222222222
Round 1 GAMMA Thread ID | 333333333333333333
Round 1 DELTA Thread ID | 444444444444444444
```

**MVP: Not implemented** (per-round only, not per-region)

---
