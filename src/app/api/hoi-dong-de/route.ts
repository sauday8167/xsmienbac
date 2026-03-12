import { NextRequest, NextResponse } from 'next/server';
import { analyzeHoiDongDe } from '@/lib/hoi-dong-de';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const date = searchParams.get('date');

        // 1. Get current prediction
        const prediction = await analyzeHoiDongDe(date || undefined);

        // 2. Get history (last 10 days)
        const history = await query(`
            SELECT * FROM hoi_dong_de_history 
            ORDER BY draw_date DESC 
            LIMIT 10
        `);

        // If today's prediction isn't in history yet (for caching/persistence), we could insert it here
        // But for "dev", we just return the calculated one.

        return NextResponse.json({
            success: true,
            data: {
                current: prediction,
                history: history.map((h: any) => ({
                    ...h,
                    prediction_36: h.prediction_36 ? JSON.parse(h.prediction_36) : [],
                    analysis_meta: h.analysis_meta ? JSON.parse(h.analysis_meta) : {}
                }))
            }
        });
    } catch (error: any) {
        console.error('API Hoi Dong De error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

