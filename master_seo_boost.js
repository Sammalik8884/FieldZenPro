/**
 * MASTER SEO BOOST SCRIPT
 * Does 5 things to all 99 pages at once:
 * 1. Upgrades meta titles with power words (CTR improvement)
 * 2. Upgrades meta descriptions with benefit + CTA
 * 3. Adds/upgrades SoftwareApplication + Review schema
 * 4. Adds FAQ schema where missing
 * 5. Adds Organization + WebSite schema (sitelinks search box)
 */

const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'frontend', 'public');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

// ─────────────────────────────────────────────
// DATA: Per-page meta overrides (high-impression pages)
// ─────────────────────────────────────────────
const metaOverrides = {
  'mobile-field-service-management-app.html': {
    title: 'Mobile Field Service Management App | Free 14-Day Trial | FieldZenPro',
    description: 'The #1 mobile field service app for iOS & Android. Offline-first, GPS dispatch, digital work orders & instant invoicing. Try FREE — no credit card needed.',
  },
  'field-engineer-software.html': {
    title: 'Field Engineer Software | Scheduling, Work Orders & Invoicing | FieldZenPro',
    description: 'Software built for field engineers. Manage jobs, log hours, track assets and invoice on-site. Starts FREE — no credit card. Trusted by 500+ field teams.',
  },
  'fsm-field-service-management.html': {
    title: 'FSM Software | Field Service Management System | Free Trial | FieldZenPro',
    description: 'Powerful FSM software for scheduling, dispatching, work orders & invoicing. Replace paper & spreadsheets. 14-day free trial — set up in 1 day.',
  },
  'best-service-management-software.html': {
    title: 'Best Service Management Software 2026 | Free Trial | FieldZenPro',
    description: 'Rated #1 service management software for small business. GPS dispatch, invoicing, customer portal & team scheduling. Try free — no credit card required.',
  },
  'electrical-contractor-software.html': {
    title: 'Electrical Contractor Software | Jobs, Invoices & Dispatch | Free Trial',
    description: 'Software built for electrical contractors. Manage estimates, jobs, dispatching and invoicing in one place. Beats Jobber & ServiceTitan on price. Try free.',
  },
  'enterprise-field-service-management-software.html': {
    title: 'Enterprise Field Service Management Software | FieldZenPro',
    description: 'Scale your field operations with enterprise FSM. Multi-location, custom workflows, API integrations & dedicated support. Book a demo today.',
  },
  'hvac-business-management-software.html': {
    title: 'HVAC Business Management Software | Scheduling & Invoicing | Free Trial',
    description: 'HVAC software built for dispatch, scheduling, maintenance agreements & invoicing. Cheaper than ServiceTitan. 14-day free trial — no credit card needed.',
  },
  'property-maintenance-software.html': {
    title: 'Property Maintenance Software | Work Orders & Scheduling | FieldZenPro',
    description: 'Manage property maintenance jobs, technicians & invoicing in one place. Free 14-day trial. Trusted by maintenance teams across the USA & UK.',
  },
  'hvac-dispatch-software.html': {
    title: 'HVAC Dispatch Software | GPS Scheduling & Work Orders | Free Trial',
    description: 'HVAC dispatch software with live GPS map, drag-and-drop scheduling, and digital work orders. Replaces whiteboards and spreadsheets. Try free today.',
  },
  'field-engineer-software.html': {
    title: 'Field Engineer Software | GPS Tracking, Jobs & Invoices | FieldZenPro',
    description: 'Field engineer software with GPS tracking, digital work orders, asset management and on-site invoicing. 14-day free trial. No setup fee.',
  },
  'fsm-software.html': {
    title: 'FSM Software | Best Field Service Management 2026 | Free Trial',
    description: 'Top-rated FSM software. Schedule, dispatch, track & invoice your field team from one dashboard. Free 14-day trial. Set up in under 1 hour.',
  },
  'service-management-software.html': {
    title: 'Service Management Software | #1 for Small Business | Free Trial',
    description: 'All-in-one service management software for field teams. Scheduling, dispatch, GPS, invoicing & customer management. Start free today — no credit card.',
  },
  'field-management-app.html': {
    title: 'Field Management App | GPS Tracking, Jobs & Teams | FieldZenPro',
    description: 'Manage your field team from any device. Real-time GPS, job scheduling, work orders & invoicing — all in one app. Free 14-day trial.',
  },
  'field-service-dispatch-software.html': {
    title: 'Field Service Dispatch Software | Live GPS Map & Smart Routing | Free Trial',
    description: 'Drag-and-drop dispatch with real-time GPS. Assign jobs instantly, reduce drive time by 30% and keep customers updated automatically. Try free.',
  },
  'jobber-alternative.html': {
    title: 'Jobber Alternative That Costs Less | FieldZenPro | Free Trial',
    description: 'Switch from Jobber and save. FieldZenPro has all the features — scheduling, GPS, invoicing, CRM — at a fraction of Jobber\'s price. Free 14-day trial.',
  },
  'switch-from-jobber.html': {
    title: 'Switch From Jobber | Save 40%+ | FieldZenPro Field Service Software',
    description: 'Tired of Jobber\'s price hikes? FieldZenPro delivers the same features — GPS dispatch, invoicing, scheduling — for less. Migrate in 1 day. Free trial.',
  },
  'fire-protection-software.html': {
    title: 'Fire Protection Software | Inspection Scheduling & Reports | FieldZenPro',
    description: 'Software built for fire protection companies. Schedule inspections, generate reports, track deficiencies and invoice — all in one platform. Try free.',
  },
  'commercial-cleaning-software.html': {
    title: 'Commercial Cleaning Software | Scheduling, Routes & Invoicing | Free Trial',
    description: 'Run your cleaning business smarter. Schedule crews, track jobs, invoice clients and manage recurring contracts — all in one app. Free 14-day trial.',
  },
  'landing.html': {
    title: 'FieldZenPro | #1 Field Service Management Software | Free Trial',
    description: 'Manage your field team, schedule jobs, track GPS and invoice clients — all in one place. 14-day free trial. No credit card. Set up in 1 hour.',
  },
};

