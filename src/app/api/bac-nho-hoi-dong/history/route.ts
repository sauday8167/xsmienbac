import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Chuyển sang lấy từ ai_predictions
        const rows = await query<any[]>(`
            SELECT 
                draw_date, 
                predicted_pairs as predicted_numbers, 
                actual_result as hit_numbers,
                is_correct,
                CASE WHEN actual_result IS NOT NULL THEN 1 ELSE 0 END as is_verified
            FROM ai_predictions 
            WHERE model_used = 'claude-3-haiku-hoi-dong'
            ORDER BY draw_date DESC 
            LIMIT 10
        `);

        const data = rows.map(row => {
            const hitNumbers = row.hit_numbers ? row.hit_numbers.split(',') : [];
            const predictedPairs = JSON.parse(row.predicted_numbers || '[]');
            const actualHits = predictedPairs.filter((p: string) => hitNumbers.includes(p));
            
            return {
                ...row,
                hit_count: actualHits.length,
                hit_numbers: JSON.stringify(actualHits) // UI mong đợi JSON array các số trúng
            };
        });

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
