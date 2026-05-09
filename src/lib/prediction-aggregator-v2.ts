import { query } from './db';
import { analyzeLotoRoi } from './loto-roi';
import { analyzeAntigravityGdb } from './gdb-analysis';
import { getDbTomorrowStats } from './db-tomorrow-stats';
import { getPrize1TomorrowStats } from './prize1-tomorrow-stats';
import { calculateLoGan } from './statistics';

export interface AggregatedPrediction {
    number: string;
    totalScore: number;
    confidence: number;
    sources: string[];
}

/**
 * Enhanced prediction aggregator using ALL available analysis methods
 * Maximum score: ~153 points
 */
export async function aggregatePredictionsV2(): Promise<AggregatedPrediction[]> {
    const scoreMap = new Map<string, { score: number; sources: Set<string> }>();

    // Initialize all numbers 00-99
    for (let i = 0; i <= 99; i++) {
        const num = i.toString().padStart(2, '0');
        scoreMap.set(num, { score: 0, sources: new Set() });
    }

    try {
        // Core Statistics (from original aggregator)
        await scoreFromFrequency(scoreMap, 1.0, 15); // 15 pts
        await scoreFromDayOfWeek(scoreMap, 0.8, 12); // 12 pts
        await scoreFromDayOfMonth(scoreMap, 0.7, 11); // 11 pts

        // Pattern Analysis
        await scoreFromGapAnalysis(scoreMap, 0.6, 8); // 8 pts
        await scoreFromCycleConvergence(scoreMap, 1.0, 12); // 12 pts (NEW)

        // Advanced Methods (NEW)
        await scoreFromLotoGanBreakout(scoreMap, 1.5, 20); // 20 pts
        await scoreFromLotoRoi(scoreMap, 1.3, 18); // 18 pts
        await scoreFromGdbDerivatives(scoreMap, 0.9, 12); // 12 pts

        // Tomorrow Statistics (NEW)
        await scoreFromDbTomorrow(scoreMap, 1.1, 15); // 15 pts
        await scoreFromG1Tomorrow(scoreMap, 1.0, 12); // 12 pts

    } catch (error) {
        console.error('Error in enhanced prediction aggregation:', error);
    }

    // Exclude Gan Numbers (Top 15 most stubborn numbers)
    const ganStats = await calculateLoGan(15, 300);
    const ganSet = new Set(ganStats.map(s => s.number));

    // Convert to array, FILTER GAN, and sort by score
    const predictions = Array.from(scoreMap.entries())
        .filter(([number]) => !ganSet.has(number)) // EXCLUDE GAN
        .map(([number, data]) => ({
            number,
            totalScore: data.score,
            confidence: Math.min(Math.round((data.score / 153) * 100), 99),
            sources: Array.from(data.sources),
        }))
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, 6);

    return predictions;
}

/**
 * Score from frequency analysis (last 30 days)
 */
async function scoreFromFrequency(
    scoreMap: Map<string, { score: number; sources: Set<string> }>,
    weight: number,
    maxPoints: number
) {
    try {
        const results = await query<any[]>(
            `SELECT * FROM xsmb_results ORDER BY draw_date DESC LIMIT 30`,
            []
        );

        const frequency = new Map<string, number>();

        results.forEach(result => {
            const numbers = extractAllNumbers(result);
            numbers.forEach(num => {
                frequency.set(num, (frequency.get(num) || 0) + 1);
            });
        });

        const sorted = Array.from(frequency.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15);

        sorted.forEach(([num, _], index) => {
            const entry = scoreMap.get(num);
            if (entry) {
                entry.score += (maxPoints - index) * weight;
                entry.sources.add('Tần Suất');
            }
        });
    } catch (error) {
        console.error('Error in frequency scoring:', error);
    }
}

/**
 * Score from day-of-week statistics
 */
