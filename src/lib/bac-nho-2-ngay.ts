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
 * Analyze Bạc Nhớ 2 Ngày
 * Logic: When A appears on day i AND B appears on day i+1, 
 * what numbers appear on day i+2?
 */
export async function analyzeBacNho2Ngay(days: number = 100, toDate?: string): Promise<BacNho2NgayData> {
    // Pruning for performance - pairs appearing only once are likely noise
    const minAppearances = days > 500 ? 2 : 1;

    // Get results up to toDate
    let queryStr = 'SELECT * FROM xsmb_results ';
    let params: any[] = [days];

    if (toDate) {
        queryStr += 'WHERE draw_date <= ? ';
        params = [toDate, days];
    }

    queryStr += 'ORDER BY draw_date DESC LIMIT ?';

    const results = await query<LotteryResultRaw[]>(queryStr, params);

    if (results.length < 3) {
        throw new Error('Cần ít nhất 3 ngày dữ liệu để phân tích Bạc Nhớ 2 Ngày');
    }

    // Reverse to have oldest first
    results.reverse();

    const latestDate = results[results.length - 1].draw_date;
    const oldestDate = results[0].draw_date;

    // Map to store patterns: pairKey -> pattern data
    const patterns = new Map<string, BacNho2NgayPattern>();
    // Map to track follow numbers for each pair
    const followMap = new Map<string, Map<string, number>>();

    // Analyze consecutive days (i, i+1, i+2)
    // We need i+2 to exist, so we iterate up to length - 2
    for (let i = 0; i < results.length - 2; i++) {
        const dayI = results[i];      // Day with A
        const dayI1 = results[i + 1];  // Day with B
        const dayI2 = results[i + 2];  // Day to predict

        const numbersI = Array.from(extractUniqueLotoNumbers(dayI));
        const numbersI1 = Array.from(extractUniqueLotoNumbers(dayI1));
        const numbersI2 = Array.from(extractUniqueLotoNumbers(dayI2));

        // Create all AB pairs (A from day i, B from day i+1)
        for (const numA of numbersI) {
            for (const numB of numbersI1) {
                const pair: [string, string] = [numA, numB];
                const pairKey = pairToKey(pair);

                // Initialize pattern if not exists
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

                // Track which numbers appear on day i+2
                const hitNumbers: string[] = [];
                const followTracker = followMap.get(pairKey)!;

                numbersI2.forEach(followNumber => {
                    followTracker.set(followNumber, (followTracker.get(followNumber) || 0) + 1);
                    hitNumbers.push(followNumber);
                });

                // Record this occurrence
                if (hitNumbers.length > 0) {
                    pattern.lastHitDate = dayI2.draw_date;
                    pattern.recentHits.push({
                        dayDMinus1: dayI.draw_date,
                        dayD: dayI1.draw_date,
                        dayDPlus1: dayI2.draw_date,
                        hitNumbers
                    });

                    // Keep only last 10 hits
                    if (pattern.recentHits.length > 10) {
                        pattern.recentHits.shift();
                    }
                }
            }
        }
    }

    // Build followNumbers arrays with correlation rates
    let allPatterns: BacNho2NgayPattern[] = [];

    // Filter patterns below threshold before heavy calculation
    const relevantPatterns = Array.from(patterns.values()).filter(p => p.totalAppearances >= minAppearances);

    relevantPatterns.forEach(pattern => {
        const pairKey = pairToKey(pattern.triggerPair);
        const followTracker = followMap.get(pairKey);

        if (followTracker && pattern.totalAppearances > 0) {
            const followNumbers: BacNho2NgayPattern['followNumbers'] = [];

            followTracker.forEach((hitCount, number) => {
                const correlationRate = (hitCount / pattern.totalAppearances) * 100;
                followNumbers.push({
                    number,
                    hitCount,
                    correlationRate
                });
            });

            // Sort by correlation rate descending and limit to top 50
            followNumbers.sort((a, b) => b.correlationRate - a.correlationRate);
            pattern.followNumbers = followNumbers.slice(0, 50);
        }

        if (pattern.lastHitDate) {
            pattern.daysSinceLastHit = daysBetween(pattern.lastHitDate, latestDate);
        }

        allPatterns.push(pattern);
    });

    // Sort by total appearances and limit to 2000 patterns
    allPatterns.sort((a, b) => b.totalAppearances - a.totalAppearances);
    allPatterns = allPatterns.slice(0, 2000);

    // Get yesterday's and day-before-yesterday's numbers for today's predictions
    if (results.length >= 2) {
        const dayDMinus1 = results[results.length - 2];
        const dayD = results[results.length - 1];

        const numbersDMinus1 = Array.from(extractUniqueLotoNumbers(dayDMinus1));
        const numbersD = Array.from(extractUniqueLotoNumbers(dayD));

        const todayPredictions: BacNho2NgayData['todayPredictions'] = [];

        // Create all pairs from (D-1, D)
        for (const numA of numbersDMinus1) {
            for (const numB of numbersD) {
                const pair: [string, string] = [numA, numB];
                const pairKey = pairToKey(pair);
                const pattern = patterns.get(pairKey);

                if (pattern && pattern.followNumbers.length > 0) {
                    todayPredictions.push({
                        yesterdayPair: pair,
                        predictions: pattern.followNumbers.slice(0, 10).map(fn => ({
                            number: fn.number,
                            correlationRate: fn.correlationRate,
                            hitCount: fn.hitCount,
                            totalAppearances: pattern.totalAppearances
                        }))
                    });
                }
            }
        }

        // Sort predictions by highest correlation rate
        todayPredictions.sort((a, b) => {
            const maxA = a.predictions[0]?.correlationRate || 0;
            const maxB = b.predictions[0]?.correlationRate || 0;
            return maxB - maxA;
        });

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
            todayPredictions
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
