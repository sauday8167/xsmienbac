import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { extractAllLotoNumbers, LotteryResultRaw } from '@/lib/lottery-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // 0-6 (0=Sunday, 1=Monday, etc.)
        const dayOfWeek = parseInt(searchParams.get('day') || '1');

        // Default 365 days
        const daysLimit = parseInt(searchParams.get('daysLimit') || '365');

        // Validate day
        if (dayOfWeek < 0 || dayOfWeek > 6) {
            return NextResponse.json({ success: false, error: 'Thứ không hợp lệ (0-6)' }, { status: 400 });
        }

        // Calculate cut-off date
        // Since sqlite 'now' uses UTC, consistent usage is key. 
        // We assume draw_date is YYYY-MM-DD.
        // Query to get results from the last N days where weekday matches
        // SQLite strftime('%w', date) returns 0-6 (0 is Sunday).

        // Get latest date from DB to anchor the "last N days" logic
        const latest = await queryOne<{ draw_date: string }>('SELECT draw_date FROM xsmb_results ORDER BY draw_date DESC LIMIT 1');
        const anchorDate = latest?.draw_date || new Date().toISOString().split('T')[0];

        const sql = `
            SELECT * FROM xsmb_results 
            WHERE draw_date >= date(?, '-${daysLimit} days') 
            AND CAST(strftime('%w', draw_date) AS INTEGER) = ?
            ORDER BY draw_date DESC
        `;

        const results = await query<LotteryResultRaw[]>(sql, [anchorDate, dayOfWeek]);

        const frequency: Record<string, number> = {};
        // Initialize 00-99 with 0
        for (let i = 0; i < 100; i++) {
            const num = i.toString().padStart(2, '0');
            frequency[num] = 0;
        }

        let totalAppearances = 0;

        results.forEach(result => {
            const numbers = extractAllLotoNumbers(result);
            numbers.forEach(num => {
                if (frequency[num] !== undefined) {
                    frequency[num]++;
                    totalAppearances++;
                }
            });
        });

        // Convert to array and sort
        const stats = Object.entries(frequency).map(([number, count]) => ({
            number,
            count
        })).sort((a, b) => b.count - a.count); // Highest first

        const synthesis = await getSynthesisStats(dayOfWeek, anchorDate);

        // Calculate calculated search range
        const anchor = new Date(anchorDate);
        const fromDate = new Date(anchor);
        fromDate.setDate(anchor.getDate() - daysLimit);

        const dateRange = {
            from: fromDate.toISOString().split('T')[0],
            to: anchorDate
        };

        return NextResponse.json({
            success: true,
            data: {
                dayOfWeek,
                daysAnalyzed: results.length,
                totalAppearances,
                stats,
                synthesis,
                dateRange
            }
        });
    } catch (error: any) {
        console.error('Error in stats/theo-thu:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

async function getTopStatsForDays(dayOfWeek: number, daysLimit: number, anchorDate: string) {
    const sql = `
        SELECT * FROM xsmb_results 
        WHERE draw_date >= date(?, '-${daysLimit} days') 
        AND CAST(strftime('%w', draw_date) AS INTEGER) = ?
    `;
    const results = await query<LotteryResultRaw[]>(sql, [anchorDate, dayOfWeek]);
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

async function getSynthesisStats(dayOfWeek: number, anchorDate: string) {
    const periods = [30, 90, 180, 365];
    const topSets = await Promise.all(periods.map(p => getTopStatsForDays(dayOfWeek, p, anchorDate)));

    const repetitions: Record<string, number> = {};
    topSets.forEach(set => {
        set.forEach(num => {
            repetitions[num] = (repetitions[num] || 0) + 1;
        });
    });

    // To break ties, we get the frequency over 365 days
    const sql365 = `
        SELECT * FROM xsmb_results 
        WHERE draw_date >= date(?, '-365 days') 
        AND CAST(strftime('%w', draw_date) AS INTEGER) = ?
    `;
    const results365 = await query<LotteryResultRaw[]>(sql365, [anchorDate, dayOfWeek]);
    const freq365: Record<string, number> = {};
    results365.forEach(result => {
        extractAllLotoNumbers(result).forEach(num => {
            freq365[num] = (freq365[num] || 0) + 1;
        });
    });

    return Object.entries(repetitions)
        .map(([number, repCount]) => ({
            number,
            repCount,
            totalCount: freq365[number] || 0
        }))
        .sort((a, b) => {
            if (b.repCount !== a.repCount) return b.repCount - a.repCount;
            return b.totalCount - a.totalCount; // Tie-breaker: 365d frequency
        })
        .slice(0, 10);
}
