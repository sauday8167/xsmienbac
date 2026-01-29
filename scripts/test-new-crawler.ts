import { crawlLiveXSMB } from '../src/lib/realtime-crawler';

async function testCrawler() {
    console.log('Testing New API Crawler...');
    console.log('--------------------------------');

    try {
        const result = await crawlLiveXSMB();

        if (result) {
            console.log('✅ Crawl Successful!');
            console.log('Source:', result.source);
            console.log('Date:', result.draw_date);
            console.log('Special Prize:', result.special_prize);
            console.log('Prize 1:', result.prize_1);
            console.log('Prize 2:', result.prize_2);
            console.log('Prize 7:', result.prize_7);

            // Validate Date Format
            if (!/^\d{4}-\d{2}-\d{2}$/.test(result.draw_date)) {
                console.error('❌ Invalid Date Format! Expected YYYY-MM-DD');
            } else {
                console.log('✅ Date Format Correct (YYYY-MM-DD)');
            }
        } else {
            console.log('⚠️ Crawl returned null (No data or both APIs failed)');
        }

    } catch (e: any) {
        console.error('❌ Test Loop Error:', e.message);
    }
}

testCrawler();