async function scoreFromDayOfWeek(
    scoreMap: Map<string, { score: number; sources: Set<string> }>,
    weight: number,
    maxPoints: number
) {
    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayOfWeek = tomorrow.getDay();

        const results = await query<any[]>(
            `SELECT * FROM xsmb_results WHERE CAST(strftime('%w', draw_date) AS INTEGER) = ? ORDER BY draw_date DESC LIMIT 50`,
            [dayOfWeek]
        );

        const frequency = new Map<string, number>();

        results.forEach(result => {
            const numbers = extractAllNumbers(result);
            numbers.forEach(num => {
                frequency.set(num, (frequency.get(num) || 0) + 1);
            });
        });

        const sorted = Array.from(frequency.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 12);

        sorted.forEach(([num, _], index) => {
            const entry = scoreMap.get(num);
            if (entry) {
                entry.score += (maxPoints - index) * weight;
                entry.sources.add('Theo Thứ');
            }
        });
    } catch (error) {
        console.error('Error in day-of-week scoring:', error);
    }
}

/**
 * Score from day-of-month statistics
 */
async function scoreFromDayOfMonth(
    scoreMap: Map<string, { score: number; sources: Set<string> }>,
    weight: number,
    maxPoints: number
) {
    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayOfMonth = tomorrow.getDate();

        const results = await query<any[]>(
            `SELECT * FROM xsmb_results WHERE CAST(strftime('%d', draw_date) AS INTEGER) = ? ORDER BY draw_date DESC LIMIT 50`,
            [dayOfMonth]
        );

        const frequency = new Map<string, number>();

        results.forEach(result => {
            const numbers = extractAllNumbers(result);
            numbers.forEach(num => {
                frequency.set(num, (frequency.get(num) || 0) + 1);
            });
        });

        const sorted = Array.from(frequency.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 11);

        sorted.forEach(([num, _], index) => {
            const entry = scoreMap.get(num);
            if (entry) {
                entry.score += (maxPoints - index) * weight;
                entry.sources.add('Theo Ngày');
            }
        });
    } catch (error) {
        console.error('Error in day-of-month scoring:', error);
    }
}


/**
 * Score from gap analysis (numbers that haven't appeared recently)
 */
async function scoreFromGapAnalysis(
    scoreMap: Map<string, { score: number; sources: Set<string> }>,
    weight: number,
    maxPoints: number
) {
    try {
        const results = await query<any[]>(
            `SELECT * FROM xsmb_results ORDER BY draw_date DESC LIMIT 10`,
            []
        );

        const recentNumbers = new Set<string>();

        results.forEach(result => {
            const numbers = extractAllNumbers(result);
            numbers.forEach(n => recentNumbers.add(n));
        });

        const allNumbers = Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, '0'));
        const gapNumbers = allNumbers.filter(n => !recentNumbers.has(n));

        gapNumbers.slice(0, 10).forEach((num, index) => {
            const entry = scoreMap.get(num);
            if (entry) {
                entry.score += (maxPoints - index) * weight;
                entry.sources.add('Gap Analysis');
            }
        });
    } catch (error) {
        console.error('Error in gap analysis:', error);
    }
}

/**
 * NEW: Score from cycle convergence (numbers nearing average cycle)
 */
