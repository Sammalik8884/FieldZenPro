/**
 * fix-canonicals.js
 * Adds cross-canonical pointing for clear near-duplicate pages.
 * For each cannibalization cluster, the "winner" keeps its own canonical.
 * "Loser" pages get their canonical updated to point to the winner.
 * 
 * IMPORTANT: Only applied to TRUE near-duplicates (same intent, similar keyword)
 * Pages with genuinely distinct angles are left alone.
 */

const fs = require('fs');
const path = require('path');

const pubDir = path.join(__dirname, 'frontend', 'public');
const BASE = 'https://fieldzenpro.com';

// Map: file → canonical URL it should point to
// Only entries where pages are genuinely near-identical in intent
const CANONICAL_MAP = {
  // "Best FSM" cluster → best-field-service-software is strongest
  'best-field-management-software.html':           '/best-field-service-software',
  'best-service-management-software.html':         '/best-field-service-software',
  'top-field-service-management-software.html':    '/best-field-service-software',
  'best-fsm-software.html':                        '/best-field-service-software',
  // NOT changing: best-field-service-management-software (different buyer), best-field-service-app (mobile)

  // "Technician software" near-dups
  'service-tech-software.html':                    '/service-technician-software',

  // "Field management" near-dups (system/platform are too different - leave alone)
  // 'field-management-system.html' → keep (enterprise angle)
  // 'field-service-management-platform.html' → keep (platform angle)

  // "Small business" cluster → small-business-field-service-software is the clearest
  'field-management-software-for-small-business.html':          '/small-business-field-service-software',
  'service-management-software-for-small-business.html':        '/small-business-field-service-software',
  // NOT changing: field-service-software-for-small-business (broad small biz FSM), 
  //              field-service-management-software-for-small-business (management angle)
  //              field-service-software-small-business-not-servicetitan (competitor angle)

  // "HVAC" cluster - keep all except the pure duplicate
  'hvac-business-management-software.html':        '/hvac-software',
  // NOT changing: hvac-field-service-software (field ops), hvac-field-service-management-software (management)

  // Mobile cluster - app and software are distinct enough, management-app is the dup
  'mobile-field-service-management-app.html':      '/mobile-field-service-app',

  // Dispatch cluster - field-technician-dispatch is too similar to field-service-dispatch
  'field-technician-dispatch-software.html':       '/field-service-dispatch-software',
  // NOT changing: field-service-call-dispatch-software (call center angle)
};

let fixed = 0;
for (const [file, canonicalPath] of Object.entries(CANONICAL_MAP)) {
  const filePath = path.join(pubDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skip (not found): ${file}`);
    continue;
  }
  
  let html = fs.readFileSync(filePath, 'utf8');
  const canonicalUrl = `${BASE}${canonicalPath}`;
  
  // Find existing canonical tag
  const existingCanonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i);
  const currentCanonical = existingCanonical ? existingCanonical[1] : '';
  
  if (currentCanonical === canonicalUrl) {
    console.log(`✅ Already correct: ${file}`);
    continue;
  }
  
  // Replace or add canonical
  if (existingCanonical) {
    html = html.replace(
      /<link[^>]+rel=["']canonical["'][^>]*>/i,
      `<link rel="canonical" href="${canonicalUrl}">`
    );
  } else {
    html = html.replace('</head>', `  <link rel="canonical" href="${canonicalUrl}">\n</head>`);
  }
  
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`✅ ${file} → ${canonicalPath}`);
  fixed++;
}

console.log(`\n✅ Updated canonicals: ${fixed} files`);
console.log(`ℹ️  Self-referencing pages (unchanged): ${Object.keys(CANONICAL_MAP).length - fixed}`);
