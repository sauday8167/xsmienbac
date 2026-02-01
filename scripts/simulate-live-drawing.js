// Simulation script to test live drawing
// This will insert partial results step by step to simulate live drawing

const { query, queryOne } = require('../src/lib/db');

const TEST_DATE = new Date().toISOString().split('T')[0];

// Sample data for simulation (from real lottery results)
const FULL_RESULT = {
    special_prize: '17151',
    prize_1: '22960',
    prize_2: ['73303', '33180'],
    prize_3: ['54339', '93758', '78904', '55993', '13321', '98721'],
    prize_4: ['2066', '5089', '1660', '0898'],
    prize_5: ['2713', '5585', '3229', '7634', '1785', '1317'],
    prize_6: ['139', '283', '310'],
    prize_7: ['94', '16', '52', '25']
};

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function clearTestData() {
    console.log('🗑️  Clearing old test data...');
    await query('DELETE FROM xsmb_results WHERE draw_date = ?', [TEST_DATE]);
}

async function createEmptyRecord() {
    console.log('📝 Creating empty record for', TEST_DATE);
    await query(
        `INSERT INTO xsmb_results (draw_date, created_at, updated_at) 
         VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [TEST_DATE]
    );
}

async function updatePrize(field, value) {
    const jsonValue = Array.isArray(value) ? JSON.stringify(value) : value;

    await query(
        `UPDATE xsmb_results SET ${field} = ?, updated_at = CURRENT_TIMESTAMP WHERE draw_date = ?`,
        [jsonValue, TEST_DATE]
    );

    console.log(`✅ Updated ${field}:`, value);
}

async function simulateLiveDrawing() {
    console.log('\n🎰 SIMULATING LIVE LOTTERY DRAWING');
    console.log('===================================\n');

    // Clean and prepare
    await clearTestData();
    await createEmptyRecord();

    console.log('\n⏰ Simulating 18:15 - Starting draw...\n');
    await sleep(2000);

    // Prize 1 (18:15)
    console.log('🔴 18:15 - Giải Nhất');
    await updatePrize('prize_1', FULL_RESULT.prize_1);
    await sleep(3000);

    // Prize 2 (18:16)
    console.log('🔴 18:16 - Giải Nhì');
    await updatePrize('prize_2', FULL_RESULT.prize_2);
    await sleep(3000);

    // Prize 3 (18:17)
    console.log('🔴 18:17 - Giải Ba');
    await updatePrize('prize_3', FULL_RESULT.prize_3);
    await sleep(3000);

    // Prize 4 (18:19)
    console.log('🔴 18:19 - Giải Tư');
    await updatePrize('prize_4', FULL_RESULT.prize_4);
    await sleep(3000);

    // Prize 5 (18:21)
    console.log('🔴 18:21 - Giải Năm');
    await updatePrize('prize_5', FULL_RESULT.prize_5);
    await sleep(3000);

    // Prize 6 (18:23)
    console.log('🔴 18:23 - Giải Sáu');
    await updatePrize('prize_6', FULL_RESULT.prize_6);
    await sleep(3000);

    // Prize 7 (18:25)
    console.log('🔴 18:25 - Giải Bảy');
    await updatePrize('prize_7', FULL_RESULT.prize_7);
    await sleep(5000);

    // Special Prize (18:30)
    console.log('🔴 18:30 - GIẢI ĐẶC BIỆT');
    await updatePrize('special_prize', FULL_RESULT.special_prize);

    console.log('\n✅ Simulation complete!');
    console.log('\n📊 Check frontend at: http://localhost:3000');
    console.log('    You should see the animations!\n');
}

simulateLiveDrawing().catch(console.error);
