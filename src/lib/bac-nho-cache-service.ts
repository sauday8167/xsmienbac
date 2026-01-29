
import fs from 'fs';
import path from 'path';
import { queryOne } from './db';

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
 * Get data from cache or recalculate if stale
 * @param key Filename key (e.g., 'so-don', 'cap-2')
 * @param calculateFn Function to calculate data if cache is stale
 * @param days Number of days to analyze
 */
export async function getOrUpdateBacNhoData<T>(
    key: string,
    calculateFn: (days: number) => Promise<T>,
    days: number = 100
): Promise<T> {
    const filePath = path.join(DATA_DIR, `bac-nho-${key}.json`);

    // 1. Get latest date from DB
    // Use a fast query to just get the latest draw date
    const latestResult = await queryOne<{ draw_date: string }>(
        'SELECT draw_date FROM xsmb_results ORDER BY draw_date DESC LIMIT 1'
    );

    // Default to today if DB is empty (unlikely)
    const dbLatestDate = latestResult?.draw_date || new Date().toISOString().split('T')[0];

    // 2. Check cache
    let shouldRecalculate = true;
    let cachedData: CachedData<T> | null = null;

    if (fs.existsSync(filePath)) {
        try {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            cachedData = JSON.parse(fileContent);

            // Check if cached data contains the latest date info
            // The cached data structure usually has `overview.latestDate` or we check `lastUpdated`
            // But checking the actual latest analyzed date inside the data is safer.
            // Let's assume T has an overview field or similar, or we just trust the timestamp if it was updated recently.
            // A better approach: The cache wrapper stores `lastUpdated` timestamp, but that doesn't tell us if it includes Today's result.
            // So we really need to check if the cached analysis *covered* dbLatestDate.

            // NOTE: Our calculate scripts store: { lastUpdated: string, data: ... }
            // And inside data (BacNhoData), there is overview.latestDate

            if (cachedData && (cachedData.data as any).overview?.latestDate === dbLatestDate) {
                shouldRecalculate = false;
            } else {
                console.log(`[BacNhoCache] Cache stale for ${key}. DB: ${dbLatestDate}, Cache: ${(cachedData?.data as any)?.overview?.latestDate}`);
            }

        } catch (e) {
            console.error(`[BacNhoCache] Error reading cache for ${key}, forcing refresh.`, e);
        }
    } else {
        console.log(`[BacNhoCache] No cache for ${key}, calculating...`);
    }

    // 3. Recalculate if needed
    if (shouldRecalculate) {
        console.log(`[BacNhoCache] 🔄 Recalculating ${key} for ${days} days...`);
        try {
            const newData = await calculateFn(days);
            const cachePayload: CachedData<T> = {
                lastUpdated: new Date().toISOString(),
                data: newData
            };

            fs.writeFileSync(filePath, JSON.stringify(cachePayload, null, 2));
            console.log(`[BacNhoCache] ✅ Updated ${key} cache.`);
            return newData;
        } catch (error) {
            console.error(`[BacNhoCache] Calculation failed for ${key}`, error);
            // If recalc fails, try to return stale cache if available
            if (cachedData) return cachedData.data;
            throw error;
        }
    }

    return cachedData!.data;
}
