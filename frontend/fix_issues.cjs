const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const frontendDir = __dirname;

function processFile(fullPath) {
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // 1. Fix double-encoded lightning bolt
    if (content.includes('âš¡')) {
        content = content.replace(/âš¡/g, '⚡');
        modified = true;
    }
    
    // Also handle other common garbled characters if the whole file was mangled by PowerShell
    // â€œ -> “
    // â€ -> ”
    // â€™ -> ’
    // â€” -> —
    // â€“ -> –
    // â€¢ -> •
    // Let's do a comprehensive replace for common windows-1252 to utf-8 mojibake
    const mojibakeMap = {
        'â€œ': '“',
        'â€': '”',
        'â€"': '”', // sometimes " appears
        'â€™': '’',
        'â€”': '—',
        'â€“': '–',
        'â€¢': '•',
        'Â·': '·'
    };
    for (const [bad, good] of Object.entries(mojibakeMap)) {
        if (content.includes(bad)) {
            content = content.split(bad).join(good);
            modified = true;
        }
    }

    // 2. Fix the meta charset order. We want <meta charset="UTF-8" /> to be first in <head>
    // Since we prepended GSC before it, let's swap them.
    const gscTag = '<meta name="google-site-verification" content="tdpdsyArJFNcbSQIYoakUNiyew4_qlX4OFgHm_wy7_4" />\n';
    const charsetTag = '<meta charset="UTF-8" />\n';
    const gscTagNoNewline = '<meta name="google-site-verification" content="tdpdsyArJFNcbSQIYoakUNiyew4_qlX4OFgHm_wy7_4" />';
    const charsetTagNoNewline = '<meta charset="UTF-8" />';

    // If we have GSC then Charset, swap them
    if (content.includes(`${gscTag}${charsetTag}`)) {
        content = content.replace(`${gscTag}${charsetTag}`, `${charsetTag}${gscTag}`);
        modified = true;
    } else if (content.includes(`${gscTagNoNewline}\n${charsetTagNoNewline}`)) {
        content = content.replace(`${gscTagNoNewline}\n${charsetTagNoNewline}`, `${charsetTagNoNewline}\n${gscTagNoNewline}`);
        modified = true;
    }

    // 3. Fix mobile menu CSS for overlap issue
    if (content.includes('.mobile-menu{') && !content.includes('pointer-events:none')) {
        content = content.replace(/\.mobile-menu\{([^}]+)\}/, (match, p1) => {
            return `.mobile-menu{${p1};pointer-events:none;visibility:hidden;}`;
        });
        modified = true;
    }
    if (content.includes('.mobile-menu.open{') && !content.includes('pointer-events:auto')) {
        content = content.replace(/\.mobile-menu\.open\{([^}]+)\}/, (match, p1) => {
            return `.mobile-menu.open{${p1};pointer-events:auto;visibility:visible;}`;
        });
        modified = true;
    }

    // 4. Fix smooth scrolling by changing body overflow-x: hidden to clip
    if (content.includes('overflow-x:hidden')) {
        content = content.replace(/overflow-x:hidden/g, 'overflow-x:clip');
        modified = true;
    }
    if (content.includes('overflow-x: hidden')) {
        content = content.replace(/overflow-x: hidden/g, 'overflow-x: clip');
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Fixed: ${fullPath}`);
    }
}

// Process index.html
const indexHtml = path.join(frontendDir, 'index.html');
if (fs.existsSync(indexHtml)) {
    processFile(indexHtml);
}

// Process all files in public
if (fs.existsSync(publicDir)) {
    const files = fs.readdirSync(publicDir);
    for (const file of files) {
        const fullPath = path.join(publicDir, file);
        if (fs.statSync(fullPath).isFile() && fullPath.endsWith('.html')) {
            processFile(fullPath);
        }
    }
}
