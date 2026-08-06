const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// ─── 1. GSC ANALYSIS ───────────────────────────────────────────────────────
const wb = XLSX.readFile('https___fieldzenpro.com_-Performance-on-Search-2026-07-01.xlsx');

const pages  = XLSX.utils.sheet_to_json(wb.Sheets['Pages']);
const queries = XLSX.utils.sheet_to_json(wb.Sheets['Queries']);

const totalClicks      = pages.reduce((s,p)=>s+p.Clicks,0);
const totalImpressions = pages.reduce((s,p)=>s+p.Impressions,0);
const avgPosition      = pages.reduce((s,p)=>s+p.Position,0)/pages.length;

console.log('═══════════════════════════════════════════════════════');
console.log('  FIELDZENPRO GSC ANALYSIS — July 1, 2026');
console.log('═══════════════════════════════════════════════════════');
console.log(`Total Clicks:       ${totalClicks}`);
console.log(`Total Impressions:  ${totalImpressions}`);
console.log(`Avg Position:       ${avgPosition.toFixed(1)}`);
console.log(`Pages Tracked:      ${pages.length}`);
console.log(`Queries Tracked:    ${queries.length}`);

console.log('\n─── TOP 25 PAGES BY IMPRESSIONS ─────────────────────────');
pages.sort((a,b)=>b.Impressions-a.Impressions).slice(0,25).forEach((p,i)=>{
  const url = p['Top pages'].replace('https://fieldzenpro.com/','');
  const ctr = (p.CTR*100).toFixed(1);
  const flag = p.Clicks===0?'❌ NO CLICKS':p.Position<11?'🏆 PAGE 1':'⏳';
  console.log(`${String(i+1).padStart(2)}. [${flag}] ${url} | ${p.Clicks}c / ${p.Impressions}imp | CTR:${ctr}% | Pos:${p.Position.toFixed(1)}`);
});

console.log('\n─── PAGES ON PAGE 1 (Pos ≤10) ─────────────────────────');
const pg1 = pages.filter(p=>p.Position<=10).sort((a,b)=>a.Position-b.Position);
pg1.forEach(p=>{
  const url = p['Top pages'].replace('https://fieldzenpro.com/','');
  console.log(`  ✅ Pos ${p.Position.toFixed(1)} | ${url} | ${p.Clicks} clicks / ${p.Impressions} imp`);
});
if(pg1.length===0) console.log('  ⚠️  NO PAGES ON PAGE 1 YET');

console.log('\n─── ALMOST PAGE 1 (Pos 10.1–20) ────────────────────────');
const almost = pages.filter(p=>p.Position>10&&p.Position<=20).sort((a,b)=>a.Position-b.Position);
almost.forEach(p=>{
  const url = p['Top pages'].replace('https://fieldzenpro.com/','');
  console.log(`  🎯 Pos ${p.Position.toFixed(1)} | ${url} | ${p.Clicks} clicks / ${p.Impressions} imp`);
});

console.log('\n─── HIGH IMPRESSION ZERO-CLICK PAGES ───────────────────');
pages.filter(p=>p.Clicks===0&&p.Impressions>200).sort((a,b)=>b.Impressions-a.Impressions).forEach(p=>{
  const url = p['Top pages'].replace('https://fieldzenpro.com/','');
  console.log(`  🔴 Pos ${p.Position.toFixed(1)} | ${url} | ${p.Impressions} imp | 0 clicks`);
});

console.log('\n─── TOP 20 QUERIES BY IMPRESSIONS ──────────────────────');
queries.sort((a,b)=>b.Impressions-a.Impressions).slice(0,20).forEach(q=>{
  const ctr=(q.CTR*100).toFixed(1);
  console.log(`  "${q['Top queries']}" | ${q.Clicks}c / ${q.Impressions}imp | CTR:${ctr}% | Pos:${q.Position.toFixed(1)}`);
});

// ─── 2. ARTICLE AUDIT ──────────────────────────────────────────────────────
console.log('\n═══════════════════════════════════════════════════════');
console.log('  ARTICLE AUDIT — Errors, Duplication, Word Count');
console.log('═══════════════════════════════════════════════════════');

const dir = path.join('frontend','public');
const htmlFiles = fs.readdirSync(dir).filter(f=>f.endsWith('.html')&&!['about','careers','changelog','privacy','terms','gdpr','security','roadmap','blog','landing'].includes(f.replace('.html','')));

let errors=[], warnings=[], allH1s={}, allTitles={};
let below2500=[], below3500=[], ok=[];

htmlFiles.forEach(file=>{
  const html = fs.readFileSync(path.join(dir,file),'utf8');
  const text = html.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
  const wc   = text.split(' ').filter(w=>w.length>2).length;

  const h1s   = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)||[]).map(h=>h.replace(/<[^>]+>/g,'').trim());
  const h2s   = (html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)||[]).map(h=>h.replace(/<[^>]+>/g,'').trim());
  const title = (html.match(/<title>([\s\S]*?)<\/title>/i)||['',''])[1].trim();
  const hasCanonical = /<link[^>]+rel="canonical"/i.test(html);
  const hasFAQSchema = /"@type":\s*"FAQPage"/i.test(html);
  const hasGA4       = /G-H54SMK14ZK/i.test(html);

  // Check duplicate H2s within article
  const dupH2s = h2s.filter((h,i)=>h2s.indexOf(h)!==i);
  if(dupH2s.length>0) errors.push(`${file}: DUPLICATE H2s → ${dupH2s.join(' | ')}`);

  // Multiple H1s
  if(h1s.length>1) errors.push(`${file}: ${h1s.length} H1 TAGS`);
  if(h1s.length===0) errors.push(`${file}: NO H1`);

  // Missing critical tags
  if(!hasCanonical) errors.push(`${file}: MISSING CANONICAL`);
  if(!hasFAQSchema)  warnings.push(`${file}: No FAQ Schema`);
  if(!hasGA4)        errors.push(`${file}: MISSING GA4`);

  // Word count tiers
  if(wc<2500) below2500.push({file,wc});
  else if(wc<3500) below3500.push({file,wc});
  else ok.push({file,wc});

  // Track duplicate titles
  if(allTitles[title]) errors.push(`DUPLICATE TITLE: "${title}" → ${file} AND ${allTitles[title]}`);
  else allTitles[title]=file;
});

console.log(`\n📊 Word Count Distribution across ${htmlFiles.length} articles:`);
console.log(`  🔴 Under 2,500 words (urgent): ${below2500.length} articles`);
below2500.sort((a,b)=>a.wc-b.wc).forEach(x=>console.log(`     ${x.file}: ${x.wc}w`));
console.log(`  🟡 2,500–3,499 words (needs upgrade): ${below3500.length} articles`);
below3500.sort((a,b)=>a.wc-b.wc).slice(0,15).forEach(x=>console.log(`     ${x.file}: ${x.wc}w`));
console.log(`  ✅ 3,500+ words (good): ${ok.length} articles`);

console.log(`\n❌ ERRORS (${errors.length} total):`);
errors.slice(0,30).forEach(e=>console.log('  '+e));

console.log(`\n⚠️  WARNINGS (${warnings.length} total):`);
warnings.slice(0,20).forEach(w=>console.log('  '+w));

console.log('\n═══════════════════════════════════════════════════════');
console.log('  DIAGNOSIS COMPLETE');
console.log('═══════════════════════════════════════════════════════');
