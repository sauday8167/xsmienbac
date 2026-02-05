import { NextResponse } from 'next/server';
import { findBridges, findBridges3D, findBridges4D, Bridge } from '@/lib/soi-cau-bach-thu';
import { findAIPatternsV2, findAIPatterns3D, findAIPatterns4D, findAIPatternsLotoDau } from '@/lib/ai-patterns';
import { queryOne } from '@/lib/db';
import { saveAIPrediction } from '@/lib/ai-brain';

export const dynamic = 'force-dynamic';

const cache = new Map<string, { timestamp: number, data: any }>();
const CACHE_TTL_MS = 60 * 60 * 1000;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        let dateParam = searchParams.get('date');
        let finalDate: string | null = null;

        if (!dateParam) {
            const latest = await queryOne<{ draw_date: string }>('SELECT draw_date FROM xsmb_results ORDER BY draw_date DESC LIMIT 1');
            finalDate = latest?.draw_date || null;
        } else {
            finalDate = dateParam;
        }

        if (!finalDate) return NextResponse.json({ success: false, error: 'No data found' }, { status: 404 });

        const amplitude = parseInt(searchParams.get('amplitude') || '3');
        const type = (searchParams.get('type') || 'loto') as string;

        const cacheKey = `${finalDate}_${amplitude}_${type}`;
        const cached = cache.get(cacheKey);

        if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS) && !type.includes('ai-mining')) {
            return NextResponse.json({ success: true, data: cached.data, _source: 'cache' });
        }

        let bridges: any[] = [];
        let aiPatterns: any[] = [];

        if (type === 'loto3d') {
            bridges = await findBridges3D(finalDate, amplitude);
        } else if (type === 'loto4d') {
            bridges = await findBridges4D(finalDate, amplitude);
        } else if (type === 'ai-mining') {
            aiPatterns = await findAIPatternsV2(finalDate);
        } else if (type === 'ai-mining-3d') {
            aiPatterns = await findAIPatterns3D(finalDate);
        } else if (type === 'ai-mining-4d') {
            aiPatterns = await findAIPatterns4D(finalDate);
        } else if (type === 'ai-mining-loto-dau') {
            aiPatterns = await findAIPatternsLotoDau(finalDate);
        } else {
            bridges = await findBridges(finalDate, amplitude, type as any);
        }

        // --- 💾 LƯU LẠI KÝ ỨC DỰ ĐOÁN (Chỉ dành cho AI Mining) ---
        if (type.includes('ai-mining') && aiPatterns.length > 0) {
            const d = new Date(finalDate);
            d.setDate(d.getDate() + 1);
            const nextDateStr = d.toISOString().split('T')[0];

            const dbTypeMap: Record<string, string> = {
                'ai-mining': 'bach-thu',
                'ai-mining-3d': '3d',
                'ai-mining-4d': '4d',
                'ai-mining-loto-dau': 'loto-dau'
            };

            const allPredictedNumbers = Array.from(new Set(aiPatterns.flatMap(p => p.numbers)));

            await saveAIPrediction({
                draw_date: nextDateStr,
                personality_id: aiPatterns[0].personality?.name.includes('Chiến Lược') ? 'strategist' :
                    aiPatterns[0].personality?.name.includes('Độc Hành') ? 'maverick' :
                        aiPatterns[0].personality?.name.includes('Toán Học') ? 'mathematician' : 'intuitive',
                prediction_type: dbTypeMap[type] || 'bach-thu',
                predicted_numbers: allPredictedNumbers,
                weights_used: {}
            });
        }

        const frequency: Record<string, number> = {};
        bridges.forEach(b => frequency[b.predictedNumber] = (frequency[b.predictedNumber] || 0) + 1);

        const responseData = {
            date: finalDate,
            amplitude,
            totalBridges: type.includes('ai-mining') ? aiPatterns.length : bridges.length,
            bridges,
            aiPatterns,
            aggregated: Object.entries(frequency).map(([number, count]) => ({ number, count })).sort((a, b) => b.count - a.count),
            personality: aiPatterns.length > 0 ? aiPatterns[0].personality : null
        };

        if (!type.includes('ai-mining')) {
            cache.set(cacheKey, { timestamp: Date.now(), data: responseData });
        }

        return NextResponse.json({ success: true, data: responseData });

    } catch (error: any) {
        console.error('Error in soi-cau-bach-thu api:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
