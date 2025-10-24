# Reference Documentation

This file contains links to reference documentation for external integrations and APIs used in the vPoll project.
Last updated: 2025-10-23

## Discord API Documentation

### General Discord.js
- Discord.js Guide: https://discordjs.guide/
- Discord.js Documentation: https://discord.js.org/docs/packages/discord.js/main
- Discord.js GitHub: https://github.com/discordjs/discord.js

### Discord Bot Best Practices & Optimization

#### Official Discord.js Resources
- **Cache Customization:** https://discordjs.guide/miscellaneous/cache-customization
  - Memory optimization through cache limits
  - Using `makeCache` and `LimitedCollection`
  - Sweeper configuration for cleaning old data
  - Warning: Do NOT customize GuildManager, ChannelManager, GuildChannelManager, RoleManager, or PermissionOverwriteManager

- **Gateway Intents Guide:** https://discordjs.guide/popular-topics/intents
  - Only enable necessary intents to reduce load
  - Understanding privileged vs standard intents
  - Intent selection best practices

- **Sharding Guide:** https://discordjs.guide/sharding/
  - When to shard (2500+ guilds or 10-15+ concurrent operations)
  - Resource distribution across processes
  - Each shard has its own event loop

#### Performance Optimization Guides
- **Optimizing Discord Bots:** https://toxigon.com/optimizing-your-discord-bot-for-performance
  - Efficient memory management and garbage collection
  - Memory leak prevention
  - Asynchronous programming patterns (`async/await`)
  - Profiling tools for identifying bottlenecks

#### Gateway Intents & Privacy
- **Intents Primer:** https://discordpy.readthedocs.io/en/stable/intents.html
- **Discord Gateway Intents Explainer:** https://gist.github.com/advaith1/e69bcc1cdd6d0087322734451f15aa2f
- **What are Privileged Intents:** https://support-dev.discord.com/hc/en-us/articles/6207308062871
  - GUILD_MEMBERS (Server Members)
  - GUILD_PRESENCES (Presence)
  - MESSAGE_CONTENT (Message Content)

#### Key Best Practices Summary

**Resource Efficiency:**
1. **Minimize Intents** - Only request what you need (reduces gateway traffic)
2. **Cache Limits** - Use `Options.cacheWithLimits()` to prevent memory bloat
3. **Sweepers** - Configure automatic cleanup of old cached data
4. **Process Isolation** - Never run multiple bots in same process
5. **Async Patterns** - Use `async/await` for non-blocking I/O

**Memory Management:**
```javascript
const client = new Client({
  makeCache: Options.cacheWithLimits({
    ...Options.DefaultMakeCacheSettings,
    MessageManager: 100,      // Limit message cache
    ReactionManager: 0,        // Disable reaction caching if not needed
    GuildMemberManager: {
      maxSize: 200,
      keepOverLimit: (member) => member.id === member.client.user.id,
    },
  }),
  sweepers: {
    messages: {
      interval: 3600,          // Every hour
      lifetime: 1800,          // Remove messages older than 30 minutes
    },
  },
  intents: [
    GatewayIntentBits.Guilds, // Only essential intents
    // Don't request privileged intents unless absolutely necessary
  ],
});
```

**API Rate Limiting:**
- Discord.js handles rate limits automatically
- Batch API calls when possible
- Use exponential backoff for retries
- Cache responses to minimize redundant requests

**Code Organization:**
- Object-oriented architecture for cleaner code
- Separate event handlers into individual files
- Use proper error handling for all async operations
- Profile code regularly to identify bottlenecks

### Discord Polls
- Discord Poll Resource Documentation: https://discord.com/developers/docs/resources/poll
- Poll API Reference: https://discord.com/developers/docs/resources/poll#poll-object
- Poll Create Structure: https://discord.com/developers/docs/resources/poll#poll-create-request-object

### Discord Slash Commands
- Slash Commands Guide: https://discord.com/developers/docs/interactions/application-commands
- Interaction Response Types: https://discord.com/developers/docs/interactions/receiving-and-responding

### Discord Developer Portal
- Developer Portal: https://discord.com/developers/applications
- Bot Permissions Calculator: https://discord.com/developers/docs/topics/permissions

## Google Sheets API Documentation

### Google Sheets API v4
- Overview: https://developers.google.com/sheets/api/guides/concepts
- API Reference: https://developers.google.com/sheets/api/reference/rest
- Node.js Quickstart: https://developers.google.com/sheets/api/quickstart/nodejs

### Reading Data
- Reading Values: https://developers.google.com/sheets/api/guides/values#read
- spreadsheets.values.get: https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/get
- Batch Get Values: https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/batchGet

### Writing Data
- Writing Values: https://developers.google.com/sheets/api/guides/values#write
- spreadsheets.values.update: https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/update
- Batch Update Values: https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/batchUpdate

### Authentication
- Authentication Overview: https://developers.google.com/sheets/api/guides/authorizing
- Service Account Setup: https://developers.google.com/identity/protocols/oauth2/service-account
- OAuth 2.0 for Client-side Apps: https://developers.google.com/identity/protocols/oauth2

### Google APIs Node.js Client
- GitHub Repository: https://github.com/googleapis/google-api-nodejs-client
- npm Package: https://www.npmjs.com/package/googleapis
- Sheets API Examples: https://github.com/googleapis/google-api-nodejs-client/tree/main/samples/sheets

## Project-Specific References

### Example Tournament Google Sheet
- Star Trek Tournament: https://docs.google.com/spreadsheets/d/1Z83Lr02EW9wvpH3YfBvLwafHMIqyxJLXaO_0D85bMfk/edit?usp=sharing
- Sheet Structure:
  - "Participants" tab: Ranked list of 64 participants (determines seeding)
  - "Regions" tab: Shows how 64 participants are distributed across 4 regions
  - "Bracket" tab: Visual tournament bracket
  - "Config" tab: Tournament settings
  - "Results" tab: Match results tracking
  - 16 participants per region (64 total)

## Additional Resources

### TypeScript
- TypeScript Documentation: https://www.typescriptlang.org/docs/

### Node.js Libraries
- dotenv (Environment Variables): https://www.npmjs.com/package/dotenv
- googleapis: https://www.npmjs.com/package/googleapis

## Notes

- All API keys and credentials should be stored in `.env` file (never committed to git)
- Google Sheets API requires OAuth 2.0 or Service Account authentication
- Discord polls are a native Discord feature (not buttons/reactions)

## Google Sheets API Setup (Completed)

### Service Account Configuration
- Project: vPoll-Bot (Google Cloud Console)
- Service Account: vpoll-sheets-access
- Credentials: `keys/vpoll-key.json` (not committed to git)
- Scopes: `https://www.googleapis.com/auth/spreadsheets`

### Testing
- Run `npm run test-sheets` to verify Google Sheets API connection
- Test script: `src/test-sheets.ts`

### Template Sheet Structure
- Template URL: https://docs.google.com/spreadsheets/d/1Z83Lr02EW9wvpH3YfBvLwafHMIqyxJLXaO_0D85bMfk/edit
- **Tabs:**
  - Participants: A1:D65 (Rank number, Participant name, Notes, Reference Link)
  - Regions: A1:E17 (Rank column + 4 region columns with participant names)
  - Bracket: Visual tournament bracket (formula-driven)
  - Config: Tournament settings (poll length, batches, channel IDs, etc.)
  - Results: Match results (16 columns per completed match)
