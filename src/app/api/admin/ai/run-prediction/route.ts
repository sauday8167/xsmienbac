import { NextRequest, NextResponse } from 'next/server';
import { AIAnalyst } from '@/lib/ai/analyst';
import { verifyAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for AI processing

export async function POST(request: NextRequest) {
    try {
        // Verify admin authentication
        const admin = verifyAdmin(request);
        if (!admin) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized - Admin access required' },
                { status: 401 }
            );
        }

        // Get optional target date from request body
        const body = await request.json().catch(() => ({}));
        const targetDate = body.targetDate;

        console.log(`[ADMIN AI] ${admin.username} triggered AI prediction for date: ${targetDate || 'today'}`);

        // Run AI analysis
        const result = await AIAnalyst.runDailyAnalysis(targetDate);

        return NextResponse.json({
            success: true,
            message: 'AI prediction completed successfully',
            data: result
        });

    } catch (error: any) {
        console.error('[ADMIN AI] Prediction error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to run AI prediction',
                details: error.stack
            },
            { status: 500 }
        );
    }
}
