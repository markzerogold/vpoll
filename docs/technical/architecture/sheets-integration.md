# Google Sheets Integration

**Google Sheets API v4 patterns for vPoll**

## Service Account Authentication

### Setup

```typescript
// src/services/sheets.ts
import { google } from 'googleapis';
import * as path from 'path';

const keyPath = path.join(__dirname, '../../keys/vpoll-key.json');

const auth = new google.auth.GoogleAuth({
  keyFile: keyPath,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
```

### Service Account Details

- Email: `vpoll-sheets-access@vpoll-475821.iam.gserviceaccount.com`
- Key file: `keys/vpoll-key.json` (not committed to git)
- Scope: Sheets API only (minimal permissions)

## Read Operations

### Read Single Range

```typescript
async function readRange(
  spreadsheetId: string,
  range: string
): Promise<any[][]> {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  return response.data.values || [];
}
```

### Read Multiple Ranges (Batch)

```typescript
async function batchReadRanges(
  spreadsheetId: string,
  ranges: string[]
): Promise<{ [range: string]: any[][] }> {
  const response = await sheets.spreadsheets.values.batchGet({
    spreadsheetId,
    ranges,
  });

  const result: { [range: string]: any[][] } = {};

  response.data.valueRanges?.forEach((vr) => {
    if (vr.range) {
      result[vr.range] = vr.values || [];
    }
  });

  return result;
}
```

**Efficiency:** Batch reads reduce API calls:
```typescript
// Instead of 3 separate calls:
const data = await batchReadRanges(sheetId, [
  'Participants!A1:D65',
  'Config!A:B',
  'Regions!A1:E17'
]);
```

## Write Operations

### Update Range

```typescript
async function writeRange(
  spreadsheetId: string,
  range: string,
  values: any[][]
): Promise<void> {
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED', // Parses formulas
    requestBody: { values },
  });
}
```

### Append Rows

```typescript
async function appendRow(
  spreadsheetId: string,
  range: string,
  values: any[][]
): Promise<void> {
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: 'RAW', // Literal values
    requestBody: { values },
  });
}
```

### Batch Update

```typescript
async function batchUpdate(
  spreadsheetId: string,
  updates: Array<{ range: string; values: any[][] }>
): Promise<void> {
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    valueInputOption: 'RAW',
    requestBody: {
      data: updates.map(u => ({
        range: u.range,
        values: u.values,
      })),
    },
  });
}
```

**Example:** Update bracket TRUE/FALSE cells:
```typescript
await batchUpdate(sheetId, [
  { range: 'Bracket!R1_ALPHA_M1_W', values: [[true]] },
  { range: 'Bracket!R1_ALPHA_M1_L', values: [[false]] },
]);
```

## Named Ranges

### Write to Named Range

```typescript
async function writeNamedRange(
  spreadsheetId: string,
  namedRange: string,
  values: any[][]
): Promise<void> {
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: namedRange, // e.g., "R1_ALPHA_M1_W"
    valueInputOption: 'RAW',
    requestBody: { values },
  });
}
```

**See:** [../specifications/bracket-cell-mapping.md](../specifications/bracket-cell-mapping.md)

## Metadata Operations

### Get Spreadsheet Info

```typescript
async function getSpreadsheetMetadata(spreadsheetId: string) {
  const response = await sheets.spreadsheets.get({
    spreadsheetId,
  });

  return {
    title: response.data.properties?.title,
    tabs: response.data.sheets?.map(s => s.properties?.title),
  };
}
```

## Error Handling

### Retry Logic with Exponential Backoff

```typescript
async function safeSheetUpdate(
  updateFn: () => Promise<void>,
  retries: number = 3
): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      await updateFn();
      return;
    } catch (error) {
      if (i === retries - 1) {
        console.error('Sheet update failed after retries:', error);
        throw error;
      }
      await sleep(Math.pow(2, i) * 1000); // 1s, 2s, 4s
    }
  }
}
```

### Common Errors

| Error Code | Meaning | Solution |
|------------|---------|----------|
| 403 | Permission denied | Check service account has Editor access |
| 404 | Sheet not found | Verify spreadsheet ID is correct |
| 429 | Rate limit | Add exponential backoff |
| 400 | Invalid range | Check A1 notation format |

## API Quota Limits

**Daily Quota:** 10,000 requests per day

**Tournament Usage Estimate:**
- Tournament creation: ~5 reads
- Per match result: ~2 writes (bracket + results)
- Full 63-match tournament: ~131 requests
- **Capacity:** ~76 tournaments per day (well within limit)

**Optimization:** Use batch operations to reduce request count

## A1 Notation Reference

### Range Examples

- `A1:D65` - Rectangle from A1 to D65
- `Config!A:B` - All rows in columns A and B of Config tab
- `Participants!A1:D65` - Specific tab and range
- `R1_ALPHA_M1_W` - Named range (if defined)

### Column Letters

- A = 1st column
- Z = 26th column
- AA = 27th column
- AZ = 52nd column

## Related Documentation

- **Architecture Overview:** [overview.md](overview.md)
- **Google Sheets Tabs:** [../../reference/google-sheets/README.md](../../reference/google-sheets/README.md)
- **Service Account Validation:** [../specifications/service-account-permissions.md](../specifications/service-account-permissions.md)
- **Config Parsing:** [../specifications/config-tab-parsing.md](../specifications/config-tab-parsing.md)
