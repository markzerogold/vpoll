## 4. Poll Batches Calculation

### Problem Statement
If "Poll Batches = 6" and there are 32 matches, what happens? The rounding behavior is undefined.

### Solution: Batches-Per-Round Algorithm

#### Interpretation

**"Poll Batches" config means:** Number of separate batches to divide the round into.

**NOT:** Number of polls per batch.

#### Calculation Algorithm

```typescript
function calculateBatches(totalMatches: number, batchConfig: string): number[][] {
  let batchCount: number;

  // Parse config
  if (batchConfig === 'full round') {
    batchCount = 1;
  } else if (batchConfig === 'one per region') {
    batchCount = 4;
  } else if (batchConfig === 'two per region') {
    batchCount = 8;
  } else if (batchConfig === 'half round') {
    batchCount = 2;
  } else if (batchConfig === 'sequential') {
    batchCount = totalMatches; // One batch per match
  } else if (/^\d+$/.test(batchConfig)) {
    // Custom number
    batchCount = parseInt(batchConfig, 10);
  } else {
    throw new Error(`Invalid Poll Batches config: ${batchConfig}`);
  }

  // Distribute matches across batches
  const baseSize = Math.floor(totalMatches / batchCount);
  const remainder = totalMatches % batchCount;

  const batches: number[][] = [];
  let matchIndex = 0;

  for (let i = 0; i < batchCount; i++) {
    // First 'remainder' batches get an extra match
    const batchSize = baseSize + (i < remainder ? 1 : 0);
    const batch: number[] = [];

    for (let j = 0; j < batchSize; j++) {
      batch.push(matchIndex++);
    }

    batches.push(batch);
  }

  return batches;
}
```

#### Examples

**Example 1: 32 matches, Poll Batches = 6**
```
Batch 1: 6 matches (indices 0-5)
Batch 2: 6 matches (indices 6-11)
Batch 3: 6 matches (indices 12-17)
Batch 4: 6 matches (indices 18-23)
Batch 5: 5 matches (indices 24-28)
Batch 6: 3 matches (indices 29-31)
```

**Formula:**
- Base size: floor(32/6) = 5
- Remainder: 32 % 6 = 2
- First 2 batches get +1 match (5+1=6)
- Last 4 batches get base size (5)

Wait, that's wrong. Let me recalculate:
- 32 ÷ 6 = 5 remainder 2
- First 2 batches: 6 matches each (12 total)
- Next 4 batches: 5 matches each (20 total)
- Total: 12 + 20 = 32 ✓

**Correct distribution:**
```
Batch 1: 6 matches
Batch 2: 6 matches
Batch 3: 5 matches
Batch 4: 5 matches
Batch 5: 5 matches
Batch 6: 5 matches
```

**Example 2: 16 matches, Poll Batches = "one per region"**
```
Batch 1 (ALPHA): 4 matches
Batch 2 (BETA): 4 matches
Batch 3 (GAMMA): 4 matches
Batch 4 (DELTA): 4 matches
```

**Example 3: 8 matches, Poll Batches = "two per region"**
```
Batch 1 (ALPHA-1): 2 matches
Batch 2 (ALPHA-2): 2 matches
Batch 3 (BETA-1): 2 matches
Batch 4 (BETA-2): 2 matches
Batch 5 (GAMMA-1): 2 matches
Batch 6 (GAMMA-2): 2 matches
Batch 7 (DELTA-1): 2 matches
Batch 8 (DELTA-2): 0 matches (Round 3 has 8 matches, not 16)
```

Wait, this doesn't work cleanly. Let me revise.

#### Revised: Region-Based Batching

**For "one per region" and "two per region", algorithm is different:**

```typescript
function calculateRegionBatches(matches: Match[], batchConfig: string): Match[][] {
  if (batchConfig === 'one per region') {
    // Group by region
    const byRegion: { [region: string]: Match[] } = {};
    matches.forEach(m => {
      if (!byRegion[m.region]) byRegion[m.region] = [];
      byRegion[m.region].push(m);
    });
    return Object.values(byRegion);
  }

  if (batchConfig === 'two per region') {
    // Split each region into 2 batches
    const byRegion: { [region: string]: Match[] } = {};
    matches.forEach(m => {
      if (!byRegion[m.region]) byRegion[m.region] = [];
      byRegion[m.region].push(m);
    });

    const batches: Match[][] = [];
    Object.values(byRegion).forEach(regionMatches => {
      const mid = Math.ceil(regionMatches.length / 2);
      batches.push(regionMatches.slice(0, mid));
      batches.push(regionMatches.slice(mid));
    });

    return batches;
  }

  // ... numeric batching as before
}
```

---
