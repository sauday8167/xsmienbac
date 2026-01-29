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

export interface BacNhoPattern {
    trigger: string;
    songThuPair: [string, string];
    totalTriggerAppearances: number;
    hitCount: number;
    correlationRate: number;
    recentHits: {
        triggerDate: string;
        hitDate: string;
        hitNumber: string;
    }[];
    daysSinceLastHit: number | null;
    lastHitDate: string | null;
}

export interface BacNhoData {
    overview: {
        analyzedDays: number;
        totalPatterns: number;
        latestDate: string;
        dataRange: {
            from: string;
            to: string;
        };
    };
    top10Global: BacNhoPattern[];
    allPatterns: BacNhoPattern[];
    todayPredictions: {
        yesterdayNumber: string;
        patterns: BacNhoPattern[];
    }[];
}

// Helper: Extract all loto numbers from a result row
function extractLotoNumbers(result: LotteryResultRaw): string[] {
    const numbers: string[] = [];

    if (result.special_prize) {
        numbers.push(result.special_prize.slice(-2).padStart(2, '0'));
    }

    if (result.prize_1) {
        numbers.push(result.prize_1.slice(-2).padStart(2, '0'));
    }

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

// Get Song Thủ pair for a number (reverse pair)
function getSongThuPair(number: string): [string, string] {
    const reversed = number.split('').reverse().join('');
    return [number, reversed];
}

// Calculate days between two dates
function daysBetween(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Main analysis function
export async function analyzeBacNho(days: number = 100): Promise<BacNhoData> {
    // Get last N days of results
    const results = await query<LotteryResultRaw[]>(
        'SELECT * FROM xsmb_results ORDER BY draw_date DESC LIMIT ?',
        [days]
    );

    if (results.length < 2) {
        throw new Error('Cần ít nhất 2 ngày dữ liệu để phân tích Bạc Nhớ');
    }

    // Reverse to have oldest first
    results.reverse();

    const latestDate = results[results.length - 1].draw_date;
    const oldestDate = results[0].draw_date;

    // Initialize patterns for all numbers 00-99
    const patterns = new Map<string, BacNhoPattern>();

    for (let i = 0; i < 100; i++) {
        const trigger = i.toString().padStart(2, '0');
        const pair = getSongThuPair(trigger);

        patterns.set(trigger, {
            trigger,
            songThuPair: pair,
            totalTriggerAppearances: 0,
            hitCount: 0,
            correlationRate: 0,
            recentHits: [],
            daysSinceLastHit: null,
            lastHitDate: null
        });
    }

    // Analyze consecutive days (exclude last day since we need D+1)
    for (let i = 0; i < results.length - 1; i++) {
        const dayD = results[i];
        const dayD1 = results[i + 1];

        const numbersD = new Set(extractLotoNumbers(dayD));
        const numbersD1 = new Set(extractLotoNumbers(dayD1));

        // For each trigger number on day D
        numbersD.forEach(trigger => {
            const pattern = patterns.get(trigger);
            if (!pattern) return;

            pattern.totalTriggerAppearances++;

            // Check if Song Thủ pair appears on day D+1
            const [a, b] = pattern.songThuPair;
            let hitNumber: string | null = null;

            if (numbersD1.has(a)) {
                hitNumber = a;
            } else if (numbersD1.has(b)) {
                hitNumber = b;
            }

            if (hitNumber) {
                pattern.hitCount++;
                pattern.lastHitDate = dayD1.draw_date;

                // Store recent hits (keep last 10)
                pattern.recentHits.push({
                    triggerDate: dayD.draw_date,
                    hitDate: dayD1.draw_date,
                    hitNumber
                });

                if (pattern.recentHits.length > 10) {
                    pattern.recentHits.shift();
                }
            }
        });
    }

    // Calculate correlation rates and days since last hit
    const allPatterns: BacNhoPattern[] = [];

    patterns.forEach(pattern => {
        if (pattern.totalTriggerAppearances > 0) {
            pattern.correlationRate = (pattern.hitCount / pattern.totalTriggerAppearances) * 100;
        }

        if (pattern.lastHitDate) {
            pattern.daysSinceLastHit = daysBetween(pattern.lastHitDate, latestDate);
        }

        allPatterns.push(pattern);
    });

    // Sort by hit count to get Top 10
    const top10Global = [...allPatterns]
        .sort((a, b) => {
            // Sort by hit count first, then by correlation rate
            if (b.hitCount !== a.hitCount) {
                return b.hitCount - a.hitCount;
            }
            return b.correlationRate - a.correlationRate;
        })
        .slice(0, 10);

    // Get yesterday's numbers for today's predictions
    const yesterdayNumbers = new Set(extractLotoNumbers(results[results.length - 1]));
    const todayPredictions: { yesterdayNumber: string; patterns: BacNhoPattern[] }[] = [];

    yesterdayNumbers.forEach(num => {
        const pattern = patterns.get(num);
        if (pattern && pattern.hitCount > 0) {
            todayPredictions.push({
                yesterdayNumber: num,
                patterns: [pattern]
            });
        }
    });

    // Sort today's predictions by correlation rate
    todayPredictions.sort((a, b) =>
        b.patterns[0].correlationRate - a.patterns[0].correlationRate
    );

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
        top10Global,
        allPatterns,
        todayPredictions
    };
}
