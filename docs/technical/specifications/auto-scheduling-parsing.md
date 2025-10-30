## 8. Auto Scheduling Time Parsing

### Problem Statement
Format like "3 days" needs parsing rules for variations (case, singular/plural, decimal values).

### Solution: Flexible Time Parser

#### Supported Formats

```typescript
const TIME_FORMATS = {
  immediate: 0,
  disabled: -1, // Blank or empty

  // Time unit patterns (case-insensitive)
  hours: /^(\d+(?:\.\d+)?)\s*(hours?|hrs?|h)$/i,
  days: /^(\d+(?:\.\d+)?)\s*(days?|d)$/i
};
```

#### Parsing Algorithm

```typescript
function parseAutoRoundScheduling(configValue: string): number {
  // Trim and lowercase for comparison
  const trimmed = configValue.trim().toLowerCase();

  // Check for special values
  if (trimmed === '' || trimmed === 'disabled' || trimmed === 'none') {
    return -1; // Disabled
  }

  if (trimmed === 'immediate') {
    return 0; // Zero delay
  }

  // Try to match hours pattern
  const hoursMatch = trimmed.match(TIME_FORMATS.hours);
  if (hoursMatch) {
    const hours = parseFloat(hoursMatch[1]);
    return hours * 60 * 60 * 1000; // Convert to milliseconds
  }

  // Try to match days pattern
  const daysMatch = trimmed.match(TIME_FORMATS.days);
  if (daysMatch) {
    const days = parseFloat(daysMatch[1]);
    return days * 24 * 60 * 60 * 1000; // Convert to milliseconds
  }

  // Invalid format
  throw new Error(`Invalid Auto Round Scheduling format: "${configValue}". Expected: "immediate", "X hours", or "X days"`);
}
```

#### Examples

| Input | Parsed Delay (ms) | Notes |
|-------|-------------------|-------|
| `""` (empty) | -1 | Disabled |
| `"disabled"` | -1 | Explicitly disabled |
| `"immediate"` | 0 | No delay |
| `"24 hours"` | 86,400,000 | 24 hours in ms |
| `"24 hour"` | 86,400,000 | Singular accepted |
| `"24h"` | 86,400,000 | Short form accepted |
| `"3 days"` | 259,200,000 | 3 days in ms |
| `"3 day"` | 259,200,000 | Singular accepted |
| `"3d"` | 259,200,000 | Short form accepted |
| `"2.5 days"` | 216,000,000 | Decimal values accepted |
| `"48 hours"` | 172,800,000 | Equivalent to 2 days |
| `"3 DAYS"` | 259,200,000 | Case-insensitive |
| `"  3 days  "` | 259,200,000 | Whitespace trimmed |

#### Validation

```typescript
function validateAutoRoundScheduling(delayMs: number): ValidationResult {
  if (delayMs === -1) {
    return { valid: true, message: 'Auto-scheduling disabled (manual advancement only)' };
  }

  if (delayMs === 0) {
    return { valid: true, message: 'Auto-scheduling: immediate (no delay)' };
  }

  if (delayMs < 0) {
    return { valid: false, error: 'Delay cannot be negative' };
  }

  // Warn if delay is very long
  const maxDays = 30;
  if (delayMs > maxDays * 24 * 60 * 60 * 1000) {
    return {
      valid: false,
      error: `Delay exceeds ${maxDays} days. Tournament may be forgotten.`
    };
  }

  return { valid: true };
}
```

---
