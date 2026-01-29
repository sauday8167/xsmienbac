import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const CACHE_DIR = join(process.cwd(), 'src/data/cache');

export async function getCache<T>(key: string, latestResultDate: string): Promise<T | null> {
    const filePath = join(CACHE_DIR, `${key}.json`);
    if (!existsSync(filePath)) return null;

    try {
        const data = JSON.parse(await readFile(filePath, 'utf8'));
        // Only return if the cache is still valid (not older than the latest lottery result)
        if (data.latestDate === latestResultDate) {
            return data.results as T;
        }
    } catch (e) {
        console.error('Cache read error:', e);
    }
    return null;
}

export async function setCache(key: string, latestDate: string, results: any): Promise<void> {
    if (!existsSync(CACHE_DIR)) {
        await mkdir(CACHE_DIR, { recursive: true });
    }

    const filePath = join(CACHE_DIR, `${key}.json`);
    try {
        await writeFile(filePath, JSON.stringify({ latestDate, results }));
    } catch (e) {
        console.error('Cache write error:', e);
    }
}
