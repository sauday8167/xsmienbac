import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { extractAllLotoNumbers, LotteryResultRaw } from '@/lib/lottery-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // Required parameters: day and month
        const dayParam = searchParams.get('day');
        const monthParam = searchParams.get('month');

        if (!dayParam || !monthParam) {
            return NextResponse.json({ success: false, error: 'Thiếu tham số ngày hoặc tháng' }, { status: 400 });
        }

        const day = parseInt(dayParam);
        const month = parseInt(monthParam);

        if (day < 1 || day > 31 || month < 1 || month > 12) {
            return NextResponse.json({ success: false, error: 'Ngày hoặc tháng không hợp lệ' }, { status: 400 });
        }

        // Optional parameter: yearsLimit
        // 0 means all time
        const yearsLimit = parseInt(searchParams.get('yearsLimit') || '0');

        // Build the query
        let sql = `
            SELECT * FROM xsmb_results 
            WHERE CAST(strftime('%d', draw_date) AS INTEGER) = ? 
            AND CAST(strftime('%m', draw_date) AS INTEGER) = ?
        `;
        const params: any[] = [day, month];

        if (yearsLimit > 0) {
            sql += ` AND draw_date >= date('now', '-${yearsLimit} years')`;
        }

        sql += ` ORDER BY draw_date DESC`;

        const results = await query<LotteryResultRaw[]>(sql, params);

        // If no results, return empty
        if (results.length === 0) {
            return NextResponse.json({
                success: true,
                data: {
                    day,
                    month,
                    yearsAnalyzed: 0,
                    totalAppearances: 0,
                    stats: [],
                    synthesis: [],
                    availableYears: []
                }
            });
        }

        // Initialize frequency counters
        const frequency: Record<string, number> = {};
        for (let i = 0; i < 100; i++) {
            frequency[i.toString().padStart(2, '0')] = 0;
        }

        let totalAppearances = 0;
        const availableYearsSet = new Set<number>();

        results.forEach(result => {
            const year = new Date(result.draw_date).getFullYear();
            if (!isNaN(year)) availableYearsSet.add(year);

            const numbers = extractAllLotoNumbers(result);
            numbers.forEach(num => {
                if (frequency[num] !== undefined) {
                    frequency[num]++;
                    totalAppearances++;
                }
            });
        });

        // Convert to array and sort
        const stats = Object.entries(frequency)
            .map(([number, count]) => ({ number, count }))
            .sort((a, b) => b.count - a.count); // Highest first

        // For synthesis, we can break ties using the overall frequency, but since this specific route is unique,
        // we'll just use the top 10 from the current selection. If we want a 'super synthesis', we can create multiple ranges.
        // Let's implement a synthesis based on the frequency across 3, 5, 10, and all years.

        const synthesis = await getSynthesisStats(day, month, yearsLimit === 0 ? 30 : yearsLimit);

        return NextResponse.json({
            success: true,
            data: {
                day,
                month,
                yearsAnalyzed: availableYearsSet.size,
                totalAppearances,
                stats,
                synthesis,
                availableYears: Array.from(availableYearsSet).sort((a, b) => b - a)
            }
        });
    } catch (error: any) {
        console.error('Error in stats/theo-ngay-trong-nam:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

async function getTopStatsForYears(day: number, month: number, yearsLimit: number) {
    let sql = `
        SELECT * FROM xsmb_results 
        WHERE CAST(strftime('%d', draw_date) AS INTEGER) = ? 
        AND CAST(strftime('%m', draw_date) AS INTEGER) = ?
    `;
    const params: any[] = [day, month];

    if (yearsLimit > 0) {
        sql += ` AND draw_date >= date('now', '-${yearsLimit} years')`;
    }

    const results = await query<LotteryResultRaw[]>(sql, params);
    const frequency: Record<string, number> = {};

    results.forEach(result => {
        extractAllLotoNumbers(result).forEach(num => {
            frequency[num] = (frequency[num] || 0) + 1;
        });
    });

    return Object.entries(frequency)
        .map(([number, count]) => ({ number, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .map(s => s.number);
}

async function getSynthesisStats(day: number, month: number, maxYears: number) {
    // Generate an array of periods up to maxYears
    const allPeriods = [3, 5, 10, 20, 0]; // 0 is all time
    // Limit periods to maxYears or lower
    const periods = allPeriods.filter(p => p !== 0 && (maxYears === 0 || p <= maxYears));
    if (maxYears === 0) periods.push(0);

    const topSets = await Promise.all(periods.map(p => getTopStatsForYears(day, month, p)));

    const repetitions: Record<string, number> = {};
    topSets.forEach(set => {
        set.forEach(num => {
            repetitions[num] = (repetitions[num] || 0) + 1;
        });
    });

    // To break ties, use overall frequency
    const sqlAll = `
        SELECT * FROM xsmb_results 
        WHERE CAST(strftime('%d', draw_date) AS INTEGER) = ? 
        AND CAST(strftime('%m', draw_date) AS INTEGER) = ?
    `;
    const resultsAll = await query<LotteryResultRaw[]>(sqlAll, [day, month]);
    const freqAll: Record<string, number> = {};
    resultsAll.forEach(result => {
        extractAllLotoNumbers(result).forEach(num => {
            freqAll[num] = (freqAll[num] || 0) + 1;
        });
    });

    return Object.entries(repetitions)
        .map(([number, repCount]) => ({
            number,
            repCount,
            totalCount: freqAll[number] || 0
        }))
        .sort((a, b) => {
            if (b.repCount !== a.repCount) return b.repCount - a.repCount;
            return b.totalCount - a.totalCount; // Tie-breaker: overall frequency
        })
        .slice(0, 10);
}
