/**
 * duplicate-check.js
 * Comprehensive duplicate content analysis across all articles
 */

const fs = require('fs');
const path = require('path');
const pubDir = path.join(__dirname, 'frontend', 'public');

const SKIP = new Set(['about.html','careers.html','changelog.html','gdpr.html',
  'privacy.html','roadmap.html','security.html','terms.html','landing.html',
  'blog.html','index.html']);

function getAllArticles() {
  const root = fs.readdirSync(pubDir).filter(f => f.endsWith('.html') && !SKIP.has(f));
  const blogDir = path.join(pubDir, 'blog');
  const blog = fs.existsSync(blogDir)
    ? fs.readdirSync(blogDir).filter(f => f.endsWith('.html')).map(f => 'blog/' + f)
    : [];
  return [...root, ...blog];
}

function getHtml(f) {
  const fp = path.join(pubDir, f);
  return fs.existsSync(fp) ? fs.readFileSync(fp, 'utf8') : '';
}

function getTitle(html) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].replace(/<[^>]+>/g,'').trim() : '';
}

function getMetaDesc(html) {
  const m = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i)
         || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
  return m ? m[1].trim() : '';
}

function getH1(html) {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return m ? m[1].replace(/<[^>]+>/g,'').trim() : '';
}

function getCanonical(html) {
  const m = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i);
  return m ? m[1].trim() : '';
}

function getTextFingerprint(html, chars) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ').trim()
    .substring(0, chars || 500);
}

function countWords(html) {
  const t = html.replace(/<script[\s\S]*?<\/script>/gi,'')
               .replace(/<style[\s\S]*?<\/style>/gi,'')
               .replace(/<[^>]+>/g,' ')
               .replace(/\s+/g,' ').trim();
  return t ? t.split(' ').filter(w => w.length > 2).length : 0;
}

// Similarity: what % of words in b are also in a (quick approx)
function similarity(a, b) {
  const wordsA = new Set(a.toLowerCase().split(/\s+/).filter(w => w.length > 4));
  const wordsB = b.toLowerCase().split(/\s+/).filter(w => w.length > 4);
  if (!wordsB.length || !wordsA.size) return 0;
  const common = wordsB.filter(w => wordsA.has(w)).length;
  return Math.round((common / wordsB.length) * 100);
}

console.log('\n📊 FieldZenPro — Duplicate Content Analysis\n' + '='.repeat(60));

const articles = getAllArticles();
console.log(`Scanning ${articles.length} articles...\n`);

const data = articles.map(f => {
  const html = getHtml(f);
  return {
    file: f,
    title: getTitle(html),
    desc: getMetaDesc(html),
    h1: getH1(html),
    canonical: getCanonical(html),
    fp200: getTextFingerprint(html, 200),
    fp500: getTextFingerprint(html, 500),
    words: countWords(html)
  };
});

let issues = 0;

// ── CHECK 1: Duplicate page titles ─────────────────────────────
console.log('1️⃣  DUPLICATE PAGE TITLES');
console.log('-'.repeat(50));
const titleMap = {};
data.forEach(d => {
  const key = d.title.toLowerCase();
  if (!titleMap[key]) titleMap[key] = [];
  titleMap[key].push(d.file);
});
const dupTitles = Object.entries(titleMap).filter(([,fs]) => fs.length > 1);
if (dupTitles.length === 0) {
  console.log('✅ No duplicate titles\n');
} else {
  dupTitles.forEach(([t, fs]) => {
    console.log(`❌ "${t.substring(0,70)}"`);
    fs.forEach(f => console.log(`   → ${f}`));
    issues++;
  });
  console.log('');
}

// ── CHECK 2: Duplicate meta descriptions ───────────────────────
console.log('2️⃣  DUPLICATE META DESCRIPTIONS');
console.log('-'.repeat(50));
const descMap = {};
data.forEach(d => {
  if (!d.desc || d.desc.length < 20) return;
  const key = d.desc.toLowerCase();
  if (!descMap[key]) descMap[key] = [];
  descMap[key].push(d.file);
});
const dupDescs = Object.entries(descMap).filter(([,fs]) => fs.length > 1);
if (dupDescs.length === 0) {
  console.log('✅ No duplicate meta descriptions\n');
} else {
  dupDescs.forEach(([t, fs]) => {
    console.log(`❌ "${t.substring(0,70)}"`);
    fs.forEach(f => console.log(`   → ${f}`));
    issues++;
  });
  console.log('');
}

// ── CHECK 3: Duplicate H1s ─────────────────────────────────────
console.log('3️⃣  DUPLICATE H1 HEADINGS');
console.log('-'.repeat(50));
const h1Map = {};
data.forEach(d => {
  if (!d.h1 || d.h1.length < 10) return;
  const key = d.h1.toLowerCase();
  if (!h1Map[key]) h1Map[key] = [];
  h1Map[key].push(d.file);
});
const dupH1s = Object.entries(h1Map).filter(([,fs]) => fs.length > 1);
if (dupH1s.length === 0) {
  console.log('✅ No duplicate H1s\n');
} else {
  dupH1s.forEach(([t, fs]) => {
    console.log(`❌ "${t.substring(0,70)}"`);
    fs.forEach(f => console.log(`   → ${f}`));
    issues++;
  });
  console.log('');
}

