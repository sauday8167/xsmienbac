import { query } from './db';

export interface PredictionSource {
    number: string;
    score: number;
    source: string;
    confidence?: number;
}

export interface AggregatedPrediction {
    number: string;
    totalScore: number;
    confidence: number;
    sources: string[];
}

/**
 * Aggregate predictions from all available methods
 * Returns top 6 numbers with highest aggregate scores
 */
export async function aggregatePredictions(): Promise<AggregatedPrediction[]> {
    const scoreMap = new Map<string, { score: number; sources: Set<string> }>();

    // Initialize all numbers 00-99
    for (let i = 0; i <= 99; i++) {
        const num = i.toString().padStart(2, '0');
        scoreMap.set(num, { score: 0, sources: new Set() });
    }

    try {
        // 1. Score from Frequency Analysis (15 points)
        await scoreFromFrequency(scoreMap);

        // 2. Score from Day-of-Week Stats (15 points)
        await scoreFromDayOfWeek(scoreMap);

        // 3. Score from Day-of-Month Stats (15 points)
        await scoreFromDayOfMonth(scoreMap);

        // 4. Score from Bạc Nhớ Số Đơn (20 points)
        await scoreFromBacNhoSoDon(scoreMap);

        // 5. Score from Recent Results Patterns (10 points)
        await scoreFromRecentPatterns(scoreMap);

    } catch (error) {
        console.error('Error in prediction aggregation:', error);
    }

    // Convert to array and sort by score
    const predictions = Array.from(scoreMap.entries())
        .map(([number, data]) => ({
            number,
            totalScore: data.score,
            confidence: Math.min(Math.round((data.score / 75) * 100), 99), // Max score ~75
            sources: Array.from(data.sources),
        }))
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, 6);

    return predictions;
}

/**
 * Score from frequency analysis (last 30 days)
 */
