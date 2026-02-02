import { NextResponse } from 'next/server';
import { findBridges, findBridges3D, findBridges4D, Bridge } from '@/lib/soi-cau-bach-thu';
import { findAIPatternsV2, findAIPatterns3D, findAIPatterns4D, findAIPatternsLotoDau } from '@/lib/ai-patterns';
import { queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Simple in-memory cache
// Key format: `${ date }_${ amplitude }_${ type } `
const cache = new Map<string, { timestamp: number, data: any }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function GET(request: Request) {
    console.log("API ROUTE HIT: " + request.url);
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

        const type = (searchParams.get('type') || 'loto') as 'loto' | 'special' | 'loto3d' | 'loto4d' | 'special-touch' | 'loto-dau' | 'ai-mining' | 'ai-mining-3d' | 'ai-mining-4d' | 'ai-mining-loto-dau';
        if (type !== 'loto' && type !== 'special' && type !== 'loto3d' && type !== 'loto4d' && type !== 'special-touch' && type !== 'loto-dau' && type !== 'ai-mining' && type !== 'ai-mining-3d' && type !== 'ai-mining-4d' && type !== 'ai-mining-loto-dau') {
            return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });
        }

        // Check Cache (Skip for AI Mining to ensure freshness during dev)
        const cacheKey = `${date}_${amplitude}_${type}`;
        const cached = cache.get(cacheKey);
        // Check cache (SKIP for AI mining to ensure dev verification)
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS) && type !== 'ai-mining' && type !== 'ai-mining-3d' && type !== 'ai-mining-4d') {
            // Return cached data
            return NextResponse.json({
                success: true,
                data: cached.data,
                _source: 'cache'
            });
        }

        // Find bridges
        let bridges: any[] = []; // Relax type for AI pattern mixing
        let aiPatterns: any[] = [];

        if (type === 'loto3d') {
            bridges = await findBridges3D(date!, amplitude);
        } else if (type === 'loto4d') {
            bridges = await findBridges4D(date!, amplitude);
        } else if (type === 'ai-mining') {
            aiPatterns = await findAIPatternsV2(date!);
        } else if (type === 'ai-mining-3d') {
            aiPatterns = await findAIPatterns3D(date!);
        } else if (type === 'ai-mining-4d') {
            aiPatterns = await findAIPatterns4D(date!);
        } else if (type === 'ai-mining-loto-dau') {
            aiPatterns = await findAIPatternsLotoDau(date!);
        } else {
            bridges = await findBridges(date!, amplitude, type as 'loto' | 'special' | 'special-touch' | 'loto-dau');
        }

        // Aggregate stats
        const frequency: Record<string, number> = {};
        bridges.forEach(b => {
            frequency[b.predictedNumber] = (frequency[b.predictedNumber] || 0) + 1;
        });

        const aggregated = Object.entries(frequency)
            .map(([number, count]) => ({ number, count }))
            .sort((a, b) => b.count - a.count);

        // Special Stats for Touch Mode
        let touchStats: { digit: string; count: number }[] = [];
        if (type === 'special-touch') {
            const touchFreq: Record<string, number> = {};
            bridges.forEach(b => {
                // predictedNumber is typically 2 digits, e.g. "34"
                const digits = b.predictedNumber.split('');
                const uniqueDigits = new Set(digits); // Avoid double counting if "33"
                uniqueDigits.forEach((d: any) => {
                    touchFreq[d] = (touchFreq[d] || 0) + 1;
                });
            });
            touchStats = Object.entries(touchFreq)
                .map(([digit, count]) => ({ digit, count }))
                .sort((a, b) => b.count - a.count);
        }

        const responseData = {
            date,
            amplitude,
            totalBridges: type === 'ai-mining' ? aiPatterns.length : bridges.length,
            bridges,
            aiPatterns,
            aggregated,
            touchStats
        };

        // Save to Cache
        cache.set(cacheKey, {
            timestamp: Date.now(),
            data: responseData
        });

        return NextResponse.json({
            success: true,
            data: responseData
        });

    } catch (error: any) {
        console.error('Error in soi-cau-bach-thu api:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error', details: error.message },
            { status: 500 }
        );
    }
}
