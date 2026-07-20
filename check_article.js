/**
 * ARTICLE QUALITY CHECKER
 * Run after writing each article to validate before committing.
 * Usage: node check_article.js filename.html
 */
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, 'frontend', 'public');
const file = process.argv[2];
if (!file) { console.log('Usage: node check_article.js filename.html'); process.exit(1); }

const html = fs.readFileSync(path.join(dir, file), 'utf8');
const h1s = html.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi) || [];
const h2matches = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi) || [];
const h2texts = h2matches.map(h => h.replace(/<[^>]+>/g, '').trim());
const dupH2 = h2texts.filter((h, i) => h2texts.indexOf(h) !== i);
const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
const title = titleMatch ? titleMatch[1] : '';
const faqItems = (html.match(/<div class="faq-item">/g) || []).length;
const tables = (html.match(/<table>/g) || []).length;
const text = html
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ').trim();
const wc = text.split(' ').filter(w => w.length > 2).length;

let errors = 0;
function check(label, condition, msg) {
  if (!condition) { console.log('  ❌ ' + label + ': ' + msg); errors++; }
  else console.log('  ✅ ' + label);
}

console.log('\n🔍 Auditing: ' + file);
console.log('─'.repeat(50));
check('Word count 4000+', wc >= 4000, 'Only ' + wc + ' words! Need 4000+');
check('Single H1', h1s.length === 1, 'Found ' + h1s.length + ' H1 tags!');
check('No duplicate H2s', dupH2.length === 0, 'Duplicates: ' + dupH2.join(', '));
check('Title present', title.length > 0, 'No title tag!');
check('Canonical tag', html.includes('rel="canonical"'), 'Missing canonical');
check('FAQ Schema', html.includes('FAQPage'), 'Missing FAQPage schema');
check('SoftwareApp Schema', html.includes('SoftwareApplication'), 'Missing schema');
check('AggregateRating', html.includes('AggregateRating'), 'Missing rating schema');
check('Hreflang tags', html.includes('hreflang'), 'Missing hreflang');
check('Author bio', html.includes('author-bio'), 'Missing author bio');
check('CTA box', html.includes('cta-box'), 'Missing CTA');
check('Nav logo', html.includes('fieldzenpro-logo.png'), 'Missing nav logo');
check('GA4 tag', html.includes('G-H54SMK14ZK'), 'Missing GA4');
check('8+ FAQ items', faqItems >= 8, 'Only ' + faqItems + ' FAQ items');
check('Related links', html.includes('class="related"'), 'Missing related');
check('Takeaways box', html.includes('class="takeaways"'), 'Missing takeaways');
check('Stat grid', html.includes('class="stat-grid"'), 'Missing stat-grid');
check('Feature grid', html.includes('class="feature-grid"'), 'Missing feature-grid');
check('2+ tables', tables >= 2, 'Only ' + tables + ' table(s)');
check('Intro answer', html.includes('class="intro-answer"'), 'Missing intro-answer');
check('Highlight box', html.includes('class="highlight-box"'), 'Missing highlight box');
check('Breadcrumb', html.includes('class="breadcrumb"'), 'Missing breadcrumb');

console.log('─'.repeat(50));
console.log('📊 Word count: ' + wc);
console.log('📑 H2 sections: ' + h2texts.length);
console.log('❓ FAQ items: ' + faqItems);
console.log('📋 Tables: ' + tables);
if (errors === 0) console.log('\n✅ ALL CHECKS PASSED - Ready to commit!\n');
else console.log('\n❌ ' + errors + ' ERROR(S) FOUND - Fix before committing!\n');
process.exit(errors > 0 ? 1 : 0);
