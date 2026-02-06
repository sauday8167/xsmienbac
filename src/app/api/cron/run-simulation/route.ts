import { NextResponse } from 'next/server';
import { generateSimulationResult } from '@/lib/simulation-generator';
import { saveSimulationResult } from '@/lib/simulation-service';

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

    // Check if it's simulation time (XX:15, only 00:15-17:15)
    if (hour > 17 || minute < 10 || minute > 20) {
        return NextResponse.json({
            success: false,
            message: 'Not simulation time',
            currentTime: vnTime.toISOString(),
            hour,
            minute
        });
    }

    try {
        // Generate simulation result
        const result = generateSimulationResult(hour);

        // Save to database
        await saveSimulationResult(result);

        console.log(`[Simulation] Generated and saved simulation for hour ${hour}`);

        return NextResponse.json({
            success: true,
            message: 'Simulation completed',
            hour,
            timestamp: vnTime.toISOString()
        });
    } catch (error: any) {
        console.error('[Simulation] Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
