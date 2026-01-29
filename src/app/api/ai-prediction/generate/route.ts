import { NextResponse } from 'next/server';
import { AIAnalyst } from '@/lib/ai/analyst';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        console.log('🤖 Manual AI Analysis triggered');

        await AIAnalyst.runDailyAnalysis();

        return NextResponse.json({
            success: true,
            message: 'AI Analysis completed successfully'
        });

    } catch (error) {
        console.error('AI Analysis error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to run AI analysis'
        }, { status: 500 });
    }
}
