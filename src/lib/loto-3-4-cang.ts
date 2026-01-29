import { query } from './db';
import { LotoStat, Loto34CangData } from '@/types/loto-3-4-cang';

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

function getEndings(result: LotteryResultRaw, length: number): string[] {
    const endings: string[] = [];
    const fields = [
        result.special_prize,
        result.prize_1,
        result.prize_2,
        result.prize_3,
        result.prize_4,
        result.prize_5,
        result.prize_6,
        result.prize_7
    ];

    fields.forEach((field, index) => {
        if (!field) return;

        // Prize 7 (index 7) has only 2 digits, skip for 3 and 4 cang
        if (index === 7) return;
        // Prize 6 (index 6) has 3 digits, skip for 4 cang
        if (index === 6 && length === 4) return;

        let values: string[] = [];
        if (field.startsWith('[') && field.endsWith(']')) {
            try {
                values = JSON.parse(field);
            } catch (e) {
                values = field.split(/[\s,]+/);
            }
        } else {
            values = field.split(/[\s,]+/);
        }

        values.forEach(val => {
            if (val.length >= length) {
                endings.push(val.slice(-length));
            }
        });
    });

    return endings;
}

function calculateStats(numberMap: Map<string, string[]>, totalDays: number, latestDate: string): LotoStat[] {
    const stats: LotoStat[] = [];
    const latestDateTime = new Date(latestDate).getTime();

    numberMap.forEach((hitDates, number) => {
        hitDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

        const appearances = hitDates.length;
        const lastDate = hitDates[hitDates.length - 1];
        const lastDateTime = new Date(lastDate).getTime();
        const daysSinceLastAppearance = Math.floor((latestDateTime - lastDateTime) / (1000 * 60 * 60 * 24));

        // Calculate gaps
        const gaps: number[] = [];
        for (let i = 1; i < hitDates.length; i++) {
            const d1 = new Date(hitDates[i - 1]).getTime();
            const d2 = new Date(hitDates[i]).getTime();
            gaps.push(Math.floor((d2 - d1) / (1000 * 60 * 60 * 24)));
        }

        const averageCycle = gaps.length > 0
            ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length)
            : totalDays; // Fallback if only 1 appearance

        const maxGan = gaps.length > 0 ? Math.max(...gaps) : daysSinceLastAppearance;

        // "Due" logic: if current gan is greater than average cycle OR close to max gan
        const isDue = daysSinceLastAppearance > averageCycle || (maxGan > 0 && daysSinceLastAppearance > maxGan * 0.8);

        stats.push({
            number,
            appearances,
            lastDate,
            daysSinceLastAppearance,
            averageCycle,
            maxGan,
            isDue,
            hitDates: hitDates.slice(-5) // Keep only last 5 for UI performance
        });
    });

    return stats;
}

export async function analyzeLoto34Cang(days: number = 1000): Promise<Loto34CangData> {
    const results = await query<LotteryResultRaw[]>(
        'SELECT * FROM xsmb_results ORDER BY draw_date DESC LIMIT ?',
        [days]
    );

    if (results.length === 0) {
        throw new Error('Không có dữ liệu xổ số');
    }

    const latestDate = results[0].draw_date;
    const oldestDate = results[results.length - 1].draw_date;
    const totalDaysAvailable = results.length;

    const map3Cang = new Map<string, string[]>();
    const map4Cang = new Map<string, string[]>();

    // Process from oldest to newest to collect dates
    const reversedResults = [...results].reverse();

    reversedResults.forEach(res => {
        const endings3 = getEndings(res, 3);
        const endings4 = getEndings(res, 4);

        endings3.forEach(num => {
            if (!map3Cang.has(num)) map3Cang.set(num, []);
            map3Cang.get(num)!.push(res.draw_date);
        });

        endings4.forEach(num => {
            if (!map4Cang.has(num)) map4Cang.set(num, []);
            map4Cang.get(num)!.push(res.draw_date);
        });
    });

    const stats3Cang = calculateStats(map3Cang, totalDaysAvailable, latestDate);
    const stats4Cang = calculateStats(map4Cang, totalDaysAvailable, latestDate);

    // Get Top 10 by appearances
    const top10_3 = [...stats3Cang].sort((a, b) => b.appearances - a.appearances).slice(0, 10);
    const top10_4 = [...stats4Cang].sort((a, b) => b.appearances - a.appearances).slice(0, 10);

    // Get Due numbers (limit to top 10 due)
    const due_3 = stats3Cang.filter(s => s.isDue).sort((a, b) => b.daysSinceLastAppearance - a.daysSinceLastAppearance).slice(0, 10);
    const due_4 = stats4Cang.filter(s => s.isDue).sort((a, b) => b.daysSinceLastAppearance - a.daysSinceLastAppearance).slice(0, 10);

    return {
        loto3Cang: {
            top10: top10_3,
            due: due_3
        },
        loto4Cang: {
            top10: top10_4,
            due: due_4
        },
        overview: {
            totalDays: totalDaysAvailable,
            fromDate: oldestDate,
            toDate: latestDate
        }
    };
}
