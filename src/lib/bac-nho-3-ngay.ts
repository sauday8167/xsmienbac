import { query } from './db';
import type { BacNho3NgayData, BacNho3NgayPattern, BacNho3NgayTodayPrediction } from '@/types/bac-nho-types';

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

import { extractUniqueLotoNumbers } from './lottery-helpers';

function daysBetween(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function tripleToKey(triple: [string, string, string]): string {
    return `${triple[0]}-${triple[1]}-${triple[2]}`;
}

/**
 * Analyze Bạc Nhớ 3 Ngày
 * Optimized to prevent memory crash by splitting today's prediction and general discovery.
 */
export async function analyzeBacNho3Ngay(days: number = 100, toDate?: string): Promise<BacNho3NgayData> {
    // Limits to prevent memory crash
    const MAX_DISCOVERY_DAYS = 200; // Only build the 'All Patterns' table for last 200 days
    
    let queryStr = 'SELECT * FROM xsmb_results ';
    let params: any[] = [days];

    if (toDate) {
        queryStr += 'WHERE draw_date <= ? ';
        params = [toDate, days];
    }

    queryStr += 'ORDER BY draw_date DESC LIMIT ?';

    const results = await query<LotteryResultRaw[]>(queryStr, params);

    if (results.length < 4) {
        throw new Error('Cần ít nhất 4 ngày dữ liệu để phân tích Bạc Nhớ 3 Ngày');
    }

    // Reverse to have oldest first
    results.reverse();

    const latestDate = results[results.length - 1].draw_date;
    const oldestDate = results[0].draw_date;

    // --- PHASE 1: Calculate Today's Predictions specifically ---
    // This is fast because we only care about triples matching the last 3 days.
    const todayPredictions: BacNho3NgayTodayPrediction[] = [];
    
    if (results.length >= 3) {
        const last3Days = {
            dMinus2: new Set(extractUniqueLotoNumbers(results[results.length - 3])),
            dMinus1: new Set(extractUniqueLotoNumbers(results[results.length - 2])),
            dKnown: new Set(extractUniqueLotoNumbers(results[results.length - 1]))
        };

        // Map to track follow numbers for specific matching triples
        const targetPatterns = new Map<string, {
            triple: [string, string, string],
            totalAppearances: number,
            followTracker: Map<string, number>
        }>();

        // Scan ALL history for windows that match ANY part of the last 3 days
        for (let i = 0; i < results.length - 3; i++) {
            const histD0 = extractUniqueLotoNumbers(results[i]);
            const histD1 = extractUniqueLotoNumbers(results[i + 1]);
            const histD2 = extractUniqueLotoNumbers(results[i + 2]);
            const histD3 = extractUniqueLotoNumbers(results[i + 3]);

            const match0 = Array.from(histD0).filter(n => last3Days.dMinus2.has(n));
            const match1 = Array.from(histD1).filter(n => last3Days.dMinus1.has(n));
            const match2 = Array.from(histD2).filter(n => last3Days.dKnown.has(n));

            if (match0.length > 0 && match1.length > 0 && match2.length > 0) {
                // We found a window where at least one loto from each day matches!
                for (const a of match0) {
                    for (const b of match1) {
                        for (const c of match2) {
                            const key = `${a}-${b}-${c}`;
                            if (!targetPatterns.has(key)) {
                                targetPatterns.set(key, {
                                    triple: [a, b, c],
                                    totalAppearances: 0,
                                    followTracker: new Map<string, number>()
                                });
                            }
                            const entry = targetPatterns.get(key)!;
                            entry.totalAppearances++;
                            histD3.forEach(num => {
                                entry.followTracker.set(num, (entry.followTracker.get(num) || 0) + 1);
                            });
                        }
                    }
                }
            }
        }

        // Convert to todayPredictions format
        targetPatterns.forEach(entry => {
            const predictions = Array.from(entry.followTracker.entries())
                .map(([number, hitCount]) => ({
                    number,
                    hitCount,
                    correlationRate: (hitCount / entry.totalAppearances) * 100,
                    totalAppearances: entry.totalAppearances
                }))
                .filter(p => p.correlationRate >= 10) // Filter weak correlations
                .sort((a, b) => b.correlationRate - a.correlationRate)
                .slice(0, 10);

            if (predictions.length > 0) {
                todayPredictions.push({
                    triggerTriple: entry.triple,
                    predictions
                });
            }
        });

        todayPredictions.sort((a, b) => {
            const maxA = a.predictions[0]?.correlationRate || 0;
            const maxB = b.predictions[0]?.correlationRate || 0;
            return maxB - maxA;
        });
    }

    // --- PHASE 2: Discovery for All Patterns (Limited Scope) ---
    const allPatterns: BacNho3NgayPattern[] = [];
    const discoveryResults = results.slice(-MAX_DISCOVERY_DAYS);
    
    if (discoveryResults.length >= 4) {
        const patternsMap = new Map<string, BacNho3NgayPattern>();
        const followMap = new Map<string, Map<string, number>>();

        for (let i = 0; i < discoveryResults.length - 3; i++) {
            const d0 = extractUniqueLotoNumbers(discoveryResults[i]);
            const d1 = extractUniqueLotoNumbers(discoveryResults[i + 1]);
            const d2 = extractUniqueLotoNumbers(discoveryResults[i + 2]);
            const d3 = extractUniqueLotoNumbers(discoveryResults[i + 3]);

            for (const a of d0) {
                for (const b of d1) {
                    for (const c of d2) {
                        const key = `${a}-${b}-${c}`;
                        if (!patternsMap.has(key)) {
                            patternsMap.set(key, {
                                triggerTriple: [a, b, c],
                                totalAppearances: 0,
                                followNumbers: [],
                                recentHits: [],
                                daysSinceLastHit: null,
                                lastHitDate: null
                            });
                            followMap.set(key, new Map<string, number>());
                        }
                        
                        const p = patternsMap.get(key)!;
                        p.totalAppearances++;
                        p.lastHitDate = discoveryResults[i + 3].draw_date;

                        const followTracker = followMap.get(key)!;
                        d3.forEach(num => {
                            followTracker.set(num, (followTracker.get(num) || 0) + 1);
                        });
                    }
                }
            }
        }

        // Post-process discovery Map
        patternsMap.forEach((pattern, key) => {
            if (pattern.totalAppearances < 1) return; // Keep only if it appeared
            
            const followTracker = followMap.get(key)!;
            pattern.followNumbers = Array.from(followTracker.entries())
                .map(([number, hitCount]) => ({
                    number,
                    hitCount,
                    correlationRate: (hitCount / pattern.totalAppearances) * 100
                }))
                .filter(p => p.correlationRate >= 20)
                .sort((a, b) => b.correlationRate - a.correlationRate)
                .slice(0, 50);

            if (pattern.followNumbers.length > 0) {
                if (pattern.lastHitDate) {
                    pattern.daysSinceLastHit = daysBetween(pattern.lastHitDate, latestDate);
                }
                allPatterns.push(pattern);
            }
        });

        allPatterns.sort((a, b) => b.totalAppearances - a.totalAppearances);
    }

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
        patterns: allPatterns.slice(0, 1000), // Safety cap
        todayPredictions: todayPredictions.slice(0, 200) // Huge optimization
    };
}