async function scoreFromFrequency(scoreMap: Map<string, { score: number; sources: Set<string> }>) {
    try {
        const results = await query<any[]>(
            `SELECT * FROM xsmb_results ORDER BY draw_date DESC LIMIT 30`,
            []
        );

        const frequency = new Map<string, number>();

        results.forEach(result => {
            const numbers = [
                result.special_prize?.slice(-2),
                result.prize_1?.slice(-2),
                ...(JSON.parse(result.prize_2 || '[]').map((n: string) => n.slice(-2))),
                ...(JSON.parse(result.prize_3 || '[]').map((n: string) => n.slice(-2))),
                ...(JSON.parse(result.prize_4 || '[]').map((n: string) => n.slice(-2))),
                ...(JSON.parse(result.prize_5 || '[]').map((n: string) => n.slice(-2))),
                ...(JSON.parse(result.prize_6 || '[]').map((n: string) => n.slice(-2))),
                ...(JSON.parse(result.prize_7 || '[]').map((n: string) => n.slice(-2))),
            ].filter(Boolean);

            numbers.forEach(num => {
                const normalized = num.padStart(2, '0');
                frequency.set(normalized, (frequency.get(normalized) || 0) + 1);
            });
        });

        // Top 15 numbers get scores (15 to 1 points)
        const sorted = Array.from(frequency.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15);

        sorted.forEach(([num, _], index) => {
            const entry = scoreMap.get(num);
            if (entry) {
                entry.score += 15 - index;
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
async function scoreFromDayOfWeek(scoreMap: Map<string, { score: number; sources: Set<string> }>) {
    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayOfWeek = tomorrow.getDay(); // 0 = Sunday

        const results = await query<any[]>(
            `SELECT * FROM xsmb_results WHERE CAST(strftime('%w', draw_date) AS INTEGER) = ? ORDER BY draw_date DESC LIMIT 50`,
            [dayOfWeek]
        );

        const frequency = new Map<string, number>();

        results.forEach(result => {
            const numbers = [
                result.special_prize?.slice(-2),
                result.prize_1?.slice(-2),
                ...(JSON.parse(result.prize_2 || '[]').map((n: string) => n.slice(-2))),
                ...(JSON.parse(result.prize_3 || '[]').map((n: string) => n.slice(-2))),
            ].filter(Boolean);

            numbers.forEach(num => {
                const normalized = num.padStart(2, '0');
                frequency.set(normalized, (frequency.get(normalized) || 0) + 1);
            });
        });

        const sorted = Array.from(frequency.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15);

        sorted.forEach(([num, _], index) => {
            const entry = scoreMap.get(num);
            if (entry) {
                entry.score += 15 - index;
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
async function scoreFromDayOfMonth(scoreMap: Map<string, { score: number; sources: Set<string> }>) {
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
            const numbers = [
                result.special_prize?.slice(-2),
                result.prize_1?.slice(-2),
                ...(JSON.parse(result.prize_2 || '[]').map((n: string) => n.slice(-2))),
                ...(JSON.parse(result.prize_3 || '[]').map((n: string) => n.slice(-2))),
            ].filter(Boolean);

            numbers.forEach(num => {
                const normalized = num.padStart(2, '0');
                frequency.set(normalized, (frequency.get(normalized) || 0) + 1);
            });
        });

        const sorted = Array.from(frequency.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15);

        sorted.forEach(([num, _], index) => {
            const entry = scoreMap.get(num);
            if (entry) {
                entry.score += 15 - index;
                entry.sources.add('Theo Ngày');
            }
        });
    } catch (error) {
        console.error('Error in day-of-month scoring:', error);
    }
}

/**
 * Score from Bạc Nhớ Số Đơn analysis
 */
async function scoreFromBacNhoSoDon(scoreMap: Map<string, { score: number; sources: Set<string> }>) {
    try {
        // Get the latest result to find trigger numbers
        const latestResult = await query<any[]>(
            `SELECT * FROM xsmb_results ORDER BY draw_date DESC LIMIT 1`,
            []
        );

        if (latestResult.length === 0) return;

        const result = latestResult[0];
        const todayNumbers = [
            result.special_prize?.slice(-2),
            result.prize_1?.slice(-2),
            ...(JSON.parse(result.prize_2 || '[]').map((n: string) => n.slice(-2))),
        ].filter(Boolean).map(n => n.padStart(2, '0'));

        // For each of today's numbers, find what commonly follows
        const predictions = new Map<string, number>();

        for (const triggerNum of todayNumbers.slice(0, 5)) { // Top 5 numbers only
            const historicalData = await query<any[]>(
                `SELECT r2.* FROM xsmb_results r1
                 JOIN xsmb_results r2 ON date(r1.draw_date, '+1 day') = r2.draw_date
                 WHERE (r1.special_prize LIKE ? OR r1.prize_1 LIKE ? 
                        OR r1.prize_2 LIKE ? OR r1.prize_3 LIKE ?)
                 ORDER BY r2.draw_date DESC LIMIT 100`,
                [`%${triggerNum}`, `%${triggerNum}`, `%${triggerNum}%`, `%${triggerNum}%`]
            );

            historicalData.forEach(nextDayResult => {
                const nextNumbers = [
                    nextDayResult.special_prize?.slice(-2),
                    nextDayResult.prize_1?.slice(-2),
                    ...(JSON.parse(nextDayResult.prize_2 || '[]').map((n: string) => n.slice(-2))),
                ].filter(Boolean);

                nextNumbers.forEach(num => {
                    const normalized = num.padStart(2, '0');
                    predictions.set(normalized, (predictions.get(normalized) || 0) + 1);
                });
            });
        }

        const sorted = Array.from(predictions.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        sorted.forEach(([num, _], index) => {
            const entry = scoreMap.get(num);
            if (entry) {
                entry.score += 20 - (index * 2);
                entry.sources.add('Bạc Nhớ');
            }
        });
    } catch (error) {
        console.error('Error in bac nho scoring:', error);
    }
}

/**
 * Score from recent result patterns (gap analysis)
 */
async function scoreFromRecentPatterns(scoreMap: Map<string, { score: number; sources: Set<string> }>) {
    try {
        const results = await query<any[]>(
            `SELECT * FROM xsmb_results ORDER BY draw_date DESC LIMIT 10`,
            []
        );

        const recentNumbers = new Set<string>();
        const veryRecentNumbers = new Set<string>();

        results.forEach((result, index) => {
            const numbers = [
                result.special_prize?.slice(-2),
                result.prize_1?.slice(-2),
                ...(JSON.parse(result.prize_2 || '[]').map((n: string) => n.slice(-2))),
            ].filter(Boolean).map(n => n.padStart(2, '0'));

            if (index < 3) {
                numbers.forEach(n => veryRecentNumbers.add(n));
            }
            numbers.forEach(n => recentNumbers.add(n));
        });

        // Find numbers that haven't appeared recently (gap analysis)
        const allNumbers = Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, '0'));
        const gapNumbers = allNumbers.filter(n => !recentNumbers.has(n));

        // Give bonus to gap numbers (they're "due")
        gapNumbers.slice(0, 20).forEach((num, index) => {
            const entry = scoreMap.get(num);
            if (entry && index < 10) {
                entry.score += 10 - index;
                entry.sources.add('Gap Analysis');
            }
        });

    } catch (error) {
        console.error('Error in pattern scoring:', error);
    }
}
