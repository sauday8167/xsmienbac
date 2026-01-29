import { query } from './db';
import type { BacNhoSoDonData, BacNhoSoDonPattern } from '@/types/bac-nho-types';

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

// Helper: Extract all loto numbers from a result row and remove duplicates
// Replaced by shared helper
const extractUniqueNumbers = extractUniqueLotoNumbers;

// Calculate days between two dates
function daysBetween(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Analyze Bạc Nhớ Số Đơn
 * Phân tích: Khi số A xuất hiện ở ngày D, số B nào sẽ xuất hiện ở ngày D+1
 */
export async function analyzeBacNhoSoDon(days: number = 100, toDate?: string): Promise<BacNhoSoDonData> {
    // Get results up to toDate
    let queryStr = 'SELECT * FROM xsmb_results ';
    let params: any[] = [days];

    if (toDate) {
        queryStr += 'WHERE draw_date <= ? ';
        params = [toDate, days];
    }

    queryStr += 'ORDER BY draw_date DESC LIMIT ?';

    const results = await query<LotteryResultRaw[]>(queryStr, params);

    if (results.length < 2) {
        throw new Error('Cần ít nhất 2 ngày dữ liệu để phân tích Bạc Nhớ Số Đơn');
    }

    // Reverse to have oldest first
    results.reverse();

    const latestDate = results[results.length - 1].draw_date;
    const oldestDate = results[0].draw_date;

    // Initialize patterns for all numbers 00-99
    const patterns = new Map<string, BacNhoSoDonPattern>();

    for (let i = 0; i < 100; i++) {
        const triggerNumber = i.toString().padStart(2, '0');

        patterns.set(triggerNumber, {
            triggerNumber,
            totalTriggerAppearances: 0,
            followNumbers: [],
            recentHits: [],
            daysSinceLastHit: null,
            lastHitDate: null
        });
    }

    // Track follow numbers for each trigger
    const followMap = new Map<string, Map<string, number>>();

    // Initialize follow maps
    for (let i = 0; i < 100; i++) {
        const num = i.toString().padStart(2, '0');
        followMap.set(num, new Map<string, number>());
    }

    // Analyze consecutive days (exclude last day since we need D+1)
    for (let i = 0; i < results.length - 1; i++) {
        const dayD = results[i];
        const dayD1 = results[i + 1];

        const numbersD = extractUniqueNumbers(dayD);
        const numbersD1 = extractUniqueNumbers(dayD1);

        // For each trigger number on day D
        numbersD.forEach(triggerNumber => {
            const pattern = patterns.get(triggerNumber);
            if (!pattern) return;

            pattern.totalTriggerAppearances++;

            // Track which numbers appear on day D+1
            const hitNumbers: string[] = [];
            numbersD1.forEach(followNumber => {
                const followTracker = followMap.get(triggerNumber);
                if (followTracker) {
                    followTracker.set(followNumber, (followTracker.get(followNumber) || 0) + 1);
                }
                hitNumbers.push(followNumber);
            });

            // Record this occurrence
            if (hitNumbers.length > 0) {
                pattern.lastHitDate = dayD1.draw_date;
                pattern.recentHits.push({
                    triggerDate: dayD.draw_date,
                    hitDate: dayD1.draw_date,
                    hitNumbers
                });

                // Keep only last 10 hits
                if (pattern.recentHits.length > 10) {
                    pattern.recentHits.shift();
                }
            }
        });
    }

    // Build followNumbers arrays with correlation rates
    const allPatterns: BacNhoSoDonPattern[] = [];

    patterns.forEach(pattern => {
        const followTracker = followMap.get(pattern.triggerNumber);
        if (followTracker && pattern.totalTriggerAppearances > 0) {
            const followNumbers: BacNhoSoDonPattern['followNumbers'] = [];

            followTracker.forEach((hitCount, number) => {
                const correlationRate = (hitCount / pattern.totalTriggerAppearances) * 100;
                followNumbers.push({
                    number,
                    hitCount,
                    correlationRate
                });
            });

            // Sort by correlation rate descending
            followNumbers.sort((a, b) => b.correlationRate - a.correlationRate);
            pattern.followNumbers = followNumbers;
        }

        if (pattern.lastHitDate) {
            pattern.daysSinceLastHit = daysBetween(pattern.lastHitDate, latestDate);
        }

        allPatterns.push(pattern);
    });

    // Get yesterday's numbers for today's predictions
    const yesterdayNumbers = extractUniqueNumbers(results[results.length - 1]);
    const todayPredictions: BacNhoSoDonData['todayPredictions'] = [];

    yesterdayNumbers.forEach(num => {
        const pattern = patterns.get(num);
        if (pattern && pattern.followNumbers.length > 0) {
            todayPredictions.push({
                yesterdayNumber: num,
                predictions: pattern.followNumbers.slice(0, 10).map(fn => ({
                    number: fn.number,
                    correlationRate: fn.correlationRate,
                    hitCount: fn.hitCount,
                    totalAppearances: pattern.totalTriggerAppearances
                }))
            });
        }
    });

    // Sort predictions by highest correlation rate
    todayPredictions.sort((a, b) => {
        const maxA = a.predictions[0]?.correlationRate || 0;
        const maxB = b.predictions[0]?.correlationRate || 0;
        return maxB - maxA;
    });

    return {
        overview: {
            analyzedDays: results.length,
            totalPatterns: allPatterns.filter(p => p.totalTriggerAppearances > 0).length,
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