// ── CHECK 4: Missing or wrong canonicals ───────────────────────
console.log('4️⃣  CANONICAL TAG ISSUES');
console.log('-'.repeat(50));
let canonIssues = 0;
data.forEach(d => {
  if (!d.canonical) {
    console.log(`❌ MISSING canonical: ${d.file}`);
    canonIssues++; issues++;
  } else if (d.canonical.includes(' ') || !d.canonical.startsWith('http')) {
    console.log(`⚠️  BAD canonical "${d.canonical}": ${d.file}`);
    canonIssues++; issues++;
  }
});
if (canonIssues === 0) console.log('✅ All canonicals present and valid\n');
else console.log('');

// ── CHECK 5: Near-identical content (expansion block fingerprint) ──
console.log('5️⃣  NEAR-IDENTICAL OPENING CONTENT (first 200 chars)');
console.log('-'.repeat(50));
const fp200Map = {};
data.forEach(d => {
  const key = d.fp200.substring(0, 150).toLowerCase().replace(/\s+/g,' ');
  if (!fp200Map[key]) fp200Map[key] = [];
  fp200Map[key].push(d.file);
});
const dupFp = Object.entries(fp200Map).filter(([,fs]) => fs.length > 1);
if (dupFp.length === 0) {
  console.log('✅ No near-identical openers\n');
} else {
  dupFp.forEach(([t, fs]) => {
    console.log(`❌ Identical opener across ${fs.length} files:`);
    fs.forEach(f => console.log(`   → ${f}`));
    issues++;
  });
  console.log('');
}

// ── CHECK 6: Keyword/topic cannibalization ─────────────────────
console.log('6️⃣  POTENTIAL KEYWORD CANNIBALIZATION');
console.log('-'.repeat(50));
// Group by first 2-3 meaningful words of title
const topicMap = {};
data.forEach(d => {
  // Extract core topic from filename
  const slug = path.basename(d.file, '.html');
  const topic = slug.replace(/(software|app|platform|system|tool|management|service|for|the|and|with|from|not)/gi,'').replace(/-+/g,'-').replace(/^-|-$/g,'').substring(0,30);
  if (!topicMap[topic]) topicMap[topic] = [];
  topicMap[topic].push(d.file);
});
// Only flag if exact same topic keyword appears multiple times
const cannibal = Object.entries(topicMap).filter(([t, fs]) => fs.length > 1 && t.length > 4);
if (cannibal.length === 0) {
  console.log('✅ No obvious cannibalization\n');
} else {
  cannibal.slice(0, 20).forEach(([t, fs]) => {
    if (fs.length > 1) {
      console.log(`⚠️  Overlapping topic "${t}":`);
      fs.forEach(f => console.log(`   → ${f}`));
    }
  });
  console.log('');
}

// ── CHECK 7: Expansion block similarity ───────────────────────
console.log('7️⃣  ARTICLES WITH IDENTICAL EXPANSION BLOCKS');
console.log('-'.repeat(50));
// Check if expansion block text is duplicated (last 300 chars of body)
const expansionMap = {};
data.forEach(d => {
  const html = getHtml(d.file);
  // Get content between last expansion comment and /body
  const expMatch = html.match(/<!-- Expansion Block[^-]*-->([\s\S]*?)<\/body>/i);
  if (expMatch) {
    const key = expMatch[1].replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().substring(0,300).toLowerCase();
    if (!expansionMap[key]) expansionMap[key] = [];
    expansionMap[key].push(d.file);
  }
});
const dupExp = Object.entries(expansionMap).filter(([,fs]) => fs.length > 3);
if (dupExp.length === 0) {
  console.log('✅ No mass-duplicated expansion blocks\n');
} else {
  console.log(`⚠️  ${dupExp.length} expansion block groups shared by 4+ articles.`);
  console.log('This is expected from bulk expansion but Google may see it as boilerplate.\n');
  dupExp.slice(0,5).forEach(([t, fs]) => {
    console.log(`  Shared by ${fs.length} articles: ${fs.slice(0,3).join(', ')}...`);
  });
  issues++;
  console.log('');
}

// ── SUMMARY ───────────────────────────────────────────────────
console.log('='.repeat(60));
console.log(`📊 TOTAL ARTICLES: ${articles.length}`);
console.log(`🚨 TOTAL ISSUES: ${issues}`);
if (issues === 0) {
  console.log('🎉 No duplicate content issues found!');
} else {
  console.log('\nIssues require fixing to avoid Google penalties.');
}
console.log('='.repeat(60));
