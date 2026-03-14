import { query } from './db';
import type { BacNho2NgayData, BacNho2NgayPattern } from '@/types/bac-nho-types';

interface LotteryResultRaw {
    draw_date: string;
    special_prize: string;
    prize_1: string;
    prize_2: string;
    prize_3: string;
    prize_4: string;
    prize_5: string;
    prize_6: string;
    prize_7: string;
}

// Helper: Extract all loto numbers from a result row and remove duplicates
import { extractUniqueLotoNumbers } from './lottery-helpers';

// Calculate days between two dates
function daysBetween(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function pairToKey(pair: [string, string]): string {
    return `${pair[0]}-${pair[1]}`;
}

/**
 * Analyze Bạc Nhớ 2 Ngày - Khung 3 Ngày
 * Logic: When A appears on day i AND B appears on day i+1, 
 * what numbers appear in the 3-day frame: i+2, i+3, i+4?
 */
export async function analyzeBacNho2NgayKhung3Ngay(days: number = 100, toDate?: string): Promise<BacNho2NgayData> {
    // Stricter pruning for frame analysis as it generates more data
    const minAppearances = days > 500 ? 2 : 1;

    // Get last N days of results + 10 extra days for the frame check buffer
    let queryStr = 'SELECT * FROM xsmb_results ';
    let params: any[] = [days + 10];

    if (toDate) {
        queryStr += 'WHERE draw_date <= ? ';
        params = [toDate, days + 10];
    }

    queryStr += 'ORDER BY draw_date DESC LIMIT ?';

    const results = await query<LotteryResultRaw[]>(queryStr, params);

    if (results.length < 5) {
        throw new Error('Cần ít nhất 5 ngày dữ liệu để phân tích Bạc Nhớ Khung 3 Ngày');
    }

    // Reverse to have oldest first
    results.reverse();

    const latestDate = results[results.length - 1].draw_date;
    const oldestDate = results[0].draw_date;

    const patterns = new Map<string, BacNho2NgayPattern>();
    const followMap = new Map<string, Map<string, number>>();
    let allPatterns: BacNho2NgayPattern[] = [];
    const MAX_DISCOVERY_DAYS = 200;
    const discoveryLimit = Math.min(results.length, MAX_DISCOVERY_DAYS);
    const discoveryResults = results.slice(-discoveryLimit);

    // Analyze consecutive days (i, i+1, i+2, i+3, i+4)
    for (let i = 0; i < discoveryResults.length - 4; i++) {
        const dayI = discoveryResults[i];
        const dayI1 = discoveryResults[i + 1];

        const frameDays: LotteryResultRaw[] = [];
        if (i + 2 < discoveryResults.length) frameDays.push(discoveryResults[i + 2]);
        if (i + 3 < discoveryResults.length) frameDays.push(discoveryResults[i + 3]);
        if (i + 4 < discoveryResults.length) frameDays.push(discoveryResults[i + 4]);

        if (frameDays.length === 0) continue;

        const numbersI = Array.from(extractUniqueLotoNumbers(dayI));
        const numbersI1 = Array.from(extractUniqueLotoNumbers(dayI1));

        const frameNumbers = new Set<string>();
        frameDays.forEach(fd => extractUniqueLotoNumbers(fd).forEach(n => frameNumbers.add(n)));

        for (const numA of numbersI) {
            for (const numB of numbersI1) {
                const pair: [string, string] = [numA, numB];
                const pairKey = pairToKey(pair);

                if (!patterns.has(pairKey)) {
                    patterns.set(pairKey, {
                        triggerPair: pair,
                        totalAppearances: 0,
                        followNumbers: [],
                        recentHits: [],
                        daysSinceLastHit: null,
                        lastHitDate: null
                    });
                    followMap.set(pairKey, new Map<string, number>());
                }

                const pattern = patterns.get(pairKey)!;
                pattern.totalAppearances++;

                const hitNumbers = Array.from(frameNumbers);
                const followTracker = followMap.get(pairKey)!;

                frameNumbers.forEach(followNumber => {
                    followTracker.set(followNumber, (followTracker.get(followNumber) || 0) + 1);
                });

                if (hitNumbers.length > 0) {
                    pattern.lastHitDate = frameDays[0].draw_date;
                    pattern.recentHits.push({
                        dayDMinus1: dayI.draw_date,
                        dayD: dayI1.draw_date,
                        dayDPlus1: frameDays[0].draw_date,
                        hitNumbers: hitNumbers.slice(0, 20)
                    });

                    if (pattern.recentHits.length > 10) {
                        pattern.recentHits.shift();
                    }
                }
            }
        }
    }

    // Build followNumbers arrays with correlation rates

    // Filter patterns below threshold before heavy calculation
    const relevantPatterns = Array.from(patterns.values()).filter(p => p.totalAppearances >= minAppearances);

    relevantPatterns.forEach(pattern => {
        const pairKey = pairToKey(pattern.triggerPair);
        const followTracker = followMap.get(pairKey);

        if (followTracker && pattern.totalAppearances > 0) {
            const followNumbers: BacNho2NgayPattern['followNumbers'] = [];

            followTracker.forEach((hitCount, number) => {
                const correlationRate = (hitCount / pattern.totalAppearances) * 100;
                followNumbers.push({ number, hitCount, correlationRate });
            });

            followNumbers.sort((a, b) => b.correlationRate - a.correlationRate);
            pattern.followNumbers = followNumbers.filter(f => f.correlationRate >= 75).slice(0, 30);
        }

        if (pattern.lastHitDate) {
            pattern.daysSinceLastHit = daysBetween(pattern.lastHitDate, latestDate);
        }
        
        if (pattern.followNumbers.length > 0) {
            allPatterns.push(pattern);
        }
    });

    // Sort by total appearances and limit to 2000 patterns
    allPatterns.sort((a, b) => b.totalAppearances - a.totalAppearances);
    allPatterns = allPatterns.slice(0, 2000);

    // Get today's and yesterday's numbers for predictions
    if (results.length >= 2) {
        const dayDMinus1 = results[results.length - 2];
        const dayD = results[results.length - 1];

        const numbersDMinus1 = Array.from(extractUniqueLotoNumbers(dayDMinus1));
        const numbersD = Array.from(extractUniqueLotoNumbers(dayD));

        const todayPredictions: BacNho2NgayData['todayPredictions'] = [];
        const yesterdayPairsSet = new Set(numbersDMinus1.flatMap(a => numbersD.map(b => `${a}-${b}`)));
        const todayPatternsMap = new Map<string, { pair: [string, string], total: number, follows: Map<string, number> }>();

        // Scan FULL history ONLY for patterns matching yesterday's trigger
        for (let i = 0; i < results.length - 4; i++) {
            const d0 = extractUniqueLotoNumbers(results[i]);
            const d1 = extractUniqueLotoNumbers(results[i+1]);
            
            const frameNumbers = new Set<string>();
            [results[i+2], results[i+3], results[i+4]].forEach(res => extractUniqueLotoNumbers(res).forEach(n => frameNumbers.add(n)));

            const match0 = Array.from(d0).filter(n => numbersDMinus1.includes(n));
            const match1 = Array.from(d1).filter(n => numbersD.includes(n));

            if (match0.length > 0 && match1.length > 0) {
                for (const a of match0) {
                    for (const b of match1) {
                        const key = `${a}-${b}`;
                        if (!todayPatternsMap.has(key)) {
                            todayPatternsMap.set(key, { pair: [a, b], total: 0, follows: new Map() });
                        }
                        const entry = todayPatternsMap.get(key)!;
                        entry.total++;
                        frameNumbers.forEach(fn => entry.follows.set(fn, (entry.follows.get(fn) || 0) + 1));
                    }
                }
            }
        }

        todayPatternsMap.forEach(entry => {
            const preds = Array.from(entry.follows.entries())
                .map(([number, hitCount]) => ({
                    number,
                    hitCount,
                    correlationRate: (hitCount / entry.total) * 100,
                    totalAppearances: entry.total
                }))
                .filter(p => p.correlationRate >= 50)
                .sort((a, b) => b.correlationRate - a.correlationRate)
                .slice(0, 10);

            if (preds.length > 0) {
                todayPredictions.push({
                    yesterdayPair: entry.pair,
                    predictions: preds
                });
            }
        });

        todayPredictions.sort((a, b) => (b.predictions[0]?.correlationRate || 0) - (a.predictions[0]?.correlationRate || 0));

        return {
            overview: {
                analyzedDays: results.length,
                totalPatterns: allPatterns.length,
                latestDate,
                dataRange: {
                    from: oldestDate,
                    to: latestDate
                }
            },
            patterns: allPatterns,
            todayPredictions: todayPredictions.slice(0, 200)
        };
    }

    // Fallback if not enough data for predictions
    return {
        overview: {
            analyzedDays: results.length,
            totalPatterns: allPatterns.length,
            latestDate,
            dataRange: {
                from: oldestDate,
                to: latestDate
            }
        },
        patterns: allPatterns,
        todayPredictions: []
    };
}
