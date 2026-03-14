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
 * Analyze Bạc Nhớ Số Đơn Khung 3 Ngày
 * Phân tích: Khi số A xuất hiện ở ngày D, số B nào sẽ xuất hiện trong các ngày D+1, D+2, D+3
 */
export async function analyzeBacNhoSoDonKhung3Ngay(days: number = 100, toDate?: string): Promise<BacNhoSoDonData> {
    // Get last N days of results + 10 extra days for the frame check buffer
    let queryStr = 'SELECT * FROM xsmb_results ';
    let params: any[] = [days + 10];

    if (toDate) {
        queryStr += 'WHERE draw_date <= ? ';
        params = [toDate, days + 10];
    }

    queryStr += 'ORDER BY draw_date DESC LIMIT ?';

    const results = await query<LotteryResultRaw[]>(queryStr, params);

    if (results.length < 4) {
        throw new Error('Cần ít nhất 4 ngày dữ liệu để phân tích Bạc Nhớ Khung 3 Ngày');
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

    // Analyze days. We need D+1, D+2, D+3 to exist.
    // So we iterate up to length - 1 (since we need at least D+1).
    // Actually for 3-day frame, we ideally need D+3.
    // If D is the last day (today), we can't check frame.
    // If D is yesterday, we can only check D+1.
    // The "Analysis" is based on HISTORY. So we only update stats for fully completed frames OR partially completed?
    // Usually Bạc Nhớ statistics are built on COMPLETED frames or at least known outcomes.
    // Let's simple check: iterate `i` from 0 to `results.length - 2`.
    // For each `i` (Day D), we look ahead up to 3 days (D+1, D+2, D+3).
    // If D+1 exists, check. If D+2 exists, check.

    const MAX_DISCOVERY_DAYS = 200;
    const discoveryLimit = Math.min(results.length, MAX_DISCOVERY_DAYS);
    const discoveryResults = results.slice(-discoveryLimit);

    for (let i = 0; i < discoveryResults.length - 1; i++) {
        const dayD = discoveryResults[i];

        const frameDays: LotteryResultRaw[] = [];
        if (i + 1 < discoveryResults.length) frameDays.push(discoveryResults[i + 1]);
        if (i + 2 < discoveryResults.length) frameDays.push(discoveryResults[i + 2]);
        if (i + 3 < discoveryResults.length) frameDays.push(discoveryResults[i + 3]);

        if (frameDays.length === 0) continue;

        const numbersD = extractUniqueNumbers(dayD);

        const frameNumbers = new Set<string>();
        frameDays.forEach(fd => {
            extractUniqueNumbers(fd).forEach(n => frameNumbers.add(n));
        });

        numbersD.forEach(triggerNumber => {
            const pattern = patterns.get(triggerNumber);
            if (!pattern) return;

            pattern.totalTriggerAppearances++;

            const hitNumbers: string[] = [];
            frameNumbers.forEach(followNumber => {
                const followTracker = followMap.get(triggerNumber);
                if (followTracker) {
                    followTracker.set(followNumber, (followTracker.get(followNumber) || 0) + 1);
                }
                hitNumbers.push(followNumber);
            });

            if (hitNumbers.length > 0) {
                pattern.lastHitDate = frameDays[0].draw_date;
                pattern.recentHits.push({
                    triggerDate: dayD.draw_date,
                    hitDate: frameDays[0].draw_date,
                    hitNumbers
                });

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
            pattern.followNumbers = followNumbers.filter(f => f.correlationRate >= 75).slice(0, 30);
        }

        if (pattern.lastHitDate) {
            pattern.daysSinceLastHit = daysBetween(pattern.lastHitDate, latestDate);
        }

        if (pattern.followNumbers.length > 0) {
            allPatterns.push(pattern);
        }
    });

    // Get yesterday's numbers for today's predictions
    // If today is T, we predict for T, T+1, T+2 based on T-1 (Yesterday).
    // Actually, "Bạc Nhớ" usually implies: "Today is Day T, results from T-1 triggers T".
    // PHASE 2: Today's Predictions (Scan FULL history only for yesterday's numbers)
    const yesterdayNumbers = extractUniqueNumbers(results[results.length - 1]);
    const todayPredictions: BacNhoSoDonData['todayPredictions'] = [];

    const todayPatternsMap = new Map<string, { total: number, follows: Map<string, number> }>();
    
    for (let i = 0; i < results.length - 4; i++) {
        const d0 = extractUniqueNumbers(results[i]);
        const frameNumbers = new Set<string>();
        [results[i+1], results[i+2], results[i+3]].forEach(res => extractUniqueNumbers(res).forEach(n => frameNumbers.add(n)));

        const match = Array.from(d0).filter(n => yesterdayNumbers.has(n));
        match.forEach(num => {
            if (!todayPatternsMap.has(num)) {
                todayPatternsMap.set(num, { total: 0, follows: new Map() });
            }
            const entry = todayPatternsMap.get(num)!;
            entry.total++;
            frameNumbers.forEach(fn => entry.follows.set(fn, (entry.follows.get(fn) || 0) + 1));
        });
    }

    todayPatternsMap.forEach((entry, num) => {
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
                yesterdayNumber: num,
                predictions: preds
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
        patterns: allPatterns.slice(0, 1000),
        todayPredictions: todayPredictions.slice(0, 200)
    };
}
