import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const record = await queryOne<any>(`
            SELECT * FROM mock_draw_results WHERE id = 1
        `);

        if (!record) {
            return NextResponse.json({
                success: true,
                data: null
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                draw_date: record.draw_date,
                run_time: record.run_time,
                total_runs: record.total_runs,
                stats: JSON.parse(record.results)
            }
        });

    } catch (error: any) {
        console.error('Mock Draw Fetch Error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
