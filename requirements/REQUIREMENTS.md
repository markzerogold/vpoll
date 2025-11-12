# vPoll Requirements Index

**High-level requirement documents and technical specifications**

---

## 📁 Files in This Folder

### Behavioral Specifications

**[BRACKET_POPULATION_FLOW.md](BRACKET_POPULATION_FLOW.md)**
- Technical specification of bracket population behavior
- Formula-driven architecture (vPoll only writes TRUE/FALSE to checkboxes)
- Round progression flow
- How VLOOKUP formulas automatically display winners

**[WINNER_COPY_REMOVAL.md](WINNER_COPY_REMOVAL.md)**
- Decision document: Removal of winner copy code
- Why formulas alone are sufficient for bracket progression
- Problems caused by direct cell writes (overwrote region names, wrong columns)
- Current approach: Only write TRUE/FALSE to checkboxes, let formulas handle display

---

## 📚 Detailed Product Requirements

**Full requirements documentation:** [@docs/requirements/README.md](../docs/requirements/README.md)

The complete product requirements are organized in `/docs/requirements/` with 9 focused sections:

### Core Documents
- **[Product Overview](../docs/requirements/01-product-overview.md)** - Problem, vision, user personas
- **[MVP Scope](../docs/requirements/02-scope-priorities.md)** - What's in/out, priorities, trade-offs
- **[Technical Architecture](../docs/requirements/08-technical-architecture.md)** - Technology stack, data models

### User Scenarios
- **[Setup Scenarios (1-11)](../docs/requirements/03-scenarios-setup.md)** - Tournament creation and preparation
- **[Core Scenarios (12-14)](../docs/requirements/04-scenarios-core.md)** - Tournament operations
- **[Admin Scenarios (15-19)](../docs/requirements/05-scenarios-admin.md)** - Management controls
- **[Deferred Scenarios (20-30)](../docs/requirements/06-scenarios-deferred.md)** - Future features

### Technical Specifications
- **[Google Sheets Spec](../docs/requirements/07-google-sheets-spec.md)** - Complete template documentation
- **[Dependencies & Decisions](../docs/requirements/09-dependencies-decisions.md)** - Risks, decision log

---

## 🔍 Using with Claude Code

Reference specific documents using `@` imports for on-demand loading:

```
@requirements/BRACKET_POPULATION_FLOW.md
@requirements/WINNER_COPY_REMOVAL.md
@docs/requirements/04-scenarios-core.md
```

**Benefits:**
- **85% context reduction** - Load only what you need
- **Faster navigation** - Find specific topics quickly
- **Session efficiency** - Minimize token usage

---

## 📋 Quick Reference

**Current Phase:** Bracket formatting complete (Nov 2025) - Ready for MVP bot development

**Next Steps:**
1. Implement `/tournament create` command
2. Implement `/tournament start` command
3. Implement poll result tracking

**For current tasks:** See [@ACTION_ITEMS.md](../ACTION_ITEMS.md)

**For implementation details:** See [@docs/implementation/todo-phase1.md](../docs/implementation/todo-phase1.md)
