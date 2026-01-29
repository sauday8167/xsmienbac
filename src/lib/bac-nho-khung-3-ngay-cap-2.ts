import { query } from './db';
import type { BacNhoCap2Data, BacNhoCap2Pattern } from '@/types/bac-nho-types';

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

function extractUniqueNumbers(result: LotteryResultRaw): Set<string> {
    const numbers = new Set<string>();
    if (result.special_prize) numbers.add(result.special_prize.slice(-2).padStart(2, '0'));
    if (result.prize_1) numbers.add(result.prize_1.slice(-2).padStart(2, '0'));
    [result.prize_2, result.prize_3, result.prize_4, result.prize_5, result.prize_6, result.prize_7].forEach(prizeJson => {
        try {
            const prizeArray = JSON.parse(prizeJson);
            if (Array.isArray(prizeArray)) prizeArray.forEach(num => num && numbers.add(num.slice(-2).padStart(2, '0')));
        } catch (e) { }
    });
    return numbers;
}

function generatePairs(numbers: string[]): [string, string][] {
    const pairs: [string, string][] = [];
    for (let i = 0; i < numbers.length; i++) {
        for (let j = i + 1; j < numbers.length; j++) {
            const pair: [string, string] = numbers[i] < numbers[j] ? [numbers[i], numbers[j]] : [numbers[j], numbers[i]];
            pairs.push(pair);
        }
    }
    return pairs;
}

function daysBetween(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function pairToKey(pair: [string, string]): string {
    return `${pair[0]}-${pair[1]}`;
}

export async function analyzeBacNhoCap2Khung3Ngay(days: number = 100, toDate?: string): Promise<BacNhoCap2Data> {
    // Stricter pruning for frame analysis
    const minAppearances = days > 500 ? 5 : (days > 200 ? 3 : 1);

    // Get last N days of results + 10 extra days for the frame check buffer
    let queryStr = 'SELECT * FROM xsmb_results ';
    let params: any[] = [days + 10];

    if (toDate) {
        queryStr += 'WHERE draw_date <= ? ';
        params = [toDate, days + 10];
    }

    queryStr += 'ORDER BY draw_date DESC LIMIT ?';

    const results = await query<LotteryResultRaw[]>(queryStr, params);
    if (results.length < 4) throw new Error('Cần ít nhất 4 ngày dữ liệu');
    results.reverse();

    const latestDate = results[results.length - 1].draw_date;
    const oldestDate = results[0].draw_date;
    const patterns = new Map<string, BacNhoCap2Pattern>();
    const followMap = new Map<string, Map<string, number>>();

    for (let i = 0; i < results.length - 1; i++) {
        const dayD = results[i];

        const frameDays: LotteryResultRaw[] = [];
        if (i + 1 < results.length) frameDays.push(results[i + 1]);
        if (i + 2 < results.length) frameDays.push(results[i + 2]);
        if (i + 3 < results.length) frameDays.push(results[i + 3]);

        if (frameDays.length === 0) continue;

        const numbersD = Array.from(extractUniqueNumbers(dayD));
        const pairs = generatePairs(numbersD);

        const frameNumbers = new Set<string>();
        frameDays.forEach(fd => extractUniqueNumbers(fd).forEach(n => frameNumbers.add(n)));

        pairs.forEach(pair => {
            const pairKey = pairToKey(pair);
            if (!patterns.has(pairKey)) {
                patterns.set(pairKey, {
                    triggerPair: pair,
                    totalTriggerAppearances: 0,
                    followNumbers: [],
                    recentHits: [],
                    daysSinceLastHit: null,
                    lastHitDate: null
                });
                followMap.set(pairKey, new Map<string, number>());
            }

            const pattern = patterns.get(pairKey)!;
            pattern.totalTriggerAppearances++;

            const hitNumbers: string[] = [];
            frameNumbers.forEach(followNumber => {
                const followTracker = followMap.get(pairKey)!;
                followTracker.set(followNumber, (followTracker.get(followNumber) || 0) + 1);
                hitNumbers.push(followNumber);
            });

            if (hitNumbers.length > 0) {
                pattern.lastHitDate = frameDays[0].draw_date;
                pattern.recentHits.push({
                    triggerDate: dayD.draw_date,
                    hitDate: frameDays[0].draw_date,
                    hitNumbers
                });
                if (pattern.recentHits.length > 10) pattern.recentHits.shift();
            }
        });
    }

    const allPatterns: BacNhoCap2Pattern[] = [];
    patterns.forEach(pattern => {
        // Pruning for performance
        if (pattern.totalTriggerAppearances < minAppearances) {
            return;
        }

        const pairKey = pairToKey(pattern.triggerPair);
        const followTracker = followMap.get(pairKey);
        if (followTracker && pattern.totalTriggerAppearances > 0) {
            const followNumbers: BacNhoCap2Pattern['followNumbers'] = [];
            followTracker.forEach((hitCount, number) => {
                const correlationRate = (hitCount / pattern.totalTriggerAppearances) * 100;
                followNumbers.push({ number, hitCount, correlationRate });
            });
            followNumbers.sort((a, b) => b.correlationRate - a.correlationRate);
            pattern.followNumbers = followNumbers;
        }
        if (pattern.lastHitDate) pattern.daysSinceLastHit = daysBetween(pattern.lastHitDate, latestDate);
        allPatterns.push(pattern);
    });

    allPatterns.sort((a, b) => b.totalTriggerAppearances - a.totalTriggerAppearances);

    const yesterdayNumbers = Array.from(extractUniqueNumbers(results[results.length - 1]));
    const yesterdayPairs = generatePairs(yesterdayNumbers);
    const todayPredictions: BacNhoCap2Data['todayPredictions'] = [];

    yesterdayPairs.forEach(pair => {
        const pairKey = pairToKey(pair);
        const pattern = patterns.get(pairKey);
        if (pattern && pattern.followNumbers.length > 0) {
            todayPredictions.push({
                yesterdayPair: pair,
                predictions: pattern.followNumbers.slice(0, 10).map(fn => ({
                    number: fn.number,
                    correlationRate: fn.correlationRate,
                    hitCount: fn.hitCount,
                    totalAppearances: pattern.totalTriggerAppearances
                }))
            });
        }
    });

    todayPredictions.sort((a, b) => (b.predictions[0]?.correlationRate || 0) - (a.predictions[0]?.correlationRate || 0));

    return {
        overview: {
            analyzedDays: results.length,
            totalPatterns: allPatterns.length,
            latestDate,
            dataRange: { from: oldestDate, to: latestDate }
        },
        patterns: allPatterns,
        todayPredictions
    };
}
