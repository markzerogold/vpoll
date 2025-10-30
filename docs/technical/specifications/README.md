# Technical Specifications Index

**Detailed implementation specifications for ambiguous areas in REQUIREMENTS.md**

This folder contains 10 focused specification documents that resolve critical implementation questions not fully answered in the main requirements documentation.

## 📋 Specification Documents

### Google Sheets Integration

1. **[Bracket Cell Mapping](bracket-cell-mapping.md)** - Named range approach for TRUE/FALSE advancement cells
2. **[Bracket Formula Logic](bracket-formula-logic.md)** - Formula-driven bracket display patterns
3. **[Config Tab Parsing](config-tab-parsing.md)** - Case-insensitive parsing rules and validation
4. **[Service Account Permissions](service-account-permissions.md)** - Permission validation and test write approach

### Tournament Logic

5. **[Match ID Generation](match-id-generation.md)** - Algorithm for generating match IDs across all 6 rounds
6. **[Poll Batches Calculation](poll-batches-calculation.md)** - Match distribution across batches
7. **[Thread ID Configuration](thread-id-configuration.md)** - Per-round thread configuration format

### Discord Integration

8. **[Discord Poll Duration](discord-poll-duration.md)** - Poll API duration format (hours, not minutes)
9. **[Poll Close Event Handling](poll-close-event-handling.md)** - Polling strategy (no Discord event exists)
10. **[Auto Scheduling Parsing](auto-scheduling-parsing.md)** - Flexible time format parsing (hours/days)

## 🎯 Purpose

These specifications resolve the **10 critical/high priority ambiguities** identified during requirements analysis that would block implementation. Each document provides:

- **Problem Statement** - What ambiguity exists in REQUIREMENTS.md
- **Solution** - Concrete technical decision
- **Implementation Details** - Code examples and algorithms
- **Validation** - How to verify correctness

## 📚 Related Documentation

- **Requirements:** [../../requirements/README.md](../../requirements/README.md) - Product specifications
- **Architecture:** [../architecture/overview.md](../architecture/overview.md) - System design
- **Google Sheets Tabs:** [../../reference/google-sheets/README.md](../../reference/google-sheets/README.md) - Template structure
- **API References:** [../api/README.md](../api/README.md) - Discord.js & Sheets APIs

## 📖 How to Use

When implementing a feature, consult the relevant specification for concrete technical decisions. These specs are meant to be **definitive references** that eliminate ambiguity and prevent reimplementation.

### Example: Implementing Result Tracking

```typescript
// Scenario 12: Update bracket after poll closes

// 1. Consult Match ID Generation spec
const matchId = generateMatchId(round, region, matchNumber); // "R1-ALPHA-M1"

// 2. Consult Bracket Cell Mapping spec
const winnerCell = matchId.replace(/-/g, '_') + '_W'; // "R1_ALPHA_M1_W"
const loserCell = matchId.replace(/-/g, '_') + '_L';

// 3. Write TRUE/FALSE to named ranges
await sheetsService.writeNamedRange(sheetId, winnerCell, [[true]]);
await sheetsService.writeNamedRange(sheetId, loserCell, [[false]]);
```

## 🔧 Implementation Status

| Spec | Status | Implementation File |
|------|--------|---------------------|
| Bracket Cell Mapping | ⚠️ Not Started | TBD |
| Bracket Formula Logic | ⚠️ Not Started | TBD |
| Match ID Generation | ⚠️ Not Started | TBD |
| Poll Batches Calculation | ⚠️ Not Started | TBD |
| Discord Poll Duration | ⚠️ Not Started | TBD |
| Poll Close Event Handling | ⚠️ Not Started | TBD |
| Config Tab Parsing | ⚠️ Not Started | TBD |
| Auto Scheduling Parsing | ⚠️ Not Started | TBD |
| Service Account Permissions | ⚠️ Not Started | TBD |
| Thread ID Configuration | ⚠️ Not Started | TBD |

---

**Version:** 1.0
**Last Updated:** 2025-10-30
**Status:** Specifications finalized, implementation pending
