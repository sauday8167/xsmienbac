import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { deleteSimulationsByDate } from '@/lib/simulation-service';

export async function GET(request: Request) {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current time in Vietnam timezone
    const now = new Date();
    const vnTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
    const hour = vnTime.getHours();
    const minute = vnTime.getMinutes();
    const today = vnTime.toISOString().split('T')[0];

    // Check if it's cleanup time (19:00)
    if (hour !== 19 || minute > 10) {
        return NextResponse.json({
            success: false,
            message: 'Not cleanup time',
            currentTime: vnTime.toISOString(),
            hour,
            minute
        });
    }

    try {
        // Check if real result exists for today
        const realResult = await query(
            'SELECT id FROM xsmb_results WHERE draw_date = ? AND special_prize IS NOT NULL',
            [today]
        );

        if (realResult.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Real result not available yet',
                date: today
            });
        }

        // Delete all simulation results for today
        const deletedCount = await deleteSimulationsByDate(today);

        console.log(`[Cleanup] Deleted ${deletedCount} simulation records for ${today}`);

        return NextResponse.json({
            success: true,
            message: 'Simulation data cleaned up',
            date: today,
            deletedCount
        });
    } catch (error: any) {
        console.error('[Cleanup] Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
