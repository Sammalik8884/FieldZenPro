const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'frontend', 'public');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
const today = '2026-06-24';

const urls = files.map(f => {
  const slug = f === 'landing.html' ? '' : f.replace('.html', '');
  const url = slug ? `https://fieldzenpro.com/${slug}` : 'https://fieldzenpro.com/';
  const priority = slug === '' ? '1.0' : '0.8';
  return `  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
}).join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

fs.writeFileSync(path.join(dir, 'sitemap.xml'), sitemap);
console.log('Sitemap updated with', files.length, 'URLs');
console.log('Sample:', urls.split('\n').slice(0, 8).join('\n'));
