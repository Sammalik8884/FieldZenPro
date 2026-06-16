const fs = require('fs');
const content = fs.readFileSync('frontend/public/blog-automate-invoicing.html', 'utf8');

console.log('=== CANONICAL ===');
const canonical = content.match(/rel="canonical"[^>]*/);
console.log(canonical ? canonical[0] : 'MISSING');

console.log('\n=== HAS og:image ===');
console.log(content.includes('og:image') ? 'YES' : 'NO');

console.log('\n=== HAS twitter:card ===');
console.log(content.includes('twitter:card') ? 'YES' : 'NO');

console.log('\n=== HAS og:site_name ===');
console.log(content.includes('og:site_name') ? 'YES' : 'NO');

console.log('\n=== HAS FAQ SCHEMA ===');
console.log(content.includes('FAQPage') ? 'YES' : 'NO');

console.log('\n=== HAS KEY TAKEAWAYS ===');
console.log(content.includes('Key Takeaways') ? 'YES' : 'NO');

console.log('\n=== HAS BROKEN EMOJI (sample) ===');
console.log(content.includes('\u00f0\u0178') ? 'YES BROKEN' : 'CLEAN');

console.log('\n=== DATE MODIFIED ===');
const dm = content.match(/"dateModified":\s*"[\d-]+"/);
console.log(dm ? dm[0] : 'MISSING');

console.log('\n=== BRAND ===');
console.log(content.includes('MytechERP Team') ? 'STILL HAS MytechERP' : 'Fixed to FieldZenPro');

console.log('\n=== OLD DOMAIN ===');
console.log(content.includes('mytech-erp.vercel.app') ? 'OLD DOMAIN STILL PRESENT' : 'Domain updated');

console.log('\n=== NEW DOMAIN ===');
console.log(content.includes('fieldzenpro.com') ? 'fieldzenpro.com found' : 'MISSING new domain');

console.log('\n=== HAS BREADCRUMB SCHEMA ===');
console.log(content.includes('BreadcrumbList') ? 'YES' : 'NO');

console.log('\n=== HAS ORGANIZATION SCHEMA ===');
console.log(content.includes('Organization') ? 'YES' : 'NO');
