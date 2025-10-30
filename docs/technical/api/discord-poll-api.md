# Discord Poll API Reference

**Discord.js v14 native poll implementation details**

## Poll Creation

### PollData Interface

```typescript
interface PollData {
  question: string;
  answers: PollAnswerData[];
  duration: number;        // HOURS (1-168, max 7 days)
  allowMultiselect?: boolean;
  layoutType?: PollLayoutType;
}

interface PollAnswerData {
  text: string;           // Answer text
  emoji?: string;         // Optional emoji
}
```

### Example: Tournament Match Poll

```typescript
import { TextChannel } from 'discord.js';

async function createMatchPoll(
  channel: TextChannel,
  round: string,
  region: string,
  matchNumber: number,
  p1Name: string,
  p1Seed: number,
  p2Name: string,
  p2Seed: number,
  durationHours: number
) {
  const poll = {
    question: {
      text: `${round} - ${region} - Match ${matchNumber}`
    },
    answers: [
      {
        poll_media: { text: `(${p1Seed}) ${p1Name}` },
        emoji: '1️⃣'
      },
      {
        poll_media: { text: `(${p2Seed}) ${p2Name}` },
        emoji: '2️⃣'
      }
    ],
    duration: durationHours,
    allow_multiselect: false,
  };

  const message = await channel.send({ poll });
  return message.id; // Save for later tracking
}
```

## Duration Parameter

**CRITICAL:** Duration is in **HOURS**, not minutes or seconds!

- Minimum: 1 hour
- Maximum: 168 hours (7 days)
- Must be integer (no decimals)

**Example:**
```typescript
duration: 24  // 24 hours (1 day)
duration: 72  // 72 hours (3 days)
```

**See:** [../specifications/discord-poll-duration.md](../specifications/discord-poll-duration.md)

## Reading Poll Results

### Get Poll Object

```typescript
const message = await channel.messages.fetch(messageId);
const poll = message.poll;

if (!poll) {
  throw new Error('Message does not contain a poll');
}
```

### Read Vote Counts

```typescript
const results = poll.answers.map(answer => ({
  text: answer.text,
  votes: answer.voteCount
}));

// Example: Determine winner
const [p1Result, p2Result] = results;
const winner = p1Result.votes > p2Result.votes
  ? p1Result.text
  : p2Result.text;
```

### Check if Poll is Closed

```typescript
const isClosed = poll.resultsFinalized === true;

if (isClosed) {
  // Safe to process results
}
```

## Poll Events

### IMPORTANT: No Poll Close Event!

Discord.js v14 does **NOT** provide a poll close event. The following events exist but are NOT useful for detecting poll close:

- `messagePollVoteAdd` - Fires when user votes (not when poll closes)
- `messagePollVoteRemove` - Fires when user removes vote
- `messageUpdate` - Fires on message edits (unreliable for polls)

### Solution: Polling Strategy

**Primary Method:** Check poll status every 60 seconds

```typescript
const pollMonitor = setInterval(async () => {
  for (const activePoll of getActivePolls()) {
    try {
      const message = await channel.messages.fetch(activePoll.messageId);

      if (message.poll?.resultsFinalized) {
        // Poll has closed - process results
        await processPollResults(message.poll, activePoll);

        // Remove from active polls
        removeActivePoll(activePoll.messageId);
      }
    } catch (error) {
      console.error(`Error checking poll ${activePoll.messageId}:`, error);
    }
  }
}, 60 * 1000); // Check every 60 seconds
```

**Opportunistic Method:** Listen for `messageUpdate` (may detect close faster)

```typescript
client.on('messageUpdate', async (oldMessage, newMessage) => {
  if (!newMessage.poll) return;

  const activePoll = getActivePoll(newMessage.id);
  if (!activePoll) return;

  // Check if poll just closed
  if (newMessage.poll.resultsFinalized &&
      !oldMessage.poll?.resultsFinalized) {
    await processPollResults(newMessage.poll, activePoll);
    removeActivePoll(newMessage.id);
  }
});
```

**See:** [../specifications/poll-close-event-handling.md](../specifications/poll-close-event-handling.md)

## Poll Limits

### Discord API Limits

- **Max answers:** 10 per poll
- **Answer text length:** 55 characters
- **Question length:** 300 characters
- **Duration:** 1-168 hours

### Rate Limits

Discord.js handles rate limiting automatically, but best practices:

- **Small delay** between poll creations (1 second recommended)
- **Batch operations** when creating many polls

```typescript
for (const match of matches) {
  await createMatchPoll(channel, match);
  await sleep(1000); // 1 second delay
}
```

## Common Patterns

### Store Poll Metadata

```typescript
interface ActivePoll {
  messageId: string;
  pollId: string;
  matchId: string;
  round: number;
  region: string;
  participant1: string;
  participant2: string;
  startTime: Date;
  endTime: Date;
  status: 'active' | 'closed' | 'processed';
}

const activePolls = new Map<string, ActivePoll>();

// After creating poll
const activePoll: ActivePoll = {
  messageId: message.id,
  pollId: message.poll.id,
  matchId: 'R1-ALPHA-M1',
  round: 1,
  region: 'ALPHA',
  participant1: 'Spock',
  participant2: 'Kirk',
  startTime: new Date(),
  endTime: new Date(Date.now() + durationHours * 60 * 60 * 1000),
  status: 'active',
};

activePolls.set(message.id, activePoll);
```

### Process Poll Results

```typescript
async function processPollResults(poll: Poll, metadata: ActivePoll) {
  const [p1Votes, p2Votes] = poll.answers.map(a => a.voteCount);

  let winner: string;
  let tiebreaker: string | undefined;

  if (p1Votes > p2Votes) {
    winner = metadata.participant1;
  } else if (p2Votes > p1Votes) {
    winner = metadata.participant2;
  } else {
    // Tie - roll dice
    const p1Roll = Math.floor(Math.random() * 100) + 1;
    const p2Roll = Math.floor(Math.random() * 100) + 1;
    winner = p1Roll > p2Roll ? metadata.participant1 : metadata.participant2;
    tiebreaker = `${metadata.participant1}: ${p1Roll}, ${metadata.participant2}: ${p2Roll}`;
  }

  // Update Google Sheets
  await updateBracket(metadata.matchId, winner);
  await appendResult({
    matchId: metadata.matchId,
    p1Votes,
    p2Votes,
    winner,
    tiebreaker,
  });

  // Post result announcement
  await channel.send(
    `✅ ${metadata.matchId} Complete\\n` +
    `🏆 Winner: ${winner}\\n` +
    `Votes: ${p1Votes} - ${p2Votes}`
  );
}
```

## Troubleshooting

### Poll not creating

- Check channel permissions (SendMessages, EmbedLinks)
- Verify duration is integer between 1-168
- Ensure answer count is 2-10

### Results not updating

- Confirm poll has `resultsFinalized === true`
- Check if poll monitoring interval is running
- Verify message fetch permissions

### Vote counts incorrect

- Use `voteCount` property, not `voters.size`
- Poll object must be from fresh fetch, not cached

## Related Documentation

- **Poll Close Event Handling:** [../specifications/poll-close-event-handling.md](../specifications/poll-close-event-handling.md)
- **Poll Duration Format:** [../specifications/discord-poll-duration.md](../specifications/discord-poll-duration.md)
- **Discord Integration:** [../architecture/discord-integration.md](../architecture/discord-integration.md)
- **Official Discord.js Docs:** https://discord.js.org/docs/packages/discord.js/14.14.1
