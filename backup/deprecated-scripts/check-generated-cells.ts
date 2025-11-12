import { generateCompleteBracket } from './generate-bracket';

/**
 * Check all generated bracket cells for duplicates or issues
 */

const cells = generateCompleteBracket();

console.log(`Total cells generated: ${cells.length}\n`);

// Group cells by position
const cellMap = new Map<string, any[]>();

cells.forEach(cell => {
  const key = `${cell.col}${cell.row}`;
  if (!cellMap.has(key)) {
    cellMap.set(key, []);
  }
  cellMap.get(key)!.push(cell);
});

// Find duplicates
console.log('=== DUPLICATE CELLS ===\n');
let duplicateCount = 0;
for (const [position, cellList] of cellMap.entries()) {
  if (cellList.length > 1) {
    duplicateCount++;
    console.log(`❌ ${position}: ${cellList.length} cells generated`);
    cellList.forEach((cell, idx) => {
      console.log(`   [${idx + 1}] isCheckbox:${cell.isCheckbox}, formula:${cell.formula?.substring(0, 40)}, value:${cell.value}`);
    });
    console.log('');
  }
}

if (duplicateCount === 0) {
  console.log('✅ No duplicate cells found\n');
} else {
  console.log(`Found ${duplicateCount} duplicate cell positions\n`);
}

// Check Round 2 ALPHA region (rows 4-29)
console.log('=== ROUND 2 ALPHA REGION (Columns D-E, Rows 4-29) ===\n');
const round2Alpha = cells.filter(c =>
  (c.col === 'D' || c.col === 'E') &&
  c.row >= 4 && c.row <= 29
).sort((a, b) => a.row - b.row);

round2Alpha.forEach(cell => {
  console.log(`${cell.col}${cell.row}: ${cell.isCheckbox ? 'CHECKBOX' : 'FORMULA'} - ${cell.formula?.substring(0, 50) || cell.value}`);
});

console.log(`\n✅ Check complete!`);
