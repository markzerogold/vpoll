### Tab 5: Config

**Range:** A:B (variable rows, key-value pairs)
**Purpose:** Tournament settings and behavior configuration

| Setting Name | Data Type | Required | Valid Values | Default | Description |
|--------------|-----------|----------|--------------|---------|-------------|
| Tournament Name | String | ✅ Yes | Any non-empty string | - | Display name for tournament |
| Tournament Description | String | ✅ Yes | Any non-empty string | - | Brief description of competition |
| Start Date | String | ✅ Yes | Date string | - | When tournament begins (display only) |
| Poll Length | Number | ✅ Yes | Positive integer (hours) | 24 | How long each poll stays open |
| Poll Batches | String | ✅ Yes | See options below | "full round" | How many polls launch at once |
| Discord Channel ID | String | ✅ Yes | Valid Discord channel ID | - | Where to post polls |
| Auto-advance | Boolean | ✅ Yes | true, false | false | Automatically start next round when current completes |
| Tie Breaker Rule | String | ✅ Yes | "Dice roll" | "Dice roll" | How to resolve tied matches |
| Results Visibility | String | ✅ Yes | See options below | "after voting" | When users can see results |
| Auto Round Scheduling | String | ⚠️ Optional | "immediate", "X days", "X hours", blank | blank | Delay before auto-starting next round |
| Celebratory GIF | Boolean | ⚠️ Optional | true, false | false | Include random GIF in winner announcement |

**Poll Batches Valid Values:**
- `"full round"` - All matches at once (32 for Round 1)
- `"one per region"` - 1 match per region (4 at a time)
- `"two per region"` - 2 matches per region (8 at a time)
- `"half round"` - Half the matches (16 for Round 1)
- `"sequential"` - One match at a time
- Number (e.g., `6`) - Exact count specified

**Results Visibility Valid Values:**
- `"after voting"` - Immediately after user votes (Discord native behavior)
- `"after poll closes"` - After poll duration ends
- `"at tournament end"` - Only when tournament completes
- *Note: MVP uses Discord native polls which always show live results*

**Example Config Tab:**
```
Setting Name               | Value
---------------------------|----------------------------------------
Tournament Name            | Star Trek Character Battle
Tournament Description     | Vote for the best character across all series
Start Date                 | October 25, 2025
Poll Length                | 24
Poll Batches               | full round
Discord Channel ID         | 1234567890123456789
Auto-advance               | true
Tie Breaker Rule           | Dice roll
Results Visibility         | after voting
Match Preview Posts        | true
Auto Round Scheduling      | 3 days
Announcements Channel ID   | 9876543210987654321
Celebratory GIF            | true
```

