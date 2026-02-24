import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

function generateRandomPrize(digits: number): string {
    let result = '';
    for (let i = 0; i < digits; i++) {
        result += Math.floor(Math.random() * 10).toString();
    }
    return result;
}

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        // Protection from external abusive calls is recommended but since it's a mock we keep it open for manual test if no auth is enforced.
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            // Uncomment the following line to enforce cron secret
            // return new Response('Unauthorized', { status: 401 });
        }

        // Generate between 20 and 50 runs
        const totalRuns = Math.floor(Math.random() * 31) + 20;

        // Counter for 00-99
        const frequency: Record<string, number> = {};
        for (let i = 0; i < 100; i++) {
            frequency[i.toString().padStart(2, '0')] = 0;
        }

        for (let run = 0; run < totalRuns; run++) {
            // Simulate 27 prizes typical for XSMB
            const prizes = [];
            // DB: 1
            prizes.push(generateRandomPrize(5));
            // G1: 1
            prizes.push(generateRandomPrize(5));
            // G2: 2
            prizes.push(generateRandomPrize(5));
            prizes.push(generateRandomPrize(5));
            // G3: 6
            for (let i = 0; i < 6; i++) prizes.push(generateRandomPrize(5));
            // G4: 4
            for (let i = 0; i < 4; i++) prizes.push(generateRandomPrize(4));
            // G5: 6
            for (let i = 0; i < 6; i++) prizes.push(generateRandomPrize(4));
            // G6: 3
            for (let i = 0; i < 3; i++) prizes.push(generateRandomPrize(3));
            // G7: 4
            for (let i = 0; i < 4; i++) prizes.push(generateRandomPrize(2));

            // Extract last 2 digits
            const lotoNumbers = prizes.map(p => p.slice(-2));
            lotoNumbers.forEach(num => {
                frequency[num]++;
            });
        }

        const stats = Object.entries(frequency)
            .map(([number, count]) => ({ number, count }))
            .sort((a, b) => b.count - a.count);

        // Current time info
        const now = new Date();
        const drawDate = now.toISOString().split('T')[0];
        const runTime = now.toLocaleTimeString('vi-VN');

        const resultsJson = JSON.stringify(stats.slice(0, 30)); // Save top 30 to limit string length

        // Overwrite id = 1
        await query(`
            INSERT INTO mock_draw_results (id, draw_date, run_time, total_runs, results) 
            VALUES (1, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET 
                draw_date=excluded.draw_date,
                run_time=excluded.run_time,
                total_runs=excluded.total_runs,
                results=excluded.results
        `, [drawDate, runTime, totalRuns, resultsJson]);

        return NextResponse.json({
            success: true,
            data: {
                draw_date: drawDate,
                run_time: runTime,
                total_runs: totalRuns,
                top_numbers: stats.slice(0, 5)
            }
        });

    } catch (error: any) {
        console.error('Mock Draw Run Error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
