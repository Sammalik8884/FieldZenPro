const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, 'frontend', 'public');
const files = [
  'field-service-management-software.html',
  'hvac-business-management-software.html'
];

files.forEach(f => {
  const html = fs.readFileSync(path.join(dir, f), 'utf8');
  const h1s = html.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi) || [];
  const h2matches = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi) || [];
  const h2texts = h2matches.map(h => h.replace(/<[^>]+>/g, '').trim());
  const dupH2 = h2texts.filter((h, i) => h2texts.indexOf(h) !== i);
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1] : '';
  const faqItems = (html.match(/<div class="faq-item">/g) || []).length;
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ').trim();
  const wc = text.split(' ').filter(w => w.length > 2).length;

  console.log('\n=== ' + f + ' ===');
  console.log('Word count    :', wc);
  console.log('H1 count      :', h1s.length, h1s.length !== 1 ? '*** ERROR - should be 1! ***' : 'OK');
  console.log('H2 count      :', h2texts.length);
  console.log('Dup H2s       :', dupH2.length > 0 ? dupH2.join(' | ') : 'None');
  console.log('Title length  :', title.length, '-', title.substring(0, 80));
  console.log('Canonical     :', html.includes('rel="canonical"') ? 'YES' : '*** MISSING ***');
  console.log('FAQ Schema    :', html.includes('FAQPage') ? 'YES' : '*** MISSING ***');
  console.log('SoftwareApp   :', html.includes('SoftwareApplication') ? 'YES' : '*** MISSING ***');
  console.log('AggRating     :', html.includes('AggregateRating') ? 'YES' : '*** MISSING ***');
  console.log('Hreflang      :', html.includes('hreflang') ? 'YES' : '*** MISSING ***');
  console.log('Author bio    :', html.includes('author-bio') ? 'YES' : '*** MISSING ***');
  console.log('CTA box       :', html.includes('cta-box') ? 'YES' : '*** MISSING ***');
  console.log('Nav logo img  :', html.includes('fieldzenpro-logo.png') ? 'YES' : '*** MISSING ***');
  console.log('GA4 tag       :', html.includes('G-H54SMK14ZK') ? 'YES' : '*** MISSING ***');
  console.log('FAQ HTML items:', faqItems, faqItems < 8 ? '*** Should be 8-10 ***' : 'OK');
  console.log('Related links :', html.includes('class="related"') ? 'YES' : '*** MISSING ***');
  console.log('Takeaways     :', html.includes('class="takeaways"') ? 'YES' : '*** MISSING ***');
  console.log('Stat grid     :', html.includes('class="stat-grid"') ? 'YES' : '*** MISSING ***');
  console.log('Feature grid  :', html.includes('class="feature-grid"') ? 'YES' : '*** MISSING ***');
  console.log('Comparison tbl:', (html.match(/<table>/g) || []).length, 'tables');
});
