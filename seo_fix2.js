/**
 * FieldZenPro — SEO Fix Pass 2
 * Fixes remaining issues:
 * 1. All remaining broken emoji sequences
 * 2. Nav logo brand name (MytechERP → FieldZenPro)
 * 3. Key Takeaways injection (improved regex)
 */

const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, 'frontend', 'public');
const TODAY = '2026-06-15';
const DOMAIN = 'https://fieldzenpro.com';

// Blog-specific pages
const BLOG_PAGES = new Set([
  'blog-automate-invoicing.html',
  'blog-best-fm-software-2026.html',
  'blog-digital-checklists-fm.html',
  'blog-digital-work-orders.html',
  'blog-erp-vs-cmms.html'
]);

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
    'Digital signatures and photo capture eliminate disputes over completed work',
    'The 5-step digitization plan: audit, choose software, configure, template, then train',
    'Pilot with 2–3 technicians for one week before full team rollout'
  ],
  'blog-erp-vs-cmms.html': [
    'CMMS covers maintenance; ERP covers the whole business — FSM software bridges both',
    'Most maintenance companies outgrow a pure CMMS within 2–3 years of growth',
    'The real cost of disconnected tools: double data entry, reporting gaps, and billing delays',
    'If you manage invoicing, payroll, procurement, and work orders — you need an ERP-level platform',
    'FieldZenPro is purpose-built to replace CMMS, accounting, and CRM with one subscription'
  ]
};

function buildTakeawaysBlock(filename) {
  const items = BLOG_TAKEAWAYS[filename];
  if (!items) return '';
  const li = items.map(i => 
    `<li style="margin-bottom:0.5rem;display:flex;align-items:flex-start;gap:0.5rem;"><span style="color:#34A853;font-weight:700;flex-shrink:0;">&#10003;</span><span>${i}</span></li>`
  ).join('\n      ');
  return `\n  <!-- Key Takeaways — GEO signal for AI search engines -->
  <div style="background:rgba(52,168,83,0.07);border:1px solid rgba(52,168,83,0.3);border-radius:12px;padding:1.5rem 2rem;margin:1.5rem 0 2rem;">
    <h2 style="margin:0 0 1rem;font-size:1.1rem;font-weight:700;color:#34A853;letter-spacing:0.5px;text-transform:uppercase;">&#9889; Key Takeaways</h2>
    <ul style="list-style:none;margin:0;padding:0;">
      ${li}
    </ul>
  </div>\n`;
}

