// Real Data Live Drawing Test
// Crawl real data for 2026-01-19 and insert step by step

const { crawlLiveXSMB } = require('../src/lib/realtime-crawler');
const { query, queryOne } = require('../src/lib/db');

const TEST_DATE = '2026-01-22';

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function clearOldData() {
    console.log('🗑️  Clearing old test data for', TEST_DATE);
    await query('DELETE FROM xsmb_results WHERE draw_date = ?', [TEST_DATE]);
    console.log('✅ Cleared\n');
}

async function createEmptyRecord() {
    console.log('📝 Creating empty record...');
    await query(
        `INSERT INTO xsmb_results (draw_date, created_at, updated_at) 
         VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [TEST_DATE]
    );
    console.log('✅ Empty record created\n');
}

async function crawlRealData() {
    console.log('🌐 Crawling REAL data from xoso.com.vn for', TEST_DATE);
    console.log('⏳ Please wait...\n');

    const data = await crawlLiveXSMB();

    if (!data) {
        console.error('❌ Failed to crawl data!');
        return null;
    }

    console.log('✅ Successfully crawled from:', data.source);
    console.log('\n📊 Data received:');
    console.log('   GĐB:', data.special_prize || '(empty)');
    console.log('   G1:', data.prize_1 || '(empty)');
    console.log('   G2:', data.prize_2 ? data.prize_2.join(', ') : '(empty)');
    console.log('   G3:', data.prize_3 ? data.prize_3.join(', ') : '(empty)');
    console.log('   G4:', data.prize_4 ? data.prize_4.join(', ') : '(empty)');
    console.log('   G5:', data.prize_5 ? data.prize_5.join(', ') : '(empty)');
    console.log('   G6:', data.prize_6 ? data.prize_6.join(', ') : '(empty)');
    console.log('   G7:', data.prize_7 ? data.prize_7.join(', ') : '(empty)');
    console.log('');

    return data;
}

async function updatePrize(field, value) {
    const jsonValue = Array.isArray(value) ? JSON.stringify(value) : value;

    await query(
        `UPDATE xsmb_results SET ${field} = ?, updated_at = CURRENT_TIMESTAMP WHERE draw_date = ?`,
        [jsonValue, TEST_DATE]
    );
}

async function simulateLiveWithRealData(data) {
    console.log('🎬 STARTING LIVE SIMULATION WITH REAL DATA');
    console.log('===========================================\n');
    console.log('⚠️  IMPORTANT: Open http://localhost:3000 NOW to watch!\n');

    await sleep(3000);

    // Prize 1
    if (data.prize_1) {
        console.log('[18:15] 🎲 Giải Nhất');
        await updatePrize('prize_1', data.prize_1);
        console.log('   ✅', data.prize_1);
        await sleep(4000);
    }

    // Prize 2
    if (data.prize_2) {
        console.log('[18:16] 🎲 Giải Nhì');
        await updatePrize('prize_2', data.prize_2);
        console.log('   ✅', data.prize_2.join(', '));
        await sleep(4000);
    }

    // Prize 3
    if (data.prize_3) {
        console.log('[18:18] 🎲 Giải Ba');
        await updatePrize('prize_3', data.prize_3);
        console.log('   ✅', data.prize_3.join(', '));
        await sleep(4000);
    }

    // Prize 4
    if (data.prize_4) {
        console.log('[18:20] 🎲 Giải Tư');
        await updatePrize('prize_4', data.prize_4);
        console.log('   ✅', data.prize_4.join(', '));
        await sleep(4000);
    }

    // Prize 5
    if (data.prize_5) {
        console.log('[18:22] 🎲 Giải Năm');
        await updatePrize('prize_5', data.prize_5);
        console.log('   ✅', data.prize_5.join(', '));
        await sleep(4000);
    }

    // Prize 6
    if (data.prize_6) {
        console.log('[18:24] 🎲 Giải Sáu');
        await updatePrize('prize_6', data.prize_6);
        console.log('   ✅', data.prize_6.join(', '));
        await sleep(4000);
    }

    // Prize 7
    if (data.prize_7) {
        console.log('[18:26] 🎲 Giải Bảy');
        await updatePrize('prize_7', data.prize_7);
        console.log('   ✅', data.prize_7.join(', '));
        await sleep(5000);
    }

    // Special Prize (pause first)
    console.log('[18:27-18:29] ⏸️  Chờ Giải Đặc Biệt...');
    await sleep(3000);

    if (data.special_prize) {
        console.log('[18:30] 🏆 GIẢI ĐẶC BIỆT');
        await updatePrize('special_prize', data.special_prize);
        console.log('   ✅✅✅', data.special_prize, '✅✅✅');
        await sleep(3000);
    }

    console.log('\n✅ SIMULATION COMPLETE!');
    console.log('📊 Check your browser - all prizes should be displayed with animations!\n');
}

async function main() {
    try {
        // Step 1: Clear old data
        await clearOldData();

        // Step 2: Create empty record
        await createEmptyRecord();

        // Step 3: Crawl real data
        const realData = await crawlRealData();

        if (!realData) {
            console.error('Cannot proceed without data!');
            return;
        }

        // Step 4: Simulate live drawing
        await simulateLiveWithRealData(realData);

    } catch (error) {
        console.error('💥 Error:', error);
    }
}

main();
