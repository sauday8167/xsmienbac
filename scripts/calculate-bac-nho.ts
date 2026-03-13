
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

            console.log(`[${days}] 1. Standard...`);
            const standard = await analyzeBacNho(days);

            console.log(`[${days}] 2. 2 Ngay...`);
            const haiNgay = await analyzeBacNho2Ngay(days);

            console.log(`[${days}] 3. 3 Ngay...`);
            const baNgay = await analyzeBacNho3Ngay(days);

            console.log(`[${days}] 4. So Don...`);
            const soDon = await analyzeBacNhoSoDon(days);

            console.log(`[${days}] 5. Cap 2...`);
            const cap2 = await analyzeBacNhoCap2(days);

            console.log(`[${days}] 6. Cap 3...`);
            const cap3 = await analyzeBacNhoCap3(days);

            console.log(`[${days}] 7. Khung 3 Ngay - 2 Ngay...`);
            const k3n2n = await analyzeBacNho2NgayKhung3Ngay(days);

            console.log(`[${days}] 8. Khung 3 Ngay - 3 Ngay...`);
            const k3n3n = await analyzeBacNho3NgayKhung3Ngay(days);

            console.log(`[${days}] 9. Khung 3 Ngay - Cap 2...`);
            const k3nCap2 = await analyzeBacNhoCap2Khung3Ngay(days);

            console.log(`[${days}] 10. Khung 3 Ngay - Cap 3...`);
            const k3nCap3 = await analyzeBacNhoCap3Khung3Ngay(days);

            console.log(`[${days}] 11. Khung 3 Ngay - So Don...`);
            const k3nSoDon = await analyzeBacNhoSoDonKhung3Ngay(days);

            const dbLatestDate = (standard as any).overview?.latestDate;
            if (!dbLatestDate) {
                console.error(`[${days}] Could not determine latest date.`);
                continue;
            }

            // Helper to write file and DB
            const saveStats = async (name: string, content: any) => {
                // Key logic to match frontend expectations:
                // 100 days -> 'so-don'
                // other days -> 'so-don-180'
                const nameSuffix = days === 100 ? '' : `-${days}`;
                const statType = `bac-nho-${name}${nameSuffix}`;
                
                // 1. Save to JSON for backward compatibility
                const filePath = path.join(dataDir, `${statType}.json`);
                fs.writeFileSync(filePath, JSON.stringify({ lastUpdated: new Date().toISOString(), data: content }, null, 2));
                
                // 2. Save to Database
                await query(
                    `INSERT INTO statistics_cache (stat_type, stat_key, stat_value, expires_at, updated_at) 
                     VALUES (?, ?, ?, datetime('now', '+30 days'), CURRENT_TIMESTAMP)
                     ON CONFLICT(stat_type, stat_key) DO UPDATE SET
                     stat_value=excluded.stat_value, updated_at=CURRENT_TIMESTAMP`,
                    [statType, dbLatestDate, JSON.stringify(content)]
                );

                // 3. Cleanup old records in DB
                await cleanupOldRecords(statType);

                console.log(`[${days}] Saved ${name} to DB and JSON`);
            };

            await saveStats('standard', standard);
            await saveStats('2-ngay', haiNgay);
            await saveStats('3-ngay', baNgay);
            await saveStats('so-don', soDon);
            await saveStats('cap-2', cap2);
            await saveStats('cap-3', cap3);
            await saveStats('khung-3-ngay-2-ngay', k3n2n);
            await saveStats('khung-3-ngay-3-ngay', k3n3n);
            await saveStats('khung-3-ngay-cap-2', k3nCap2);
            await saveStats('khung-3-ngay-cap-3', k3nCap3);
            await saveStats('khung-3-ngay-so-don', k3nSoDon);

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
