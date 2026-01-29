import { NextResponse } from 'next/server';
import { calculateLoGan, calculateFrequent } from '@/lib/statistics';

export const dynamic = 'force-dynamic'; // Update on every request

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const limitType = url.searchParams.get('limit') || '10';
        const limit = parseInt(limitType, 10);

        // StatsConfig
        const ganPeriods = 100; // Look back 100 days for Lo Gan
        const freqPeriods = 30; // Look back 30 days for Frequent (User asked "last 10" but 10 is quite short for "frequent", user request said "tong 10 ky xo so gan nhat" -> OK last 10 periods)
        // Correcting per user request: "trong 10 kỳ xổ số gần nhất"
        const freqPeriodsUser = 10;

        // Run in parallel
        const [loGan, frequent] = await Promise.all([
            calculateLoGan(limit, ganPeriods),
            calculateFrequent(limit, freqPeriodsUser)
        ]);

        return NextResponse.json({
            success: true,
            data: {
                loGan,
                frequent
            }
        });

    } catch (error) {
        console.error('Stats API Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
