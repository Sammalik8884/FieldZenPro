const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const domain = 'https://fieldzenpro.com';

let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${domain}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`;

function addUrl(urlPath, priority = '0.8') {
    sitemap += `  <url>
    <loc>${domain}${urlPath}</loc>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>\n`;
}

if (fs.existsSync(publicDir)) {
    const files = fs.readdirSync(publicDir);
    for (const file of files) {
        if (file.endsWith('.html')) {
            // Exclude index if it exists in public (usually it's in frontend root)
            if (file === 'index.html') continue;
            
            // Try to map to clean URLs.
            // Based on vercel.json, some are mapped exactly. Let's just use the file name without .html.
            const urlPath = `/${file.replace('.html', '')}`;
            
            // Set priority
            let priority = '0.8';
            if (['landing', 'about', 'pricing'].includes(urlPath.substring(1))) {
                priority = '0.9';
            }
            
            addUrl(urlPath, priority);
        }
    }
}

sitemap += `</urlset>\n`;

const outputPath = path.join(publicDir, 'sitemap.xml');
fs.writeFileSync(outputPath, sitemap, 'utf8');

console.log(`Sitemap generated successfully at ${outputPath}`);