// Complete map of all broken sequences → correct character
// Read the file as latin1 to see actual bytes
function fixEmojis(content) {
  // These are the actual multi-byte sequences that appear after double-encoding
  const fixes = [
    // ðŸ"… = 📅 (calendar)
    [/\u00f0\u009f\u0094\u0085/g, '\uD83D\uDCC5'],
    // ðŸ'° = 💰 (money bag)
    [/\u00f0\u009f\u0092\u00b0/g, '\uD83D\uDCB0'],
    // â±ï¸ = ⏱️ (timer)
    [/\u00e2\u00b1\u00ef\u00b8/g, '\u23F1\uFE0F'],
    [/\u00e2\u00b1\uFFFD/g, '\u23F1\uFE0F'],
    // âœï¸ = ✍️ (writing hand)
    [/\u00e2\u009c\u00ef\u00b8/g, '\u270D\uFE0F'],
    // ðŸ"‹ = 📋 (clipboard)
    [/\u00f0\u009f\u0094\u008b/g, '\uD83D\uDCCB'],
    // ðŸ'¸ = 💸 (money with wings)
    [/\u00f0\u009f\u0092\u00b8/g, '\uD83D\uDCB8'],
    // ðŸ'» = 👻 (ghost)
    [/\u00f0\u009f\u0091\u00bb/g, '\uD83D\uDC7B'],
    // ðŸ¤· = 🤷 (shrug)
    [/\u00f0\u009f\u00a4\u00b7/g, '\uD83E\uDD37'],
    // ðŸ"¸ = 📸 (camera)
    [/\u00f0\u009f\u0094\u00b8/g, '\uD83D\uDCF8'],
    // ðŸ" = 🔑 (key)
    [/\u00f0\u009f\u0094\u0091/g, '\uD83D\uDD11'],
    // ðŸ"„ = 📄 (document)
    [/\u00f0\u009f\u0094\u0084/g, '\uD83D\uDCC4'],
    // ðŸ"§ = 🔧 (wrench)
    [/\u00f0\u009f\u0094\u00a7/g, '\uD83D\uDD27'],
    // ðŸ"¦ = 📦 (package)
    [/\u00f0\u009f\u0094\u00a6/g, '\uD83D\uDCE6'],
    // ðŸ§¾ = 🧾 (receipt)
    [/\u00f0\u009f\u00a7\u00be/g, '\uD83E\uDDFE'],
    // ðŸ'³ = 💳 (credit card)
    [/\u00f0\u009f\u0092\u00b3/g, '\uD83D\uDCB3'],
    // ðŸ'¥ = 👥 (people)
    [/\u00f0\u009f\u0091\u00a5/g, '\uD83D\uDC65'],
    // ðŸ' = 👍 (thumbs up)
    [/\u00f0\u009f\u0091\u008d/g, '\uD83D\uDC4D'],
    // ðŸ"Š = 📊 (bar chart)
    [/\u00f0\u009f\u0094\u008a/g, '\uD83D\uDCCA'],
    // ðŸ¢ = 🏢 (office building)
    [/\u00f0\u009f\u008f\u00a2/g, '\uD83C\uDFE2'],
    // ðŸ"¥ = 🔥 (fire)
    [/\u00f0\u009f\u0094\u00a5/g, '\uD83D\uDD25'],
    // ðŸ† = 🏆 (trophy)
    [/\u00f0\u009f\u008f\u0086/g, '\uD83C\uDFC6'],
    // ðŸ—ï¸ = 🏗️ (building construction)
    [/\u00f0\u009f\u008f\u0097\u00ef\u00b8/g, '\uD83C\uDFD7\uFE0F'],
    // ðŸ›¡ï¸ = 🛡️ (shield)
    [/\u00f0\u009f\u009b\u00a1\u00ef\u00b8/g, '\uD83D\uDEE1\uFE0F'],
    // âï¸ / â„ï¸ = ❄️ (snowflake)
    [/\u00e2\u009d\u0084\u00ef\u00b8/g, '\u2744\uFE0F'],
    // â° = ⏰ (alarm clock)
    [/\u00e2\u008f\u00b0/g, '\u23F0'],
    // â˜… = ★ (star)
    [/\u00e2\u02dc\u2026/g, '\u2605'],
    // â†' = ↑
    [/\u00e2\u0086\u0091/g, '\u2191'],
    // â†" = ↓
    [/\u00e2\u0086\u0093/g, '\u2193'],
    // âœ" = ✓
    [/\u00e2\u009c\u0093/g, '\u2713'],
    // ðŸ" = 🔍 (magnifying glass)
    [/\u00f0\u009f\u0094\u008d/g, '\uD83D\uDD0D'],
  ];
  
  fixes.forEach(([pattern, replacement]) => {
    content = content.replace(pattern, replacement);
  });
  return content;
}

let totalModified = 0;
const files = fs.readdirSync(PUBLIC_DIR).filter(f => f.endsWith('.html'));

files.forEach(filename => {
  const filePath = path.join(PUBLIC_DIR, filename);
  // Read as latin1 to preserve byte values exactly, then work with it
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Fix broken emoji
  const fixed = fixEmojis(content);
  if (fixed !== content) {
    content = fixed;
    changed = true;
  }

  // Fix nav logo: MytechERP → FieldZenPro
  if (content.includes('class="nav-logo">⚡ MytechERP') || content.includes('class="nav-logo">\u26a1 MytechERP')) {
    content = content.replace(/class="nav-logo">[^<]*MytechERP<\/a>/g, 'class="nav-logo">&#9889; FieldZenPro</a>');
    changed = true;
  }

  // Fix "⚡ MytechERP" in nav
  content = content.replace(/⚡ MytechERP/g, '⚡ FieldZenPro');
  
  // Add Key Takeaways to blog posts (after post-meta div, before first h2)
  if (BLOG_PAGES.has(filename) && !content.includes('Key Takeaways')) {
    const takeaways = buildTakeawaysBlock(filename);
    if (takeaways) {
      // Insert after closing post-meta div
      const postMetaEnd = content.indexOf('</div>', content.indexOf('post-meta'));
      if (postMetaEnd !== -1) {
        content = content.slice(0, postMetaEnd + 6) + '\n' + takeaways + content.slice(postMetaEnd + 6);
        changed = true;
      }
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalModified++;
    console.log('Fixed: ' + filename);
  }
});

console.log('\nDone! Modified ' + totalModified + ' files.');
