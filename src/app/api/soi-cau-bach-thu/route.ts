import { NextResponse } from 'next/server';
import { findBridges, findBridges3D, findBridges4D, Bridge } from '@/lib/soi-cau-bach-thu';
import { queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Simple in-memory cache
// Key format: `${date}_${amplitude}_${type}`
const cache = new Map<string, { timestamp: number, data: any }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

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

        const type = (searchParams.get('type') || 'loto') as 'loto' | 'special' | 'loto3d' | 'loto4d';
        if (type !== 'loto' && type !== 'special' && type !== 'loto3d' && type !== 'loto4d') {
            return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });
        }

        // Check Cache
        const cacheKey = `${date}_${amplitude}_${type}`;
        const cached = cache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
            // Return cached data
            return NextResponse.json({
                success: true,
                data: cached.data,
                _source: 'cache'
            });
        }

        // Find bridges
        let bridges;
        if (type === 'loto3d') {
            bridges = await findBridges3D(date!, amplitude);
        } else if (type === 'loto4d') {
            bridges = await findBridges4D(date!, amplitude);
        } else {
            bridges = await findBridges(date!, amplitude, type);
        }

        // Aggregate stats
        const frequency: Record<string, number> = {};
        bridges.forEach(b => {
            frequency[b.predictedNumber] = (frequency[b.predictedNumber] || 0) + 1;
        });

        const aggregated = Object.entries(frequency)
            .map(([number, count]) => ({ number, count }))
            .sort((a, b) => b.count - a.count);

        const responseData = {
            date,
            amplitude,
            totalBridges: bridges.length,
            bridges,
            aggregated
        };

        // Save to Cache
        cache.set(cacheKey, {
            timestamp: Date.now(),
            data: responseData
        });

        return NextResponse.json({
            success: true,
            data: responseData,
            _source: 'db'
        });

    } catch (error: any) {
        console.error('Error in soi-cau-bach-thu api:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error', details: error.message },
            { status: 500 }
        );
    }
}
