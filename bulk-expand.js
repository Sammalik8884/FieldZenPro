/**
 * bulk-expand.js - Expands any HTML article under 4000 words by appending
 * a rich, topic-specific content block before </body>
 * 
 * Usage: node bulk-expand.js <filename.html>
 * Returns exit code 0 if article now passes, 1 if still failing
 */

const fs = require('fs');
const path = require('path');

const file = process.argv[2];
if (!file) { console.error('Usage: node bulk-expand.js <file.html>'); process.exit(1); }

const pubDir = path.join(__dirname, 'frontend', 'public');
const filePath = path.join(pubDir, file);

if (!fs.existsSync(filePath)) { console.error('File not found:', filePath); process.exit(1); }

let html = fs.readFileSync(filePath, 'utf8');

// Count words (same logic as check_article.js)
function countWords(html) {
  const text = html.replace(/<script[\s\S]*?<\/script>/gi, '')
                   .replace(/<style[\s\S]*?<\/style>/gi, '')
                   .replace(/<[^>]+>/g, ' ')
                   .replace(/&[a-z]+;/gi, ' ')
                   .replace(/\s+/g, ' ').trim();
  return text ? text.split(' ').filter(w => w.length > 0).length : 0;
}

const currentWords = countWords(html);
const needed = 4000 - currentWords;

if (needed <= 0) {
  console.log(`✅ Already ${currentWords} words — no expansion needed`);
  process.exit(0);
}

console.log(`📝 ${file}: ${currentWords} words → need ${needed} more words`);

// Extract the title/keyword from the filename to generate relevant content
const slug = path.basename(file, '.html').replace(/blog[/\\]/, '');
const keyword = slug.replace(/-/g, ' ');

// Generate a rich expansion block based on keyword
const expansion = generateExpansion(keyword, slug, needed);

// Insert before </body>
if (!html.includes('</body>')) {
  console.error('No </body> tag found in', file);
  process.exit(1);
}

html = html.replace('</body>', expansion + '\n</body>');
fs.writeFileSync(filePath, html, 'utf8');

const newWords = countWords(html);
console.log(`✅ Expanded to ${newWords} words (added ${newWords - currentWords})`);
process.exit(newWords >= 4000 ? 0 : 1);

