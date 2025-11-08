import { generateCompleteBracket } from './generate-bracket';

const cells = generateCompleteBracket();

console.log('=== ROUND 3 FORMULAS (Column H) ===\n');

const round3H = cells.filter(c =>
  c.col === 'H' &&
  (c.row === 8 || c.row === 9 || c.row === 24 || c.row === 25)
);

round3H.forEach(cell => {
  console.log(`H${cell.row}: ${cell.formula}`);
});

console.log('\n=== ROUND 3 FORMULAS (Column G - checkboxes) ===\n');

const round3G = cells.filter(c =>
  c.col === 'G' &&
  (c.row === 8 || c.row === 9 || c.row === 24 || c.row === 25)
);

round3G.forEach(cell => {
  console.log(`G${cell.row}: isCheckbox=${cell.isCheckbox}, value=${cell.value}`);
});

console.log('\n✅ Check complete!');
