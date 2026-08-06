/**
 * fix-titles-and-links.js
 * Fixes:
 * 1. Truncates page titles to max 60 chars (keeps keyword at front)
 * 2. Truncates meta descriptions to max 155 chars
 * 3. Fills in missing meta descriptions
 * 4. Adds internal links section to every article that lacks them
 * 5. Adds FAQ schema to switch-from-jobber.html
 * 
 * Run: node fix-titles-and-links.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

function getHtml(f) { return fs.readFileSync(path.join(pubDir, f), 'utf8'); }
function saveHtml(f, html) { fs.writeFileSync(path.join(pubDir, f), html, 'utf8'); }

function cap(s) { return s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '); }

function slugToKeyword(slug) {
  return slug.replace(/^blog\//,'').replace(/-/g,' ').replace(/html$/,'').trim();
}

// ── Internal link map: each slug -> its related articles ──────
// Hub pages that should receive most internal links
const HUB_PAGES = [
  { slug: 'field-service-management-software', label: 'Field Service Management Software' },
  { slug: 'field-service-dispatch-software', label: 'Dispatch Software' },
  { slug: 'field-service-invoicing-software', label: 'Invoicing Software' },
  { slug: 'technician-scheduling-software', label: 'Technician Scheduling' },
  { slug: 'mobile-field-service-app', label: 'Mobile Field Service App' },
  { slug: 'field-service-management', label: 'What is Field Service Management' },
  { slug: 'field-service-crm-software', label: 'Field Service CRM' },
  { slug: 'field-service-invoicing-software', label: 'Field Service Invoicing' },
];

// Category-specific related links for each article type
function getRelatedLinks(slug) {
  const kw = slug.replace(/^blog\//,'');
  const isHvac = /hvac|heating|cooling/.test(kw);
  const isElec = /electri/.test(kw);
  const isPlumb = /plumb/.test(kw);
  const isDispatch = /dispatch/.test(kw);
  const isMobile = /mobile|app/.test(kw);
  const isSchedul = /schedul/.test(kw);
  const isInvoic = /invoic|billing/.test(kw);
  const isSmall = /small.business/.test(kw);
  const isAlt = /alternative|vs/.test(kw);
  const isBest = /best|top/.test(kw);

  let links = [
    { href: '/field-service-management-software', label: 'Field Service Management Software' },
  ];

  if (isHvac) links.push(
    { href: '/hvac-dispatch-software', label: 'HVAC Dispatch Software' },
    { href: '/hvac-invoicing-software', label: 'HVAC Invoicing Software' },
    { href: '/hvac-scheduling-software', label: 'HVAC Scheduling Software' },
    { href: '/technician-scheduling-software', label: 'Technician Scheduling' },
  );
  else if (isElec) links.push(
    { href: '/electrical-contractor-software', label: 'Electrical Contractor Software' },
    { href: '/electrical-contractor-billing-software', label: 'Electrical Billing Software' },
    { href: '/field-service-dispatch-software', label: 'Field Service Dispatch' },
    { href: '/technician-scheduling-software', label: 'Technician Scheduling' },
  );
  else if (isPlumb) links.push(
    { href: '/plumbing-software', label: 'Plumbing Software' },
    { href: '/field-service-invoicing-software', label: 'Field Service Invoicing' },
    { href: '/technician-scheduling-software', label: 'Technician Scheduling' },
    { href: '/field-service-dispatch-software', label: 'Dispatch Software' },
  );
  else if (isDispatch) links.push(
    { href: '/technician-scheduling-software', label: 'Technician Scheduling Software' },
    { href: '/technician-tracking-software', label: 'Technician Tracking' },
    { href: '/field-service-management-software', label: 'FSM Software' },
    { href: '/mobile-field-service-app', label: 'Mobile Field Service App' },
  );
  else if (isMobile) links.push(
    { href: '/field-service-management-software', label: 'Field Service Management Software' },
    { href: '/technician-tracking-software', label: 'Technician Tracking' },
    { href: '/field-service-invoicing-software', label: 'Mobile Invoicing' },
    { href: '/field-service-dispatch-software', label: 'Dispatch Software' },
  );
  else if (isSchedul) links.push(
    { href: '/field-service-dispatch-software', label: 'Dispatch Software' },
    { href: '/technician-tracking-software', label: 'Technician Tracking' },
    { href: '/field-service-management-software', label: 'FSM Software' },
    { href: '/mobile-field-service-app', label: 'Mobile App' },
  );
  else if (isInvoic) links.push(
    { href: '/field-service-management-software', label: 'Field Service Management' },
    { href: '/field-service-dispatch-software', label: 'Dispatch Software' },
    { href: '/technician-scheduling-software', label: 'Scheduling Software' },
    { href: '/mobile-field-service-app', label: 'Mobile App for Invoicing' },
  );
  else if (isSmall) links.push(
    { href: '/field-service-management-software', label: 'Field Service Management Software' },
    { href: '/field-service-invoicing-software', label: 'Invoicing Software' },
    { href: '/technician-scheduling-software', label: 'Scheduling Software' },
    { href: '/free-field-service-software', label: 'Free Field Service Software' },
  );
  else if (isAlt || isBest) links.push(
    { href: '/field-service-management-software', label: 'FieldZenPro FSM Platform' },
    { href: '/field-service-dispatch-software', label: 'Dispatch Software' },
    { href: '/field-service-invoicing-software', label: 'Invoicing Software' },
    { href: '/technician-scheduling-software', label: 'Scheduling Software' },
    { href: '/mobile-field-service-app', label: 'Mobile App' },
  );
  else links.push(
    { href: '/field-service-dispatch-software', label: 'Field Service Dispatch Software' },
    { href: '/field-service-invoicing-software', label: 'Field Service Invoicing' },
    { href: '/technician-scheduling-software', label: 'Technician Scheduling Software' },
    { href: '/mobile-field-service-app', label: 'Mobile Field Service App' },
  );

  // Remove self-reference
  return links.filter(l => !l.href.includes(kw.replace(/\s+/g,'-'))).slice(0, 5);
}

// ── Shorten title to max 60 chars ─────────────────────────────
function shortenTitle(title) {
  if (title.length <= 60) return title;
  // Try to cut at a natural break point before 60 chars
  const cutAt = title.lastIndexOf(' ', 57);
  if (cutAt > 30) return title.substring(0, cutAt) + ' | FieldZenPro';
  return title.substring(0, 57) + '...';
}

// ── Generate meta description ─────────────────────────────────
function generateMetaDesc(slug, existingDesc) {
  if (existingDesc && existingDesc.length >= 100 && existingDesc.length <= 155) return existingDesc;
  
  const kw = cap(slug.replace(/^blog\//,'').replace(/-/g,' '));
  const desc = `FieldZenPro ${kw}: dispatch, scheduling, invoicing & GPS tracking at $249/month flat for unlimited users. Free 14-day trial, no credit card required.`;
  
  if (existingDesc && existingDesc.length > 155) {
    // Truncate at last complete sentence under 155 chars
    const truncated = existingDesc.substring(0, 152);
    const lastDot = Math.max(truncated.lastIndexOf('. '), truncated.lastIndexOf('! '), truncated.lastIndexOf('? '));
    if (lastDot > 80) return existingDesc.substring(0, lastDot + 1);
    return truncated + '...';
  }
  
  return desc.substring(0, 155);
}

const articles = getAllArticles();
let fixed = 0;
let titleFixed = 0, descFixed = 0, linksFixed = 0;

for (const f of articles) {
  let html = getHtml(f);
  let changed = false;
  const slug = path.basename(f, '.html').replace(/blog[/\\]/, '');

  // 1. Fix title length
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) {
    const current = titleMatch[1].replace(/<[^>]+>/g,'').trim();
    if (current.length > 65) {
      const shortened = shortenTitle(current);
      html = html.replace(titleMatch[0], `<title>${shortened}</title>`);
      titleFixed++;
      changed = true;
    }
  }

  // 2. Fix meta description
  const descMatch = html.match(/<meta([^>]+)name=["']description["']([^>]*)>/i)
                 || html.match(/<meta([^>]+)content=["'][^"']*["']([^>]+)name=["']description["'][^>]*>/i);
  
  let existingDesc = '';
  if (descMatch) {
    const contentM = descMatch[0].match(/content=["']([^"']*)/i);
    existingDesc = contentM ? contentM[1] : '';
  }
  
  if (!existingDesc || existingDesc.length < 100 || existingDesc.length > 165) {
    const newDesc = generateMetaDesc(slug, existingDesc);
    if (descMatch) {
      html = html.replace(descMatch[0], descMatch[0].replace(/content=["'][^"']*["']/i, `content="${newDesc}"`));
    } else {
      html = html.replace('</head>', `  <meta name="description" content="${newDesc}">\n</head>`);
    }
    descFixed++;
    changed = true;
  }

  // 3. Add internal links if missing (check if related section exists and is empty)
  const hasRealLinks = /<a\s+href=["']\/[^"']+["'][^>]*>/.test(html);
  if (!hasRealLinks) {
    const related = getRelatedLinks(slug);
    const linkBlock = `
  <!-- Internal Links -->
  <nav class="related" aria-label="Related articles">
    <h3>Related Resources</h3>
    <ul>
      ${related.map(l => `<li><a href="${l.href}">${l.label}</a></li>`).join('\n      ')}
      <li><a href="/blog/what-is-fsm-software">What is FSM Software?</a></li>
    </ul>
  </nav>`;
    html = html.replace('</body>', linkBlock + '\n</body>');
    linksFixed++;
    changed = true;
  }

  if (changed) {
    saveHtml(f, html);
    fixed++;
  }
}

// 4. Fix switch-from-jobber.html - add FAQ schema
const jobberPath = path.join(pubDir, 'switch-from-jobber.html');
if (fs.existsSync(jobberPath)) {
  let jHtml = fs.readFileSync(jobberPath, 'utf8');
  if (!jHtml.includes('FAQPage')) {
    const faqSchema = `
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {"@type": "Question", "name": "Why should I switch from Jobber to FieldZenPro?", "acceptedAnswer": {"@type": "Answer", "text": "FieldZenPro offers flat $249/month pricing for unlimited users vs Jobber's per-user fees. At 5+ users FieldZenPro is consistently cheaper, and includes native QuickBooks sync, offline mobile app, and skills-based dispatch enforcement."}},
      {"@type": "Question", "name": "How long does it take to switch from Jobber to FieldZenPro?", "acceptedAnswer": {"@type": "Answer", "text": "Most companies complete the Jobber-to-FieldZenPro migration in 7-10 business days including full data migration of customers, job history, and recurring schedules."}},
      {"@type": "Question", "name": "Will I lose my Jobber data when switching to FieldZenPro?", "acceptedAnswer": {"@type": "Answer", "text": "No. FieldZenPro's onboarding team migrates all your customer records, job history, recurring schedules and technician profiles from Jobber as part of standard onboarding at no additional cost."}},
      {"@type": "Question", "name": "Does FieldZenPro have all the features Jobber has?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, and more. FieldZenPro includes everything Jobber offers — scheduling, dispatch, invoicing, payment, customer notifications, QuickBooks sync — plus skills-based dispatch enforcement, full offline mobile app, and unlimited users at a flat rate."}}
    ]
  }
  </script>`;
    jHtml = jHtml.replace('</head>', faqSchema + '\n</head>');
    fs.writeFileSync(jobberPath, jHtml, 'utf8');
    console.log('✅ Added FAQ schema to switch-from-jobber.html');
  }
}

console.log(`\n✅ Fixed ${fixed} articles:`);
console.log(`   Titles shortened: ${titleFixed}`);
console.log(`   Meta descriptions fixed: ${descFixed}`);
console.log(`   Internal links added: ${linksFixed}`);
console.log(`\nRunning final validation on 5 sample articles...`);

// Quick validation sample
const samples = ['field-service-management-software.html','hvac-software.html','plumbing-software.html','mobile-field-service-app.html','best-field-service-software.html'];
for (const s of samples) {
  try {
    execSync(`node check_article.js ${s}`, { cwd: __dirname, stdio: 'pipe' });
    console.log(`✅ ${s}`);
  } catch(e) {
    const errs = (e.stdout||'').toString().split('\n').filter(l=>l.includes('❌')&&!l.includes('ERROR')).join('; ');
    console.log(`❌ ${s}: ${errs}`);
  }
}
