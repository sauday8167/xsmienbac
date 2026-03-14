
import 'tsconfig-paths/register';
import fs from 'fs';
import path from 'path';
import { analyzeBacNho } from '../src/lib/bac-nho';
import { analyzeBacNho2Ngay } from '../src/lib/bac-nho-2-ngay';
import { analyzeBacNho3Ngay } from '../src/lib/bac-nho-3-ngay';
import { analyzeBacNhoSoDon } from '../src/lib/bac-nho-so-don';
import { analyzeBacNhoCap2 } from '../src/lib/bac-nho-cap-2';
import { analyzeBacNhoCap3 } from '../src/lib/bac-nho-cap-3';
import { analyzeBacNho2NgayKhung3Ngay } from '../src/lib/bac-nho-khung-3-ngay-2-ngay';
import { analyzeBacNho3NgayKhung3Ngay } from '../src/lib/bac-nho-khung-3-ngay-3-ngay';
import { analyzeBacNhoCap2Khung3Ngay } from '../src/lib/bac-nho-khung-3-ngay-cap-2';
import { analyzeBacNhoCap3Khung3Ngay } from '../src/lib/bac-nho-khung-3-ngay-cap-3';
import { analyzeBacNhoSoDonKhung3Ngay } from '../src/lib/bac-nho-khung-3-ngay-so-don';
import { query, queryOne, closePool } from '../src/lib/db';

async function cleanupOldRecords(type: string) {
    try {
        const thirtyDaysAgoRecord = await queryOne<{ stat_key: string }>(
            'SELECT stat_key FROM statistics_cache WHERE stat_type = ? ORDER BY stat_key DESC LIMIT 1 OFFSET 30',
            [type]
        );

        if (thirtyDaysAgoRecord) {
            await query(
                'DELETE FROM statistics_cache WHERE stat_type = ? AND stat_key < ?',
                [type, thirtyDaysAgoRecord.stat_key]
            );
            console.log(`Cleaned up old records for ${type} (kept 30 entries)`);
        }
    } catch (e) {
        console.error(`Cleanup failed for ${type}`, e);
    }
}

async function calculateAll() {
    const DAY_RANGES = [100, 180, 365, 730, 1000];
    
    console.log(`--- STARTING BAC NHO MULTI-RANGE CALCULATION ---`);
    const totalStartTime = Date.now();

    try {
        const dataDir = path.join(process.cwd(), 'src', 'data');
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

        for (const days of DAY_RANGES) {
            console.log(`\n>>> ANALYZING RANGE: ${days} DAYS <<<`);
            const rangeStartTime = Date.now();

            // Helper to determine latest date from a standard sample
            const sample = await analyzeBacNho(30);
            const dbLatestDate = (sample as any).overview?.latestDate;
            if (!dbLatestDate) {
                console.error(`[${days}] Could not determine latest date.`);
                continue;
            }

            // Function to run analysis, save, and CLEAR memory immediately
            const runAndSave = async (label: string, name: string, analyzer: (d: number) => Promise<any>) => {
                console.log(`[${days}] ${label}...`);
                let result: any = await analyzer(days);
                
                const nameSuffix = days === 100 ? '' : `-${days}`;
                const statType = `bac-nho-${name}${nameSuffix}`;
                
                await query(
                    `INSERT INTO statistics_cache (stat_type, stat_key, stat_value, expires_at, updated_at) 
                     VALUES (?, ?, ?, datetime('now', '+30 days'), CURRENT_TIMESTAMP)
                     ON CONFLICT(stat_type, stat_key) DO UPDATE SET
                     stat_value=excluded.stat_value, updated_at=CURRENT_TIMESTAMP`,
                    [statType, dbLatestDate, JSON.stringify(result)]
                );
                await cleanupOldRecords(statType);
                console.log(`[${days}] Saved ${name} to DB`);
                
                // Explicitly clear memory
                result = null;
                if (global.gc) global.gc();
            };

            await runAndSave('1. Standard', 'standard', analyzeBacNho);
            await runAndSave('2. 2 Ngay', '2-ngay', analyzeBacNho2Ngay);
            await runAndSave('3. 3 Ngay', '3-ngay', analyzeBacNho3Ngay);
            await runAndSave('4. So Don', 'so-don', analyzeBacNhoSoDon);
            await runAndSave('5. Cap 2', 'cap-2', analyzeBacNhoCap2);
            await runAndSave('6. Cap 3', 'cap-3', analyzeBacNhoCap3);
            await runAndSave('7. Khung 3 Ngay - 2 Ngay', 'khung-3-ngay-2-ngay', analyzeBacNho2NgayKhung3Ngay);
            await runAndSave('8. Khung 3 Ngay - 3 Ngay', 'khung-3-ngay-3-ngay', analyzeBacNho3NgayKhung3Ngay);
            await runAndSave('9. Khung 3 Ngay - Cap 2', 'khung-3-ngay-cap-2', analyzeBacNhoCap2Khung3Ngay);
            await runAndSave('10. Khung 3 Ngay - Cap 3', 'khung-3-ngay-cap-3', analyzeBacNhoCap3Khung3Ngay);
            await runAndSave('11. Khung 3 Ngay - So Don', 'khung-3-ngay-so-don', analyzeBacNhoSoDonKhung3Ngay);

            console.log(`[${days}] Range completed in ${(Date.now() - rangeStartTime) / 1000}s`);
        }

        console.log(`\n--- ALL RANGES SUCCESSFUL ---`);
        console.log(`Total batch time: ${(Date.now() - totalStartTime) / 1000}s`);

    } catch (error) {
        console.error('Batch calculation failed:', error);
        process.exit(1);
    } finally {
        await closePool();
    }
}

calculateAll();
