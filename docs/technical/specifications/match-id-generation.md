## 3. Match ID Generation Algorithm

### Problem Statement
Round 5 format is "R5-ALPHA_vs_BETA-M1" but we never defined HOW regions are paired. Which region winner faces which?

### Solution: Fixed Region Pairing Algorithm

#### Bracket Structure

**Single Elimination Standard:**
Tournament follows March Madness bracket structure with fixed regional semifinals.

#### Region Pairing Algorithm

**Round 5 (Final Four) - 2 Matches:**

**Match 1:** Winner of Region 1 vs Winner of Region 2
**Match 2:** Winner of Region 3 vs Winner of Region 4

**Region Order:** Determined by column order in Regions tab (columns B, C, D, E)

**Example with custom region names:**
- Regions tab columns: `Federation | Klingon Empire | Romulan Star Empire | Dominion`
- R5-M1: Federation winner vs Klingon Empire winner
- R5-M2: Romulan Star Empire winner vs Dominion winner

#### Match ID Format by Round

```typescript
function generateMatchId(round: number, region: string, matchNumber: number, regions?: string[]): string {
  switch (round) {
    case 1:
    case 2:
    case 3:
    case 4:
      // Within-region matches
      return `R${round}-${region}-M${matchNumber}`;

    case 5:
      // Cross-region semifinals
      if (matchNumber === 1) {
        return `R5-${regions[0]}_vs_${regions[1]}-M1`;
      } else {
        return `R5-${regions[2]}_vs_${regions[3]}-M1`;
      }

    case 6:
      // Championship (no region)
      return `R6-CHAMPIONSHIP-M1`;

    default:
      throw new Error(`Invalid round number: ${round}`);
  }
}
```

#### Complete Match ID List (Example Tournament)

**Assumptions:**
- Regions: ALPHA, BETA, GAMMA, DELTA (default names)
- Standard 64-participant bracket

**Round 1 (32 matches):**
```
R1-ALPHA-M1, R1-ALPHA-M2, ..., R1-ALPHA-M8
R1-BETA-M1, R1-BETA-M2, ..., R1-BETA-M8
R1-GAMMA-M1, R1-GAMMA-M2, ..., R1-GAMMA-M8
R1-DELTA-M1, R1-DELTA-M2, ..., R1-DELTA-M8
```

**Round 2 (16 matches):**
```
R2-ALPHA-M1, R2-ALPHA-M2, R2-ALPHA-M3, R2-ALPHA-M4
R2-BETA-M1, R2-BETA-M2, R2-BETA-M3, R2-BETA-M4
R2-GAMMA-M1, R2-GAMMA-M2, R2-GAMMA-M3, R2-GAMMA-M4
R2-DELTA-M1, R2-DELTA-M2, R2-DELTA-M3, R2-DELTA-M4
```

**Round 3 (8 matches):**
```
R3-ALPHA-M1, R3-ALPHA-M2
R3-BETA-M1, R3-BETA-M2
R3-GAMMA-M1, R3-GAMMA-M2
R3-DELTA-M1, R3-DELTA-M2
```

**Round 4 (4 matches):**
```
R4-ALPHA-M1 (Regional Final)
R4-BETA-M1 (Regional Final)
R4-GAMMA-M1 (Regional Final)
R4-DELTA-M1 (Regional Final)
```

**Round 5 (2 matches):**
```
R5-ALPHA_vs_BETA-M1 (Semifinal 1)
R5-GAMMA_vs_DELTA-M1 (Semifinal 2)
```

**Round 6 (1 match):**
```
R6-CHAMPIONSHIP-M1 (Final)
```

#### Custom Region Names

**Handling spaces and special characters:**

```typescript
function sanitizeRegionName(regionName: string): string {
  // Remove spaces, convert to uppercase, limit length
  return regionName
    .replace(/\s+/g, '_')
    .replace(/[^A-Z0-9_]/gi, '')
    .substring(0, 20)
    .toUpperCase();
}

// Example:
// "Romulan Star Empire" -> "ROMULAN_STAR_EMPIRE"
// "Klingon Empire (TOS)" -> "KLINGON_EMPIRE_TOS"
```

**Match ID with custom names:**
```
R5-FEDERATION_vs_KLINGON_EMPIRE-M1
```

---
