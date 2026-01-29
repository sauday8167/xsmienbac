const { query } = require('../src/lib/db');
const { format } = require('date-fns');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function simulateLive() {
    const today = format(new Date(), 'yyyy-MM-dd');
    console.log(`🚀 Starting Live Simulation for ${today}`);

    // 1. Reset/Init Data
    await query('DELETE FROM xsmb_results WHERE draw_date = ?', [today]);
    await query('INSERT INTO xsmb_results (draw_date, created_at) VALUES (?, CURRENT_TIMESTAMP)', [today]);
    console.log('✨ Cleared old data & initialized');

    // Define prizes sequence
    const prizes = [
        { name: 'prize_1', val: '12345', delay: 2000 },
        { name: 'prize_2', val: ['23456', '34567'], delay: 3000 },
        { name: 'prize_3', val: ['34567', '45678', '56789', '67890', '78901', '89012'], delay: 4000 },
        { name: 'prize_4', val: ['1111', '2222', '3333', '4444'], delay: 3000 },
        { name: 'prize_5', val: ['5555', '6666', '7777', '8888', '9999', '0000'], delay: 4000 },
        { name: 'prize_6', val: ['111', '222', '333'], delay: 3000 },
        { name: 'prize_7', val: ['44', '55', '66', '77'], delay: 3000 },
        { name: 'special_prize', val: '99999', delay: 5000 }
    ];

    for (const prize of prizes) {
        console.log(`⏳ Waiting to reveal ${prize.name}...`);
        await sleep(prize.delay);

        let val = prize.val;
        if (Array.isArray(val)) val = JSON.stringify(val);

        await query(`UPDATE xsmb_results SET ${prize.name} = ? WHERE draw_date = ?`, [val, today]);
        console.log(`✅ Revealed ${prize.name}: ${val}`);
    }

    console.log('🏁 Simulation Complete!');
}

simulateLive().catch(console.error).finally(() => process.exit());
