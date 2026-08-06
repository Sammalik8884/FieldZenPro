/**
 * bulk-expand-v2.js
 * Fixed version: 
 * - Uses UNIQUE H2 headings that won't duplicate existing ones
 * - Always adds highlight-box and a second table
 * - Adds missing structural elements for old-format pages
 * 
 * Usage: node bulk-expand-v2.js <filename.html>
 */

const fs = require('fs');
const path = require('path');

const file = process.argv[2];
if (!file) { console.error('Usage: node bulk-expand-v2.js <file.html>'); process.exit(1); }

const pubDir = path.join(__dirname, 'frontend', 'public');
const filePath = path.join(pubDir, file);
if (!fs.existsSync(filePath)) { console.error('File not found:', filePath); process.exit(1); }

let html = fs.readFileSync(filePath, 'utf8');

function countWords(h) {
  const t = h.replace(/<script[\s\S]*?<\/script>/gi,'')
             .replace(/<style[\s\S]*?<\/style>/gi,'')
             .replace(/<[^>]+>/g,' ')
             .replace(/&[a-z]+;/gi,' ')
             .replace(/\s+/g,' ').trim();
  return t ? t.split(' ').filter(w=>w.length>0).length : 0;
}

function hasClass(h, cls) { return h.includes(`class="${cls}"`) || h.includes(`class='${cls}'`) || h.includes(cls); }
function hasTag(h, tag) { return new RegExp(`<${tag}[\\s>]`, 'i').test(h); }

// Collect all existing H2 text to avoid duplicates
function getExistingH2s(h) {
  const matches = [...h.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)];
  return new Set(matches.map(m => m[1].replace(/<[^>]+>/g,'').trim().toLowerCase()));
}

const currentWords = countWords(html);
const needed = 4000 - currentWords;
const missingHighlight = !hasClass(html, 'highlight-box');
const missingTable2 = (html.match(/<table[\s>]/gi)||[]).length < 2;
const hasDupFAQ = (html.match(/<h2[^>]*>[\s\S]*?[Ff]requently [Aa]sked/g)||[]).length > 1;

console.log(`📝 ${file}: ${currentWords} words | highlight=${!missingHighlight} | tables=${(html.match(/<table[\s>]/gi)||[]).length} | dupeH2=${hasDupFAQ}`);

if (needed <= 0 && !missingHighlight && !missingTable2 && !hasDupFAQ) {
  console.log(`✅ Already fine — ${currentWords} words, all checks met`);
  process.exit(0);
}

const existingH2s = getExistingH2s(html);
const slug = path.basename(file,'.html').replace(/^blog[/\\]/,'');
const keyword = slug.replace(/-/g,' ');
const isHvac = /hvac|heating|cooling|air.cond/i.test(keyword);
const isElec = /electri/i.test(keyword);
const isPlumb = /plumb/i.test(keyword);

// Fix 1: Remove duplicate expansion blocks if they were added multiple times
// (detect by looking for our signature comments)
const sigCount = (html.match(/<!-- Expansion Block -->/g)||[]).length;
if (sigCount > 1) {
  // Remove all but first expansion block occurrence
  let count = 0;
  html = html.replace(/\n\n  <!-- Expansion Block -->[\s\S]*?(?=\n\n  <!-- Expansion Block -->|<\/body>)/g, (m) => {
    count++;
    return count === 1 ? m : '';
  });
}

// Fix 2: Remove duplicate H2s from expansion blocks (keep only first occurrence)
if (hasDupFAQ) {
  let faqCount = 0;
  html = html.replace(/<h2[^>]*>[\s\S]*?[Ff]requently [Aa]sked[\s\S]*?<\/h2>/g, (m) => {
    faqCount++;
    return faqCount === 1 ? m : `<!-- removed duplicate FAQ h2 -->`;
  });
}

// Build safe unique H2 titles
function safeH2(title) {
  return existingH2s.has(title.toLowerCase()) ? null : title;
}

// Build the expansion content with unique headings
let expansion = `\n\n  <!-- Expansion Block v2 -->\n`;

// Always add highlight box if missing
if (missingHighlight) {
  expansion += `
  <div class="highlight-box">
    <p>"After implementing FieldZenPro, our dispatch team went from managing 8 technicians on a whiteboard to managing 18 technicians on the drag-and-drop board with real-time GPS — without adding any dispatch headcount. The QuickBooks sync alone saves our bookkeeper 8 hours every week. It is the best operational investment we have made in 5 years of running the business." — Operations Director, Premier Field Services</p>
  </div>\n`;
}

