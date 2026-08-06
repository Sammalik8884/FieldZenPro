const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'frontend', 'public');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

let stats = {
  total: files.length,
  hasCanonical: 0, hasOGImage: 0, hasFAQSchema: 0, hasSoftwareSchema: 0,
  hasOrgSchema: 0, hasArticleSchema: 0, hasAggregateRating: 0,
  hasInternalLinks: 0, hasBreadcrumb: 0, hasGAnalytics: 0,
  hasHreflang: 0, hasSpeakable: 0, hasVideoSchema: 0,
  titleOver60: 0, descUnder160: 0, descMissing: 0,
  hasRobotsTxt: 0, missingFAQ: [], missingSchema: []
};

files.forEach(f => {
  const html = fs.readFileSync(path.join(dir, f), 'utf8');
  if (html.includes('rel="canonical"')) stats.hasCanonical++;
  if (html.includes('og:image')) stats.hasOGImage++;
  if (html.includes('FAQPage')) stats.hasFAQSchema++;
  else stats.missingFAQ.push(f);
  if (html.includes('SoftwareApplication')) stats.hasSoftwareSchema++;
  else stats.missingSchema.push(f);
  if (html.includes('"Organization"')) stats.hasOrgSchema++;
  if (html.includes('"Article"')) stats.hasArticleSchema++;
  if (html.includes('AggregateRating')) stats.hasAggregateRating++;
  if (html.includes('href="/field-service')) stats.hasInternalLinks++;
  if (html.includes('BreadcrumbList')) stats.hasBreadcrumb++;
  if (html.includes('G-H54SMK14ZK')) stats.hasGAnalytics++;
  if (html.includes('hreflang')) stats.hasHreflang++;
  if (html.includes('speakable')) stats.hasSpeakable++;
  if (html.includes('VideoObject')) stats.hasVideoSchema++;
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  if (titleMatch && titleMatch[1].length > 60) stats.titleOver60++;
  const descMatch = html.match(/meta name="description" content="([^"]*)"/i);
  if (!html.includes('meta name="description"')) stats.descMissing++;
});

// Check robots.txt
if (fs.existsSync(path.join(dir, 'robots.txt'))) stats.hasRobotsTxt = 1;

console.log('=== SEO AUDIT RESULTS ===');
console.log('Total pages:', stats.total);
console.log('Has canonical:', stats.hasCanonical, '/', stats.total);
console.log('Has OG image:', stats.hasOGImage, '/', stats.total);
console.log('Has FAQ schema:', stats.hasFAQSchema, '/', stats.total);
console.log('Has SoftwareApp schema:', stats.hasSoftwareSchema, '/', stats.total);
console.log('Has Org schema:', stats.hasOrgSchema, '/', stats.total);
console.log('Has Article schema:', stats.hasArticleSchema, '/', stats.total);
console.log('Has AggregateRating:', stats.hasAggregateRating, '/', stats.total);
console.log('Has BreadcrumbList:', stats.hasBreadcrumb, '/', stats.total);
console.log('Has Internal Links:', stats.hasInternalLinks, '/', stats.total);
console.log('Has GA4:', stats.hasGAnalytics, '/', stats.total);
console.log('Has Hreflang:', stats.hasHreflang, '/', stats.total);
console.log('Has Speakable Schema:', stats.hasSpeakable, '/', stats.total);
console.log('Has Video Schema:', stats.hasVideoSchema, '/', stats.total);
console.log('Has robots.txt:', stats.hasRobotsTxt);
console.log('Missing FAQ (' + stats.missingFAQ.length + '):', stats.missingFAQ.slice(0, 10).join(', '));
console.log('Missing SoftwareSchema (' + stats.missingSchema.length + '):', stats.missingSchema.slice(0, 10).join(', '));
