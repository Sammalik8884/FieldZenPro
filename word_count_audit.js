const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'frontend', 'public');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const results = [];

files.forEach(f => {
  const html = fs.readFileSync(path.join(dir, f), 'utf8');
  // Strip HTML tags to count words
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const wordCount = text.split(' ').filter(w => w.length > 2).length;
  results.push({ file: f, words: wordCount });
});

// Sort by word count ascending (shortest first = most need improvement)
results.sort((a, b) => a.words - b.words);

console.log('=== WORD COUNT AUDIT ===');
console.log('Under 1000 words (critical):');
results.filter(r => r.words < 1000).forEach(r => console.log(`  ${r.words.toString().padStart(5)} | ${r.file}`));
console.log('\nUnder 1500 words (needs improvement):');
results.filter(r => r.words >= 1000 && r.words < 1500).forEach(r => console.log(`  ${r.words.toString().padStart(5)} | ${r.file}`));
console.log('\nUnder 2000 words:');
results.filter(r => r.words >= 1500 && r.words < 2000).forEach(r => console.log(`  ${r.words.toString().padStart(5)} | ${r.file}`));
console.log('\n2000-2500 words:');
results.filter(r => r.words >= 2000 && r.words < 2500).forEach(r => console.log(`  ${r.words.toString().padStart(5)} | ${r.file}`));
console.log('\n2500+ words (good):');
results.filter(r => r.words >= 2500).forEach(r => console.log(`  ${r.words.toString().padStart(5)} | ${r.file}`));

const avg = Math.round(results.reduce((s, r) => s + r.words, 0) / results.length);
console.log('\nTotal pages:', results.length);
console.log('Average word count:', avg);
console.log('Under 2500 words:', results.filter(r => r.words < 2500).length);
