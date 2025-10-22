# Test Tournament Sheet Generation

This guide explains how to create a test Google Sheet with mock tournament data for testing vPoll.

## Quick Start

### Step 1: Create a Blank Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click "Blank" to create a new spreadsheet
3. Name it something like "vPoll Test Tournament"

### Step 2: Share with Service Account

1. Click the "Share" button in the top-right
2. Enter this email address: `vpoll-sheets-access@vpoll-475821.iam.gserviceaccount.com`
3. Set permission to: **Editor** (required!)
4. Click "Send"

### Step 3: Get the Spreadsheet ID

From the URL of your sheet:
```
https://docs.google.com/spreadsheets/d/1Z83Lr02EW9wvpH3YfBvLwafHMIqyxJLXaO_0D85bMfk/edit
                                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                      This is the spreadsheet ID
```

### Step 4: Run the Population Script

```bash
npm run populate-test-sheet <spreadsheet-id>
```

Example:
```bash
npm run populate-test-sheet 1Z83Lr02EW9wvpH3YfBvLwafHMIqyxJLXaO_0D85bMfk
```

### Step 5: Verify the Sheet

The script will create 5 tabs with data:

1. **Participants** (64 Star Trek characters with ranks, notes, and reference links)
2. **Config** (Tournament settings with realistic values)
3. **Regions** (4 regions: Federation, Klingon Empire, Romulan Star Empire, Dominion)
4. **Bracket** (Simplified bracket visualization)
5. **Results** (Header row, ready for match results)

### Step 6: Make it Publicly Viewable (Optional)

1. Click "Share" again
2. Change "General access" to: "Anyone with the link" → **Viewer**
3. This allows Discord users to view the bracket without Google sign-in

### Step 7: Update Discord Channel ID

1. Open the Config tab
2. Find "Discord Channel ID" row
3. Replace `1234567890123456789` with your actual Discord channel ID
   - Right-click your channel in Discord → "Copy Channel ID"

## What Data is Generated?

### Participants (64 Characters)

- Rank 1: Spock (TOS/TAS/Films/SNW)
- Rank 2: Jean-Luc Picard (TNG/Films)
- Rank 3: Data (TNG/Films)
- Rank 4: Worf (TNG/DS9/Films)
- ... and 60 more Star Trek characters!

Each participant has:
- **Rank** (1-64, determines seeding)
- **Name** (character name with series)
- **Notes** (brief description)
- **Reference Link** (Memory Alpha wiki URL)

### Config Settings

Tournament configuration includes:
- **Tournament Name:** Star Trek Character Battle 2025
- **Poll Length:** 24 hours
- **Poll Batches:** full round (all 32 matches at once)
- **Auto-advance:** true
- **Tie Breaker:** Dice roll
- **Match Preview Posts:** true
- **Auto Round Scheduling:** 3 days

### Regions Distribution

64 participants distributed across 4 regions (16 each):
- **Federation** - Ranks 1, 5, 9, 13, 17, 21, 25, 29, 33, 37, 41, 45, 49, 53, 57, 61
- **Klingon Empire** - Ranks 2, 6, 10, 14, 18, 22, 26, 30, 34, 38, 42, 46, 50, 54, 58, 62
- **Romulan Star Empire** - Ranks 3, 7, 11, 15, 19, 23, 27, 31, 35, 39, 43, 47, 51, 55, 59, 63
- **Dominion** - Ranks 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64

## Testing the Sheet

After populating the sheet, you can:

1. **Test validation:** Run `/tournament create <sheet-url>` in Discord
2. **Verify participant distribution:** Check that all 64 participants are in correct regions
3. **Test tournament start:** Start a test tournament
4. **Test poll creation:** Verify polls are created with correct participant names and seeds

## Troubleshooting

### Error: "The caller does not have permission"

**Cause:** Service account doesn't have Editor access to the sheet

**Fix:**
1. Go to the sheet
2. Click Share
3. Verify `vpoll-sheets-access@vpoll-475821.iam.gserviceaccount.com` is listed with "Editor" permission
4. If not listed, add it again

### Error: "Unable to parse range"

**Cause:** Sheet tabs don't exist or have wrong names

**Fix:** The script will automatically create/rename tabs. If this fails, manually create tabs named: Participants, Config, Regions, Bracket, Results

### Error: "Spreadsheet not found"

**Cause:** Invalid spreadsheet ID

**Fix:** Double-check you copied the ID from the URL correctly (the long alphanumeric string)

## Advanced Usage

### Multiple Test Sheets

You can create multiple test sheets for different scenarios:

```bash
# Create sheet 1 with mock data
npm run populate-test-sheet <id-1>

# Create sheet 2 with same data (for testing multiple tournaments)
npm run populate-test-sheet <id-2>
```

### Modifying Mock Data

To change the participants or config:

1. Edit `src/populate-test-sheet.ts`
2. Modify the `mockParticipants` or `tournamentConfig` arrays
3. Run the script again on a new sheet

## Next Steps

After creating your test sheet:

1. ✅ Test `/tournament create` command validation
2. ✅ Test `/tournament start` command
3. ✅ Test poll creation and batching
4. ✅ Test result tracking and bracket updates
5. ✅ Test full tournament flow (all 6 rounds)

---

**Service Account Email:** `vpoll-sheets-access@vpoll-475821.iam.gserviceaccount.com`

**Questions?** Check the main README.md or REQUIREMENTS.md for more details.
