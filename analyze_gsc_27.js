const XLSX = require('xlsx');

function analyzeFile(filename) {
  console.log(`\n\n=== ANALYZING: ${filename} ===`);
  try {
    const wb = XLSX.readFile(filename);
    const pages = XLSX.utils.sheet_to_json(wb.Sheets['Pages']);
    
    console.log('\n--- TOP 20 PAGES BY IMPRESSIONS ---');
    pages.sort((a,b) => b.Impressions - a.Impressions).slice(0,20).forEach(p => {
      console.log(`${p['Top pages']}: ${p.Clicks} clicks, ${p.Impressions} imp, CTR: ${(p.CTR*100).toFixed(2)}%, Pos: ${p.Position.toFixed(1)}`);
    });

    const queries = XLSX.utils.sheet_to_json(wb.Sheets['Queries']);
    console.log('\n--- TOP 20 QUERIES BY IMPRESSIONS ---');
    queries.sort((a,b) => b.Impressions - a.Impressions).slice(0,20).forEach(q => {
      console.log(`${q['Top queries']}: ${q.Clicks} clicks, ${q.Impressions} imp, CTR: ${(q.CTR*100).toFixed(2)}%, Pos: ${q.Position.toFixed(1)}`);
    });

    console.log('\n--- PAGES CLOSE TO PAGE 1 (Pos 10.1 - 20) ---');
    pages.filter(p => p.Position > 10 && p.Position <= 20).sort((a,b) => b.Impressions - a.Impressions).slice(0,10).forEach(p => {
      console.log(`${p['Top pages']}: Pos ${p.Position.toFixed(1)} | ${p.Impressions} imp | ${p.Clicks} clicks`);
    });
    
  } catch (e) {
    console.log("Error reading file:", e.message);
  }
}

analyzeFile('https___fieldzenpro.com_-Performance-on-Search-2026-06-27.xlsx');
