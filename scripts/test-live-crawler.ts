import { crawlLiveXSMB } from '../src/lib/realtime-crawler';

async function testCrawler() {
    console.log('🕷️ Testing Live Crawler...');
    const result = await crawlLiveXSMB();

    if (result) {
        console.log('✅ Result Parsed Successfully:');
        console.log('Date:', result.draw_date);
        console.log('Source:', result.source);
        console.log('Special Prize:', result.special_prize);
        console.log('Prize 1:', result.prize_1);
        console.log('Full JSON:', JSON.stringify(result, null, 2));
    } else {
        console.error('❌ No result found (or all sources failed/empty).');
    }
}

testCrawler();
