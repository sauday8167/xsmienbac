import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // yyyy-mm-dd

    if (!date) {
        return NextResponse.json({ success: false, error: 'Missing date' }, { status: 400 });
    }

    try {
        const row = await queryOne(
            `SELECT draw_date, predicted_pairs, actual_result, is_correct, accuracy_notes, confidence_score
             FROM ai_predictions WHERE draw_date = ? LIMIT 1`,
            [date]
        );

        if (!row) {
            return NextResponse.json({ success: false, error: 'No prediction for this date' });
        }

        return NextResponse.json({ success: true, data: row });
    } catch (error) {
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
