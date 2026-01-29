import { query } from './db';

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

export interface NumberPrediction {
    number: string;
    appearances: number;
    frequency: number;
    averageCycle: number | null;
    daysSinceLastAppearance: number | null;
    historicalIntervals: number[];
    score: number;
    likelihood: 'RẤT CAO' | 'CAO' | 'TRUNG BÌNH' | 'THẤP';
    lastAppearanceDate: string | null;
}

export interface PredictionData {
    overview: {
        latestDate: string;
        analyzedDays: number;
        dataRange: {
            from: string;
            to: string;
        };
    };
    allNumbers: NumberPrediction[];
    topPredictions: NumberPrediction[];
    longAbsence: NumberPrediction[];
    regularNumbers: NumberPrediction[];
    consecutiveNumbers: NumberPrediction[];
}

// Helper: Extract all loto numbers (last 2 digits) from a result row
function extractLotoNumbers(result: LotteryResultRaw): string[] {
    const numbers: string[] = [];

    // Special prize (single number)
    if (result.special_prize) {
        numbers.push(result.special_prize.slice(-2).padStart(2, '0'));
    }

    // Prize 1 (single number)
    if (result.prize_1) {
        numbers.push(result.prize_1.slice(-2).padStart(2, '0'));
    }

    // Prizes 2-7 (arrays stored as JSON)
    [result.prize_2, result.prize_3, result.prize_4, result.prize_5, result.prize_6, result.prize_7].forEach(prizeJson => {
        try {
            const prizeArray = JSON.parse(prizeJson);
            if (Array.isArray(prizeArray)) {
                prizeArray.forEach(num => {
                    if (num) {
                        numbers.push(num.slice(-2).padStart(2, '0'));
                    }
                });
            }
        } catch (e) {
            // Skip invalid JSON
        }
    });

    return numbers;
}

// Calculate days between two dates
function daysBetween(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Calculate statistics for a single number
function calculateNumberStats(
    number: string,
    results: LotteryResultRaw[],
    latestDate: string
): NumberPrediction {
    // Find all dates where this number appeared
    const appearanceDates: string[] = [];

    results.forEach(result => {
        const lotos = extractLotoNumbers(result);
        if (lotos.includes(number)) {
            appearanceDates.push(result.draw_date);
        }
    });

    // Sort dates (oldest to newest)
    appearanceDates.sort();

    const appearances = appearanceDates.length;
    const frequency = appearances / Math.min(results.length, 100);

    // Calculate historical intervals (days between consecutive appearances)
    const historicalIntervals: number[] = [];
    for (let i = 1; i < appearanceDates.length; i++) {
        const interval = daysBetween(appearanceDates[i - 1], appearanceDates[i]);
        historicalIntervals.push(interval);
    }

    // Calculate average cycle
    let averageCycle: number | null = null;
    if (historicalIntervals.length > 0) {
        const sum = historicalIntervals.reduce((a, b) => a + b, 0);
        averageCycle = sum / historicalIntervals.length;
    }

    // Calculate days since last appearance
    let daysSinceLastAppearance: number | null = null;
    let lastAppearanceDate: string | null = null;

    if (appearanceDates.length > 0) {
        lastAppearanceDate = appearanceDates[appearanceDates.length - 1];
        daysSinceLastAppearance = daysBetween(lastAppearanceDate, latestDate);
    }

    // Calculate score
    let score = 0;
    if (averageCycle && averageCycle > 0 && daysSinceLastAppearance !== null) {
        score = (daysSinceLastAppearance / averageCycle) * frequency;
    }

    // Determine likelihood
    let likelihood: 'RẤT CAO' | 'CAO' | 'TRUNG BÌNH' | 'THẤP' = 'TRUNG BÌNH';

    if (averageCycle && daysSinceLastAppearance !== null) {
        if (daysSinceLastAppearance > 1.3 * averageCycle) {
            likelihood = 'RẤT CAO';
        } else if (daysSinceLastAppearance >= 0.8 * averageCycle && daysSinceLastAppearance <= 1.2 * averageCycle) {
            likelihood = 'CAO';
        } else if (daysSinceLastAppearance < 0.3 * averageCycle) {
            likelihood = 'THẤP';
        }
    }

    return {
        number,
        appearances,
        frequency,
        averageCycle,
        daysSinceLastAppearance,
        historicalIntervals,
        score,
        likelihood,
        lastAppearanceDate
    };
}

// Main function to get all prediction data
export async function getPredictionData(days: number = 100): Promise<PredictionData> {
    // Get the last N days of results
    const results = await query<LotteryResultRaw[]>(
        'SELECT * FROM xsmb_results ORDER BY draw_date DESC LIMIT ?',
        [days]
    );

    if (results.length === 0) {
        throw new Error('Không có dữ liệu xổ số');
    }

    // Reverse to have oldest first for easier processing
    results.reverse();

    const latestDate = results[results.length - 1].draw_date;
    const oldestDate = results[0].draw_date;

    // Calculate stats for all numbers 00-99
    const allNumbers: NumberPrediction[] = [];

    for (let i = 0; i < 100; i++) {
        const number = i.toString().padStart(2, '0');
        const stats = calculateNumberStats(number, results, latestDate);
        allNumbers.push(stats);
    }

    // Sort by score descending for top predictions
    const sortedByScore = [...allNumbers].sort((a, b) => b.score - a.score);
    const topPredictions = sortedByScore.slice(0, 10);

    // Long absence numbers (high days since)
    const longAbsence = [...allNumbers]
        .filter(n => n.daysSinceLastAppearance !== null)
        .sort((a, b) => (b.daysSinceLastAppearance || 0) - (a.daysSinceLastAppearance || 0))
        .slice(0, 10);

    // Regular numbers (consistent cycle, low variance)
    const regularNumbers = [...allNumbers]
        .filter(n =>
            n.averageCycle !== null &&
            n.historicalIntervals.length >= 3 &&
            n.appearances >= 5
        )
        .map(n => {
            // Calculate variance
            const mean = n.averageCycle!;
            const variance = n.historicalIntervals.reduce((sum, interval) => {
                return sum + Math.pow(interval - mean, 2);
            }, 0) / n.historicalIntervals.length;
            return { ...n, variance };
        })
        .sort((a, b) => a.variance - b.variance)
        .slice(0, 10);

    // Consecutive numbers (appeared in recent consecutive days)
    const recentResults = results.slice(-10); // Last 10 draws
    const consecutiveMap = new Map<string, number>();

    for (let i = 0; i < recentResults.length - 1; i++) {
        const currentNums = new Set(extractLotoNumbers(recentResults[i]));
        const nextNums = new Set(extractLotoNumbers(recentResults[i + 1]));

        currentNums.forEach(num => {
            if (nextNums.has(num)) {
                consecutiveMap.set(num, (consecutiveMap.get(num) || 0) + 1);
            }
        });
    }

    const consecutiveNumbers = allNumbers
        .filter(n => consecutiveMap.has(n.number))
        .sort((a, b) => (consecutiveMap.get(b.number) || 0) - (consecutiveMap.get(a.number) || 0))
        .slice(0, 10);

    return {
        overview: {
            latestDate,
            analyzedDays: results.length,
            dataRange: {
                from: oldestDate,
                to: latestDate
            }
        },
        allNumbers,
        topPredictions,
        longAbsence,
        regularNumbers,
        consecutiveNumbers
    };
}
