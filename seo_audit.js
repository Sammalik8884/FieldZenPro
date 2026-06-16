const fs=require('fs'),path=require('path');
const DIR=path.join(__dirname,'frontend','public');
const DOMAIN='https://fieldzenpro.com';
const files=fs.readdirSync(DIR).filter(function(f){return f.endsWith('.html');});
const SKIP=new Set(['landing.html','privacy.html','terms.html','gdpr.html','security.html','changelog.html','roadmap.html','careers.html','about.html']);

var issues=[];
var titles={};var descs={};var h1s={};
var totalPages=0;

files.forEach(function(f){
  if(SKIP.has(f)) return;
  totalPages++;
  var slug=f.replace('.html','');
  var c=fs.readFileSync(path.join(DIR,f),'utf8');

  // Title
  var titleM=c.match(/<title>([\s\S]*?)<\/title>/i);
  var title=titleM?titleM[1].trim():'MISSING';
  if(title==='MISSING') issues.push('CRITICAL: No title tag: '+f);
  else if(title.length>75) issues.push('WARN: Title too long ('+title.length+'chars): '+f);
  else if(title.length<25) issues.push('WARN: Title too short ('+title.length+'chars): '+f);
  if(titles[title]) issues.push('CRITICAL: Duplicate title with '+titles[title]+' | '+f);
  else titles[title]=f;

  // Meta description
  var descM=c.match(/<meta name="description" content="([\s\S]*?)"/i);
  var desc=descM?descM[1].trim():'MISSING';
  if(desc==='MISSING') issues.push('CRITICAL: No meta description: '+f);
  else if(desc.length>165) issues.push('WARN: Meta desc too long ('+desc.length+'): '+f);
  else if(desc.length<60) issues.push('WARN: Meta desc too short ('+desc.length+'): '+f);
  if(descs[desc]) issues.push('CRITICAL: Duplicate meta desc | '+descs[desc]+' | '+f);
  else descs[desc]=f;

  // H1 count and content
  var h1M=c.match(/<h1>([\s\S]*?)<\/h1>/i);
  var h1=h1M?h1M[1].trim():'MISSING';
  if(h1==='MISSING') issues.push('CRITICAL: No H1: '+f);
  var h1Count=(c.match(/<h1/gi)||[]).length;
  if(h1Count>1) issues.push('CRITICAL: Multiple H1s ('+h1Count+'): '+f);
  if(h1s[h1]) issues.push('CRITICAL: Duplicate H1 with '+h1s[h1]+' | '+f);
  else h1s[h1]=f;

  // Canonical URL
  var canM=c.match(/<link rel="canonical" href="([^"]+)"/i);
  if(!canM) issues.push('CRITICAL: No canonical tag: '+f);
  else{
    var expected=DOMAIN+'/'+slug;
    if(canM[1]!==expected) issues.push('CRITICAL: Wrong canonical ('+canM[1]+') should be ('+expected+'): '+f);
  }

  // Schema
  if(!c.includes('FAQPage')) issues.push('WARN: No FAQPage schema: '+f);
  if(!c.includes('application/ld+json')) issues.push('CRITICAL: No JSON-LD schema: '+f);
  if(!c.includes('SoftwareApplication')) issues.push('WARN: No SoftwareApplication schema: '+f);
  if(!c.includes('BreadcrumbList')) issues.push('WARN: No BreadcrumbList schema: '+f);

  // Open Graph / Social
  if(!c.includes('og:title')) issues.push('WARN: No og:title: '+f);
  if(!c.includes('og:description')) issues.push('WARN: No og:description: '+f);
  if(!c.includes('og:image')) issues.push('WARN: No og:image: '+f);
  if(!c.includes('twitter:card')) issues.push('WARN: No twitter:card: '+f);

  // Analytics
  if(!c.includes('G-H54SMK14ZK')) issues.push('WARN: No GA4 tag: '+f);

  // SEO basics
  if(!c.includes('index, follow')) issues.push('CRITICAL: Missing robots index,follow: '+f);
  if(!c.includes('viewport')) issues.push('WARN: No viewport meta: '+f);
  if(!c.includes('fonts.googleapis.com')) issues.push('WARN: No Google Fonts loaded: '+f);
  if(!c.includes('href="/')) issues.push('WARN: No internal links: '+f);
  if(!c.includes('/signup')) issues.push('WARN: No trial/signup CTA: '+f);

  // Content quality
  var wc=c.replace(/<[^>]*>/g,'').replace(/\s+/g,' ').split(' ').filter(function(w){return w.length>2;}).length;
  if(wc<2000) issues.push('CRITICAL: Too few words ('+wc+'): '+f);
  else if(wc<2400) issues.push('WARN: Below 2400 words ('+wc+'): '+f);

  // GEO signals
  if(!c.includes('Quick Answer')) issues.push('WARN: No GEO direct answer block: '+f);
  if(!c.includes('Key Takeaways')) issues.push('WARN: No Key Takeaways: '+f);
  if(!c.includes('stat-grid')) issues.push('WARN: No stats grid: '+f);
  if(!c.includes('author-bio')) issues.push('WARN: No author bio (E-E-A-T): '+f);
  if(!c.includes('faq-section')) issues.push('WARN: No FAQ section: '+f);

  // Broken JSON-LD (basic check)
  var scripts=c.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)||[];
  scripts.forEach(function(s,i){
    var json=s.replace(/<script type="application\/ld\+json">/i,'').replace(/<\/script>/i,'').trim();
    try{ JSON.parse(json); }
    catch(e){ issues.push('CRITICAL: Invalid JSON-LD schema #'+(i+1)+' on: '+f+' ERR:'+e.message.substring(0,60)); }
  });

  // img alt (basic)
  var imgs=c.match(/<img[^>]+>/gi)||[];
  imgs.forEach(function(img){
    if(!img.includes('alt=')) issues.push('WARN: img missing alt attribute in '+f);
  });
});

