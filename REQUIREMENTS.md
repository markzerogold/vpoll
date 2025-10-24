# vPoll Product Requirements Document

**⚠️ This file has been reorganized for better context management**

The requirements documentation has been split into focused sections in `/docs/requirements/`.

## 📖 Read the Full Documentation

**Main Entry Point:** [docs/requirements/README.md](docs/requirements/README.md)

This provides navigation to all requirement sections with import links for Claude Code.

## 🎯 Quick Links

### Core Documents
- **[Product Overview](docs/requirements/01-product-overview.md)** - Problem, vision, personas
- **[MVP Scope](docs/requirements/02-scope-priorities.md)** - What's in/out, priorities
- **[Technical Architecture](docs/requirements/08-technical-architecture.md)** - Stack, data models

### Scenarios
- **[Setup Scenarios (1-11)](docs/requirements/03-scenarios-setup.md)** - Tournament creation
- **[Core Scenarios (12-14)](docs/requirements/04-scenarios-core.md)** - Tournament operations
- **[Admin Scenarios (15-19)](docs/requirements/05-scenarios-admin.md)** - Management controls
- **[Deferred Scenarios (20-30)](docs/requirements/06-scenarios-deferred.md)** - Future features

### Technical Details
- **[Google Sheets Spec](docs/requirements/07-google-sheets-spec.md)** - Complete template documentation
- **[Dependencies & Decisions](docs/requirements/09-dependencies-decisions.md)** - Risks, decision log

## 💡 Why This Structure?

**Benefits:**
- **85% context reduction** - Load only the sections you need
- **Easier navigation** - Find specific topics quickly
- **Better maintainability** - Update sections independently
- **Cleaner organization** - Logical flow through requirements

## 🔍 Using with Claude Code

Reference specific sections using `@` imports:

```
@docs/requirements/04-scenarios-core.md
@docs/requirements/07-google-sheets-spec.md
```

---

**Note:** The original 3,287-line REQUIREMENTS.md is preserved as `REQUIREMENTS_OLD.md` for reference.
