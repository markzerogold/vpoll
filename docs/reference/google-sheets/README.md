# Google Sheets Template Specification

**Complete specification for vPoll tournament Google Sheets structure**

All tournaments use a Google Sheets template with **6 tabs**. This folder contains detailed specifications for each tab.

## 📊 Template Tabs

### Core Tournament Data

1. **[Bracket Tab](bracket-tab.md)** (Tab 1) - Formula-driven visual tournament bracket
   - TRUE/FALSE winner indicators
   - Vote display format: `45 (1) Spock`
   - Auto-propagates winners to next rounds

2. **[Participants Tab](participants-tab.md)** (Tab 3) - 64 tournament participants
   - Columns: Rank, Name, Notes, Reference Link
   - Ranks 1-64 determine seeding

3. **[Regions Tab](regions-tab.md)** (Tab 4) - 4 customizable regions
   - 16 participants per region
   - Distribution pattern: Ranks 1-4 → Regions 1-4, repeat

4. **[Config Tab](config-tab.md)** (Tab 5) - Tournament settings
   - 13+ configuration parameters
   - Poll length, batching, auto-advance, etc.

5. **[Results Tab](results-tab.md)** (Tab 2) - Match history
   - 16 columns per match
   - Chronological result records
   - Vote counts and timestamps

6. **[Instructions Tab](instructions-tab.md)** (Tab 6) - Built-in documentation
   - Setup guide for tournament creators
   - ~100 rows of instructional content

## 🔗 Master Template

**URL:** https://docs.google.com/spreadsheets/d/1Jm2oRCvsHN1ijeos6Bi1wqzN44C2eMJAO3KvkmCaCmo/edit

**Access in Discord:** `/tournament template`

## 🔐 Service Account Requirements

**Email:** `vpoll-sheets-access@vpoll-475821.iam.gserviceaccount.com`

**Required Permission:** Editor (not Viewer)

**Why Editor?** vPoll needs write access to:
- Update Bracket tab (TRUE/FALSE for winners)
- Append rows to Results tab
- Validate sheet structure

## 🎯 Tab Order Recommendation

While vPoll finds tabs by name (order doesn't matter), this recommended order optimizes user experience:

1. **Bracket** - Most frequently viewed, should be first tab
2. **Results** - Second most viewed
3. **Participants** - Setup phase, less frequent access after creation
4. **Regions** - Setup phase only
5. **Config** - Setup phase only
6. **Instructions** - Reference only

## 📚 Related Documentation

- **Technical Specs:** [../../technical/specifications/README.md](../../technical/specifications/README.md)
  - [Bracket Cell Mapping](../../technical/specifications/bracket-cell-mapping.md)
  - [Bracket Formula Logic](../../technical/specifications/bracket-formula-logic.md)
  - [Config Tab Parsing](../../technical/specifications/config-tab-parsing.md)
- **Requirements:** [../../requirements/07-google-sheets-spec.md](../../requirements/07-google-sheets-spec.md) (Full original spec)
- **Test Sheet Generation:** [../TEST_SHEET_GENERATION.md](../TEST_SHEET_GENERATION.md)

## 🔧 Validation

vPoll validates sheet structure during `/tournament create`:

- ✅ All 6 tabs exist (by name, not position)
- ✅ Participants tab: 64 unique participants, ranks 1-64
- ✅ Config tab: All required settings present
- ✅ Regions tab: 4 unique region names
- ✅ Service account has Editor access
- ✅ Bracket tab: Named ranges for advancement cells (126 total)

See [../../technical/specifications/config-tab-parsing.md](../../technical/specifications/config-tab-parsing.md) for validation details.

## 🎓 Quick Start

1. Get template: `/tournament template` in Discord
2. Make a copy: File → Make a copy
3. Fill in:
   - **Participants tab:** 64 participants with ranks
   - **Config tab:** Required settings (8 minimum)
   - **Regions tab:** Customize region names (optional)
4. Share with service account (Editor permission)
5. Create tournament: `/tournament create <your-sheet-url>`
