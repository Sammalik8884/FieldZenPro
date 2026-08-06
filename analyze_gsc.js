const xlsx = require('xlsx');
const path = require('path');

const fp = path.join(__dirname, 'https___fieldzenpro.com_-Performance-on-Search-2026-06-19.xlsx');
const wb = xlsx.readFile(fp);

console.log('--- Sheets Available ---');
console.log(wb.SheetNames.join(', '));

function analyzeSheet(sheetName, idCol) {
    if (!wb.Sheets[sheetName]) {
        console.log(`Sheet ${sheetName} not found.`);
        return;
    }
    const data = xlsx.utils.sheet_to_json(wb.Sheets[sheetName]);
    console.log('\n========================================');
    console.log(`=== ${sheetName.toUpperCase()} ===`);
    console.log('========================================');
    
    // Sort by impressions descending
    data.sort((a, b) => (b.Impressions || 0) - (a.Impressions || 0));
    
    console.log('\n🎯 TOP 15 BY IMPRESSIONS:');
    data.slice(0, 15).forEach(row => {
        let ctr = row.CTR !== undefined ? (row.CTR * 100).toFixed(2) : 0;
        let pos = row.Position !== undefined ? row.Position.toFixed(1) : 0;
        console.log(`- ${row[idCol]}: Imp=${row.Impressions}, Clicks=${row.Clicks}, CTR=${ctr}%, Pos=${pos}`);
    });

    console.log('\n📉 HIGH IMPRESSIONS, LOW CTR (< 1%) & POSITION > 10:');
    let lowCtr = data.filter(row => row.Impressions > 50 && row.CTR < 0.01 && row.Position > 10);
    lowCtr.slice(0, 10).forEach(row => {
        let ctr = row.CTR !== undefined ? (row.CTR * 100).toFixed(2) : 0;
        let pos = row.Position !== undefined ? row.Position.toFixed(1) : 0;
        console.log(`- ${row[idCol]}: Imp=${row.Impressions}, Clicks=${row.Clicks}, CTR=${ctr}%, Pos=${pos}`);
    });

    console.log('\n🚀 LOW-HANGING FRUIT (Position 11 - 25, Imp > 20):');
    let page2 = data.filter(row => row.Position >= 11 && row.Position <= 25 && row.Impressions > 20);
    // Sort page2 by impressions
    page2.sort((a, b) => (b.Impressions || 0) - (a.Impressions || 0));
    page2.slice(0, 15).forEach(row => {
        let ctr = row.CTR !== undefined ? (row.CTR * 100).toFixed(2) : 0;
        let pos = row.Position !== undefined ? row.Position.toFixed(1) : 0;
        console.log(`- ${row[idCol]}: Imp=${row.Impressions}, Clicks=${row.Clicks}, CTR=${ctr}%, Pos=${pos}`);
    });
}

analyzeSheet('Queries', 'Top queries');
analyzeSheet('Pages', 'Top pages');