async function scoreFromCycleConvergence(
    scoreMap: Map<string, { score: number; sources: Set<string> }>,
    weight: number,
    maxPoints: number
) {
    try {
        const results = await query<any[]>(
            `SELECT * FROM xsmb_results ORDER BY draw_date DESC LIMIT 100`,
            []
        );

        const latestDate = results[0].draw_date;
        const convergenceScores: Array<{ num: string; score: number }> = [];

        for (let i = 0; i < 100; i++) {
            const num = i.toString().padStart(2, '0');
            const appearances: string[] = [];

            results.forEach(result => {
                const numbers = extractAllNumbers(result);
                if (numbers.includes(num)) {
                    appearances.push(result.draw_date);
                }
            });

            if (appearances.length >= 3) {
                // Calculate average cycle
                const intervals: number[] = [];
                for (let j = 1; j < appearances.length; j++) {
                    const days = daysBetween(appearances[j], appearances[j - 1]);
                    intervals.push(days);
                }
                const avgCycle = intervals.reduce((a, b) => a + b, 0) / intervals.length;
                const daysSince = daysBetween(latestDate, appearances[0]);

                // Calculate ratio
                const ratio = daysSince / avgCycle;

                // Optimal range: 0.9 - 1.1 (approaching cycle)
                let cycleScore = 0;
                if (ratio >= 0.9 && ratio <= 1.1) {
                    cycleScore = 10; // Very high score
                } else if (ratio > 1.1 && ratio <= 1.3) {
                    cycleScore = 7; // Overdue
                } else if (ratio >= 0.7 && ratio < 0.9) {
                    cycleScore = 5; // Slightly early
                }

                if (cycleScore > 0) {
                    convergenceScores.push({ num, score: cycleScore });
                }
            }
        }

        // Sort and apply weights
        convergenceScores
            .sort((a, b) => b.score - a.score)
            .slice(0, 12)
            .forEach((item, index) => {
                const entry = scoreMap.get(item.num);
                if (entry) {
                    entry.score += (maxPoints - index) * weight;
                    entry.sources.add('Chu Kỳ');
                }
            });
    } catch (error) {
        console.error('Error in cycle convergence:', error);
    }
}

/**
 * NEW: Score from Lô Gan breakout (moderate Gan about to break)
 */
async function scoreFromLotoGanBreakout(
    scoreMap: Map<string, { score: number; sources: Set<string> }>,
    weight: number,
    maxPoints: number
) {
    try {
        const results = await query<any[]>(
            `SELECT * FROM xsmb_results ORDER BY draw_date DESC LIMIT 60`,
            []
        );

        const latestDate = results[0].draw_date;
        const ganNumbers: Array<{ num: string; days: number }> = [];

        for (let i = 0; i < 100; i++) {
            const num = i.toString().padStart(2, '0');

            // Find last appearance
            let found = false;
            let daysSince = 0;

            for (let j = 1; j < results.length; j++) {
                const numbers = extractAllNumbers(results[j]);
                if (numbers.includes(num)) {
                    daysSince = j;
                    found = true;
                    break;
                }
            }

            // Sweet spot: 12-20 days without appearing
            if (found && daysSince >= 12 && daysSince <= 20) {
                ganNumbers.push({ num, days: daysSince });
            }
        }

        // Higher score for 15-18 days (most likely to break)
        ganNumbers
            .sort((a, b) => {
                const scoreA = a.days >= 15 && a.days <= 18 ? 100 : a.days;
                const scoreB = b.days >= 15 && b.days <= 18 ? 100 : b.days;
                return scoreB - scoreA;
            })
            .slice(0, 10)
            .forEach((item, index) => {
                const entry = scoreMap.get(item.num);
                if (entry) {
                    const bonus = item.days >= 15 && item.days <= 18 ? 1.5 : 1.0;
                    entry.score += (maxPoints - (index * 2)) * weight * bonus;
                    entry.sources.add('Lô Gan');
                }
            });
    } catch (error) {
        console.error('Error in Lô Gan breakout:', error);
    }
}

/**
 * NEW: Score from Lô Rơi analysis
 */
async function scoreFromLotoRoi(
    scoreMap: Map<string, { score: number; sources: Set<string> }>,
    weight: number,
    maxPoints: number
) {
    try {
        const lotoRoiData = await analyzeLotoRoi();
        const predictions = new Set<string>();

        // Type A: Lô rơi từ Đề
        predictions.add(lotoRoiData.typeA.pair[0]);
        predictions.add(lotoRoiData.typeA.pair[1]);

        // Type B: Intersection and MultiHit
        lotoRoiData.typeB.intersection.numbers.forEach(n => predictions.add(n));
        lotoRoiData.typeB.multiHit.numbers.forEach(n => predictions.add(n));

        const predArray = Array.from(predictions);
        predArray.forEach((num, index) => {
            const entry = scoreMap.get(num);
            if (entry && index < 10) {
                entry.score += (maxPoints - (index * 1.8)) * weight;
                entry.sources.add('Lô Rơi');
            }
        });
    } catch (error) {
        console.error('Error in Lô Rơi scoring:', error);
    }
}

