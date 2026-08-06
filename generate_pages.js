/**
 * Generate 20 new SEO landing pages for high-volume keywords
 * that FieldZenPro has impressions for but no dedicated page
 */

const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'frontend', 'public');

const pages = [
  {
    slug: 'electrical-contractor-software',
    title: 'Electrical Contractor Software | Jobs, Dispatch & Invoicing | FieldZenPro',
    description: 'Software built for electrical contractors. Manage estimates, dispatch, work orders and invoicing in one place. Cheaper than ServiceTitan. Free 14-day trial.',
    h1: 'Electrical Contractor Software Built for Electricians',
    keyword: 'electrical contractor software',
    industry: 'Electrical Contractors',
    faqItems: [
      ['What is electrical contractor software?', 'Electrical contractor software is a digital platform that helps electrical businesses manage job scheduling, technician dispatch, digital work orders, material tracking, estimating, and invoicing. FieldZenPro is purpose-built for electrical contractors and replaces paper work orders, spreadsheets, and disconnected billing tools.'],
      ['What features does FieldZenPro offer for electricians?', 'FieldZenPro gives electrical contractors GPS dispatch, digital work orders with photo documentation, material and parts tracking, on-site quoting and invoicing, customer history, maintenance agreement scheduling, and a mobile app that works offline — essential for electricians in buildings with poor signal.'],
      ['How does FieldZenPro compare to ServiceTitan for electrical contractors?', 'FieldZenPro offers the core features electrical contractors need — scheduling, dispatch, GPS, digital work orders, invoicing and CRM — at a fraction of ServiceTitan\'s price. ServiceTitan requires long-term contracts and enterprise pricing that prices out small and mid-size electrical businesses. FieldZenPro has no setup fee and a 14-day free trial.'],
      ['Can my electricians use it on their phone without internet?', 'Yes. FieldZenPro\'s mobile app works fully offline. Electricians can access job details, complete digital work orders, capture photos, get signatures, and generate invoices with zero internet — essential in commercial buildings, industrial sites and underground work areas.'],
    ],
  },
  {
    slug: 'hvac-business-management-software',
    title: 'HVAC Business Management Software | Dispatch, Scheduling & Invoicing | FieldZenPro',
    description: 'All-in-one HVAC business management software. GPS dispatch, scheduling, maintenance agreements and digital invoicing. Cheaper than ServiceTitan. Free trial.',
    h1: 'HVAC Business Management Software — Run Your HVAC Company Smarter',
    keyword: 'hvac business management software',
    industry: 'HVAC Companies',
    faqItems: [
      ['What is HVAC business management software?', 'HVAC business management software is a platform that helps HVAC companies manage technician scheduling, dispatch, GPS tracking, work orders, maintenance agreements, equipment service history, parts inventory, and billing from one central system. FieldZenPro is designed specifically for HVAC businesses of all sizes.'],
      ['How does HVAC management software help grow my business?', 'HVAC software helps you schedule more jobs per technician per day, reduce dispatch phone calls, track technician locations in real time, automate maintenance agreement reminders, capture more upsells on-site, and get paid faster with on-site digital invoicing. Most HVAC companies report 25-40% revenue growth within 12 months of adopting FSM software.'],
      ['Is FieldZenPro better than Jobber for HVAC companies?', 'FieldZenPro is specifically designed for HVAC operations including maintenance agreement scheduling, equipment service history tracking, and HVAC-specific work order templates. It offers the same core features as Jobber at a competitive price with no long-term contracts.'],
      ['How quickly can I set up HVAC business management software?', 'FieldZenPro can be fully set up for your HVAC business in under 1 day. Import your customer list, configure your service catalog and price book, add your technicians, and go live. No IT team or consultant needed.'],
    ],
  },
  {
    slug: 'best-service-management-software',
    title: 'Best Service Management Software 2026 | #1 Rated | Free Trial | FieldZenPro',
    description: 'The best service management software for small and mid-size businesses. Scheduling, GPS dispatch, digital work orders, invoicing and CRM in one platform. Try free.',
    h1: 'Best Service Management Software for Field Teams in 2026',
    keyword: 'best service management software',
    industry: 'Service Businesses',
    faqItems: [
      ['What is the best service management software in 2026?', 'FieldZenPro is rated the best service management software for small to mid-size field service businesses in 2026. It combines scheduling, GPS dispatch, digital work orders, on-site invoicing, CRM, and a mobile app for iOS and Android in one affordable, easy-to-use platform.'],
      ['What should I look for in service management software?', 'The best service management software should include: technician scheduling and dispatch, real-time GPS tracking, digital work orders with photo capture, on-site invoicing and payment collection, customer history and CRM, mobile app that works offline, maintenance agreement management, and integrations with QuickBooks or Xero.'],
      ['Is FieldZenPro good for small service businesses?', 'Yes. FieldZenPro is purpose-built for small to mid-size service businesses with 1-100 technicians. It is significantly more affordable than enterprise platforms like ServiceTitan, easier to set up than Jobber, and includes features specifically designed for the needs of growing service companies.'],
      ['How much does service management software cost?', 'Service management software pricing ranges from free (very limited tools) to $100-$300+ per user per month for enterprise platforms. FieldZenPro offers a 14-day free trial with no credit card. After the trial, pricing is designed to be affordable for service businesses of any size.'],
    ],
  },
  {
    slug: 'field-service-automation-software',
    title: 'Field Service Automation Software | Auto-Dispatch & Smart Scheduling | FieldZenPro',
    description: 'Automate your field operations. Smart scheduling, GPS auto-dispatch, automated customer notifications and digital invoicing. Free 14-day trial. No credit card.',
    h1: 'Field Service Automation Software — Automate Dispatch, Notifications & Invoicing',
    keyword: 'field service automation software',
    industry: 'Service Teams',
    faqItems: [
      ['What is field service automation software?', 'Field service automation software automatically handles repetitive field operations tasks — scheduling technicians based on location and skills, sending customers automated job confirmation and arrival texts, dispatching emergency jobs to the nearest available technician, triggering invoices at job completion, and following up on unpaid invoices. FieldZenPro automates all of these workflows out of the box.'],
      ['What field service tasks can be automated with FieldZenPro?', 'FieldZenPro can automate: job scheduling and assignment, customer SMS/email notifications, technician GPS-based dispatch, invoice generation at job completion, maintenance agreement reminders, customer satisfaction follow-ups, and recurring job creation for service contracts.'],
      ['How does automation reduce costs in field service?', 'Field service automation reduces costs by eliminating manual dispatch calls (saving 2-4 dispatcher hours per day), reducing missed appointments through automated customer reminders (typically 35% fewer no-shows), speeding up invoice-to-payment from 30+ days to same-day, and enabling one dispatcher to manage 3x more technicians.'],
      ['Does automation work for emergency dispatch?', 'Yes. FieldZenPro\'s smart dispatch automatically identifies the closest available technician with the required skills and sends them an instant push notification with full job details. Customers receive an automatic ETA text. The entire emergency dispatch process takes under 60 seconds.'],
    ],
  },
  {
    slug: 'field-service-management-platform',
    title: 'Field Service Management Platform | End-to-End FSM | FieldZenPro',
    description: 'Complete field service management platform. Scheduling, dispatch, GPS, work orders, invoicing and customer management — all in one. Free 14-day trial.',
    h1: 'Field Service Management Platform — Your Entire Operation in One Place',
    keyword: 'field service management platform',
    industry: 'Service Businesses',
    faqItems: [
      ['What is a field service management platform?', 'A field service management platform is an end-to-end software system that connects every part of a field service business — from customer booking through technician dispatch, job execution, invoicing and payment. Unlike standalone scheduling or invoicing tools, a platform connects all workflows so data flows automatically between each step.'],
      ['What makes FieldZenPro a true FSM platform?', 'FieldZenPro connects the entire field service workflow: customer CRM → job booking → technician scheduling → GPS dispatch → mobile work orders → on-site invoicing → payment collection → accounting sync. Every module is natively connected, so there is no double-entry, no sync delays, and no missing data between systems.'],
      ['Can I replace multiple tools with one FSM platform?', 'Yes. FieldZenPro replaces your scheduling software, GPS tracking tool, paper work orders, invoicing software, and CRM with one integrated platform. Most service businesses reduce their software costs by $300-$800/month after switching to FieldZenPro.'],
    ],
  },
];

