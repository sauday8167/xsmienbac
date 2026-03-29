// Test script for realtime crawler
const { crawlLiveXSMB } = require('../src/lib/realtime-crawler');

async function testCrawler() {
    console.log('🧪 Testing Realtime Crawler...\n');
    console.log('Trying to crawl from multiple sources...\n');

    try {
        const result = await crawlLiveXSMB();

        if (result) {
            console.log('✅ SUCCESS! Crawled from:', result.source);
            console.log('\n📊 Result Data:');
            console.log('   Date:', result.draw_date);
            console.log('   Special Prize:', result.special_prize || '(not yet)');
            console.log('   Prize 1:', result.prize_1 || '(not yet)');
            console.log('   Prize 2:', result.prize_2 ? result.prize_2.join(', ') : '(not yet)');
            console.log('   Prize 3:', result.prize_3 ? result.prize_3.join(', ') : '(not yet)');
            console.log('   Prize 4:', result.prize_4 ? result.prize_4.join(', ') : '(not yet)');
            console.log('   Prize 5:', result.prize_5 ? result.prize_5.join(', ') : '(not yet)');
            console.log('   Prize 6:', result.prize_6 ? result.prize_6.join(', ') : '(not yet)');
            console.log('   Prize 7:', result.prize_7 ? result.prize_7.join(', ') : '(not yet)');
            console.log('\n✅ Crawler is working correctly!');
        } else {
            console.log('⚠️  No data returned from any source.');
            console.log('This is normal if it\'s not drawing time (18:15-18:32)');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    }
}

testCrawler();
