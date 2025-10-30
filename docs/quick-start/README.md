# Quick Start Guide

**Fast navigation to essential vPoll documentation**

## 🚀 New to vPoll?

1. **[5-Minute Setup](setup.md)** - Get the bot running in 5 minutes
2. **[Bot Commands Reference](commands.md)** - All `/tournament` commands explained
3. **[Common Dev Tasks](common-tasks.md)** - Frequent workflow patterns

## 📚 Complete Documentation

### Requirements & Planning
- [Product Requirements Overview](../requirements/README.md) - Full product vision
- [Current Implementation Tasks](../implementation/todo-phase1.md) - What's being built now
- [Future Features](../reference/FUTURE.md) - Post-MVP enhancements

### Technical Documentation
- [Architecture Overview](../technical/architecture/overview.md) - System design
- [Technical Specifications](../technical/specifications/README.md) - Implementation specs
- [Google Sheets Integration](../reference/google-sheets/README.md) - Template structure
- [API References](../technical/api/README.md) - Discord.js & Sheets APIs

### Testing & Tools
- [Test Sheet Generation](../reference/TEST_SHEET_GENERATION.md) - Create test data
- [Discord & Sheets References](../reference/REFERENCES.md) - External docs

## ⚡ Quick Commands

```bash
# Setup
npm install
cp .env.example .env  # Then edit with your credentials

# Development
npm run dev           # Run with hot reload
npm run build         # Compile TypeScript
npm run deploy-commands  # Register commands with Discord

# Code Quality
npm run lint          # Check code style
npm run format        # Auto-format code

# Testing
npm run test-sheets   # Test Google Sheets connection
```

## 🔑 Essential Credentials

**Discord:** Get from [Discord Developer Portal](https://discord.com/developers/applications)
- `DISCORD_TOKEN` - Bot token
- `CLIENT_ID` - Application ID

**Google Sheets:** Service account authentication
- Email: `vpoll-sheets-access@vpoll-475821.iam.gserviceaccount.com`
- Credentials file: `keys/vpoll-key.json` (not in git)

## 📖 Documentation Philosophy

vPoll uses a **load-on-demand** documentation structure to optimize Claude Code context usage:

- **CLAUDE.md** - Always loaded, provides quick links with `@import` syntax
- **quick-start/** - Fast reference (this folder)
- **requirements/** - Modular product specs (9 focused files)
- **technical/** - Implementation details (split by concern)
- **reference/** - Supporting materials and future plans

Use `@docs/path/to/file.md` in Claude Code to load specific documentation as needed, keeping your context window efficient.