/**
 * NEW: Score from GDB derivatives (Sum, Edge, Pivot)
 */
async function scoreFromGdbDerivatives(
    scoreMap: Map<string, { score: number; sources: Set<string> }>,
    weight: number,
    maxPoints: number
) {
    try {
        const gdbData = await analyzeAntigravityGdb();
        if (!gdbData) return;

        const predictions: string[] = [];

        // Sum pairs
        predictions.push(...gdbData.sum.pairs);

        // Edge pairs
        predictions.push(...gdbData.edge.pairs);

        // Pivot touch set (limit to top 8)
        predictions.push(...gdbData.pivot.touchSet.slice(0, 8));

        // Deduplicate and score
        const unique = Array.from(new Set(predictions));
        unique.forEach((num, index) => {
            const entry = scoreMap.get(num);
            if (entry && index < 12) {
                entry.score += (maxPoints - index) * weight;
                entry.sources.add('GĐB');
            }
        });
    } catch (error) {
        console.error('Error in GDB derivatives:', error);
    }
}

/**
 * NEW: Score from DB Tomorrow statistics
 */
async function scoreFromDbTomorrow(
    scoreMap: Map<string, { score: number; sources: Set<string> }>,
    weight: number,
    maxPoints: number
) {
    try {
        // Get yesterday's DB tail
        const latestResult = await query<any[]>(
            `SELECT special_prize FROM xsmb_results ORDER BY draw_date DESC LIMIT 1`,
            []
        );

        if (latestResult.length === 0) return;

        const dbTail = latestResult[0].special_prize.slice(-2);
        const stats = await getDbTomorrowStats(dbTail);

        // Use frequency data
        stats.frequencies.slice(0, 10).forEach((item, index) => {
            const entry = scoreMap.get(item.number);
            if (entry) {
                entry.score += (maxPoints - (index * 1.5)) * weight;
                entry.sources.add('ĐB Mai');
            }
        });
    } catch (error) {
        console.error('Error in DB Tomorrow scoring:', error);
    }
}

/**
 * NEW: Score from G1 Tomorrow statistics
 */
async function scoreFromG1Tomorrow(
    scoreMap: Map<string, { score: number; sources: Set<string> }>,
    weight: number,
    maxPoints: number
) {
    try {
        // Get yesterday's G1 tail
        const latestResult = await query<any[]>(
            `SELECT prize_1 FROM xsmb_results ORDER BY draw_date DESC LIMIT 1`,
            []
        );

        if (latestResult.length === 0) return;

        const g1Tail = latestResult[0].prize_1.slice(-2);
        const stats = await getPrize1TomorrowStats(g1Tail);

        // Use frequency data
        stats.frequencies.slice(0, 10).forEach((item, index) => {
            const entry = scoreMap.get(item.number);
            if (entry) {
                entry.score += (maxPoints - (index * 1.2)) * weight;
                entry.sources.add('G1 Mai');
            }
        });
    } catch (error) {
        console.error('Error in G1 Tomorrow scoring:', error);
    }
}

/**
 * Helper: Extract all loto numbers from a result
 */
function extractAllNumbers(result: any): string[] {
    const numbers = [
        result.special_prize?.slice(-2),
        result.prize_1?.slice(-2),
        ...(JSON.parse(result.prize_2 || '[]').map((n: string) => n.slice(-2))),
        ...(JSON.parse(result.prize_3 || '[]').map((n: string) => n.slice(-2))),
        ...(JSON.parse(result.prize_4 || '[]').map((n: string) => n.slice(-2))),
        ...(JSON.parse(result.prize_5 || '[]').map((n: string) => n.slice(-2))),
        ...(JSON.parse(result.prize_6 || '[]').map((n: string) => n.slice(-2))),
        ...(JSON.parse(result.prize_7 || '[]').map((n: string) => n.slice(-2))),
    ].filter(Boolean).map(n => n.padStart(2, '0'));

    return numbers;
}

/**
 * Helper: Calculate days between dates
 */
function daysBetween(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
