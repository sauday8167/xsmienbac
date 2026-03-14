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

// Generate all pairs (combinations) from an array
function generatePairs(numbers: string[]): [string, string][] {
    const pairs: [string, string][] = [];
    for (let i = 0; i < numbers.length; i++) {
        for (let j = i + 1; j < numbers.length; j++) {
            // Sort pair to ensure consistency (e.g., [12, 34] same as [34, 12])
            const pair: [string, string] = numbers[i] < numbers[j]
                ? [numbers[i], numbers[j]]
                : [numbers[j], numbers[i]];
            pairs.push(pair);
        }
    }
    return pairs;
}

// Calculate days between two dates
function daysBetween(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Convert pair to string key for map
function pairToKey(pair: [string, string]): string {
    return `${pair[0]}-${pair[1]}`;
}

/**
 * Analyze Bạc Nhớ Cặp 2
 * Phân tích: Khi cặp A+B cùng xuất hiện ở ngày D, số C nào sẽ xuất hiện ở ngày D+1
 */
export async function analyzeBacNhoCap2(days: number = 100, toDate?: string): Promise<BacNhoCap2Data> {
    // Dynamic pruning
    const minAppearances = days > 500 ? 3 : (days > 200 ? 2 : 1);

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
        throw new Error('Cần ít nhất 2 ngày dữ liệu để phân tích Bạc Nhớ Cặp 2');
    }

    // Reverse to have oldest first
    results.reverse();

    const latestDate = results[results.length - 1].draw_date;
    const oldestDate = results[0].draw_date;

    // Map to store patterns: key = "num1-num2", value = pattern
    const patterns = new Map<string, BacNhoCap2Pattern>();

    // Track follow numbers for each pair
    const followMap = new Map<string, Map<string, number>>();

    // Analyze consecutive days (exclude last day since we need D+1)
    for (let i = 0; i < results.length - 1; i++) {
        const dayD = results[i];
        const dayD1 = results[i + 1];

        const numbersD = Array.from(extractUniqueNumbers(dayD));
        const numbersD1 = extractUniqueNumbers(dayD1);

        // Generate all pairs from day D numbers
        const pairs = generatePairs(numbersD);

        // For each pair on day D
        pairs.forEach(pair => {
            const pairKey = pairToKey(pair);

            // Initialize pattern if not exists
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

            // Track which numbers appear on day D+1
            const hitNumbers: string[] = [];
            numbersD1.forEach(followNumber => {
                const followTracker = followMap.get(pairKey)!;
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
    let allPatterns: BacNhoCap2Pattern[] = [];

    patterns.forEach(pattern => {
        // Pruning for performance scale
        if (pattern.totalTriggerAppearances < minAppearances) {
            return;
        }

        const pairKey = pairToKey(pattern.triggerPair);
        const followTracker = followMap.get(pairKey);
        if (followTracker && pattern.totalTriggerAppearances > 0) {
            const followNumbers: BacNhoCap2Pattern['followNumbers'] = [];

            followTracker.forEach((hitCount, number) => {
                const correlationRate = (hitCount / pattern.totalTriggerAppearances) * 100;
                followNumbers.push({
                    number,
                    hitCount,
                    correlationRate
                });
            });

            // Sort by correlation rate descending and LIMIT to save memory
            followNumbers.sort((a, b) => b.correlationRate - a.correlationRate);
            pattern.followNumbers = followNumbers.slice(0, 50);
        }

        if (pattern.lastHitDate) {
            pattern.daysSinceLastHit = daysBetween(pattern.lastHitDate, latestDate);
        }

        allPatterns.push(pattern);
    });

    // Sort patterns by total appearances and LIMIT to keep JSON size sane
    allPatterns.sort((a, b) => b.totalTriggerAppearances - a.totalTriggerAppearances);
    allPatterns = allPatterns.slice(0, 1000); 

    // Get yesterday's pairs for today's predictions
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
