/**
 * FieldZenPro — SEO Fix Pass 4
 * Uses exact Unicode codepoint sequences to fix mojibake
 * The broken emojis appear as sequences of Latin/punctuation Unicode chars
 */

const fs = require('fs');
const path = require('path');
const PUBLIC_DIR = path.join(__dirname, 'frontend', 'public');

// Map of broken Unicode sequences → correct emoji
// Broken sequences use chars like U+00F0 (ð), U+0178 (Ÿ), U+2018 ('), U+201C ("), U+2026 (…) etc.
// These are Windows-1252/Latin1 bytes misinterpreted as Unicode
const EMOJI_MAP = [
  // ðŸ'° = 💰 (money bag) — U+00F0 U+0178 U+2019 U+00B0
  ['\u00f0\u0178\u2019\u00b0', '💰'],
  // ðŸ"… = 📅 (calendar) — U+00F0 U+0178 U+201C U+2026
  ['\u00f0\u0178\u201c\u2026', '📅'],
  // ðŸ"‹ = 📋 (clipboard) — U+00F0 U+0178 U+201C U+2039
  ['\u00f0\u0178\u201c\u2039', '📋'],
  // ðŸ" = 🔍 (magnifying glass) — U+00F0 U+0178 U+201C U+2039 (same? check)
  ['\u00f0\u0178\u201d\u0160', '🔧'],
  // ðŸ"§ = 🔧 (wrench)
  ['\u00f0\u0178\u201d\u00a7', '🔧'],
  // ðŸ"¦ = 📦 (package) — U+00F0 U+0178 U+201C U+00A6
  ['\u00f0\u0178\u201c\u00a6', '📦'],
  // ðŸ"„ = 📄 (document)
  ['\u00f0\u0178\u201c\u201e', '📄'],
  // ðŸ'¸ = 💸 (money wings)
  ['\u00f0\u0178\u2019\u00b8', '💸'],
  // ðŸ'» = 👻 (ghost)
  ['\u00f0\u0178\u2018\u00bb', '👻'],
  // ðŸ¤· = 🤷 (shrug)
  ['\u00f0\u0178\u00a4\u00b7', '🤷'],
  // ðŸ"¸ = 📸 (camera with flash)
  ['\u00f0\u0178\u201d\u00b8', '📸'],
  // ðŸ§¾ = 🧾 (receipt)
  ['\u00f0\u0178\u00a7\u00be', '🧾'],
  // ðŸ'³ = 💳 (credit card)
  ['\u00f0\u0178\u2019\u00b3', '💳'],
  // ðŸ'¥ = 👥 (people/group)
  ['\u00f0\u0178\u2018\u00a5', '👥'],
  // ðŸ"Š = 📊 (bar chart)
  ['\u00f0\u0178\u201c\u008a', '📊'],
  ['\u00f0\u0178\u201c\u2022', '📊'],
  // ðŸ¢ = 🏢 (office building)
  ['\u00f0\u0178\u008f\u00a2', '🏢'],
  // ðŸ"¥ = 🔥 (fire)
  ['\u00f0\u0178\u201d\u00a5', '🔥'],
  ['\u00f0\u0178\u201c\u00a5', '🔥'],
  // ðŸ† = 🏆 (trophy)
  ['\u00f0\u0178\u008f\u0086', '🏆'],
  // ðŸ—ï¸ = 🏗️ (construction)
  ['\u00f0\u0178\u008f\u2014\u00ef\u00b8\u008f', '🏗️'],
  ['\u00f0\u0178\u008f\u2014', '🏗️'],
  // ðŸ›¡ï¸ = 🛡️ (shield)
  ['\u00f0\u0178\u009b\u00a1\u00ef\u00b8\u008f', '🛡️'],
  ['\u00f0\u0178\u009b\u00a1', '🛡️'],
  // ðŸ'¡ = 💡 (lightbulb)
  ['\u00f0\u0178\u2019\u00a1', '💡'],
  // ðŸŽ¯ = 🎯 (target)
  ['\u00f0\u0178\u008e\u00af', '🎯'],
  // ðŸš€ = 🚀 (rocket)
  ['\u00f0\u0178\u009a\u0080', '🚀'],
  // ðŸŒ = 🌐 (globe)
  ['\u00f0\u0178\u008c\u0090', '🌐'],
  // ðŸ¤ = 🤝 (handshake)
  ['\u00f0\u0178\u00a4\u009d', '🤝'],
  // ðŸ'‰ = 👉 (pointing right)
  ['\u00f0\u0178\u2018\u0089', '👉'],
  // ðŸ' = 👍 (thumbs up)
  ['\u00f0\u0178\u2018\u008d', '👍'],
  // ðŸ­ = 🏭 (factory)
  ['\u00f0\u0178\u00af\u00ad', '🏭'],
  // ðŸ  = 🏠 (house)
  ['\u00f0\u0178\u00a0', '🏠'],
  // ðŸŒŸ = 🌟 (glowing star)
  ['\u00f0\u0178\u008c\u009f', '🌟'],
  // ðŸ"' = 🔑 (key)
  ['\u00f0\u0178\u201d\u2018', '🔑'],
  ['\u00f0\u0178\u201c\u0091', '🔑'],
  // â˜… = ★ (star) — U+00E2 U+02DC U+2026
  ['\u00e2\u02dc\u2026', '★'],
  ['\u00e2\u02dc\u00a5', '★'],
  // â±ï¸ = ⏱️ (timer) — various forms
  ['\u00e2\u00b1\u00ef\u00b8', '⏱️'],
  ['\u00e2\u00b1\u00ef', '⏱️'],
  // âœï¸ = ✍️ (writing hand)
  ['\u00e2\u009c\u008d\u00ef\u00b8', '✍️'],
  ['\u00e2\u009c\u008d', '✍️'],
  // âŒ = ❌ (X)
  ['\u00e2\u0152', '❌'],
  // â„ï¸ = ❄️ (snowflake)
  ['\u00e2\u009d\u0084\u00ef\u00b8', '❄️'],
  // â° = ⏰ (alarm clock)
  ['\u00e2\u008f\u00b0', '⏰'],
];

let totalModified = 0;
const files = fs.readdirSync(PUBLIC_DIR).filter(f => f.endsWith('.html'));

files.forEach(filename => {
  const filePath = path.join(PUBLIC_DIR, filename);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  EMOJI_MAP.forEach(([broken, fixed]) => {
    if (content.includes(broken)) {
      content = content.split(broken).join(fixed);
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalModified++;
    process.stdout.write('.');
  }
});

console.log('\nDone! Fixed emoji in ' + totalModified + ' files.');
