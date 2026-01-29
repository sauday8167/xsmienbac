import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { extractAllLotoNumbers, LotteryResultRaw } from '@/lib/lottery-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // 1-31
        const dayOfMonth = parseInt(searchParams.get('day') || '1');

        // Default 365 days
        const daysLimit = parseInt(searchParams.get('daysLimit') || '365');

        // Validate day
        if (dayOfMonth < 1 || dayOfMonth > 31) {
            return NextResponse.json({ success: false, error: 'Ngày không hợp lệ (1-31)' }, { status: 400 });
        }

        const dayStr = dayOfMonth.toString().padStart(2, '0');

        // Get latest date from DB to anchor the "last N days" logic
        const latest = await queryOne<{ draw_date: string }>('SELECT draw_date FROM xsmb_results ORDER BY draw_date DESC LIMIT 1');
        const anchorDate = latest?.draw_date || new Date().toISOString().split('T')[0];

        const sql = `
            SELECT * FROM xsmb_results 
            WHERE draw_date >= date(?, '-${daysLimit} days') 
            AND strftime('%d', draw_date) = ?
            ORDER BY draw_date DESC
        `;

        const results = await query<LotteryResultRaw[]>(sql, [anchorDate, dayStr]);

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

        const synthesis = await getSynthesisStats(dayOfMonth, anchorDate);

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
                dayOfMonth,
                daysAnalyzed: results.length,
                totalAppearances,
                stats,
                synthesis,
                dateRange
            }
        });
    } catch (error: any) {
        console.error('Error in stats/theo-ngay:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

async function getTopStatsForDays(dayOfMonth: number, periodStr: string, anchorDate: string) {
    const dayStr = dayOfMonth.toString().padStart(2, '0');
    const sql = `
        SELECT * FROM xsmb_results 
        WHERE draw_date >= date(?, '-${periodStr}') 
        AND strftime('%d', draw_date) = ?
    `;
    const results = await query<LotteryResultRaw[]>(sql, [anchorDate, dayStr]);
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

async function getSynthesisStats(dayOfMonth: number, anchorDate: string) {
    const periods = ['3 months', '6 months', '12 months', '18 months'];
    const topSets = await Promise.all(periods.map(p => getTopStatsForDays(dayOfMonth, p, anchorDate)));

    const repetitions: Record<string, number> = {};
    topSets.forEach(set => {
        set.forEach(num => {
            repetitions[num] = (repetitions[num] || 0) + 1;
        });
    });

    const dayStr = dayOfMonth.toString().padStart(2, '0');
    const sql18 = `
        SELECT * FROM xsmb_results 
        WHERE draw_date >= date(?, '-18 months') 
        AND strftime('%d', draw_date) = ?
    `;
    const results18 = await query<LotteryResultRaw[]>(sql18, [anchorDate, dayStr]);
    const freq18: Record<string, number> = {};
    results18.forEach(result => {
        extractAllLotoNumbers(result).forEach(num => {
            freq18[num] = (freq18[num] || 0) + 1;
        });
    });

    return Object.entries(repetitions)
        .map(([number, repCount]) => ({
            number,
            repCount,
            totalCount: freq18[number] || 0
        }))
        .sort((a, b) => {
            if (b.repCount !== a.repCount) return b.repCount - a.repCount;
            return b.totalCount - a.totalCount;
        })
        .slice(0, 10);
}
