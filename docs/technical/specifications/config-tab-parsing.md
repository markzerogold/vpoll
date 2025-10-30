## 7. Config Tab Parsing Rules

### Problem Statement
Config tab format (headers, case sensitivity, whitespace handling) is not fully specified.

### Solution: Strict Parsing Rules

#### Config Tab Structure

**Row 1: Header Row**
```
| Setting Name | Value | Description |
```

**Parsing starts at Row 2.**

#### Parsing Algorithm

```typescript
function parseConfigTab(values: string[][]): TournamentConfig {
  // Skip header row (row 1 is index 0)
  const configRows = values.slice(1);

  const config: { [key: string]: string } = {};

  configRows.forEach((row, index) => {
    if (row.length < 2) {
      logger.warn(`Config row ${index + 2} has fewer than 2 columns, skipping`);
      return;
    }

    const key = normalizeConfigKey(row[0]);
    const value = row[1]?.toString().trim() || '';

    if (key) {
      config[key] = value;
    }
  });

  return mapToTournamentConfig(config);
}

function normalizeConfigKey(key: string | undefined): string {
  if (!key) return '';

  return key
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_'); // "Poll Length" -> "poll_length"
}
```

#### Config Key Mapping

**Case-insensitive, whitespace-normalized:**

| User Input | Normalized Key | Config Field |
|------------|----------------|--------------|
| "Tournament Name" | tournament_name | tournamentName |
| "tournament name" | tournament_name | tournamentName |
| "Poll Length" | poll_length | pollLengthHours |
| "poll_length" | poll_length | pollLengthHours |
| "Discord Channel ID" | discord_channel_id | discordChannelId |

#### Required Config Values

**Must be present and non-empty:**
```typescript
const REQUIRED_CONFIG = [
  'tournament_name',
  'tournament_description',
  'start_date',
  'poll_length',
  'poll_batches',
  'discord_channel_id',
  'auto_advance',
  'tie_breaker_rule',
  'results_visibility'
];

function validateRequiredConfig(config: { [key: string]: string }): ValidationResult {
  const missing: string[] = [];

  REQUIRED_CONFIG.forEach(key => {
    if (!config[key] || config[key].trim() === '') {
      missing.push(key.replace(/_/g, ' '));
    }
  });

  if (missing.length > 0) {
    return {
      valid: false,
      errors: [`Missing required config values: ${missing.join(', ')}`]
    };
  }

  return { valid: true };
}
```

#### Unknown Config Keys

**Behavior:** Warn but don't error

```typescript
const KNOWN_CONFIG_KEYS = [
  'tournament_name',
  'tournament_description',
  'start_date',
  'poll_length',
  'poll_batches',
  'discord_channel_id',
  'auto_advance',
  'tie_breaker_rule',
  'results_visibility',
  'auto_round_scheduling',
  'celebratory_gif',
  // Thread IDs (optional, 6 rounds)
  'round_1_thread_id',
  'round_2_thread_id',
  'round_3_thread_id',
  'round_4_thread_id',
  'round_5_thread_id',
  'round_6_thread_id'
];

// Unknown keys generate warnings
configRows.forEach((row, index) => {
  const key = normalizeConfigKey(row[0]);
  if (key && !KNOWN_CONFIG_KEYS.includes(key)) {
    logger.warn(`Unknown config key at row ${index + 2}: "${row[0]}" (normalized: "${key}")`);
  }
});
```

---
