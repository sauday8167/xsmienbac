import { query } from './db';
import type { BacNhoCap3Data, BacNhoCap3Pattern } from '@/types/bac-nho-types';

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

function generateTriples(numbers: string[]): [string, string, string][] {
    const triples: [string, string, string][] = [];
    for (let i = 0; i < numbers.length; i++) {
        for (let j = i + 1; j < numbers.length; j++) {
            for (let k = j + 1; k < numbers.length; k++) {
                const triple = [numbers[i], numbers[j], numbers[k]].sort();
                triples.push([triple[0], triple[1], triple[2]]);
            }
        }
    }
    return triples;
}

function daysBetween(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function tripleToKey(triple: [string, string, string]): string {
    return `${triple[0]}-${triple[1]}-${triple[2]}`;
}

export async function analyzeBacNhoCap3Khung3Ngay(days: number = 100, toDate?: string): Promise<BacNhoCap3Data> {
    // For Khung 3 Ngay, we need even stricter pruning as it generates more hits
    // Triples in frame are more common but still rare.
    // We require at least 2 appearances for 1000 days to avoid massive noise.
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
    if (results.length < 4) throw new Error('Cần ít nhất 4 ngày dữ liệu');
    results.reverse();

    const latestDate = results[results.length - 1].draw_date;
    const oldestDate = results[0].draw_date;
    const patterns = new Map<string, BacNhoCap3Pattern>();
    // Optimization: Use Uint16Array instead of Map<string, number> for follow frequencies.
    // There are only 100 possible follow numbers (00-99).
    // 161,700 patterns * 100 * 2 bytes = ~32MB RAM (vs ~1.5GB with Maps)
    const followMap = new Map<string, Uint16Array>();

    for (let i = 0; i < results.length - 1; i++) {
        const dayD = results[i];
        const frameDays: LotteryResultRaw[] = [];
        if (i + 1 < results.length) frameDays.push(results[i + 1]);
        if (i + 2 < results.length) frameDays.push(results[i + 2]);
        if (i + 3 < results.length) frameDays.push(results[i + 3]);

        if (frameDays.length === 0) continue;

        const numbersD = Array.from(extractUniqueNumbers(dayD));
        const triples = generateTriples(numbersD);

        const frameNumbers = new Set<string>();
        frameDays.forEach(fd => extractUniqueNumbers(fd).forEach(n => frameNumbers.add(n)));

        triples.forEach(triple => {
            const tripleKey = tripleToKey(triple);
            if (!patterns.has(tripleKey)) {
                patterns.set(tripleKey, {
                    triggerTriple: triple,
                    totalTriggerAppearances: 0,
                    followNumbers: [],
                    recentHits: [],
                    daysSinceLastHit: null,
                    lastHitDate: null
                });
                followMap.set(tripleKey, new Uint16Array(100)); // Index 0-99
            }

            const pattern = patterns.get(tripleKey)!;
            pattern.totalTriggerAppearances++;

            const hitNumbers: string[] = [];
            const followTracker = followMap.get(tripleKey)!;

            frameNumbers.forEach(followNumber => {
                const numIdx = parseInt(followNumber, 10);
                if (!isNaN(numIdx) && numIdx >= 0 && numIdx < 100) {
                    followTracker[numIdx]++;
                    hitNumbers.push(followNumber);
                }
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

    const allPatterns: BacNhoCap3Pattern[] = [];
    patterns.forEach((pattern, key) => {
        // Pruning for performance
        if (pattern.totalTriggerAppearances < minAppearances) {
            return;
        }

        const followTracker = followMap.get(key);
        if (followTracker && pattern.totalTriggerAppearances > 0) {
            const followNumbers: BacNhoCap3Pattern['followNumbers'] = [];

            // Iterate through the array (0-99)
            for (let num = 0; num < 100; num++) {
                const hitCount = followTracker[num];
                if (hitCount > 0) {
                    const correlationRate = (hitCount / pattern.totalTriggerAppearances) * 100;
                    const numberStr = num.toString().padStart(2, '0');
                    followNumbers.push({ number: numberStr, hitCount, correlationRate });
                }
            }

            followNumbers.sort((a, b) => b.correlationRate - a.correlationRate);
            pattern.followNumbers = followNumbers;
        }
        if (pattern.lastHitDate) pattern.daysSinceLastHit = daysBetween(pattern.lastHitDate, latestDate);
        allPatterns.push(pattern);
    });

    allPatterns.sort((a, b) => b.totalTriggerAppearances - a.totalTriggerAppearances);

    // Filter to reduce payload size - CAP 3 generates too many combinations
    // Only return patterns that have appeared at least 2 times OR have very high correlation (>80% on 1st appearance)
    // Actually, to be safe for JSON stringify, we should strictly limit.
    // Let's keep patterns with >= 2 appearances.
    const optimizedPatterns = allPatterns
        .filter(p => p.totalTriggerAppearances >= minAppearances)
        .map(p => ({
            ...p,
            followNumbers: p.followNumbers.slice(0, 50), // Keep top 50 follow numbers only
            recentHits: p.recentHits.slice(0, 5) // Limit recent hits history
        }))
        .sort((a, b) => b.totalTriggerAppearances - a.totalTriggerAppearances)
        .slice(0, 2000); // Limit total patterns

    const yesterdayNumbers = Array.from(extractUniqueNumbers(results[results.length - 1]));
    const yesterdayTriples = generateTriples(yesterdayNumbers);
    const todayPredictions: BacNhoCap3Data['todayPredictions'] = [];

    yesterdayTriples.forEach(triple => {
        const tripleKey = tripleToKey(triple);
        const pattern = patterns.get(tripleKey);
        // For predictions we might want data even if it appeared once?
        // But if we filtered above, we can't get it from the array.
        // But 'patterns' map still has it.
        if (pattern && pattern.followNumbers.length > 0) {
            todayPredictions.push({
                yesterdayTriple: triple,
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
            totalPatterns: optimizedPatterns.length,
            latestDate,
            dataRange: { from: oldestDate, to: latestDate }
        },
        patterns: optimizedPatterns,
        todayPredictions
    };
}
