import { analyzeBacNhoCap3 } from '../src/lib/bac-nho-cap-3';
import { analyzeBacNhoCap2 } from '../src/lib/bac-nho-cap-2';
import { analyzeBacNhoSoDon } from '../src/lib/bac-nho-so-don';
import { analyzeBacNhoSoDonKhung3Ngay } from '../src/lib/bac-nho-khung-3-ngay-so-don';
import { getOrUpdateBacNhoData } from '../src/lib/bac-nho-cache-service';

const TIMEFRAMES = [100, 180, 365, 730, 1000];

async function main() {
    console.log('🚀 Starting Comprehensive Bac Nho Stats Cache Warming...');

    const tasks = [
        { label: 'SO DON', key: 'so-don', fn: analyzeBacNhoSoDon },
        { label: 'KHUNG 3 NGAY SO DON', key: 'khung-3-ngay-so-don', fn: analyzeBacNhoSoDonKhung3Ngay },
        { label: 'CAP 2', key: 'cap-2', fn: analyzeBacNhoCap2 },
        { label: 'CAP 3', key: 'cap-3', fn: analyzeBacNhoCap3 },
    ];

    for (const task of tasks) {
        console.log(`\n--- Warming ${task.label} ---`);
        for (const days of TIMEFRAMES) {
            const cacheKey = days === 100 ? task.key : `${task.key}-${days}`;
            process.stdout.write(`👉 Processing ${task.label} - ${days} days... `);
            const startTime = Date.now();
            try {
                await getOrUpdateBacNhoData(
                    cacheKey,
                    async (d) => await task.fn(d),
                    days
                );
                const duration = ((Date.now() - startTime) / 1000).toFixed(1);
                console.log(`✅ Done in ${duration}s`);
            } catch (error) {
                console.error(`❌ Failed:`, error);
            }
        }
    }

    console.log('\n✨ All Done!');
}

main().catch(console.error);

main().catch(console.error);
