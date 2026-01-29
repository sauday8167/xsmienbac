import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const history = await query(
            `SELECT 
                draw_date, 
                predicted_pairs, 
                actual_result, 
                is_correct, 
                confidence_score,
                accuracy_notes 
             FROM ai_predictions 
             ORDER BY draw_date DESC 
             LIMIT 10`
        );

        return NextResponse.json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error('Failed to fetch AI history:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
