import { NextResponse } from 'next/server';
import { findBridges, Bridge } from '@/lib/soi-cau-bach-thu';
import { queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        let date = searchParams.get('date');
        // If no date provided, use the latest date in DB
        if (!date) {
            const latest = await queryOne<{ draw_date: string }>('SELECT draw_date FROM xsmb_results ORDER BY draw_date DESC LIMIT 1');
            if (latest) {
                date = latest.draw_date;
            } else {
                return NextResponse.json({ success: false, error: 'No data found' }, { status: 404 });
            }
        }

        const amplitude = parseInt(searchParams.get('amplitude') || '3');
        if (amplitude < 1 || amplitude > 20) {
            return NextResponse.json({ success: false, error: 'Biên độ phải từ 1 đến 20' }, { status: 400 });
        }

        // Find bridges
        const bridges = await findBridges(date!, amplitude);

        // Aggregate stats
        const frequency: Record<string, number> = {};
        bridges.forEach(b => {
            frequency[b.predictedNumber] = (frequency[b.predictedNumber] || 0) + 1;
        });

        const aggregated = Object.entries(frequency)
            .map(([number, count]) => ({ number, count }))
            .sort((a, b) => b.count - a.count);

        return NextResponse.json({
            success: true,
            data: {
                date,
                amplitude,
                totalBridges: bridges.length,
                bridges,
                aggregated
            }
        });

    } catch (error: any) {
        console.error('Error in soi-cau-bach-thu api:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error', details: error.message },
            { status: 500 }
        );
    }
}
