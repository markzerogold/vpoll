# Technical Documentation

**Complete technical reference for vPoll implementation**

## 📁 Documentation Structure

### Specifications
**[specifications/](specifications/README.md)** - Detailed implementation specs for ambiguous requirements

10 focused specification documents (69-155 lines each):
- Bracket cell mapping and formulas
- Match ID generation and poll batches
- Discord poll duration and event handling
- Config parsing and permissions validation
- Auto scheduling and thread configuration

**Why separate?** Originally one 1,244-line TECHNICAL_SPEC.md, now split for efficient context loading.

---

### Architecture
**[architecture/](architecture/)** - System design and patterns

- **[overview.md](architecture/overview.md)** - High-level architecture
- **[data-models.md](architecture/data-models.md)** - TypeScript interfaces
- **[discord-integration.md](architecture/discord-integration.md)** - Discord.js patterns
- **[sheets-integration.md](architecture/sheets-integration.md)** - Google Sheets patterns

---

### Decisions
**[decisions/](decisions/README.md)** - Architecture Decision Records (ADR)

10 major decisions with rationale:
1. Google Sheets vs Database
2. Discord native polls vs custom voting
3. Private bot vs public deployment
4. And more...

---

### API References
**[api/](api/README.md)** - External API documentation

- Discord.js v14 poll API specifics
- Google Sheets API v4 patterns
- Service account authentication

---

## 🎯 Quick Navigation by Task

### Implementing Tournament Creation
1. Read [specifications/config-tab-parsing.md](specifications/config-tab-parsing.md)
2. Read [specifications/service-account-permissions.md](specifications/service-account-permissions.md)
3. Read [architecture/data-models.md](architecture/data-models.md) for `TournamentState` interface
4. See [../implementation/todo-phase1.md](../implementation/todo-phase1.md) for tasks

### Implementing Poll Creation
1. Read [specifications/discord-poll-duration.md](specifications/discord-poll-duration.md)
2. Read [specifications/poll-batches-calculation.md](specifications/poll-batches-calculation.md)
3. Read [architecture/discord-integration.md](architecture/discord-integration.md)
4. See [api/discord-poll-api.md](api/discord-poll-api.md) for Discord.js specifics

### Implementing Result Tracking
1. Read [specifications/match-id-generation.md](specifications/match-id-generation.md)
2. Read [specifications/bracket-cell-mapping.md](specifications/bracket-cell-mapping.md)
3. Read [specifications/poll-close-event-handling.md](specifications/poll-close-event-handling.md)
4. See [architecture/sheets-integration.md](architecture/sheets-integration.md)

---

## 📚 Related Documentation

- **Requirements:** [../requirements/README.md](../requirements/README.md) - Product specifications
- **Quick Start:** [../quick-start/README.md](../quick-start/README.md) - Dev workflows
- **Implementation:** [../implementation/TODO.md](../implementation/TODO.md) - Current tasks
- **Google Sheets:** [../reference/google-sheets/README.md](../reference/google-sheets/README.md) - Template structure

---

## 💡 Documentation Philosophy

**Load on-demand:** Use `@docs/technical/[path]` to load specific documentation as needed, keeping context efficient.

**Focused files:** Each document serves a single purpose (100-200 lines ideal).

**Cross-referenced:** Documents link to related content rather than duplicating information.

---

**Last Updated:** 2025-10-30