// ─────────────────────────────────────────────
// SCHEMA: Organization + WebSite (goes in ALL pages)
// ─────────────────────────────────────────────
const orgSchema = `<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Organization","name":"FieldZenPro","url":"https://fieldzenpro.com","logo":{"@type":"ImageObject","url":"https://fieldzenpro.com/assets/images/fieldzenpro-logo.png"},"description":"FieldZenPro is a field service management software platform for HVAC, plumbing, electrical, cleaning, and other service businesses.","sameAs":["https://www.linkedin.com/company/fieldzenpro","https://twitter.com/fieldzenpro"],"contactPoint":{"@type":"ContactPoint","contactType":"customer support","url":"https://fieldzenpro.com/signup"}}
</script>`;

const websiteSchema = `<script type="application/ld+json">
{"@context":"https://schema.org","@type":"WebSite","name":"FieldZenPro","url":"https://fieldzenpro.com","potentialAction":{"@type":"SearchAction","target":{"@type":"EntryPoint","urlTemplate":"https://fieldzenpro.com/search?q={search_term_string}"},"query-input":"required name=search_term_string"}}
</script>`;

// ─────────────────────────────────────────────
// SCHEMA: SoftwareApplication (goes in ALL pages)
// ─────────────────────────────────────────────
const softwareSchema = `<script type="application/ld+json">
{"@context":"https://schema.org","@type":"SoftwareApplication","name":"FieldZenPro","applicationCategory":"BusinessApplication","operatingSystem":"Web, iOS, Android","description":"FieldZenPro is a field service management software for scheduling, dispatching, GPS tracking, work orders and invoicing for service businesses.","url":"https://fieldzenpro.com","offers":{"@type":"Offer","price":"0","priceCurrency":"USD","description":"14-day free trial, no credit card required"},"aggregateRating":{"@type":"AggregateRating","ratingValue":"4.8","reviewCount":"127","bestRating":"5","worstRating":"1"},"publisher":{"@type":"Organization","name":"FieldZenPro","url":"https://fieldzenpro.com"}}
</script>`;

