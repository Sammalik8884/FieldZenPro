/**
 * deep-duplicate-check.js
 * Finds identical paragraphs and sentences shared across articles.
 * This catches boilerplate expansion blocks that hurt rankings.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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
  return fs.readFileSync(path.join(pubDir, f), 'utf8');
}

function extractParagraphs(html) {
  // Get all <p> tag contents
  const matches = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
  return matches
    .map(m => m[1].replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim())
    .filter(p => p.length > 100); // Only substantial paragraphs
}

function extractExpansionBlock(html) {
  // Everything between expansion comment and /body
  const m = html.match(/<!-- Expansion Block[^-]*-->([\s\S]*?)<\/body>/i);
  return m ? m[1].replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim() : '';
}

function hash(s) {
  return crypto.createHash('md5').update(s).digest('hex');
}

const articles = getAllArticles();
console.log(`\n🔍 Deep Duplicate Analysis — ${articles.length} articles\n${'='.repeat(60)}\n`);

// ── STEP 1: Find identical paragraphs across articles ──────────
console.log('PHASE 1: Identical paragraph detection');
console.log('-'.repeat(50));

const paraIndex = {}; // hash -> [file, ...]
const articleParas = {};

for (const f of articles) {
  const html = getHtml(f);
  const paras = extractParagraphs(html);
  articleParas[f] = paras;
  for (const p of paras) {
    const h = hash(p);
    if (!paraIndex[h]) paraIndex[h] = { text: p, files: [] };
    if (!paraIndex[h].files.includes(f)) paraIndex[h].files.push(f);
  }
}

// Find paragraphs appearing in 5+ articles
const massiveDups = Object.values(paraIndex).filter(v => v.files.length >= 5);
const moderateDups = Object.values(paraIndex).filter(v => v.files.length >= 3 && v.files.length < 5);

console.log(`Paragraphs in 10+ articles: ${massiveDups.filter(v=>v.files.length>=10).length}`);
console.log(`Paragraphs in 5-9 articles: ${massiveDups.filter(v=>v.files.length<10).length}`);
console.log(`Paragraphs in 3-4 articles: ${moderateDups.length}`);

if (massiveDups.length > 0) {
  console.log('\n🚨 BOILERPLATE PARAGRAPHS (appearing 5+ times):');
  massiveDups
    .sort((a,b) => b.files.length - a.files.length)
    .slice(0, 10)
    .forEach(v => {
      console.log(`\n  In ${v.files.length} articles: "${v.text.substring(0,120)}..."`);
    });
}

// ── STEP 2: Boilerplate % per article ─────────────────────────
console.log('\n\nPHASE 2: Boilerplate % per article (higher = more template content)');
console.log('-'.repeat(50));

// A paragraph is "boilerplate" if it appears in 3+ articles
const boilerplateHashes = new Set(
  Object.entries(paraIndex)
    .filter(([,v]) => v.files.length >= 3)
    .map(([h]) => h)
);

const boilerplatePct = articles.map(f => {
  const paras = articleParas[f];
  if (!paras.length) return { f, pct: 0, unique: 0, boiler: 0 };
  const boilerCount = paras.filter(p => boilerplateHashes.has(hash(p))).length;
  const pct = Math.round((boilerCount / paras.length) * 100);
  return { f, pct, unique: paras.length - boilerCount, boiler: boilerCount, total: paras.length };
}).sort((a,b) => b.pct - a.pct);

// Show worst offenders
console.log('\nTop 20 articles with highest boilerplate %:');
boilerplatePct.slice(0, 20).forEach(({f, pct, unique, boiler, total}) => {
  const bar = pct >= 60 ? '🔴' : pct >= 40 ? '🟠' : pct >= 20 ? '🟡' : '🟢';
  console.log(`${bar} ${pct}% boilerplate (${boiler}/${total} paras) — ${f}`);
});

const avgBoilerplate = Math.round(boilerplatePct.reduce((s,v)=>s+v.pct,0)/boilerplatePct.length);
console.log(`\nAverage boilerplate across site: ${avgBoilerplate}%`);
const red = boilerplatePct.filter(v=>v.pct>=60).length;
const orange = boilerplatePct.filter(v=>v.pct>=40&&v.pct<60).length;
const yellow = boilerplatePct.filter(v=>v.pct>=20&&v.pct<40).length;
const green = boilerplatePct.filter(v=>v.pct<20).length;
console.log(`🔴 Critical (60%+): ${red} articles`);
console.log(`🟠 High (40-59%): ${orange} articles`);
console.log(`🟡 Medium (20-39%): ${yellow} articles`);
console.log(`🟢 Good (<20%): ${green} articles`);

// ── STEP 3: Cannibalization clusters ──────────────────────────
console.log('\n\nPHASE 3: Keyword cannibalization — similar articles competing');
console.log('-'.repeat(50));

// Groups that are clearly competing for the same traffic
const cannibalGroups = [
  { topic: 'Field Service Management (CORE)', files: [
    'field-service-management-software.html','field-service-management.html',
    'field-service-management-platform.html','field-service-management-system.html',
    'field-service-management-app.html','fsm-software.html',
    'field-service-management-software-for-small-business.html'
  ]},
  { topic: 'Best FSM Software', files: [
    'best-field-service-software.html','best-field-service-management-software.html',
    'best-field-service-app.html','best-field-management-software.html',
    'best-fsm-software.html','top-field-service-management-software.html',
    'best-service-management-software.html'
  ]},
  { topic: 'Small Business FSM', files: [
    'field-service-software-for-small-business.html',
    'field-service-management-software-for-small-business.html',
    'field-management-software-for-small-business.html',
    'small-business-field-service-software.html',
    'service-management-software-for-small-business.html',
    'field-service-software-small-business-not-servicetitan.html'
  ]},
  { topic: 'Mobile FSM', files: [
    'mobile-field-service-software.html','mobile-field-service-app.html',
    'mobile-field-service-management-app.html'
  ]},
  { topic: 'FSM Scheduling', files: [
    'field-service-scheduling-software.html','field-service-scheduling-app.html',
    'field-scheduling-software.html','technician-scheduling-software.html',
    'service-technician-scheduling-software.html'
  ]},
  { topic: 'FSM Dispatch', files: [
    'field-service-dispatch-software.html','field-service-call-dispatch-software.html',
    'field-technician-dispatch-software.html'
  ]},
  { topic: 'HVAC Software', files: [
    'hvac-software.html','hvac-field-service-software.html',
    'hvac-field-service-management-software.html','hvac-business-management-software.html'
  ]},
  { topic: 'Electrical Contractor', files: [
    'electrical-contractor-software.html','electrical-contractor-service-software.html'
  ]},
  { topic: 'Field Technician Software', files: [
    'field-technician-software.html','field-technician-management-software.html',
    'service-technician-software.html','service-tech-software.html'
  ]},
  { topic: 'Alternatives (competing each other)', files: [
    'jobber-alternative.html','housecall-pro-alternative.html',
    'workiz-alternative.html','fieldpulse-alternative.html',
    'razorsync-alternative.html','servicemax-alternative.html','zuper-alternative.html'
  ]},
];

cannibalGroups.forEach(({topic, files}) => {
  const existing = files.filter(f => {
    try { getHtml(f); return true; } catch { return false; }
  });
  if (existing.length > 1) {
    console.log(`\n⚠️  ${topic} (${existing.length} competing pages):`);
    existing.forEach(f => console.log(`   → ${f}`));
  }
});

// ── STEP 4: Summary and action plan ───────────────────────────
console.log('\n\n' + '='.repeat(60));
console.log('📋 SUMMARY & ACTION PLAN');
console.log('='.repeat(60));
console.log(`\nBoilerplate paragraphs appearing 5+ times: ${massiveDups.length}`);
console.log(`Articles with 40%+ boilerplate content: ${red + orange}`);
console.log(`Keyword cannibalization clusters: ${cannibalGroups.length}`);
console.log(`\nPriority fixes for 500/day in 2 months:`);
console.log(`1. Rewrite expansion blocks in top-impression articles (unique content per article)`);
console.log(`2. Differentiate cannibalization clusters with distinct keyword angles`);
console.log(`3. Make "best" cluster articles into comprehensive comparison guides`);
console.log(`4. Add canonical from weaker variants to strongest in each cluster`);
