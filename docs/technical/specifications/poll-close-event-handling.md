## 6. Poll Close Event Handling

### Problem Statement
REQUIREMENTS.md claims "vPoll listens for Discord poll close event" but Discord.js v14 documentation doesn't show this event.

### Solution: Hybrid Approach with Polling

#### Discord.js v14 Poll Events

**Reality check:** Discord.js v14 does NOT have a dedicated "poll close" event.

**Available events:**
- `messagePollVoteAdd` - Fires when user votes (not useful for close detection)
- `messageUpdate` - Fires when message updates (including poll end, but unreliable)

**Conclusion:** Primary method must be **polling**, not event listeners.

#### Revised Implementation Strategy

**Primary Method: Scheduled Poll Checking**

```typescript
class PollMonitor {
  private activePolls: Map<string, ActivePoll> = new Map();
  private checkInterval: NodeJS.Timeout;

  constructor(private bot: Client) {
    // Check all active polls every 1 minute
    this.checkInterval = setInterval(() => this.checkAllPolls(), 60000);
  }

  async checkAllPolls(): Promise<void> {
    const now = Date.now();

    for (const [pollId, activePoll] of this.activePolls) {
      // Check if poll should be closed by now
      if (now >= activePoll.closeTime) {
        try {
          await this.processPollResult(activePoll);
          this.activePolls.delete(pollId);
        } catch (error) {
          logger.error(`Failed to process poll ${pollId}:`, error);
          // Keep in activePolls for retry on next check
        }
      }
    }
  }

  async processPollResult(activePoll: ActivePoll): Promise<void> {
    // Fetch latest poll data
    const channel = await this.bot.channels.fetch(activePoll.channelId) as TextChannel;
    const message = await channel.messages.fetch(activePoll.messageId);

    if (!message.poll) {
      throw new Error('Poll not found on message');
    }

    // Check if poll is actually closed
    if (!message.poll.expiresAt || message.poll.expiresAt > new Date()) {
      // Poll not closed yet, check again later
      return;
    }

    // Extract vote counts
    const votes: { [answerId: string]: number } = {};
    message.poll.answers.forEach(answer => {
      votes[answer.text] = answer.voteCount;
    });

    // Determine winner and update Google Sheets
    await this.updateBracket(activePoll, votes);
  }
}
```

**Fallback Method: messageUpdate Event (Opportunistic)**

```typescript
// Listen for message updates (may include poll close)
client.on('messageUpdate', async (oldMessage, newMessage) => {
  if (!newMessage.poll) return;

  const activePoll = pollMonitor.getActivePoll(newMessage.id);
  if (!activePoll) return;

  // Check if poll just ended
  if (newMessage.poll.expiresAt && newMessage.poll.expiresAt <= new Date()) {
    // Poll closed, process immediately (don't wait for next check cycle)
    await pollMonitor.processPollResult(activePoll);
  }
});
```

#### Check Frequency Trade-offs

| Interval | Pros | Cons |
|----------|------|------|
| 10 seconds | Near real-time results | High API usage, rate limit risk |
| 1 minute | Fast enough, reasonable API usage | **Recommended for MVP** |
| 5 minutes | Low API usage | Delayed result processing |
| 10 minutes | Very low API usage | Too slow, poor UX |

**MVP Decision:** Check every **1 minute** (60 seconds).

#### Update REQUIREMENTS.md Documentation

**Replace lines 706-711 with:**
```
1. **Primary Method:** vPoll checks all active polls every 60 seconds
   - Scheduled check runs every minute
   - Fetches poll data and checks if expiry time passed
   - Processes result when poll closed
2. **Opportunistic Method:** Listen for messageUpdate events
   - May detect poll close faster than scheduled check
   - Not reliable (Discord may not fire event), so scheduled check is primary
```

---
