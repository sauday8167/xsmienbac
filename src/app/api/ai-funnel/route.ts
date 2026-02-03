import { NextResponse } from 'next/server';
import { generateFunnelPrediction } from '@/lib/ai-funnel';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const data = await generateFunnelPrediction();
        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("AI Funnel Error:", error);
        return NextResponse.json({ success: false, error: 'Failed to generate funnel prediction' }, { status: 500 });
    }
}
