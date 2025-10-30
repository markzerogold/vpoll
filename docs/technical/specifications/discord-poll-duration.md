## 5. Discord Poll Duration Format

### Problem Statement
Config stores poll length as hours (24), but what format does Discord.js poll API actually require?

### Solution: Discord.js Poll API Specification

#### Discord.js v14 Poll API

**Poll creation uses `PollData` interface:**

```typescript
interface PollData {
  question: string;
  answers: PollAnswerData[];
  duration: number; // Duration in HOURS (1-168, max 7 days)
  allowMultiselect?: boolean;
  layoutType?: PollLayoutType;
}
```

**Key Finding:** Discord.js accepts duration in **hours**, NOT minutes or seconds.

#### Implementation

```typescript
async function createPoll(
  channel: TextChannel,
  match: Match,
  pollLengthHours: number
): Promise<Message> {
  const pollData: PollData = {
    question: `Round ${match.round} - ${match.region} - Match ${match.matchNumber}`,
    answers: [
      { text: `(${match.participant1.seed}) ${match.participant1.name}`, emoji: '1️⃣' },
      { text: `(${match.participant2.seed}) ${match.participant2.name}`, emoji: '2️⃣' }
    ],
    duration: pollLengthHours, // Direct from config - no conversion needed
    allowMultiselect: false
  };

  const message = await channel.send({ poll: pollData });
  return message;
}
```

#### Validation

**Config validation:**
```typescript
function validatePollLength(hours: number): ValidationResult {
  if (!Number.isInteger(hours)) {
    return { valid: false, error: 'Poll Length must be a whole number' };
  }

  if (hours < 1 || hours > 168) {
    return { valid: false, error: 'Poll Length must be between 1 and 168 hours (7 days max)' };
  }

  return { valid: true };
}
```

**Discord API Limits:**
- Minimum: 1 hour
- Maximum: 168 hours (7 days)
- Must be integer (no decimals)

---
