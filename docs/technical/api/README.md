# API References

**External API documentation and usage patterns**

## 📚 API Documentation

### Discord.js v14

**[discord-poll-api.md](discord-poll-api.md)** - Discord native poll specifics

- Poll creation format
- Duration parameter (hours, not minutes!)
- Poll event handling (no close event exists)
- Result reading patterns

**Official Docs:** https://discord.js.org/docs/packages/discord.js/14.14.1

### Google Sheets API v4

**[sheets-api.md](sheets-api.md)** - Google Sheets API patterns

- Service account authentication
- Read/write operations
- Batch operations for efficiency
- A1 notation reference
- Error handling and retry logic

**Official Docs:** https://developers.google.com/sheets/api/reference/rest

---

## Quick Reference

### Discord Poll API

**Create Poll:**
```typescript
const message = await channel.send({
  poll: {
    question: { text: "Question?" },
    answers: [
      { poll_media: { text: "Option 1" } },
      { poll_media: { text: "Option 2" } }
    ],
    duration: 24, // HOURS (not minutes!)
    allow_multiselect: false,
  }
});
```

**Read Poll Results:**
```typescript
const poll = message.poll;
const results = poll.answers.map(a => ({
  text: a.text,
  votes: a.voteCount
}));
```

**Important:** No poll close event! Must poll periodically.

---

### Google Sheets API

**Read Range:**
```typescript
const response = await sheets.spreadsheets.values.get({
  spreadsheetId: '1abc...',
  range: 'Participants!A1:D65'
});
const values = response.data.values; // 2D array
```

**Write Range:**
```typescript
await sheets.spreadsheets.values.update({
  spreadsheetId: '1abc...',
  range: 'Results!A2:P2',
  valueInputOption: 'RAW',
  requestBody: {
    values: [['R1-ALPHA-M1', 'Round 1', ...]]
  }
});
```

**Batch Operations:**
```typescript
await sheets.spreadsheets.values.batchUpdate({
  spreadsheetId: '1abc...',
  valueInputOption: 'RAW',
  requestBody: {
    data: [
      { range: 'Bracket!C10', values: [[true]] },
      { range: 'Bracket!C18', values: [[false]] }
    ]
  }
});
```

---

## Related Documentation

- **Discord Integration:** [../architecture/discord-integration.md](../architecture/discord-integration.md)
- **Sheets Integration:** [../architecture/sheets-integration.md](../architecture/sheets-integration.md)
- **Specifications:** [../specifications/README.md](../specifications/README.md)
- **Quick Start:** [../../quick-start/README.md](../../quick-start/README.md)

---

**Last Updated:** 2025-10-30