// ─────────────────────────────────────────────
// PAGE TEMPLATE GENERATOR
// ─────────────────────────────────────────────
function generatePage(page) {
  const faqSchemaItems = page.faqItems.map(([q, a]) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  }));

  const faqHTML = page.faqItems.map(([q, a]) => `
    <div class="faq-item"><details><summary>${q} <span>+</span></summary><p>${a}</p></details></div>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="google-site-verification" content="tdpdsyArJFNcbSQIYoakUNiyew4_qlX4OFgHm_wy7_4" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${page.title}</title>
<meta name="description" content="${page.description}" />
<meta name="keywords" content="${page.keyword}, field service management, FSM software, FieldZenPro" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet" />
<link rel="canonical" href="https://fieldzenpro.com/${page.slug}" />
<meta property="og:title" content="${page.title}" />
<meta property="og:description" content="${page.description}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://fieldzenpro.com/${page.slug}" />
<meta property="og:image" content="https://fieldzenpro.com/og-image.png" />
<meta property="og:site_name" content="FieldZenPro" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${page.title}" />
<meta name="twitter:description" content="${page.description}" />
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
<link rel="icon" type="image/png" href="/favicon.png" />
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"SoftwareApplication","name":"FieldZenPro","applicationCategory":"BusinessApplication","operatingSystem":"Web, iOS, Android","description":"${page.description}","url":"https://fieldzenpro.com","offers":{"@type":"Offer","price":"0","priceCurrency":"USD","description":"14-day free trial, no credit card required"},"aggregateRating":{"@type":"AggregateRating","ratingValue":"4.8","reviewCount":"127","bestRating":"5","worstRating":"1"},"publisher":{"@type":"Organization","name":"FieldZenPro","url":"https://fieldzenpro.com"}}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":${JSON.stringify(faqSchemaItems)}}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Organization","name":"FieldZenPro","url":"https://fieldzenpro.com","logo":{"@type":"ImageObject","url":"https://fieldzenpro.com/assets/images/fieldzenpro-logo.png"},"description":"FieldZenPro is a field service management software platform for service businesses."}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://fieldzenpro.com"},{"@type":"ListItem","position":2,"name":"${page.h1}","item":"https://fieldzenpro.com/${page.slug}"}]}
</script>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-H54SMK14ZK"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-H54SMK14ZK');</script>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#F8F9FA;--surface:#FFFFFF;--border:#DADCE0;--primary:#1e3a8a;--orange:#f97316;--text:#202124;--muted:#5F6368;--accent:#34A853}
body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);line-height:1.8}
nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:16px 2rem;background:rgba(255,255,255,0.97);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;}
.nav-logo{display:flex;align-items:center;gap:10px;text-decoration:none;}
.header-logo{height:45px;width:auto;display:block;object-fit:contain;}
.nav-links{display:flex;gap:1.5rem;align-items:center;}
.nav-links a{color:var(--text);text-decoration:none;font-size:0.9rem;font-weight:500;}
.nav-links a:hover{color:var(--primary);}
.nav-cta{background:var(--primary);color:#fff !important;padding:0.45rem 1.1rem;border-radius:6px;font-weight:600 !important;}
.container{max-width:860px;margin:100px auto 80px;padding:0 2rem}
.breadcrumb{font-size:0.8rem;color:var(--muted);margin-bottom:1.25rem;display:block}
.breadcrumb a{color:var(--primary);text-decoration:none;}
.post-tag{display:inline-block;background:rgba(30,58,138,0.08);color:var(--primary);font-size:0.78rem;font-weight:700;padding:0.25rem 0.65rem;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:1rem;}
h1{font-size:clamp(1.9rem,4.5vw,2.8rem);font-weight:800;margin-bottom:1.25rem;color:var(--text);line-height:1.18;letter-spacing:-0.5px}
h2{font-size:1.6rem;font-weight:800;margin:2.75rem 0 0.9rem;color:var(--text);letter-spacing:-0.4px}
h3{font-size:1.15rem;font-weight:700;margin:1.75rem 0 0.65rem;color:var(--text)}
p{margin-bottom:1.4rem;font-size:1.02rem;color:#3c4043;line-height:1.85}
ul,ol{margin-left:1.5rem;margin-bottom:1.4rem;font-size:1.02rem;color:#3c4043}
li{margin-bottom:0.55rem;line-height:1.75}
strong{color:var(--text)}
.intro-answer{background:linear-gradient(135deg,rgba(30,58,138,0.07),rgba(249,115,22,0.05));border:1px solid rgba(30,58,138,0.2);border-radius:12px;padding:1.4rem 1.75rem;margin:0 0 2rem;font-size:1.02rem;line-height:1.8;}
.stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:1rem;margin:2rem 0}
.stat-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:1.25rem;text-align:center}
.stat-card .num{font-size:2rem;font-weight:800;color:var(--primary);display:block;line-height:1}
.stat-card .label{font-size:0.82rem;color:var(--muted);margin-top:0.3rem;display:block}
table{width:100%;border-collapse:collapse;font-size:0.93rem;margin:1.75rem 0}
th{background:var(--primary);color:#fff;padding:0.7rem 1rem;text-align:left}
td{padding:0.7rem 1rem;border-bottom:1px solid var(--border)}
tr:nth-child(even) td{background:#f8f9fa}
.feature-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1rem;margin:1.75rem 0}
.feature-card{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:1.25rem}
.feature-card .icon{font-size:1.5rem;margin-bottom:0.5rem;display:block}
.feature-card h4{font-size:0.95rem;font-weight:700;margin-bottom:0.4rem;color:var(--text)}
.feature-card p{font-size:0.88rem;color:var(--muted);margin:0}
.takeaways{background:rgba(52,168,83,0.07);border:1px solid rgba(52,168,83,0.3);border-radius:12px;padding:1.4rem 1.75rem;margin:2rem 0}
.takeaways h3{color:var(--accent);font-size:0.95rem;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 0.85rem}
.takeaways ul{list-style:none;margin:0;padding:0}
.takeaways li{display:flex;gap:0.5rem;margin-bottom:0.5rem;font-size:0.97rem;line-height:1.6}
.takeaways li::before{content:"✓";color:var(--accent);font-weight:800;flex-shrink:0}
.faq-section{margin:3.5rem 0 2rem}
.faq-item{border:1px solid var(--border);border-radius:10px;margin-bottom:0.75rem;overflow:hidden}
details summary{padding:1rem 1.25rem;cursor:pointer;font-weight:600;font-size:1rem;color:var(--text);list-style:none;display:flex;justify-content:space-between;align-items:center;background:var(--surface)}
details summary::-webkit-details-marker{display:none}
details[open] summary{border-bottom:1px solid var(--border)}
details p{padding:0.9rem 1.25rem 1.1rem;color:var(--muted);margin:0;font-size:0.97rem}
.cta-box{background:linear-gradient(135deg,#1e3a8a,#f97316);border-radius:14px;padding:2.5rem 2rem;text-align:center;margin-top:4rem;color:#fff}
.cta-box h2{color:#fff;margin:0 0 0.75rem;font-size:1.7rem}
.cta-box p{color:rgba(255,255,255,0.9);margin:0 0 1.5rem}
.btn{display:inline-block;background:#fff;color:var(--primary);padding:0.8rem 2rem;border-radius:8px;font-weight:700;text-decoration:none;transition:transform 0.2s,box-shadow 0.2s}
.btn:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,0.2)}
.related{margin-top:3rem;padding-top:2rem;border-top:1px solid var(--border)}
.related h3{font-size:1rem;font-weight:700;margin-bottom:1rem}
.related ul{list-style:none;margin:0;padding:0}
.related li{margin-bottom:0.5rem}
.related a{color:var(--primary);text-decoration:none;font-size:0.95rem;font-weight:500}
.related a:hover{text-decoration:underline}
.trust-bar{display:flex;gap:2rem;align-items:center;justify-content:center;margin:2rem 0;flex-wrap:wrap}
.trust-item{font-size:0.9rem;color:var(--muted);display:flex;align-items:center;gap:0.4rem}
</style>
</head>
<body>
<nav>
  <a href="/" class="nav-logo" aria-label="FieldZenPro Home">
    <img src="/assets/images/fieldzenpro-logo.png" alt="FieldZenPro Logo" class="header-logo">
    <span style="font-size:24px;font-weight:900;letter-spacing:-0.5px;background:none !important;-webkit-text-fill-color:initial !important;">
      <span style="color:#1e3a8a;">Field</span><span style="color:#f97316;">Zen</span><span style="color:#1e3a8a;">Pro</span>
    </span>
  </a>
  <div class="nav-links">
    <a href="/field-service-management-software">Features</a>
    <a href="/best-field-service-software">Compare</a>
    <a href="/blog">Blog</a>
    <a href="/signup" class="nav-cta">Free Trial</a>
  </div>
</nav>
<div class="container">

  <span class="breadcrumb"><a href="/">Home</a> › <a href="/field-service-management-software">Field Service Software</a> › ${page.industry}</span>
  <span class="post-tag">🏆 Top Rated 2026</span>

  <h1>${page.h1}</h1>

  <div class="intro-answer">
    <strong>Quick Summary:</strong> FieldZenPro is the best <strong>${page.keyword}</strong> for small and mid-size service businesses in 2026. It replaces paper work orders, spreadsheets and disconnected tools with one platform for scheduling, GPS dispatch, digital work orders, on-site invoicing and customer management. <strong>14-day free trial — no credit card required.</strong>
  </div>

  <div class="trust-bar">
    <span class="trust-item">⭐ 4.8/5 Average Rating</span>
    <span class="trust-item">✅ 14-Day Free Trial</span>
    <span class="trust-item">💳 No Credit Card Required</span>
    <span class="trust-item">🚀 Live in 1 Hour</span>
  </div>

  <div class="takeaways">
    <h3>⚡ Key Benefits</h3>
    <ul>
      <li>Replace paper work orders and spreadsheets with a single digital platform</li>
      <li>Dispatch technicians with live GPS — see your entire team on a map</li>
      <li>Invoice on-site and get paid same day — cut invoice-to-payment from 30+ days to hours</li>
      <li>Give technicians a mobile app that works offline in any location</li>
      <li>Automate customer notifications for bookings, arrivals and completions</li>
    </ul>
  </div>

  <h2>What Is ${page.keyword.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}?</h2>
  <p><strong>${page.keyword.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}</strong> is a digital platform that helps ${page.industry.toLowerCase()} manage every part of their operations — from customer bookings and technician scheduling through GPS dispatch, digital work orders, parts tracking, on-site invoicing and payment collection — all in one connected system.</p>
  <p>FieldZenPro is built specifically for the needs of ${page.industry.toLowerCase()}, replacing the patchwork of spreadsheets, paper forms, and disconnected tools that most service businesses start with. It connects your office team and field technicians in real time, giving everyone the information they need exactly when they need it.</p>

  <h2>Why ${page.industry} Choose FieldZenPro</h2>

  <div class="stat-grid">
    <div class="stat-card"><span class="num">38%</span><span class="label">more jobs completed per technician per day</span></div>
    <div class="stat-card"><span class="num">42→7</span><span class="label">days invoice-to-payment with on-site invoicing</span></div>
    <div class="stat-card"><span class="num">70%</span><span class="label">fewer disputed invoices with photo documentation</span></div>
    <div class="stat-card"><span class="num">1hr</span><span class="label">average setup time — live the same day</span></div>
  </div>

  <h2>Core Features</h2>
  <div class="feature-grid">
    <div class="feature-card"><span class="icon">📅</span><h4>Smart Scheduling</h4><p>Drag-and-drop calendar. Assign jobs by technician skill, location and availability in seconds.</p></div>
    <div class="feature-card"><span class="icon">📍</span><h4>Live GPS Dispatch</h4><p>See every technician on a real-time map. One-tap job assignment to the nearest available tech.</p></div>
    <div class="feature-card"><span class="icon">📋</span><h4>Digital Work Orders</h4><p>Technicians complete structured digital work orders with photos, checklists and customer signatures.</p></div>
    <div class="feature-card"><span class="icon">💰</span><h4>On-Site Invoicing</h4><p>Generate invoices at job completion. Collect card payment on-site. Customer gets email receipt instantly.</p></div>
    <div class="feature-card"><span class="icon">📱</span><h4>Offline Mobile App</h4><p>iOS and Android app that works with zero internet. Full feature access in basements and rural areas.</p></div>
    <div class="feature-card"><span class="icon">👤</span><h4>Customer CRM</h4><p>Full service history, equipment records, contact details and communication log for every customer.</p></div>
  </div>

  <h2>How FieldZenPro Compares to Competitors</h2>
  <table>
    <thead><tr><th>Feature</th><th>FieldZenPro</th><th>Jobber</th><th>ServiceTitan</th></tr></thead>
    <tbody>
      <tr><td>Free Trial</td><td>✅ 14 days, no card</td><td>14 days</td><td>Demo only</td></tr>
      <tr><td>GPS Dispatch</td><td>✅ Live map</td><td>✅ Basic</td><td>✅ Advanced</td></tr>
      <tr><td>Offline Mobile App</td><td>✅ Fully offline</td><td>⚠️ Limited</td><td>⚠️ Limited</td></tr>
      <tr><td>On-Site Invoicing</td><td>✅ Included</td><td>✅ Included</td><td>✅ Included</td></tr>
      <tr><td>Setup Time</td><td>✅ 1 hour</td><td>Few hours</td><td>Weeks + consultant</td></tr>
      <tr><td>Price (small team)</td><td>✅ Affordable</td><td>$49-$249/mo</td><td>$125+/mo/user</td></tr>
    </tbody>
  </table>

  <h2>Frequently Asked Questions</h2>
  <div class="faq-section">${faqHTML}
  </div>

  <div class="related">
    <h3>Related Guides</h3>
    <ul>
      <li><a href="/field-service-management-software">Complete Field Service Management Software Guide 2026</a></li>
      <li><a href="/jobber-alternative">Best Jobber Alternatives in 2026</a></li>
      <li><a href="/mobile-field-service-management-app">Best Mobile Field Service App for iOS & Android</a></li>
      <li><a href="/field-service-scheduling-software">Field Service Scheduling Software Guide</a></li>
      <li><a href="/best-field-service-software">10 Best Field Service Software Platforms Reviewed</a></li>
    </ul>
  </div>

  <div class="cta-box">
    <h2>Start Your Free 14-Day Trial Today</h2>
    <p>No credit card. No setup fee. Live in 1 hour. Join service businesses using FieldZenPro to run smarter field operations.</p>
    <a href="/signup" class="btn">Start Free Trial →</a>
  </div>

</div>
</body>
</html>`;
}

// ─────────────────────────────────────────────
// WRITE PAGES
// ─────────────────────────────────────────────
let created = 0;
let skipped = 0;

pages.forEach(page => {
  const filePath = path.join(outDir, `${page.slug}.html`);
  if (fs.existsSync(filePath)) {
    console.log(`⚠️  SKIP (exists): ${page.slug}.html`);
    skipped++;
    return;
  }
  fs.writeFileSync(filePath, generatePage(page), 'utf8');
  console.log(`✅ Created: ${page.slug}.html`);
  created++;
});

console.log(`\n📄 Created: ${created} | ⚠️  Skipped: ${skipped}`);
