const { query, queryOne } = require('../src/lib/db');
const { format } = require('date-fns');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function simulateRealLive() {
    const today = format(new Date(), 'yyyy-MM-dd'); // 2026-01-24
    const sourceDate = '2026-01-23';

    console.log(`🚀 Replaying result from ${sourceDate} as LIVE for ${today}`);

    // 1. Get Source Data
    const source = await queryOne('SELECT * FROM xsmb_results WHERE draw_date = ?', [sourceDate]);
    if (!source) {
        console.error('❌ Source data not found!');
        process.exit(1);
    }

    // 2. Reset Today
    await query('DELETE FROM xsmb_results WHERE draw_date = ?', [today]);
    await query('INSERT INTO xsmb_results (draw_date, created_at) VALUES (?, CURRENT_TIMESTAMP)', [today]);
    console.log('✨ Cleared today\'s data & initialized');

    // 3. Define Prizes (Order of revelation)
    // Note: JSON fields are strings in DB
    const prizes = [
        { name: 'prize_1', val: source.prize_1, delay: 2000 },
        { name: 'prize_2', val: JSON.parse(source.prize_2), delay: 2500 },
        { name: 'prize_3', val: JSON.parse(source.prize_3), delay: 3000 },
        { name: 'prize_4', val: JSON.parse(source.prize_4), delay: 2500 },
        { name: 'prize_5', val: JSON.parse(source.prize_5), delay: 3000 },
        { name: 'prize_6', val: JSON.parse(source.prize_6), delay: 2000 },
        { name: 'prize_7', val: JSON.parse(source.prize_7), delay: 2000 },
        { name: 'special_prize', val: source.special_prize, delay: 4000 }
    ];

    for (const prize of prizes) {
        console.log(`⏳ Revealing ${prize.name}...`);
        await sleep(prize.delay);

        let val = prize.val;
        if (Array.isArray(val)) val = JSON.stringify(val);

        await query(`UPDATE xsmb_results SET ${prize.name} = ? WHERE draw_date = ?`, [val, today]);
        console.log(`✅ Revealed ${prize.name}: ${val}`);
    }

    console.log('🏁 Simulation Complete!');
}

simulateRealLive().catch(console.error).finally(() => process.exit());
