const { analyzeBacNhoCap2 } = require('./src/lib/bac-nho-cap-2');
const { analyzeBacNhoSoDon } = require('./src/lib/bac-nho-so-don');

async function test() {
    try {
        console.log('Testing Bạc Nhớ Số Đơn for 1000 days...');
        const soDon = await analyzeBacNhoSoDon(1000);
        console.log('Số Đơn - Analyzed Days:', soDon.overview.analyzedDays);

        console.log('Testing Bạc Nhớ Cặp 2 for 1000 days...');
        const cap2 = await analyzeBacNhoCap2(1000);
        console.log('Cặp 2 - Analyzed Days:', cap2.overview.analyzedDays);
    } catch (error) {
        console.error('Error:', error);
    }
}

test();
