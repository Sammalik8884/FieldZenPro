const fs = require('fs');
['public/fieldedge-alternative.html', 'dist/fieldedge-alternative.html'].forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const regex = /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    try {
      JSON.parse(match[1].trim());
    } catch (e) {
      console.log('Error in', file, ':', e.message);
      // find the position if e.message has "at position N"
      const posMatch = e.message.match(/at position (\d+)/);
      if (posMatch) {
        const pos = parseInt(posMatch[1]);
        console.log('Context:', match[1].substring(Math.max(0, pos - 20), pos + 20));
      }
    }
  }
});
