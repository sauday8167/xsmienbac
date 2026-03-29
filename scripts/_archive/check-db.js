// Check database for historical data
const { query } = require('../src/lib/db');

async function checkDatabase() {
    console.log('🔍 Checking database for historical data...\n');

    const results = await query(`
        SELECT draw_date, special_prize, prize_1 
        FROM xsmb_results 
        WHERE draw_date >= '2026-01-14' 
        ORDER BY draw_date DESC
    `);

    console.log(`Found ${results.length} records:\n`);

    results.forEach(row => {
        console.log(`📅 ${row.draw_date}: GĐB=${row.special_prize || 'null'}, G1=${row.prize_1 || 'null'}`);
    });

    if (results.length >= 5) {
        console.log('\n✅ Database has enough data (5+ days) for AI analysis');
    } else {
        console.log(`\n⚠️  Only ${results.length} days found - AI needs at least 5 days`);
    }
}

checkDatabase().catch(console.error);
