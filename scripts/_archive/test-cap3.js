const { analyzeBacNhoCap3 } = require('./src/lib/bac-nho-cap-3');

async function test() {
    try {
        console.log('Testing Bạc Nhớ Cặp 3 analysis for 100 days...');
        const data100 = await analyzeBacNhoCap3(100);
        console.log('100 days - Total Patterns:', data100.patterns.length);
        console.log('100 days - Today Predictions:', data100.todayPredictions.length);

        console.log('Testing Bạc Nhớ Cặp 3 analysis for 1000 days...');
        const data1000 = await analyzeBacNhoCap3(1000);
        console.log('1000 days - Total Patterns:', data1000.patterns.length);
        console.log('1000 days - Today Predictions:', data1000.todayPredictions.length);

        if (data1000.patterns.length > 0) {
            console.log('First pattern:', JSON.stringify(data1000.patterns[0], null, 2));
        }
    } catch (error) {
        console.error('Error during test:', error);
    }
}

test();
