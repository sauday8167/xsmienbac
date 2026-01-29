import { analyzeBacNhoCap3 } from '../src/lib/bac-nho-cap-3';
import { analyzeBacNho2Ngay } from '../src/lib/bac-nho-2-ngay';
import { analyzeBacNhoCap3Khung3Ngay } from '../src/lib/bac-nho-khung-3-ngay-cap-3';
import { getOrUpdateBacNhoData } from '../src/lib/bac-nho-cache-service';

// Mock DB connection setup if needed by imports (usually db.ts handles it)
// But since we are running as a script with tsx, need to ensure paths work.
// db.ts uses process.cwd() which should be fine if run from root.

const TIMEFRAMES = [100, 180, 365, 730, 1000];

async function main() {
    console.log('🚀 Starting Bac Nho Stats Cache Warming...');

    // 1. Cap 3
    console.log('\n--- Warming CAP 3 ---');
    for (const days of TIMEFRAMES) {
        process.stdout.write(`👉 Processing Cap 3 - ${days} days... `);
        const startTime = Date.now();
        try {
            await getOrUpdateBacNhoData(
                `cap-3-${days}`,
                async (d) => await analyzeBacNhoCap3(d),
                days
            );
            const duration = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`✅ Done in ${duration}s`);
        } catch (error) {
            console.error(`❌ Failed:`, error);
        }
    }

    // 2. 2 Ngay
    console.log('\n--- Warming 2 NGAY ---');
    for (const days of TIMEFRAMES) {
        process.stdout.write(`👉 Processing 2 Ngay - ${days} days... `);
        const startTime = Date.now();
        try {
            await getOrUpdateBacNhoData(
                `2-ngay-${days}`,
                async (d) => await analyzeBacNho2Ngay(d),
                days
            );
            const duration = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`✅ Done in ${duration}s`);
        } catch (error) {
            console.error(`❌ Failed:`, error);
        }
    }

    // 3. Nuoi (Khung 3 Ngay Cap 3)
    console.log('\n--- Warming NUOI (Khung 3 Ngay) ---');
    for (const days of TIMEFRAMES) {
        process.stdout.write(`👉 Processing Nuoi - ${days} days... `);
        const startTime = Date.now();
        try {
            await getOrUpdateBacNhoData(
                `cap-3-khung-3-ngay-${days}`,
                async (d) => await analyzeBacNhoCap3Khung3Ngay(d),
                days
            );
            const duration = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`✅ Done in ${duration}s`);
        } catch (error) {
            console.error(`❌ Failed:`, error);
        }
    }

    console.log('\n✨ All Done!');
}

main().catch(console.error);
