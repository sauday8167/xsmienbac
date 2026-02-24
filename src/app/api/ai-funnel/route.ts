import { NextResponse } from 'next/server';
import { generateConsensusPrediction } from '@/lib/ai-funnel';
import { getCouncilHistory, getLatestTacticalAdvice } from '@/lib/ai-learning';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const [prediction, history, tactics] = await Promise.all([
            generateConsensusPrediction(),
            getCouncilHistory(10),
            getLatestTacticalAdvice()
        ]);

        return NextResponse.json({
            success: true,
            data: {
                ...prediction,
                history,
                tactics
            }
        });
    } catch (error: any) {
        console.error("AI Funnel Error:", error);
        return NextResponse.json({ success: false, error: 'Failed to generate funnel prediction' }, { status: 500 });
    }
}
