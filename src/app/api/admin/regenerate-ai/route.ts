import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { AIAnalyst } from '@/lib/ai/analyst';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        console.log('🔄 Admin: Regenerating AI Prediction');

        // Step 1: Delete old prediction for today
        const today = new Date().toISOString().split('T')[0];
        await query('DELETE FROM ai_predictions WHERE draw_date = ?', [today]);
        console.log(`✅ Deleted old prediction for ${today}`);

        // Step 2: Run AI analysis
        await AIAnalyst.runDailyAnalysis();
        console.log('✅ AI Analysis completed');

        return NextResponse.json({
            success: true,
            message: 'AI Prediction regenerated successfully'
        });

    } catch (error) {
        console.error('❌ Regeneration error:', error);
        return NextResponse.json({
            success: false,
            error: (error as Error).message
        }, { status: 500 });
    }
}
