# vPoll Product Requirements Document

**Last Updated:** 2025-10-23
**Status:** In Development - MVP Phase
**Owner:** Product Team

---

## 📚 Documentation Structure

This document is split into focused sections for easier navigation and context management. Each section can be referenced independently using `@docs/requirements/[filename]`.

### Core Requirements

1. **[@01-product-overview.md](01-product-overview.md)** - Product overview, problem statement, vision, and user personas
2. **[@02-scope-priorities.md](02-scope-priorities.md)** - MVP scope, priorities, and key trade-offs
3. **[@08-technical-architecture.md](08-technical-architecture.md)** - Technology stack, data models, and architecture

### User Scenarios

4. **[@03-scenarios-setup.md](03-scenarios-setup.md)** - Scenarios 1-11: Tournament setup and preparation
5. **[@04-scenarios-core.md](04-scenarios-core.md)** - Scenarios 12-14: Core tournament operations
6. **[@05-scenarios-admin.md](05-scenarios-admin.md)** - Scenarios 15-19: Admin controls
7. **[@06-scenarios-deferred.md](06-scenarios-deferred.md)** - Scenarios 20-30: Deferred features

### Technical Specifications

8. **[@07-google-sheets-spec.md](07-google-sheets-spec.md)** - Complete Google Sheets template specification
9. **[@09-dependencies-decisions.md](09-dependencies-decisions.md)** - Dependencies, risks, and decision log

---

## Quick Reference

### MVP Scope (12 Core Features)

**Phase 1: Core Tournament Flow** ✅ Must Have
- Tournament creation from Google Sheets template
- Automated poll creation with configurable batching
- Poll result tracking and Google Sheets updates
- Bracket progression through all 6 rounds
- Winner announcement
- Basic validation and error handling
- Tiebreaker dice rolls

**Phase 2: Admin Controls** ✅ Must Have
- Manual round advancement commands
- Tournament pause/resume
- Tournament cancellation
- Results display commands

**Phase 3: Advanced Configuration** ⚠️ Should Have
- Auto round scheduling
- Thread/channel organization (manual setup)

### Key Architecture Decisions

- **Data Storage:** Google Sheets (transparency, no backend required)
- **Voting Mechanism:** Discord native polls (familiar UX)
- **Tournament Format:** 64-participant single elimination
- **Bot Type:** Private bot for MVP (public deployment deferred)

### Related Documentation

- **Technical Specifications:** [../../TECHNICAL_SPEC.md](../../TECHNICAL_SPEC.md)
- **Future Features:** [../../FUTURE.md](../../FUTURE.md)
- **Implementation Tasks:** [../../TODO.md](../../TODO.md)
- **Project Setup:** [../../README.md](../../README.md)

---

## Navigation

For full context on any section, use the `@` import syntax:

```
@docs/requirements/01-product-overview.md
@docs/requirements/04-scenarios-core.md
@docs/requirements/07-google-sheets-spec.md
```

This allows Claude Code to load only the sections you need, reducing context window usage by ~85%.

---

**Note:** This README serves as the entry point for all requirements documentation. The original monolithic REQUIREMENTS.md (3,287 lines) has been split into 9 focused files for better maintainability and context efficiency.