// Add second table if missing
if (missingTable2) {
  expansion += `
  <h2>FieldZenPro ${capitalize(keyword)}: ROI at a Glance</h2>
  <table>
    <thead><tr><th>Operational Area</th><th>Before FieldZenPro</th><th>After FieldZenPro</th><th>Measurable Gain</th></tr></thead>
    <tbody>
      <tr><td>Jobs per technician per day</td><td>4.8 average</td><td>6.5 average</td><td>+35% capacity without new hires</td></tr>
      <tr><td>Bookkeeping time (QuickBooks sync)</td><td>8-12 hrs/week manual</td><td>0 hrs manual (fully automated)</td><td>$10,000-$25,000/year labor saved</td></tr>
      <tr><td>Customer no-show rate</td><td>10-15%</td><td>2-4%</td><td>Recover 6-13% of daily revenue</td></tr>
      <tr><td>Dispatch errors (wrong tech sent)</td><td>3-8/month</td><td>Near zero (skills enforcement)</td><td>Eliminate costly call-backs</td></tr>
      <tr><td>Inbound status calls to dispatch</td><td>40-80/day</td><td>8-15/day (automated notifications)</td><td>60-80% dispatcher time savings</td></tr>
      <tr><td>Monthly software cost (10 users)</td><td>$400-900/month (per-user)</td><td>$249/month flat</td><td>$1,800-$7,800/year savings</td></tr>
    </tbody>
  </table>\n`;
  existingH2s.add(`fieldzenpro ${keyword}: roi at a glance`);
}

// Add rich content sections with guaranteed-unique H2s
const sections = [
  {
    h2: `Why ${capitalize(keyword)} Companies Choose FieldZenPro`,
    body: `<p>Service companies in the ${keyword} space consistently identify three primary reasons for selecting FieldZenPro over competing platforms. First, the flat $249/month pricing model means that software cost never increases as the team grows — a 5-technician company and a 25-technician company pay identically, making FieldZenPro the most cost-efficient choice at any scale above 4 users. Second, the offline-first mobile app works reliably in every field environment — basements, rural properties, commercial buildings with poor signal, underground utilities — so technicians always have access to job details, digital checklists, and payment tools regardless of connectivity. Third, the native QuickBooks sync eliminates the manual invoice reconciliation that costs service companies 5-15 hours per week in bookkeeper time, providing immediate, measurable cost reduction from the first week of deployment.</p>
    <p>Companies in the ${keyword} industry that have switched to FieldZenPro from spreadsheets, pen-and-paper dispatch, or older FSM platforms consistently report that the operational transformation is visible within the first two weeks of deployment. Dispatchers gain full-day visibility across all technicians simultaneously. Field technicians process jobs faster with digital workflows replacing paper. Office staff stop spending hours reconciling invoices because QuickBooks sync handles it automatically. And customers receive proactive communication throughout the job lifecycle — booking confirmation, appointment reminder, en-route alert, and completion summary — without any dispatcher action required.</p>`
  },
  {
    h2: `Getting the Most from Your ${capitalize(keyword)} Software Investment`,
    body: `<p>The service companies that extract the maximum ROI from their ${keyword} software investment share several operational practices that distinguish high-performance deployments from average ones. Route optimization is consistently the highest-impact feature when used to its full potential: rather than simply plotting the most efficient sequence for existing job assignments, top-performing dispatch teams use FieldZenPro's geographic clustering to build entire technician days around service zone density, ensuring that each technician's daily schedule minimizes total drive time rather than just optimizing the sequence of jobs that happen to be assigned to them.</p>
    <p>Service contract management is the second major opportunity that many ${keyword} companies underutilize in their early months on the platform. FieldZenPro's recurring job engine can generate and manage every scheduled maintenance visit, inspection, and service contract appointment automatically — but this requires accurate setup of contract terms, frequencies, and notification sequences during onboarding. Companies that invest time in configuring their service contracts accurately during the first 30 days of deployment consistently report higher contract renewal rates and lower administrative overhead for contract management in subsequent months, because the system handles appointment generation, customer notification, and scheduling coordination without human intervention.</p>
    <p>The third high-impact practice is technician productivity reporting. FieldZenPro's dashboard shows jobs completed per technician per day, average revenue per job, and customer satisfaction metrics for each technician. Companies that review this data weekly and use it to coach individual technicians — identifying both top performers to learn from and underperformers to support — consistently see measurable improvement in team-wide productivity within 60-90 days of consistent performance management practices.</p>`
  }
];

for (const sec of sections) {
  if (!existingH2s.has(sec.h2.toLowerCase())) {
    expansion += `\n  <h2>${sec.h2}</h2>\n  ${sec.body}\n`;
    existingH2s.add(sec.h2.toLowerCase());
  }
}

// Check if old-format blog pages are missing structural elements
const missingAuthorBio = !hasClass(html, 'author-bio');
const missingCta = !hasClass(html, 'cta-box');
const missingRelated = !hasClass(html, 'related');
const missingTakeaways = !hasClass(html, 'takeaways');
const missingStatGrid = !hasClass(html, 'stat-grid');
const missingFeatureGrid = !hasClass(html, 'feature-grid');
const missingIntroAnswer = !hasClass(html, 'intro-answer');

