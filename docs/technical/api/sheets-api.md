# Google Sheets API Reference

**Google Sheets API v4 usage patterns for vPoll**

## Service Account Authentication

### Setup

```typescript
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  keyFile: './keys/vpoll-key.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
```

### Service Account Details

- **Email:** `vpoll-sheets-access@vpoll-475821.iam.gserviceaccount.com`
- **Key File:** `keys/vpoll-key.json` (not in git)
- **Scope:** Spreadsheets only (minimal permissions)
- **Required Permission:** Editor on tournament sheets

## Read Operations

### Read Single Range

```typescript
const response = await sheets.spreadsheets.values.get({
  spreadsheetId: '1Jm2oRCvsHN1ijeos6Bi1wqzN44C2eMJAO3KvkmCaCmo',
  range: 'Participants!A1:D65',
});

const values = response.data.values || [];
// values is a 2D array: [[row1col1, row1col2], [row2col1, row2col2], ...]
```

### Batch Read (Multiple Ranges)

```typescript
const response = await sheets.spreadsheets.values.batchGet({
  spreadsheetId: '1abc123...',
  ranges: [
    'Participants!A1:D65',
    'Config!A:B',
    'Regions!A1:E17'
  ],
});

response.data.valueRanges?.forEach(vr => {
  console.log(`Range: ${vr.range}`);
  console.log(`Values:`, vr.values);
});
```

## Write Operations

### Update Range

```typescript
await sheets.spreadsheets.values.update({
  spreadsheetId: '1abc123...',
  range: 'Bracket!C10',
  valueInputOption: 'RAW',  // or 'USER_ENTERED' for formulas
  requestBody: {
    values: [[true]]  // 2D array even for single cell
  },
});
```

### Append Rows

```typescript
await sheets.spreadsheets.values.append({
  spreadsheetId: '1abc123...',
  range: 'Results!A:P',  // Will find next empty row
  valueInputOption: 'RAW',
  requestBody: {
    values: [
      ['R1-ALPHA-M1', 'Round 1', 'ALPHA', 'Spock', 1, 45, ...]
    ]
  },
});
```

### Batch Update

```typescript
await sheets.spreadsheets.values.batchUpdate({
  spreadsheetId: '1abc123...',
  valueInputOption: 'RAW',
  requestBody: {
    data: [
      { range: 'Bracket!C10', values: [[true]] },
      { range: 'Bracket!C18', values: [[false]] },
    ]
  },
});
```

## A1 Notation

### Range Format

- `A1` - Single cell
- `A1:D65` - Rectangle from A1 to D65
- `A:A` - Entire column A
- `1:1` - Entire row 1
- `A:D` - Columns A through D
- `Sheet1!A1:D65` - Specific tab

### Column Letters

```
A=1, B=2, ..., Z=26, AA=27, AB=28, ..., AZ=52, BA=53, ...
```

## ValueInputOption

### RAW
- Values are stored exactly as provided
- No parsing or interpretation
- Use for: Literal text, numbers, booleans

```typescript
valueInputOption: 'RAW'
// "=SUM(A1:A10)" → stored as text "=SUM(A1:A10)"
// "true" → stored as text "true"
```

### USER_ENTERED
- Values parsed as if user typed them
- Formulas are evaluated
- Use for: Formulas, dates that should be parsed

```typescript
valueInputOption: 'USER_ENTERED'
// "=SUM(A1:A10)" → stored as formula, calculates result
// "2025-01-01" → stored as date
```

## Error Handling

### Common Error Codes

| Code | Error | Solution |
|------|-------|----------|
| 400 | Bad Request | Check A1 notation format |
| 403 | Permission Denied | Verify service account has Editor access |
| 404 | Not Found | Check spreadsheet ID is correct |
| 429 | Rate Limit | Implement exponential backoff |
| 500 | Internal Error | Retry operation |

### Retry Logic

```typescript
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      const isLastAttempt = i === maxRetries - 1;

      if (error.code === 429 && !isLastAttempt) {
        // Rate limit - exponential backoff
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        await sleep(delay);
        continue;
      }

      if (error.code >= 500 && !isLastAttempt) {
        // Server error - retry
        await sleep(1000);
        continue;
      }

      throw error; // Give up
    }
  }

  throw new Error('Max retries exceeded');
}
```

## API Quotas

### Limits

- **Read requests:** 100 per 100 seconds per user
- **Write requests:** 100 per 100 seconds per user
- **Daily limit:** 10,000 requests per day per project

### Optimization

**Use batch operations:**
```typescript
// Bad: 3 separate API calls
await readRange(sheetId, 'Participants!A1:D65');
await readRange(sheetId, 'Config!A:B');
await readRange(sheetId, 'Regions!A1:E17');

// Good: 1 API call
await batchReadRanges(sheetId, [
  'Participants!A1:D65',
  'Config!A:B',
  'Regions!A1:E17'
]);
```

### Tournament Usage Estimate

- **Tournament creation:** ~5 reads
- **Per match result:** ~2 writes (bracket + results)
- **Full 63-match tournament:** ~131 requests total
- **Daily capacity:** ~76 full tournaments

## Named Ranges

### Using Named Ranges

If sheet defines named ranges (e.g., `R1_ALPHA_M1_W`):

```typescript
await sheets.spreadsheets.values.update({
  spreadsheetId: '1abc123...',
  range: 'R1_ALPHA_M1_W',  // Named range instead of A1 notation
  valueInputOption: 'RAW',
  requestBody: {
    values: [[true]]
  },
});
```

**See:** [../specifications/bracket-cell-mapping.md](../specifications/bracket-cell-mapping.md)

## Spreadsheet Metadata

### Get Sheet Info

```typescript
const response = await sheets.spreadsheets.get({
  spreadsheetId: '1abc123...',
});

const metadata = {
  title: response.data.properties?.title,
  tabs: response.data.sheets?.map(s => ({
    title: s.properties?.title,
    sheetId: s.properties?.sheetId,
    index: s.properties?.index,
  })),
};
```

## Related Documentation

- **Sheets Integration:** [../architecture/sheets-integration.md](../architecture/sheets-integration.md)
- **Google Sheets Tabs:** [../../reference/google-sheets/README.md](../../reference/google-sheets/README.md)
- **Service Account Validation:** [../specifications/service-account-permissions.md](../specifications/service-account-permissions.md)
- **Official API Docs:** https://developers.google.com/sheets/api/reference/rest