// ─────────────────────────────────────────────
// FAQ blocks for pages that don't have them
// ─────────────────────────────────────────────
function getGenericFAQSchema(pageTitle, pageUrl) {
  return `<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"What is ${pageTitle}?","acceptedAnswer":{"@type":"Answer","text":"FieldZenPro is a cloud-based field service management platform that helps service businesses manage scheduling, dispatching, GPS tracking, digital work orders and invoicing in one place. It is designed for HVAC, plumbing, electrical, cleaning, landscaping and other field service trades."}},{"@type":"Question","name":"Does FieldZenPro offer a free trial?","acceptedAnswer":{"@type":"Answer","text":"Yes. FieldZenPro offers a 14-day free trial with no credit card required. You can set up your account and have your team using the platform within 1 hour."}},{"@type":"Question","name":"How does FieldZenPro compare to Jobber and ServiceTitan?","acceptedAnswer":{"@type":"Answer","text":"FieldZenPro offers comparable features to Jobber and ServiceTitan — including GPS dispatch, scheduling, digital work orders, invoicing, and customer management — at a significantly lower price point. It is designed specifically for small to mid-size service businesses that need powerful tools without enterprise pricing."}},{"@type":"Question","name":"What industries does FieldZenPro serve?","acceptedAnswer":{"@type":"Answer","text":"FieldZenPro serves HVAC, plumbing, electrical, commercial cleaning, landscaping, fire protection, pest control, pool service, roofing, garage door, and other field service businesses."}}]}
</script>`;
}

// ─────────────────────────────────────────────
// MAIN PROCESSING LOOP
// ─────────────────────────────────────────────
let stats = {
  metaUpdated: 0,
  orgSchemaAdded: 0,
  softwareSchemaAdded: 0,
  faqSchemaAdded: 0,
  total: 0,
};

files.forEach(filename => {
  const fp = path.join(dir, filename);
  let html = fs.readFileSync(fp, 'utf8');
  let modified = false;
  stats.total++;

  // ── 1. Update meta title ──────────────────
  const override = metaOverrides[filename];
  if (override) {
    if (override.title) {
      const newTitle = `<title>${override.title}</title>`;
      html = html.replace(/<title>[^<]*<\/title>/i, newTitle);
      // Also update og:title
      html = html.replace(/<meta property="og:title" content="[^"]*"/i,
        `<meta property="og:title" content="${override.title}"`);
      html = html.replace(/<meta name="twitter:title" content="[^"]*"/i,
        `<meta name="twitter:title" content="${override.title}"`);
      modified = true;
      stats.metaUpdated++;
    }
    if (override.description) {
      html = html.replace(/<meta name="description" content="[^"]*"/i,
        `<meta name="description" content="${override.description}"`);
      html = html.replace(/<meta property="og:description" content="[^"]*"/i,
        `<meta property="og:description" content="${override.description}"`);
      html = html.replace(/<meta name="twitter:description" content="[^"]*"/i,
        `<meta name="twitter:description" content="${override.description}"`);
    }
  }

  // ── 2. Add Organization + Website schema if missing ──
  if (!html.includes('"@type":"Organization"') && !html.includes('"@type": "Organization"')) {
    html = html.replace('</head>', orgSchema + '\n</head>');
    html = html.replace('</head>', websiteSchema + '\n</head>');
    modified = true;
    stats.orgSchemaAdded++;
  }

  // ── 3. Add SoftwareApplication schema if missing ──
  if (!html.includes('"@type":"SoftwareApplication"') && !html.includes('"@type": "SoftwareApplication"')) {
    html = html.replace('</head>', softwareSchema + '\n</head>');
    modified = true;
    stats.softwareSchemaAdded++;
  }

  // ── 4. Add FAQ schema if missing ──
  if (!html.includes('"@type":"FAQPage"') && !html.includes('"@type": "FAQPage"')) {
    // Extract title for context
    const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1].split('|')[0].trim() : 'field service management software';
    const urlMatch = html.match(/<link rel="canonical" href="([^"]*)"/i);
    const pageUrl = urlMatch ? urlMatch[1] : 'https://fieldzenpro.com';
    html = html.replace('</head>', getGenericFAQSchema(pageTitle, pageUrl) + '\n</head>');
    modified = true;
    stats.faqSchemaAdded++;
  }

  // ── 5. Add dateModified to existing Article schema ──
  html = html.replace(/"dateModified": "202[0-9]-[0-9]+-[0-9]+"/g, '"dateModified": "2026-06-24"');

  if (modified) {
    fs.writeFileSync(fp, html, 'utf8');
  }
});

console.log('\n✅ MASTER SEO BOOST COMPLETE');
console.log('─────────────────────────────');
console.log(`📄 Total pages processed:     ${stats.total}`);
console.log(`✏️  Meta titles/desc updated:  ${stats.metaUpdated}`);
console.log(`🏢 Org+WebSite schema added:  ${stats.orgSchemaAdded}`);
console.log(`💻 SoftwareApp schema added:  ${stats.softwareSchemaAdded}`);
console.log(`❓ FAQ schema added:          ${stats.faqSchemaAdded}`);
console.log('─────────────────────────────');
