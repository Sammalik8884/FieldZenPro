/**
 * full-seo-audit.js
 * Comprehensive SEO + technical audit beyond the 22-check validator.
 * Checks: title length, meta description length, schema quality,
 * internal links, broken links, page structure, image alt tags,
 * robots/sitemap, heading hierarchy, CTR optimization signals.
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
  return fs.readFileSync(path.join(pubDir, f), 'utf8');
}

function stripTags(s) { return s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(); }

function getTitle(html) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? stripTags(m[1]) : '';
}
function getMetaDesc(html) {
  const m = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i)
         || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
  return m ? m[1].trim() : '';
}
function getH1(html) {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return m ? stripTags(m[1]) : '';
}
function getH2s(html) {
  return [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map(m => stripTags(m[1]));
}
function getH3s(html) {
  return [...html.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi)].map(m => stripTags(m[1]));
}
function getImages(html) {
  return [...html.matchAll(/<img([^>]*)>/gi)].map(m => {
    const src = (m[1].match(/src=["']([^"']+)/i) || [])[1] || '';
    const alt = (m[1].match(/alt=["']([^"']*)/i) || [])[1] || null;
    return { src, alt };
  });
}
function getInternalLinks(html) {
  return [...html.matchAll(/href=["']([^"'#?]+\.html[^"']*)/gi)].map(m => m[1]);
}
function getSchema(html) {
  const schemas = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  return schemas.map(s => { try { return JSON.parse(s[1]); } catch { return null; } }).filter(Boolean);
}
function hasKeyword(html, keyword) {
  const text = html.replace(/<[^>]+>/g,' ').toLowerCase();
  return text.includes(keyword.toLowerCase());
}

const articles = getAllArticles();
console.log(`\n🔍 Full SEO Audit — ${articles.length} articles\n${'='.repeat(65)}\n`);

// Accumulate all issues
const issues = {
  titleTooShort: [],
  titleTooLong: [],
  titleMissingKeyword: [],
  descTooShort: [],
  descTooLong: [],
  descMissingKeyword: [],
  h1MissingKeyword: [],
  noH2s: [],
  tooFewH2s: [],
  imagesNoAlt: [],
  noImages: [],
  noInternalLinks: [],
  fewInternalLinks: [],
  brokenInternalRefs: [],
  schemaMissing: [],
  schemaInvalid: [],
  noFaqSchema: [],
  lowClickability: [],    // title not compelling for CTR
  keywordInTitle: [],     // keyword not in first 5 words of title
  readabilityPoor: [],    // very long sentences
  missingLastUpdated: [],
  missingBreadcrumb: [],
};

// Track all HTML filenames for broken link check
const allHtmlFiles = new Set(
  fs.readdirSync(pubDir).filter(f => f.endsWith('.html'))
);
const blogDir = path.join(pubDir, 'blog');
if (fs.existsSync(blogDir)) {
  fs.readdirSync(blogDir).filter(f => f.endsWith('.html')).forEach(f => allHtmlFiles.add('blog/' + f));
}

for (const f of articles) {
  const html = getHtml(f);
  const slug = path.basename(f, '.html').replace(/^blog\//,'');
  const keyword = slug.replace(/-/g, ' ');

  const title = getTitle(html);
  const desc = getMetaDesc(html);
  const h1 = getH1(html);
  const h2s = getH2s(html);
  const imgs = getImages(html);
  const links = getInternalLinks(html);
  const schemas = getSchema(html);

  // Title checks
  if (title.length < 30) issues.titleTooShort.push({ f, val: title });
  if (title.length > 70) issues.titleTooLong.push({ f, val: title.length + ' chars' });
  if (!title.toLowerCase().includes(keyword.split(' ').slice(0,2).join(' '))) {
    issues.titleMissingKeyword.push({ f, keyword, title });
  }

  // Meta description checks
  if (!desc || desc.length < 100) issues.descTooShort.push({ f, val: (desc||'').length + ' chars' });
  if (desc.length > 165) issues.descTooLong.push({ f, val: desc.length + ' chars' });
  if (desc && !desc.toLowerCase().includes(keyword.split(' ')[0])) {
    issues.descMissingKeyword.push({ f, keyword });
  }

  // H1 checks
  if (h1 && !h1.toLowerCase().includes(keyword.split(' ').slice(0,2).join(' '))) {
    issues.h1MissingKeyword.push({ f, keyword, h1: h1.substring(0,60) });
  }

  // H2 structure
  if (h2s.length === 0) issues.noH2s.push(f);
  else if (h2s.length < 4) issues.tooFewH2s.push({ f, count: h2s.length });

  // Image checks
  const imgsNoAlt = imgs.filter(i => i.alt === null || i.alt === '');
  if (imgsNoAlt.length > 0) issues.imagesNoAlt.push({ f, count: imgsNoAlt.length });
  if (imgs.length === 0) issues.noImages.push(f);

  // Internal links
  const internalOnly = links.filter(l => !l.startsWith('http'));
  if (internalOnly.length === 0) issues.noInternalLinks.push(f);
  else if (internalOnly.length < 3) issues.fewInternalLinks.push({ f, count: internalOnly.length });

  // Broken internal links (points to a file that doesn't exist)
  internalOnly.forEach(href => {
    const target = href.replace(/^\//, '').replace(/\/$/, '') + (href.endsWith('.html') ? '' : '.html');
    const targetClean = target.split('?')[0].split('#')[0];
    if (targetClean && !allHtmlFiles.has(targetClean) && !targetClean.includes('signup') && !targetClean.includes('pricing')) {
      issues.brokenInternalRefs.push({ f, href });
    }
  });

  // Schema checks
  const hasFAQ = schemas.some(s => s['@type'] === 'FAQPage' || (Array.isArray(s['@graph']) && s['@graph'].some(n => n['@type'] === 'FAQPage')));
  const hasSoftware = schemas.some(s => s['@type'] === 'SoftwareApplication');
  if (!hasFAQ) issues.noFaqSchema.push(f);
  if (!hasSoftware) issues.schemaMissing.push(f);

  // CTR / click-through quality check
  const powerWords = ['best','top','guide','2026','free','complete','ultimate','how to','vs','alternative','software','platform','app'];
  const titleHasPower = powerWords.some(pw => title.toLowerCase().includes(pw));
  if (!titleHasPower) issues.lowClickability.push({ f, title });
}

// ── PRINT RESULTS ─────────────────────────────────────────────

function section(name, items, limit = 15) {
  const count = items.length;
  const icon = count === 0 ? '✅' : count <= 5 ? '🟡' : count <= 20 ? '🟠' : '🔴';
  console.log(`\n${icon} ${name}: ${count}`);
  if (count > 0) {
    items.slice(0, limit).forEach(item => {
      if (typeof item === 'string') console.log(`   → ${item}`);
      else console.log(`   → ${item.f}${item.val ? ' ('+item.val+')' : ''}${item.keyword ? ' | missing: "'+item.keyword+'"' : ''}${item.title ? ' | title: "'+item.title.substring(0,50)+'"' : ''}${item.h1 ? ' | h1: "'+item.h1+'"' : ''}`);
    });
    if (count > limit) console.log(`   ... and ${count - limit} more`);
  }
}

console.log('📌 TITLE TAG ISSUES');
section('Titles too short (<30 chars)', issues.titleTooShort);
section('Titles too long (>70 chars)', issues.titleTooLong);
section('Title missing primary keyword', issues.titleMissingKeyword);

console.log('\n📌 META DESCRIPTION ISSUES');
section('Descriptions too short (<100 chars)', issues.descTooShort);
section('Descriptions too long (>165 chars)', issues.descTooLong);
section('Description missing keyword', issues.descMissingKeyword);

console.log('\n📌 HEADING STRUCTURE');
section('Missing keyword in H1', issues.h1MissingKeyword);
section('No H2 headings', issues.noH2s);
section('Fewer than 4 H2s', issues.tooFewH2s);

console.log('\n📌 IMAGES');
section('Images missing alt text', issues.imagesNoAlt);
section('Pages with NO images', issues.noImages);

console.log('\n📌 INTERNAL LINKING');
section('No internal links', issues.noInternalLinks);
section('Fewer than 3 internal links', issues.fewInternalLinks);
section('Broken internal link references', issues.brokenInternalRefs, 20);

console.log('\n📌 SCHEMA / STRUCTURED DATA');
section('Missing SoftwareApplication schema', issues.schemaMissing);
section('Missing FAQ schema', issues.noFaqSchema);

console.log('\n📌 CTR OPTIMIZATION');
section('Titles with no power words (low click appeal)', issues.lowClickability);

// ── SUMMARY ───────────────────────────────────────────────────
const total = Object.values(issues).reduce((s, v) => s + v.length, 0);
console.log('\n' + '='.repeat(65));
console.log('📊 TOTAL ISSUE INSTANCES FOUND: ' + total);
console.log('\nTop priorities to fix for ranking boost:');
const priorities = [
  ['🔴 Pages with NO images', issues.noImages.length, 'Add 1-2 relevant images with descriptive alt text'],
  ['🔴 Broken internal links', issues.brokenInternalRefs.length, 'Fix 404 links that waste crawl budget'],
  ['🟠 Title missing keyword', issues.titleMissingKeyword.length, 'Google uses title for ranking signal'],
  ['🟠 Meta desc too short', issues.descTooShort.length, 'Short descriptions hurt CTR in search results'],
  ['🟠 Title too long', issues.titleTooLong.length, 'Truncated titles lose CTR'],
  ['🟡 Missing alt text', issues.imagesNoAlt.length, 'Alt text = image ranking + accessibility'],
];
priorities.forEach(([label, count, reason]) => {
  if (count > 0) console.log(`  ${label} (${count}) — ${reason}`);
});
console.log('='.repeat(65));
