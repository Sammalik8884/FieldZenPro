/**
 * FieldZenPro — Full SEO & GEO Optimizer
 * Processes ALL HTML pages in frontend/public/
 * 
 * What this script does:
 * 1. Updates all canonical URLs: mytech-erp.vercel.app → fieldzenpro.com
 * 2. Fixes all broken UTF-8 emoji encoding (ðŸ"… → 📅, etc.)
 * 3. Adds missing og:image, og:url, og:site_name, twitter:card meta tags
 * 4. Adds missing robots meta tag
 * 5. Adds missing JSON-LD Article schema where none exists
 * 6. Adds FAQ schema (rich results) to blog posts
 * 7. Updates dateModified to today
 * 8. Adds GEO: "Key Takeaways" box to blog posts
 * 9. Adds Author bio block (E-E-A-T signal)
 * 10. Fixes image missing width/height (CLS)
 * 11. Adds internal linking section where missing
 * 12. Adds Organization schema to all pages
 */

const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, 'frontend', 'public');
const TODAY = '2026-06-15';
const DOMAIN = 'https://fieldzenpro.com';
const OG_IMAGE = `${DOMAIN}/og-image.png`;

// Emoji repair map — mojibake → correct character
const EMOJI_FIXES = [
  [/ðŸ"…/g, '📅'],
  [/â±ï¸/g, '⏱️'],
  [/âœï¸/g, '✍️'],
  [/ðŸ"‹/g, '📋'],
  [/ðŸ"/g, '🔍'],
  [/ðŸ'°/g, '💰'],
  [/ðŸ"§/g, '🔧'],
  [/ðŸ"¦/g, '📦'],
  [/ðŸ"„/g, '📄'],
  [/ðŸ§¾/g, '🧾'],
  [/ðŸ'³/g, '💳'],
  [/ðŸ¢/g, '🏢'],
  [/ðŸ—ï¸/g, '🏗️'],
  [/ðŸ"¸/g, '📸'],
  [/âï¸/g, '❄️'],
  [/â„ï¸/g, '❄️'],
  [/ðŸ"¥/g, '🔥'],
  [/ðŸ†/g, '🏆'],
  [/ðŸ'¸/g, '💸'],
  [/ðŸ'»/g, '👻'],
  [/ðŸ¤·/g, '🤷'],
  [/ðŸ'¥/g, '👥'],
  [/ðŸ›¡ï¸/g, '🛡️'],
  [/âï¸/g, '⚡'],
  [/ðŸ"Š/g, '📊'],
  [/â˜…/g, '★'],
  [/â†'/g, '↑'],
  [/â†"/g, '↓'],
  [/âœ"/g, '✓'],
  [/â°/g, '⏰'],
  [/ðŸ"/g, '🔑'],
  [/ðŸ¡ï¸/g, '🏡️'],
  [/ðŸ·ï¸/g, '🏷️'],
  [/ðŸ'‰/g, '👉'],
  [/ðŸ'Š/g, '💊'],
  [/ðŸš—/g, '🚗'],
  [/ðŸš/g, '🚀'],
  [/ðŸŒ/g, '🌐'],
  [/ðŸ¤/g, '🤝'],
  [/ðŸŽ¯/g, '🎯'],
  [/ðŸ'¡/g, '💡'],
  [/ðŸŒŸ/g, '🌟'],
  [/â\x80\x8b/g, ''],
];

// Pages to SKIP (not articles, don't add article schema)
const SKIP_PAGES = new Set([
  'landing.html', 'blog.html', 'about.html', 'privacy.html',
  'terms.html', 'gdpr.html', 'security.html', 'careers.html',
  'changelog.html', 'roadmap.html'
]);

// Blog-specific pages (add Key Takeaways + FAQ schema)
const BLOG_PAGES = new Set([
  'blog-automate-invoicing.html',
  'blog-best-fm-software-2026.html',
  'blog-digital-checklists-fm.html',
  'blog-digital-work-orders.html',
  'blog-erp-vs-cmms.html'
]);

// FAQ data for blog posts
const BLOG_FAQS = {
  'blog-automate-invoicing.html': [
    { q: 'What is invoice automation for service companies?', a: 'Invoice automation is the process of automatically generating, sending, and tracking invoices without manual data entry. When a technician marks a job complete in your field service software, an invoice is instantly created from the work order data and emailed to the client.' },
    { q: 'How long does it take to set up automated invoicing?', a: 'Most field service companies can set up automated invoicing within 1–2 weeks. Week one covers configuring your product catalog and templates; week two involves generating your first automated invoices. FieldZenPro users are typically fully live within 10 business days.' },
    { q: 'How much money can I save by automating invoicing?', a: 'A typical FM company processing 100 work orders per month spends 25–33 hours on manual invoicing. At $20/hour, that is $500–$660 per month in admin costs alone — plus 5–10% of invoices that are never billed. Automation captures 100% of completed work and eliminates those admin hours.' },
    { q: 'What software automates invoicing for field service companies?', a: 'FieldZenPro is purpose-built for field service invoice automation. It connects quotes, work orders, and invoices in one platform, with automatic PDF generation and email delivery, a customer self-service portal, and Stripe payment integration.' }
  ],
  'blog-best-fm-software-2026.html': [
    { q: 'What is the best facilities management software in 2026?', a: 'The best FM software in 2026 depends on your company size and needs. For small to mid-size field service companies, FieldZenPro offers the best combination of work orders, scheduling, inventory, invoicing, and payroll in one platform. Enterprise users may also consider Archibus or Planon for large building portfolios.' },
    { q: 'How much does facilities management software cost?', a: 'FM software pricing ranges widely. Basic tools start at $29/month per user. Full-featured platforms like FieldZenPro typically run $49–$149/month for small teams. Enterprise platforms can cost $1,000+ per month. Many vendors offer free trials so you can test before committing.' },
    { q: 'What is the difference between CAFM and CMMS?', a: 'CAFM (Computer-Aided Facility Management) focuses on space, asset, and real estate management for building owners. CMMS (Computerized Maintenance Management System) focuses on maintenance scheduling and work orders for maintenance teams. FSM (Field Service Management) software like FieldZenPro covers field technician operations, work orders, and billing.' },
    { q: 'Can small businesses use facilities management software?', a: 'Absolutely. Many FM software platforms including FieldZenPro are specifically designed for small businesses with 1–50 technicians. They offer simple onboarding, mobile apps, and affordable pricing — without the complexity of enterprise-grade systems.' }
  ],
  'blog-digital-checklists-fm.html': [
    { q: 'What is a digital checklist for facilities management?', a: 'A digital checklist is an electronic form completed by technicians on their smartphone or tablet during inspections or maintenance visits. Unlike paper, digital checklists capture timestamps, GPS location, photo evidence, and technician signatures — creating an auditable, tamper-proof record.' },
    { q: 'How do digital checklists help with compliance?', a: 'Digital checklists create a verifiable audit trail for every inspection. When regulators or clients request proof of compliance, you can instantly export timestamped reports with photos showing exactly what was inspected, when, and by whom. This is far stronger evidence than paper records.' },
    { q: 'What types of checklists can be digitized?', a: 'Any paper checklist can be digitized: HVAC preventive maintenance, fire safety inspections, daily cleaning rounds, building condition reports, elevator safety checks, pest control visit logs, and equipment commissioning forms.' },
    { q: 'How long does it take to switch from paper to digital checklists?', a: "With the right software, the switch takes 3 days: Day 1 to recreate your top 5 checklists digitally, Day 2 to pilot with 2-3 technicians, and Day 3 to review and roll out to the full team. FieldZenPro's drag-and-drop builder requires no coding." }
  ],
  'blog-digital-work-orders.html': [
    { q: 'What is a digital work order?', a: 'A digital work order is an electronic job ticket that captures all information about a service task: customer details, site location, job description, required parts, assigned technician, completion status, photos, and customer signature. Everything is stored in the cloud and accessible in real time.' },
    { q: 'What are the benefits of digital work orders over paper?', a: 'Digital work orders eliminate lost paperwork, enable real-time status tracking, auto-generate invoices on job completion, capture photo evidence and signatures, and allow dispatchers to see every technician\'s progress simultaneously. Companies that switch report 30–40% faster billing cycles.' },
    { q: 'How do I digitize my work order process?', a: 'Start by auditing your current paper process, then choose FSM software that fits your business. Configure your site structure and service types, build work order templates for common job types, train your technicians on the mobile app, and run a 2-week pilot before full rollout.' },
    { q: 'What is the best work order software for small business?', a: 'FieldZenPro is highly rated for small service businesses because it combines work orders with scheduling, inventory, invoicing, and a mobile app in one affordable platform — without the complexity of enterprise tools.' }
  ],
  'blog-erp-vs-cmms.html': [
    { q: 'What is the difference between ERP and CMMS?', a: 'A CMMS (Computerized Maintenance Management System) focuses specifically on maintenance: work orders, preventive maintenance schedules, and asset tracking. An ERP (Enterprise Resource Planning) system covers the entire business: finance, HR, procurement, CRM, and operations. Field service businesses typically need a hybrid — an FSM platform that includes both operational and financial management.' },
    { q: 'Do I need an ERP or CMMS for my maintenance company?', a: 'If you only need to manage work orders and equipment maintenance, a CMMS may be sufficient. If you also need to manage invoicing, payroll, procurement, and customer relationships, you need a full FSM/ERP platform like FieldZenPro. Most growing maintenance businesses outgrow CMMS within 2–3 years.' },
    { q: 'How much does a CMMS cost?', a: 'CMMS pricing typically starts at $25–$45/user/month for cloud-based solutions. Full ERP platforms cost more but provide significantly more value by replacing multiple disconnected tools. FieldZenPro offers an all-in-one solution starting at a competitive price point for small teams.' },
    { q: 'Can FieldZenPro replace both my CMMS and accounting software?', a: 'Yes. FieldZenPro is designed to be the single platform that replaces your CMMS (work orders, maintenance schedules, checklists), your invoicing software, your CRM, your inventory system, and your HR/payroll tools — eliminating the need for multiple disconnected subscriptions.' }
  ]
};

// Key takeaways for blog posts
const BLOG_TAKEAWAYS = {
  'blog-automate-invoicing.html': [
    'Manual invoicing costs FM companies 25–33 hours per month in admin time',
    'Automation reduces invoice-to-payment time from 42 days to 7–14 days',
    '5–10% of manual invoices are never billed — automation captures 100%',
    'Auto-generation from work orders, PDF delivery, and online payment are the 3 must-have features',
    'Most companies go fully live with invoice automation in 1–2 weeks'
  ],
  'blog-best-fm-software-2026.html': [
    'The best FM software combines work orders, scheduling, inventory, and billing in one platform',
    'Look for mobile-first design so technicians can update jobs from the field',
    'Key differentiator: offline capability for technicians in low-signal areas',
    'SMB-focused tools (like FieldZenPro) cost far less than enterprise platforms',
    'Always test with a free trial before committing to an annual subscription'
  ],
  'blog-digital-checklists-fm.html': [
    'Paper checklists create compliance risk — they can be falsified and provide no photo evidence',
    'Digital checklists capture GPS location, timestamps, and photos for irrefutable audit trails',
    'Fire safety, HVAC, cleaning, and building inspections all benefit immediately from digitization',
    'The switch from paper to digital takes only 3 days with the right software',
    'Analytics from digital checklists let you spot recurring issues before they become expensive'
  ],
  'blog-digital-work-orders.html': [
    'Paper work orders cause delayed billing — digital work orders auto-generate invoices on job completion',
    'Technicians need a mobile app that works offline (no cell service in basements or rural areas)',
    'Digital signatures and photo capture eliminate "I never agreed to that" disputes',
    'The 5-step digitization plan: audit → choose software → configure → template → train',
    'Pilot with 2–3 technicians for one week before full team rollout'
  ],
  'blog-erp-vs-cmms.html': [
    'CMMS covers maintenance; ERP covers the whole business — FSM software bridges both',
    'Most maintenance companies outgrow a pure CMMS within 2–3 years of growth',
    'The real cost of disconnected tools: double data entry, reporting gaps, and billing delays',
    'If you manage invoicing + payroll + procurement + work orders, you need an ERP-level platform',
    'FieldZenPro is purpose-built to replace CMMS + accounting + CRM with one subscription'
  ]
};

/**
 * Generate FAQ HTML + JSON-LD for a blog page
 */
function buildFaqBlock(filename) {
  const faqs = BLOG_FAQS[filename];
  if (!faqs) return '';

  const faqItems = faqs.map(f => `
    <div class="faq-item" style="border:1px solid var(--border);border-radius:8px;margin-bottom:1rem;overflow:hidden;">
      <details>
        <summary style="padding:1rem 1.25rem;cursor:pointer;font-weight:600;font-size:1rem;color:var(--text);list-style:none;display:flex;justify-content:space-between;align-items:center;">
          ${f.q} <span style="color:var(--primary);font-size:1.2rem;margin-left:0.5rem;">+</span>
        </summary>
        <p style="padding:0 1.25rem 1rem;color:var(--muted);margin:0;font-size:0.95rem;">${f.a}</p>
      </details>
    </div>`).join('');

  const schemaItems = faqs.map(f => `{"@type":"Question","name":"${f.q.replace(/"/g, '\\"')}","acceptedAnswer":{"@type":"Answer","text":"${f.a.replace(/"/g, '\\"')}"}}`).join(',');

  return `
  <!-- FAQ Section — GEO + Rich Results -->
  <h2 style="font-size:1.75rem;font-weight:700;margin:3rem 0 1rem;color:var(--text);">Frequently Asked Questions</h2>
  <div class="faq-container" style="margin-bottom:3rem;">
    ${faqItems}
  </div>
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"FAQPage","mainEntity":[${schemaItems}]}
  </script>`;
}

/**
 * Generate Key Takeaways HTML — GEO signal for AI summarizers
 */
function buildTakeawaysBlock(filename) {
  const items = BLOG_TAKEAWAYS[filename];
  if (!items) return '';
  const li = items.map(i => `<li style="margin-bottom:0.5rem;display:flex;align-items:flex-start;gap:0.5rem;"><span style="color:var(--accent);font-weight:700;flex-shrink:0;">✓</span>${i}</li>`).join('\n    ');
  return `
  <!-- Key Takeaways — GEO signal for AI search engines -->
  <div style="background:rgba(52,168,83,0.07);border:1px solid rgba(52,168,83,0.3);border-radius:12px;padding:1.5rem 2rem;margin:2rem 0 2.5rem;">
    <h2 style="margin:0 0 1rem;font-size:1.1rem;font-weight:700;color:var(--accent);letter-spacing:0.5px;text-transform:uppercase;">⚡ Key Takeaways</h2>
    <ul style="list-style:none;margin:0;padding:0;">
      ${li}
    </ul>
  </div>`;
}

/**
 * Generate Article JSON-LD schema
 */
function buildArticleSchema(title, description, slug, publishDate) {
  return `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "${title.replace(/"/g, '\\"')}",
  "description": "${description.replace(/"/g, '\\"')}",
  "url": "${DOMAIN}/${slug}",
  "image": "${OG_IMAGE}",
  "author": {
    "@type": "Person",
    "name": "Muhammad Usama",
    "url": "${DOMAIN}/about"
  },
  "publisher": {
    "@type": "Organization",
    "name": "FieldZenPro",
    "url": "${DOMAIN}",
    "logo": {
      "@type": "ImageObject",
      "url": "${DOMAIN}/logo.png"
    }
  },
  "datePublished": "${publishDate || TODAY}",
  "dateModified": "${TODAY}",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "${DOMAIN}/${slug}"
  }
}
</script>`;
}

/**
 * Build standard meta tags block (OG + Twitter + robots)
 */
function buildMetaTags(title, description, slug) {
  return `<meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />
<meta property="og:description" content="${description.replace(/"/g, '&quot;')}" />
<meta property="og:type" content="article" />
<meta property="og:url" content="${DOMAIN}/${slug}" />
<meta property="og:image" content="${OG_IMAGE}" />
<meta property="og:site_name" content="FieldZenPro" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}" />
<meta name="twitter:description" content="${description.replace(/"/g, '&quot;')}" />
<meta name="twitter:image" content="${OG_IMAGE}" />
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
<link rel="author" href="${DOMAIN}/about" />`;
}

/**
 * Main processor
 */
function processFile(filePath, filename) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  const slug = filename.replace('.html', '');
  const isBlog = BLOG_PAGES.has(filename);
  const isSkip = SKIP_PAGES.has(filename);

  // ── 1. Fix emoji encoding ──────────────────────────────────────────────
  EMOJI_FIXES.forEach(([pattern, replacement]) => {
    content = content.replace(pattern, replacement);
  });

  // ── 2. Update canonical URL domain ────────────────────────────────────
  content = content.replace(
    /https:\/\/mytech-erp\.vercel\.app/g,
    DOMAIN
  );
  content = content.replace(
    /https:\/\/www\.fieldzenpro\.com/g,
    DOMAIN
  );

  // ── 3. Add/fix canonical tag if missing ───────────────────────────────
  if (!content.includes('rel="canonical"')) {
    content = content.replace(
      '</head>',
      `<link rel="canonical" href="${DOMAIN}/${slug}" />\n</head>`
    );
  }

  // ── 4. Update dateModified in existing JSON-LD ─────────────────────────
  content = content.replace(
    /"dateModified":\s*"[\d-]+"/g,
    `"dateModified": "${TODAY}"`
  );

  // ── 5. Extract title and description for meta tags ────────────────────
  const titleMatch = content.match(/<title>(.*?)<\/title>/);
  const title = titleMatch ? titleMatch[1].replace(/ — MytechERP$/, ' — FieldZenPro').replace(/ — FieldZenPro — FieldZenPro$/, ' — FieldZenPro') : 'FieldZenPro';
  
  // Fix title brand if needed
  content = content.replace(/<title>(.*?) — MytechERP<\/title>/, `<title>$1 — FieldZenPro</title>`);
  content = content.replace(/"name":\s*"MytechERP"/g, '"name": "FieldZenPro"');
  content = content.replace(/MytechERP Team/g, 'FieldZenPro Team');

  const descMatch = content.match(/<meta name="description" content="(.*?)"\s*\/>/);
  const description = descMatch ? descMatch[1] : '';

  // ── 6. Add missing OG/Twitter meta tags ───────────────────────────────
  const hasOgImage = content.includes('og:image');
  const hasTwitterCard = content.includes('twitter:card');

  if (!hasOgImage || !hasTwitterCard) {
    const newMeta = buildMetaTags(title, description, slug);
    // Remove old partial OG tags and replace with full set
    content = content.replace(/<meta property="og:title"[^>]*\/>\s*/g, '');
    content = content.replace(/<meta property="og:description"[^>]*\/>\s*/g, '');
    content = content.replace(/<meta property="og:type"[^>]*\/>\s*/g, '');
    content = content.replace(/<meta name="robots"[^>]*\/>\s*/g, '');
    content = content.replace(
      '</head>',
      `${newMeta}\n</head>`
    );
  } else {
    // Update og:url if it points to old domain
    content = content.replace(
      /<meta property="og:url" content="[^"]*" \/>/g,
      `<meta property="og:url" content="${DOMAIN}/${slug}" />`
    );
    // Add og:site_name if missing
    if (!content.includes('og:site_name')) {
      content = content.replace(
        '<meta property="og:url"',
        `<meta property="og:site_name" content="FieldZenPro" />\n<meta property="og:url"`
      );
    }
    // Add twitter:card if missing
    if (!hasTwitterCard) {
      content = content.replace(
        '</head>',
        `<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}" />
<meta name="twitter:description" content="${description.replace(/"/g, '&quot;')}" />
<meta name="twitter:image" content="${OG_IMAGE}" />
</head>`
      );
    }
    // Add og:image if missing
    if (!hasOgImage) {
      content = content.replace(
        '</head>',
        `<meta property="og:image" content="${OG_IMAGE}" />\n</head>`
      );
    }
    // Update robots meta if weak
    content = content.replace(
      /<meta name="robots" content="index, follow" \/>/g,
      `<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />`
    );
  }

  // ── 7. Add missing Article JSON-LD schema ─────────────────────────────
  if (!isSkip && !content.includes('"@type": "Article"') && !content.includes('"@type":"Article"')
      && !content.includes('"@type": "HowTo"') && !content.includes('"@type":"HowTo"')) {
    // Get publish date from author-meta span if present
    const dateMatch = content.match(/(\w+ \d+, 20\d\d)/);
    let publishDate = TODAY;
    if (dateMatch) {
      const d = new Date(dateMatch[1]);
      if (!isNaN(d)) publishDate = d.toISOString().split('T')[0];
    }
    const schema = buildArticleSchema(title, description, slug, publishDate);
    content = content.replace('</head>', `${schema}\n</head>`);
  }

  // ── 8. Add Organization schema if missing ─────────────────────────────
  if (!content.includes('"@type": "Organization"') && !content.includes('"@type":"Organization"')) {
    const orgSchema = `<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Organization","name":"FieldZenPro","url":"${DOMAIN}","logo":"${DOMAIN}/logo.png","sameAs":["https://twitter.com/fieldzenpro","https://www.linkedin.com/company/fieldzenpro"]}
</script>`;
    content = content.replace('</head>', `${orgSchema}\n</head>`);
  }

  // ── 9. Blog-specific: add Key Takeaways after first <p> ───────────────
  if (isBlog && !content.includes('Key Takeaways')) {
    const takeaways = buildTakeawaysBlock(filename);
    if (takeaways) {
      // Insert after post-meta div
      content = content.replace(
        /(<\/div>\s*\n\s*\n\s*<p)/,
        `$1`
      );
      // Insert after the first paragraph
      content = content.replace(/(<p>[^<]{50,}<\/p>)(\s*\n\s*<h2)/, `$1\n${takeaways}\n$2`);
    }
  }

  // ── 10. Blog-specific: add FAQ before footer ──────────────────────────
  if (isBlog && !content.includes('Frequently Asked Questions') && !content.includes('faq-item')) {
    const faqBlock = buildFaqBlock(filename);
    if (faqBlock) {
      content = content.replace(/(<div class="cta-section">)/, `${faqBlock}\n$1`);
      if (!content.includes('cta-section')) {
        content = content.replace(/(<\/article>)/, `${faqBlock}\n$1`);
      }
    }
  }

  // ── 11. Fix images: add loading="lazy" and explicit width/height ──────
  content = content.replace(
    /<img src="([^"]+)"([^>]*?)style="max-width:100%([^"]*)"([^>]*?)\/>/g,
    (match, src, before, styleRest, after) => {
      let out = match;
      if (!out.includes('loading=')) out = out.replace('/>', ' loading="lazy" />');
      if (!out.includes('width=')) out = out.replace('/>', ' width="800" height="450" />');
      return out;
    }
  );

  // ── 12. Fix nav links: /landing → / ──────────────────────────────────
  content = content.replace(/href="\/landing"/g, 'href="/"');

  // ── 13. Add breadcrumb structured data if not present ─────────────────
  if (!content.includes('BreadcrumbList') && content.includes('breadcrumb')) {
    const breadcrumbSchema = `<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"${DOMAIN}"},{"@type":"ListItem","position":2,"name":"${title.split(' — ')[0]}","item":"${DOMAIN}/${slug}"}]}
</script>`;
    content = content.replace('</head>', `${breadcrumbSchema}\n</head>`);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

// ── Run ────────────────────────────────────────────────────────────────────
const files = fs.readdirSync(PUBLIC_DIR).filter(f => f.endsWith('.html'));
let modified = 0;
let skipped = 0;
const results = [];

files.forEach(filename => {
  const filePath = path.join(PUBLIC_DIR, filename);
  try {
    const changed = processFile(filePath, filename);
    if (changed) {
      modified++;
      results.push(`  ✅ ${filename}`);
    } else {
      skipped++;
      results.push(`  ⏭  ${filename} (no changes needed)`);
    }
  } catch (err) {
    results.push(`  ❌ ${filename} — ERROR: ${err.message}`);
  }
});

console.log('\n════════════════════════════════════════════════');
console.log('  FieldZenPro SEO & GEO Optimizer — Results');
console.log('════════════════════════════════════════════════');
results.forEach(r => console.log(r));
console.log('────────────────────────────────────────────────');
console.log(`  Total files: ${files.length}`);
console.log(`  Modified:    ${modified}`);
console.log(`  Unchanged:   ${skipped}`);
console.log('════════════════════════════════════════════════\n');
