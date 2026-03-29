import { crawlLiveXSMB } from '../src/lib/realtime-crawler';

async function test() {
    console.log('🏁 Starting AZ24 Crawler Test...');
    console.log('📅 Target Date: 25-01-2026 (Today)');

    try {
        const result = await crawlLiveXSMB();

        if (result) {
            console.log('\n✅ CRAWL SUCCESS!');
            console.log('-----------------------------------');
            console.log(`📅 Date: ${result.draw_date}`);
            console.log(`🔗 Source: ${result.source}`);
            console.log(`🏆 Special Prize: ${result.special_prize}`);
            console.log(`🥇 Prize 1: ${result.prize_1}`);
            console.log(`🥈 Prize 2: ${result.prize_2?.join(' - ')}`);
            console.log(`🥉 Prize 3: ${result.prize_3?.join(' - ')}`);
            console.log(`4️⃣ Prize 4: ${result.prize_4?.join(' - ')}`);
            console.log(`5️⃣ Prize 5: ${result.prize_5?.join(' - ')}`);
            console.log(`6️⃣ Prize 6: ${result.prize_6?.join(' - ')}`);
            console.log(`7️⃣ Prize 7: ${result.prize_7?.join(' - ')}`);
            console.log('-----------------------------------');
        } else {
            console.log('\n❌ CRAWL RED: No data returned (possibly site error or structure change)');
        }
    } catch (error) {
        console.error('\n❌ TEST FAILED:', error);
    }
}

test();
