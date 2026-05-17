const fs = require('fs');
const path = require('path');

const gaTag = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-H54SMK14ZK"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-H54SMK14ZK');
</script>
`;

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (stat.isFile() && fullPath.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (!content.includes('G-H54SMK14ZK')) {
                // Find </head> and insert the tag right before it
                content = content.replace(/<\/head>/i, `${gaTag}</head>`);
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath}`);
            } else {
                console.log(`Skipped (already has GA tag): ${fullPath}`);
            }
        }
    }
}

const frontendDir = __dirname;
const publicDir = path.join(frontendDir, 'public');

// Process index.html in frontend
const indexHtml = path.join(frontendDir, 'index.html');
if (fs.existsSync(indexHtml)) {
    let content = fs.readFileSync(indexHtml, 'utf8');
    if (!content.includes('G-H54SMK14ZK')) {
        content = content.replace(/<\/head>/i, `${gaTag}</head>`);
        fs.writeFileSync(indexHtml, content, 'utf8');
        console.log(`Updated: ${indexHtml}`);
    } else {
        console.log(`Skipped (already has GA tag): ${indexHtml}`);
    }
}

// Process all files in public
if (fs.existsSync(publicDir)) {
    processDirectory(publicDir);
}