// Sitemap check
var smPath=path.join(DIR,'sitemap.xml');
if(!fs.existsSync(smPath)){
  issues.push('CRITICAL: sitemap.xml MISSING');
} else {
  var sm=fs.readFileSync(smPath,'utf8');
  var smUrls=(sm.match(/<loc>/g)||[]).length;
  console.log('Sitemap: '+smUrls+' URLs found');
  if(smUrls < 70) issues.push('WARN: Sitemap may be incomplete - only '+smUrls+' URLs');
}

// Robots.txt
var rbPath=path.join(DIR,'robots.txt');
if(!fs.existsSync(rbPath)){
  issues.push('CRITICAL: robots.txt MISSING');
} else {
  var rb=fs.readFileSync(rbPath,'utf8');
  if(rb.includes('Disallow: /\n')||rb.includes('Disallow: /\r')) issues.push('CRITICAL: robots.txt blocking ALL crawlers!');
  if(!rb.includes('Sitemap:')) issues.push('WARN: robots.txt missing Sitemap: directive');
  if(!rb.includes('User-agent: *')) issues.push('WARN: robots.txt missing User-agent: *');
  console.log('robots.txt OK');
}

// Final report
var critical=issues.filter(function(i){return i.indexOf('CRITICAL')===0;});
var warn=issues.filter(function(i){return i.indexOf('WARN')===0;});

console.log('\n========================================');
console.log('         FULL SEO/GEO AUDIT REPORT      ');
console.log('========================================');
console.log('Pages audited:      '+totalPages);
console.log('CRITICAL issues:    '+critical.length);
console.log('WARNINGS:           '+warn.length);
console.log('========================================');

if(critical.length>0){
  console.log('\n=== CRITICAL ISSUES (must fix) ===');
  critical.forEach(function(i){console.log('  '+i);});
}
if(warn.length>0){
  console.log('\n=== WARNINGS ('+warn.length+' total) ===');
  warn.slice(0,40).forEach(function(i){console.log('  '+i);});
  if(warn.length>40) console.log('  ... and '+(warn.length-40)+' more warnings');
}
if(issues.length===0){
  console.log('\n  ALL CLEAR - No issues detected!');
}