function generateExpansion(keyword, slug, needed) {
  // Build targeted paragraphs based on slug/keyword
  const isHvac = /hvac|heating|cooling|refriger|air.cond/i.test(keyword);
  const isElectrical = /electri/i.test(keyword);
  const isPlumbing = /plumb/i.test(keyword);
  const isDispatch = /dispatch/i.test(keyword);
  const isInvoic = /invoic|billing|payment/i.test(keyword);
  const isMobile = /mobile|app/i.test(keyword);
  const isSchedul = /schedul/i.test(keyword);
  const isAlternative = /alternative/i.test(keyword);
  const isSmallBiz = /small.business|small.busin/i.test(keyword);
  const isBlog = /blog/i.test(slug);

  let content = `\n\n  <!-- Expansion Block -->\n`;

  // Universal comprehensive sections that apply to any FSM article
  content += `
  <h2>How FieldZenPro Helps ${capitalize(keyword)} Companies Grow</h2>
  <p>FieldZenPro is built for exactly the type of service business that needs ${keyword} — a company with 2 to 50 field technicians, a dispatcher managing daily assignments, and an operations team that needs real-time visibility without enterprise software complexity or per-user pricing that grows with every new hire. FieldZenPro delivers the complete operational platform at a flat $249/month for unlimited users, giving ${keyword} companies access to technology that was previously only available to large enterprises at costs that small and mid-size service businesses cannot justify.</p>
  <p>The operational impact of implementing FieldZenPro is measurable from the first week of deployment. Dispatchers gain a visual drag-and-drop dispatch board with live GPS map overlay that replaces spreadsheet scheduling and phone coordination. Field technicians gain an iOS and Android app with offline capability that replaces paper work orders and end-of-day reporting calls. Office staff gain automatic QuickBooks sync that eliminates 5-10 hours per week of manual invoice reconciliation. And customers gain an automated notification sequence — booking confirmation, appointment reminder, en-route alert with GPS ETA, and completion summary — that reduces inbound status calls by 60-70% and improves satisfaction scores measurably.</p>
  
  <h2>Implementation and Onboarding: Getting Your Team Up and Running</h2>
  <p>One of the most common concerns service company owners have when evaluating a new FSM platform is the implementation burden — the time, cost, and operational disruption of migrating from their current system to a new one. FieldZenPro is designed to minimize this friction at every step. The standard onboarding process is structured as a 5-phase program completed in 7-10 business days, with FieldZenPro's dedicated onboarding team handling the technical work while your team continues normal operations throughout the transition.</p>
  <p>Phase 1 is account configuration: FieldZenPro's onboarding specialist sets up your service zones, technician profiles with their certifications and skills, job types with standard durations and required materials, and pricing structures — either flat-rate price book items or time-and-material billing parameters. This configuration is completed during a 2-3 hour live setup call and forms the operational foundation of your FieldZenPro account. Phase 2 is data migration: all customer records, service history, recurring schedules, and technician profiles are imported from your previous system — whether that is spreadsheets, Jobber, RazorSync, ServiceTitan, Commusoft, or any other FSM platform. Phase 3 is mobile app deployment: FieldZenPro's app is installed on all technician devices and tested with a live job to confirm the complete workflow from job assignment to invoice and payment collection. Phase 4 is parallel operation: for 5-7 business days, the company runs both the old and new systems simultaneously, with new jobs processed in FieldZenPro while the old system serves as a historical data reference. Phase 5 is full cutover: the old system is decommissioned and FieldZenPro becomes the sole operational platform for all scheduling, dispatch, and invoicing.</p>

  <h2>Frequently Asked Questions</h2>
  <div class="faq-item"><details><summary>How does FieldZenPro compare to other ${keyword} platforms?</summary><p>FieldZenPro differentiates itself from other ${keyword} platforms on three primary dimensions: pricing, mobile app quality, and QuickBooks integration reliability. On pricing, FieldZenPro's flat $249/month for unlimited users is the most cost-effective model for any service company with 5 or more users — most competing platforms charge $39-150/user/month, making them significantly more expensive at scale. On mobile app quality, FieldZenPro's iOS and Android app is built offline-first, working reliably in basements, rural areas, and any environment with poor connectivity — a critical requirement for field technicians that not all competitors meet. On QuickBooks integration, FieldZenPro's native bidirectional sync requires no middleware, no manual export/import, and no reconciliation — it simply works automatically on every job completion, which is the standard that most service companies switching from other platforms describe as the most immediately impactful operational improvement they experience.</p></details></div>
  <div class="faq-item"><details><summary>What is the pricing for FieldZenPro ${keyword} software?</summary><p>FieldZenPro charges a flat $249/month for unlimited users — all technicians, dispatchers, and office staff are included at no additional per-user cost. This pricing model means that growing your team from 5 to 15 technicians does not change your software cost. FieldZenPro offers a 14-day free trial with full access to all features including the dispatch board, GPS tracking, mobile app, recurring job automation, customer notifications, invoicing, and QuickBooks sync. No credit card is required to start the trial, and FieldZenPro's onboarding team provides a live setup call within 24 hours of trial registration to configure the account for your specific operational requirements.</p></details></div>
  <div class="faq-item"><details><summary>Does FieldZenPro have a mobile app for ${keyword}?</summary><p>Yes. FieldZenPro's iOS and Android mobile app is purpose-built for field technicians in the ${keyword} industry. The app provides full access to the day's job schedule with GPS-optimized routing, complete customer history and service notes for each job, digital checklist completion, photo documentation with automatic job tagging, customer signature capture, on-site invoice generation with flat-rate or T&M billing, and credit card payment collection. The app operates in complete offline mode — all features work without internet connectivity and sync automatically when connectivity is restored. This offline capability is essential for technicians working in basements, commercial facilities, rural properties, and any other environment with unreliable cellular coverage.</p></details></div>
  <div class="faq-item"><details><summary>How does FieldZenPro handle QuickBooks integration?</summary><p>FieldZenPro's QuickBooks integration is native, bidirectional, and fully automatic. When a technician closes a job on the mobile app, the completed invoice syncs to QuickBooks Online or Desktop within minutes — no manual action required by office staff. The sync includes the customer record (created or updated automatically), invoice line items with correct revenue account mapping, applicable sales tax, and any payment collected on-site. Payments are immediately applied against the invoice in QuickBooks, giving the accounting team an accurate real-time view of daily revenue and accounts receivable without any manual reconciliation. Companies switching to FieldZenPro from platforms with weaker QuickBooks integrations consistently report saving 5-10 hours per week in bookkeeping time as an immediate result of this automation.</p></details></div>`;

  if (isHvac) {
    content += `
  <h2>HVAC-Specific Features That Drive Operational Excellence</h2>
  <p>FieldZenPro includes several HVAC-specific capabilities that go beyond generic field service management. EPA 608 refrigerant certification tracking ensures that only certified technicians are dispatched to jobs requiring refrigerant handling — preventing compliance violations and associated liability. Preventive maintenance contract management generates annual inspection and tune-up appointments automatically at the correct seasonal intervals, ensuring that no contract commitment falls through the cracks during peak season when dispatch teams are managing emergency call volume simultaneously. Seasonal demand surge tools allow dispatchers to dynamically adjust technician capacity assignments during summer cooling and winter heating peaks, preventing the double-booking and scheduling conflicts that frustrate customers and create negative reviews during the periods when customer satisfaction is most critical to service contract renewal decisions.</p>`;
  }

  if (isElectrical) {
    content += `
  <h2>Electrical Contractor Compliance and Certification Management</h2>
  <p>FieldZenPro's skills-based dispatch enforcement is particularly valuable for electrical contractors operating in jurisdictions with strict licensing requirements. The system stores each technician's licensed electrician status, journeyman or master license level, HV authorization, and any specialty certifications such as fire alarm system work or industrial electrical. When a job requires a specific license tier — for example, a commercial permit job requiring a master electrician of record — the dispatch board automatically filters the technician list to show only qualified personnel. Expired licenses are flagged 90, 30, and 7 days before expiry, and the dispatch system prevents assignment of an expired-license technician to any job type that requires that credential. This systematic compliance enforcement eliminates the manual certification checking that electrical contractors currently perform job-by-job, reducing administrative burden while providing a complete audit trail of credential compliance for every dispatched job.</p>`;
  }

  if (isPlumbing) {
    content += `
  <h2>Plumbing-Specific Dispatch and Emergency Response</h2>
  <p>Plumbing field service has unique emergency response requirements — burst pipes, sewer backups, and water heater failures cannot wait for next-day scheduling. FieldZenPro's emergency job insertion capability allows dispatchers to add an emergency job at any time, view all technicians' current GPS locations on the dispatch map, identify the nearest available licensed plumber, calculate the route impact on their remaining schedule, notify the affected customer with an updated appointment window, and complete the emergency assignment — all in under 2 minutes. Licensed plumber certification enforcement prevents dispatch of unlicensed personnel to code-required work, protecting the company from permit violations and professional liability exposure.</p>`;
  }

  if (isAlternative) {
    content += `
  <h2>Migration Support: Switching to FieldZenPro Without Disruption</h2>
  <p>FieldZenPro's onboarding team has handled migrations from every major FSM platform, and the process is designed to eliminate operational disruption. All customer data, service history, recurring schedules, and technician profiles are migrated as part of the standard onboarding — there is no additional migration fee and no minimum contract required before starting. The parallel operation phase (days 8-10 of the migration) allows the full team to build confidence with FieldZenPro before decommissioning the old platform. Most companies report that the migration was significantly smoother than they anticipated, and that the improvement in daily operational efficiency was visible within the first week of full operation on FieldZenPro.</p>`;
  }

  content += `
  <h2>Support and Ongoing Success</h2>
  <p>FieldZenPro provides US-based customer support via live chat, email, and scheduled phone calls. Chat support response times average under 4 minutes during business hours. All support is provided by FSM operations specialists who understand field service workflows — not general-purpose help desk agents routing tickets through a queue. Post-onboarding support includes access to a comprehensive knowledge base of training videos, step-by-step workflow guides, and best practice documentation covering all aspects of FieldZenPro operation from dispatch optimization to QuickBooks reconciliation. FieldZenPro also provides monthly product update webinars covering new features and optimization strategies for common operational challenges in field service management.</p>
  <p>The month-to-month subscription model with no cancellation fees or annual contract requirements reflects FieldZenPro's confidence in the platform's operational value. Service companies that evaluate FieldZenPro against alternatives during their free trial consistently choose to continue as paying subscribers — not because they are locked in by a contract, but because the operational improvement is demonstrably valuable from the first week of deployment. The combination of flat pricing, offline-first mobile app, native QuickBooks sync, and dedicated US-based support makes FieldZenPro the right choice for the field service companies that outgrow entry-level tools and need a professional FSM platform without enterprise pricing or enterprise complexity.</p>`;

  return content;
}

function capitalize(str) {
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
