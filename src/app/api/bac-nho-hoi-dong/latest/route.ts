import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Chuyển sang lấy từ ai_predictions
        const row = await queryOne<any>(`
            SELECT 
                draw_date, 
                predicted_pairs as predicted_numbers, 
                actual_result as hit_numbers, 
                analysis_content,
                model_used
            FROM ai_predictions 
            WHERE model_used = 'claude-3-haiku-hoi-dong'
            ORDER BY id DESC 
            LIMIT 1
        `);
        
        if (!row) {
            return NextResponse.json({ success: false, error: 'Chưa có dữ liệu' });
        }

        // Mapping lại hit_count cho UI
        const hitNumbers = row.hit_numbers ? row.hit_numbers.split(',') : [];
        const predictedPairs = JSON.parse(row.predicted_numbers || '[]');
        const actualHits = predictedPairs.filter((p: string) => hitNumbers.includes(p));
        
        return NextResponse.json({ 
            success: true, 
            data: {
                ...row,
                hit_count: actualHits.length
            } 
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
