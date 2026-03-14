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
    const allPatterns: BacNhoCap2Pattern[] = [];
    const MAX_DISCOVERY_DAYS = 200;
    const discoveryLimit = Math.min(results.length, MAX_DISCOVERY_DAYS);
    const discoveryResults = results.slice(-discoveryLimit);

    for (let i = 0; i < discoveryResults.length - 3; i++) {
        const dayD = discoveryResults[i];

        const frameDays: LotteryResultRaw[] = [];
        if (i + 1 < discoveryResults.length) frameDays.push(discoveryResults[i + 1]);
        if (i + 2 < discoveryResults.length) frameDays.push(discoveryResults[i + 2]);
        if (i + 3 < discoveryResults.length) frameDays.push(discoveryResults[i + 3]);

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

    patterns.forEach(pattern => {
        // Pruning for performance
        if (pattern.totalTriggerAppearances < 3) {
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
            pattern.followNumbers = followNumbers.filter(f => f.correlationRate >= 75).slice(0, 30);
        }
        if (pattern.lastHitDate) pattern.daysSinceLastHit = daysBetween(pattern.lastHitDate, latestDate);
        if (pattern.followNumbers.length > 0) {
            allPatterns.push(pattern);
        }
    });

    allPatterns.sort((a, b) => (b.followNumbers[0]?.correlationRate || 0) - (a.followNumbers[0]?.correlationRate || 0));

    // --- PHASE 2: Today's Predictions (Scan FULL history only for relevant pairs) ---
    const yesterdayNumbers = Array.from(extractUniqueNumbers(results[results.length - 1]));
    const yesterdayPairs = generatePairs(yesterdayNumbers);
    const todayPredictions: BacNhoCap2Data['todayPredictions'] = [];

    const yesterdayPairsSet = new Set(yesterdayPairs.map(p => pairToKey(p)));
    const todayPatternsMap = new Map<string, { pair: [string, string], total: number, follows: Map<string, number> }>();

    for (let i = 0; i < results.length - 4; i++) {
        const d = results[i];
        const nums = Array.from(extractUniqueNumbers(d));
        const pairs = generatePairs(nums);
        
        const frameNumbers = new Set<string>();
        [results[i+1], results[i+2], results[i+3]].forEach(res => extractUniqueNumbers(res).forEach(n => frameNumbers.add(n)));

        pairs.forEach(p => {
            const key = pairToKey(p);
            if (yesterdayPairsSet.has(key)) {
                if (!todayPatternsMap.has(key)) {
                    todayPatternsMap.set(key, { pair: p, total: 0, follows: new Map<string, number>() });
                }
                const entry = todayPatternsMap.get(key)!;
                entry.total++;
                frameNumbers.forEach(fn => entry.follows.set(fn, (entry.follows.get(fn) || 0) + 1));
            }
        });
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
            dataRange: { from: oldestDate, to: latestDate }
        },
        patterns: allPatterns.slice(0, 500),
        todayPredictions: todayPredictions.slice(0, 100)
    };
}
