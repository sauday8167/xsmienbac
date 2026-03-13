
import fs from 'fs';
import path from 'path';
import { query, queryOne } from './db';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface CachedData<T> {
    lastUpdated: string;
    data: T;
}

/**
 * Cleanup old records in statistics_cache, keeping only the most recent 30 days per type
 */
async function cleanupOldRecords(type: string) {
    try {
        // Find the date for the 30th record (ordered by stat_key DESC which is YYYY-MM-DD)
        const thirtyDaysAgoRecord = await queryOne<{ stat_key: string }>(
            'SELECT stat_key FROM statistics_cache WHERE stat_type = ? ORDER BY stat_key DESC LIMIT 1 OFFSET 30',
            [type]
        );

        if (thirtyDaysAgoRecord) {
            await query(
                'DELETE FROM statistics_cache WHERE stat_type = ? AND stat_key < ?',
                [type, thirtyDaysAgoRecord.stat_key]
            );
            console.log(`[BacNhoCache] Cleaned up records for ${type} older than ${thirtyDaysAgoRecord.stat_key}`);
        }
    } catch (e) {
        console.error(`[BacNhoCache] Cleanup failed for ${type}`, e);
    }
}

/**
 * Get data from DB cache or recalculate if stale
 * @param key Filename key (e.g., 'so-don', 'cap-2')
 * @param calculateFn Function to calculate data if cache is stale
 * @param days Number of days to analyze
 */
export async function getOrUpdateBacNhoData<T>(
    key: string,
    calculateFn: (days: number) => Promise<T>,
    days: number = 100
): Promise<T> {
    const statType = `bac-nho-${key}`;
    
    // 1. Get latest date from results DB to check freshness
    const latestResult = await queryOne<{ draw_date: string }>(
        'SELECT draw_date FROM xsmb_results ORDER BY draw_date DESC LIMIT 1'
    );
    const dbLatestDate = latestResult?.draw_date || new Date().toISOString().split('T')[0];

    // 2. Check DB Cache
    try {
        const cachedRow = await queryOne<{ stat_value: string }>(
            'SELECT stat_value FROM statistics_cache WHERE stat_type = ? AND stat_key = ?',
            [statType, dbLatestDate]
        );

        if (cachedRow) {
            try {
                const parsed = JSON.parse(cachedRow.stat_value);
                // The stored value is the raw 'data' property if we want consistency with JSON format
                return parsed;
            } catch (e) {
                console.error(`[BacNhoCache] JSON Parse error for DB cache ${key}`, e);
            }
        }
    } catch (dbErr) {
        console.error(`[BacNhoCache] DB query error for ${key}`, dbErr);
    }

    // 3. Fallback to JSON file if DB fails or is empty for this date
    const filePath = path.join(DATA_DIR, `bac-nho-${key}.json`);
    if (fs.existsSync(filePath)) {
        try {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const cachedJson: CachedData<T> = JSON.parse(fileContent);
            if ((cachedJson.data as any).overview?.latestDate === dbLatestDate) {
                return cachedJson.data;
            }
        } catch (e) {
            // Ignore JSON read errors
        }
    }

    // 4. Recalculate
    console.log(`[BacNhoCache] 🔄 Recalculating ${key} for ${days} days...`);
    try {
        const newData = await calculateFn(days);
        
        // Save to DB
        await query(
            `INSERT INTO statistics_cache (stat_type, stat_key, stat_value, expires_at, updated_at) 
             VALUES (?, ?, ?, datetime('now', '+30 days'), CURRENT_TIMESTAMP)
             ON CONFLICT(stat_type, stat_key) DO UPDATE SET
             stat_value=excluded.stat_value, updated_at=CURRENT_TIMESTAMP`,
            [statType, dbLatestDate, JSON.stringify(newData)]
        );

        // Backup to JSON (Optional, good for safety)
        const cachePayload: CachedData<T> = {
            lastUpdated: new Date().toISOString(),
            data: newData
        };
        fs.writeFileSync(filePath, JSON.stringify(cachePayload, null, 2));

        // Cleanup old DB records
        await cleanupOldRecords(statType);

        console.log(`[BacNhoCache] ✅ Updated ${key} cache in DB and JSON.`);
        return newData;
    } catch (error) {
        console.error(`[BacNhoCache] Calculation failed for ${key}`, error);
        throw error;
    }
}
