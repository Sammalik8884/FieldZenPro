// Fix duplicate H2 sections: removes the SECOND occurrence of duplicate H2 blocks
const fs = require('fs');
const path = require('path');

const dir = path.join('frontend', 'public');
const filesToFix = [
  'best-field-service-app.html',
  'enterprise-field-service-management-software.html',
  'field-management-app.html',
  'field-service-applications.html',
  'field-service-erp-software.html',
  'field-service-inventory-management.html',
  'field-service-management-app.html',
  'field-service-routing-software.html',
  'field-service-tracking-software.html',
  'field-technician-management-software.html',
  'field-technician-software.html',
  'service-tech-software.html',
  'service-technician-software.html'
];

let fixed = 0;
filesToFix.forEach(file => {
  const filePath = path.join(dir, file);
  let html = fs.readFileSync(filePath, 'utf8');
  const original = html;

  // Find all H2 tags and their positions
  const h2Regex = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  const seen = new Set();
  const duplicateH2s = new Set();
  let match;
  while ((match = h2Regex.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, '').trim().toLowerCase();
    if (seen.has(text)) duplicateH2s.add(text);
    else seen.add(text);
  }

  if (duplicateH2s.size === 0) {
    console.log(`SKIP (no dupes): ${file}`);
    return;
  }

  // For each duplicate H2, remove the SECOND occurrence along with its section content
  // Strategy: find the second occurrence of the h2 and remove from it until the next h2 or end of section
  duplicateH2s.forEach(dupText => {
    // Match the h2 opening tag (any attributes), content matching dupText, closing tag
    const escapedText = dupText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Find all matches of this h2 (case insensitive)
    const pattern = new RegExp(`<h2[^>]*>[^<]*${escapedText}[^<]*<\\/h2>`, 'gi');
    const allMatches = [];
    let m;
    while ((m = pattern.exec(html)) !== null) {
      allMatches.push({ index: m.index, length: m[0].length, full: m[0] });
    }

    // If 2+ matches, remove from the 2nd match onwards until the next h2 or end of article
    if (allMatches.length >= 2) {
      // Work backwards to avoid index shifting
      for (let i = allMatches.length - 1; i >= 1; i--) {
        const startIdx = allMatches[i].index;
        // Find the next h2 after this position
        const nextH2Match = /<h2[^>]*>/i.exec(html.slice(startIdx + allMatches[i].length));
        let endIdx;
        if (nextH2Match) {
          endIdx = startIdx + allMatches[i].length + nextH2Match.index;
        } else {
          // Remove until CTA/footer/end of main content
          const ctaMatch = /<div[^>]*class="cta|<footer|<\/article/i.exec(html.slice(startIdx));
          if (ctaMatch) {
            endIdx = startIdx + ctaMatch.index;
          } else {
            endIdx = startIdx + allMatches[i].length;
          }
        }
        html = html.slice(0, startIdx) + html.slice(endIdx);
      }
    }
  });

  if (html !== original) {
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`✅ FIXED: ${file}`);
    fixed++;
  } else {
    console.log(`⚠️  No change made: ${file}`);
  }
});

console.log(`\nTotal files fixed: ${fixed}`);
