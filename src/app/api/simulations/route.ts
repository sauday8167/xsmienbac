import { NextResponse } from 'next/server';
import { getSimulationsByDate } from '@/lib/simulation-service';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    // Default to today if no date provided
    const now = new Date();
    const vnTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
    const targetDate = date || vnTime.toISOString().split('T')[0];

    try {
        const simulations = await getSimulationsByDate(targetDate);

        return NextResponse.json({
            success: true,
            date: targetDate,
            count: simulations.length,
            simulations
        });
    } catch (error: any) {
        console.error('[Simulations API] Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
