
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { LotteryResultRaw, ApiResponse } from '@/types';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '30');

        // 1. Fetch latest results
        const results = await query<LotteryResultRaw[]>(
            'SELECT * FROM xsmb_results ORDER BY draw_date DESC LIMIT ?',
            [limit]
        );

        if (results.length === 0) {
            return NextResponse.json({ success: true, data: [] });
        }

        // 2. Extract loto numbers for each date
        const dailyLoto: { date: string, loto: string[] }[] = results.map(row => {
            const numbers: string[] = [];
            numbers.push(row.special_prize);
            numbers.push(row.prize_1);
            numbers.push(...JSON.parse(row.prize_2));
            numbers.push(...JSON.parse(row.prize_3));
            numbers.push(...JSON.parse(row.prize_4));
            numbers.push(...JSON.parse(row.prize_5));
            numbers.push(...JSON.parse(row.prize_6));
            numbers.push(...JSON.parse(row.prize_7));

            const lotoList = numbers
                .filter(n => n)
                .map(n => n.slice(-2).padStart(2, '0'));

            return { date: row.draw_date, loto: lotoList };
        }).reverse(); // Ascending date order for chart

        // 3. Find overall Top 5 numbers in this period
        const totalFreq: Record<string, number> = {};
        dailyLoto.forEach(day => {
            day.loto.forEach(num => {
                totalFreq[num] = (totalFreq[num] || 0) + 1;
            });
        });

        const topNumbers = Object.entries(totalFreq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([num]) => num);

        // 4. Transform to Chart.js datasets format
        const labels = dailyLoto.map(d => d.date.split('-').slice(1).join('/')); // MM/DD
        const datasets = topNumbers.map((num, idx) => {
            const colors = [
                'rgba(220, 38, 38, 1)', // Red
                'rgba(37, 99, 235, 1)', // Blue
                'rgba(245, 158, 11, 1)', // Gold
                'rgba(16, 185, 129, 1)', // Green
                'rgba(139, 92, 246, 1)'  // Purple
            ];
            const data = dailyLoto.map(day => {
                return day.loto.filter(l => l === num).length;
            });

            return {
                label: `Số ${num}`,
                data,
                borderColor: colors[idx % colors.length],
                backgroundColor: colors[idx % colors.length].replace('1)', '0.1)'),
                tension: 0.4,
                pointRadius: 4,
                fill: true
            };
        });

        return NextResponse.json({
            success: true,
            data: { labels, datasets }
        });
    } catch (error) {
        console.error('Trend API Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
