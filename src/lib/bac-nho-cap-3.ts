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

// Helper: Extract all loto numbers from a result row and remove duplicates
function extractUniqueNumbers(result: LotteryResultRaw): Set<string> {
    const numbers = new Set<string>();

    if (result.special_prize) {
        numbers.add(result.special_prize.slice(-2).padStart(2, '0'));
    }

    if (result.prize_1) {
        numbers.add(result.prize_1.slice(-2).padStart(2, '0'));
    }

    [result.prize_2, result.prize_3, result.prize_4, result.prize_5, result.prize_6, result.prize_7].forEach(prizeJson => {
        try {
            const prizeArray = JSON.parse(prizeJson);
            if (Array.isArray(prizeArray)) {
                prizeArray.forEach(num => {
                    if (num) {
                        numbers.add(num.slice(-2).padStart(2, '0'));
                    }
                });
            }
        } catch (e) {
            // Skip invalid JSON
        }
    });

    return numbers;
}

// Generate all triples (combinations) from an array
function generateTriples(numbers: string[]): [string, string, string][] {
    const triples: [string, string, string][] = [];
    for (let i = 0; i < numbers.length; i++) {
        for (let j = i + 1; j < numbers.length; j++) {
            for (let k = j + 1; k < numbers.length; k++) {
                // Sort triple to ensure consistency
                const triple = [numbers[i], numbers[j], numbers[k]].sort();
                triples.push([triple[0], triple[1], triple[2]]);
            }
        }
    }
    return triples;
}

// Calculate days between two dates
function daysBetween(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Convert triple to string key for map
function tripleToKey(triple: [string, string, string]): string {
    return `${triple[0]}-${triple[1]}-${triple[2]}`;
}

/**
 * Analyze Bạc Nhớ Cặp 3
 * Phân tích: Khi cặp A+B+C cùng xuất hiện ở ngày D, số D nào sẽ xuất hiện ở ngày D+1
 */
export async function analyzeBacNhoCap3(days: number = 100, toDate?: string): Promise<BacNhoCap3Data> {
    // For 1000 days, triples found only once are mostly noise and cause memory issues.
    // We prune intensely if days is large.
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

    if (results.length < 2) {
        throw new Error('Cần ít nhất 2 ngày dữ liệu để phân tích Bạc Nhớ Cặp 3');
    }

    // Reverse to have oldest first
    results.reverse();

    const latestDate = results[results.length - 1].draw_date;
    const oldestDate = results[0].draw_date;

    // Map to store patterns: key = "num1-num2-num3", value = pattern
    const patterns = new Map<string, BacNhoCap3Pattern>();

    // Track follow numbers for each triple
    const followMap = new Map<string, Map<string, number>>();

    // Analyze consecutive days (exclude last day since we need D+1)
    for (let i = 0; i < results.length - 1; i++) {
        const dayD = results[i];
        const dayD1 = results[i + 1];

        const numbersD = Array.from(extractUniqueNumbers(dayD));
        const numbersD1 = extractUniqueNumbers(dayD1);

        // Generate all triples from day D numbers
        const triples = generateTriples(numbersD);

        // For each triple on day D
        triples.forEach(triple => {
            const tripleKey = tripleToKey(triple);

            // Initialize pattern if not exists
            if (!patterns.has(tripleKey)) {
                patterns.set(tripleKey, {
                    triggerTriple: triple,
                    totalTriggerAppearances: 0,
                    followNumbers: [],
                    recentHits: [],
                    daysSinceLastHit: null,
                    lastHitDate: null
                });
                followMap.set(tripleKey, new Map<string, number>());
            }

            const pattern = patterns.get(tripleKey)!;
            pattern.totalTriggerAppearances++;

            // Track which numbers appear on day D+1
            const hitNumbers: string[] = [];
            numbersD1.forEach(followNumber => {
                const followTracker = followMap.get(tripleKey)!;
                followTracker.set(followNumber, (followTracker.get(followNumber) || 0) + 1);
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
    let allPatterns: BacNhoCap3Pattern[] = [];

    // Filter out patterns below threshold before doing heavy calculation
    const relevantPatterns = Array.from(patterns.values()).filter(p => p.totalTriggerAppearances >= minAppearances);

    relevantPatterns.forEach(pattern => {
        const tripleKey = tripleToKey(pattern.triggerTriple);
        const followTracker = followMap.get(tripleKey);
        if (followTracker && pattern.totalTriggerAppearances > 0) {
            const followNumbers: BacNhoCap3Pattern['followNumbers'] = [];

            followTracker.forEach((hitCount, number) => {
                const correlationRate = (hitCount / pattern.totalTriggerAppearances) * 100;
                followNumbers.push({
                    number,
                    hitCount,
                    correlationRate
                });
            });

            // Sort by correlation rate descending and LIMIT to top 50 to save memory/payload
            followNumbers.sort((a, b) => b.correlationRate - a.correlationRate);
            pattern.followNumbers = followNumbers.slice(0, 50);
        }

        if (pattern.lastHitDate) {
            pattern.daysSinceLastHit = daysBetween(pattern.lastHitDate, latestDate);
        }

        allPatterns.push(pattern);
    });

    // Sort all patterns by total appearances and LIMIT to keep JSON size sane
    allPatterns.sort((a, b) => b.totalTriggerAppearances - a.totalTriggerAppearances);
    allPatterns = allPatterns.slice(0, 2000); // 2000 patterns is plenty for a UI

    // Get yesterday's triples for today's predictions
    const yesterdayNumbers = Array.from(extractUniqueNumbers(results[results.length - 1]));
    const yesterdayTriples = generateTriples(yesterdayNumbers);
    const todayPredictions: BacNhoCap3Data['todayPredictions'] = [];

    yesterdayTriples.forEach(triple => {
        const tripleKey = tripleToKey(triple);
        const pattern = patterns.get(tripleKey);
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
