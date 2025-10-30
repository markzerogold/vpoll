## 1. Bracket Tab Cell Mapping

### Problem Statement
REQUIREMENTS.md states "vPoll writes TRUE to winner's advancement cell" but never specifies the cell addresses. Implementation cannot proceed without knowing which cells to write to for each of the 63 matches.

### Solution: Named Cell Approach

**Decision:** Use a standardized cell naming convention based on Match IDs.

#### Cell Naming Convention

For each match, two cells control advancement:
- **Winner Cell:** `<MatchID>_W` (e.g., `R1_ALPHA_M1_W`)
- **Loser Cell:** `<MatchID>_L` (e.g., `R1_ALPHA_M1_L`)

**Cell Locations:** Named ranges defined in Google Sheets template.

#### Implementation Strategy

**Template Setup:**
1. Create named ranges for all 126 advancement cells (63 matches × 2 participants)
2. Names follow pattern: `R{round}_{region}_M{match}_W` and `R{round}_{region}_M{match}_L`
3. Named ranges eliminate hardcoded cell addresses

**Bot Implementation:**
```typescript
// Example: Update bracket for Round 1, ALPHA region, Match 1
const matchId = "R1-ALPHA-M1";
const winnerCell = matchId.replace(/-/g, '_') + '_W'; // "R1_ALPHA_M1_W"
const loserCell = matchId.replace(/-/g, '_') + '_L';  // "R1_ALPHA_M1_L"

await sheetsService.writeNamedRange(sheetId, winnerCell, [[true]]);
await sheetsService.writeNamedRange(sheetId, loserCell, [[false]]);
```

#### Complete Named Range List

**Round 1 (32 matches across 4 regions):**
- ALPHA: `R1_ALPHA_M1_W`, `R1_ALPHA_M1_L`, ..., `R1_ALPHA_M8_W`, `R1_ALPHA_M8_L`
- BETA: `R1_BETA_M1_W`, `R1_BETA_M1_L`, ..., `R1_BETA_M8_W`, `R1_BETA_M8_L`
- GAMMA: `R1_GAMMA_M1_W`, `R1_GAMMA_M1_L`, ..., `R1_GAMMA_M8_W`, `R1_GAMMA_M8_L`
- DELTA: `R1_DELTA_M1_W`, `R1_DELTA_M1_L`, ..., `R1_DELTA_M8_W`, `R1_DELTA_M8_L`

**Round 2 (16 matches):** `R2_ALPHA_M1_W`, `R2_ALPHA_M1_L`, ..., `R2_DELTA_M4_W`, `R2_DELTA_M4_L`

**Round 3 (8 matches):** `R3_ALPHA_M1_W`, `R3_ALPHA_M1_L`, ..., `R3_DELTA_M2_W`, `R3_DELTA_M2_L`

**Round 4 (4 matches):** `R4_ALPHA_M1_W`, `R4_ALPHA_M1_L`, ..., `R4_DELTA_M1_W`, `R4_DELTA_M1_L`

**Round 5 (2 matches):**
- `R5_ALPHA_vs_BETA_M1_W`, `R5_ALPHA_vs_BETA_M1_L`
- `R5_GAMMA_vs_DELTA_M1_W`, `R5_GAMMA_vs_DELTA_M1_L`

**Round 6 (1 match):**
- `R6_CHAMPIONSHIP_M1_W`, `R6_CHAMPIONSHIP_M1_L`

#### Validation

**During `/tournament create`:**
```typescript
function validateBracketNamedRanges(sheetId: string): ValidationResult {
  const requiredRanges = generateAllMatchNamedRanges(); // 126 total
  const existingRanges = await sheets.getNamedRanges(sheetId);

  const missing = requiredRanges.filter(r => !existingRanges.includes(r));

  if (missing.length > 0) {
    return {
      valid: false,
      errors: [`Bracket tab missing ${missing.length} named ranges. Template may be corrupted.`]
    };
  }

  return { valid: true };
}
```

#### Alternative: Hardcoded Cell Addresses (Fallback)

If named ranges prove problematic, fallback to hardcoded addresses:

```typescript
const BRACKET_CELLS = {
  R1_ALPHA_M1_W: 'C10',
  R1_ALPHA_M1_L: 'C18',
  // ... 124 more entries
};
```

**Recommendation:** Named ranges preferred for flexibility and maintainability.

---