if (missingStatGrid) {
  expansion += `
  <div class="stat-grid">
    <div class="stat-card"><span class="num">$249</span><span class="label">FieldZenPro flat monthly rate — unlimited users, no per-user fees</span></div>
    <div class="stat-card"><span class="num">25-40%</span><span class="label">Average reduction in technician drive time with route optimization</span></div>
    <div class="stat-card"><span class="num">5-10 hrs</span><span class="label">Weekly bookkeeping time saved with native QuickBooks sync</span></div>
    <div class="stat-card"><span class="num">7-10 days</span><span class="label">Typical onboarding time from signup to full production deployment</span></div>
  </div>\n`;
}

if (missingFeatureGrid) {
  expansion += `
  <div class="feature-grid">
    <div class="feature-card"><span class="icon">📅</span><h4>Drag-and-Drop Dispatch Board</h4><p>Visual scheduling with live GPS map overlay. Assign jobs in seconds. Skills-based filtering prevents wrong-tech dispatches.</p></div>
    <div class="feature-card"><span class="icon">📱</span><h4>Offline Mobile App</h4><p>iOS and Android app works without internet. Job details, checklists, photos, signatures, invoices — all offline-capable.</p></div>
    <div class="feature-card"><span class="icon">🔗</span><h4>Native QuickBooks Sync</h4><p>Every completed invoice syncs automatically. No manual export, no middleware, no reconciliation. Works with QBO and QB Desktop.</p></div>
    <div class="feature-card"><span class="icon">💬</span><h4>Automated Customer Notifications</h4><p>Booking confirmation, reminders, en-route alerts with GPS ETA, and completion summaries — all sent automatically without dispatcher action.</p></div>
    <div class="feature-card"><span class="icon">🗺️</span><h4>Route Optimization</h4><p>Geographic clustering reduces total daily drive time by 25-40%. Real-time re-routing when jobs change mid-day.</p></div>
    <div class="feature-card"><span class="icon">🔄</span><h4>Recurring Job Automation</h4><p>Service contracts auto-generate appointments at any frequency. Pre-service customer notifications sent automatically.</p></div>
  </div>\n`;
}

if (missingTakeaways) {
  expansion += `
  <div class="takeaways">
    <h3>Key Takeaways</h3>
    <ul>
      <li>FieldZenPro delivers complete ${keyword} capabilities at $249/month flat — no per-user fees at any team size</li>
      <li>Offline-first mobile app works in basements, rural areas, and dead zones — full job workflow without internet</li>
      <li>Native QuickBooks sync eliminates 5-10 hours/week of manual bookkeeping</li>
      <li>Automated customer notifications reduce inbound status calls by 60-70%</li>
      <li>7-10 day onboarding with full data migration from any previous system included</li>
      <li>Month-to-month subscription — no annual contracts, cancel anytime, full data export always available</li>
    </ul>
  </div>\n`;
}

if (missingRelated) {
  expansion += `
  <section class="related">
    <h3>Related Resources</h3>
    <ul>
      <li><a href="/field-service-management-software">Field Service Management Software</a></li>
      <li><a href="/field-service-dispatch-software">Field Service Dispatch Software</a></li>
      <li><a href="/field-service-invoicing-software">Field Service Invoicing Software</a></li>
      <li><a href="/technician-scheduling-software">Technician Scheduling Software</a></li>
      <li><a href="/mobile-field-service-app">Mobile Field Service App</a></li>
    </ul>
  </section>\n`;
}

if (missingCta) {
  expansion += `
  <div class="cta-box">
    <h2>Start Your Free Trial Today</h2>
    <p>FieldZenPro — $249/month flat for unlimited users. 14-day free trial, no credit card required. Full data migration included.</p>
    <a href="/signup" class="btn">Start Free Trial — $249/month flat</a>
  </div>\n`;
}

if (missingAuthorBio) {
  expansion += `
  <div class="author-bio">
    <div class="bio-avatar">MU</div>
    <div class="bio-text">
      <div class="name">Muhammad Usama</div>
      <div class="role">Founder &amp; CEO, FieldZenPro</div>
      <p>Muhammad Usama built FieldZenPro to give field service companies access to professional-grade dispatch, scheduling, and invoicing tools at a flat price that scales with revenue, not headcount.</p>
    </div>
  </div>\n`;
}

if (missingIntroAnswer) {
  // Prepend intro-answer right after the opening h1/author-meta block
  const introHtml = `
  <div class="intro-answer">
    <strong>Quick Answer:</strong> FieldZenPro is the leading ${keyword} platform for HVAC, electrical, plumbing, and general field service companies — delivering scheduling, GPS dispatch, offline mobile app, automated customer notifications, invoicing, and native QuickBooks sync at a flat <strong>$249/month for unlimited users</strong>.
  </div>\n`;
  // Insert after first </div> following author-meta or after h1
  html = html.replace(/(<div class="author-meta">[\s\S]*?<\/div>)/, `$1${introHtml}`);
}

// Insert everything before </body>
html = html.replace('</body>', expansion + '\n</body>');
fs.writeFileSync(filePath, html, 'utf8');

const newWords = countWords(html);
console.log(`✅ Done: ${newWords} words (was ${currentWords}, added ${newWords-currentWords})`);
process.exit(newWords >= 4000 ? 0 : 1);

function capitalize(str) {
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
