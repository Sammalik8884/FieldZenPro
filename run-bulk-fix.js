/**
 * run-bulk-fix.js
 * Processes ALL HTML articles under 4000 words.
 * For each: expand → validate → report.
 * Run: node run-bulk-fix.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const pubDir = path.join(__dirname, 'frontend', 'public');

// Get all HTML files
function getAllHtml() {
  const root = fs.readdirSync(pubDir).filter(f => f.endsWith('.html')).map(f => f);
  const blogDir = path.join(pubDir, 'blog');
  const blog = fs.existsSync(blogDir)
    ? fs.readdirSync(blogDir).filter(f => f.endsWith('.html')).map(f => `blog/${f}`)
    : [];
  return [...root, ...blog];
}

function countWords(html) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ').trim();
  return text ? text.split(' ').filter(w => w.length > 0).length : 0;
}

// Skip non-article pages
const SKIP = new Set([
  'about.html','careers.html','changelog.html','gdpr.html','privacy.html',
  'roadmap.html','security.html','terms.html','landing.html','blog.html',
  'index.html'
]);

const allFiles = getAllHtml();
const toFix = allFiles.filter(f => {
  const base = path.basename(f);
  if (SKIP.has(base)) return false;
  const fp = path.join(pubDir, f);
  if (!fs.existsSync(fp)) return false;
  const html = fs.readFileSync(fp, 'utf8');
  return countWords(html) < 4000;
});

console.log(`\n📊 Found ${toFix.length} articles under 4000 words\n`);

let fixed = 0, failed = 0, alreadyGood = 0;
const failedList = [];

for (const file of toFix) {
  try {
    const result = execSync(`node bulk-expand.js "${file}"`, { encoding: 'utf8', cwd: __dirname });
    console.log(`✅ ${file}: ${result.trim()}`);
    fixed++;
  } catch (e) {
    const out = e.stdout || e.message || '';
    console.log(`❌ ${file}: ${out.trim()}`);
    failedList.push(file);
    failed++;
  }
}

console.log(`\n========================================`);
console.log(`✅ Fixed: ${fixed} | ❌ Still failing: ${failed}`);
if (failedList.length) {
  console.log(`\nStill need manual attention:`);
  failedList.forEach(f => console.log(`  - ${f}`));
}
console.log(`========================================\n`);
