import { NextResponse } from 'next/server';
import { AIAnalyst } from '@/lib/ai/analyst';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log('Manual trigger of AI Analysis via API...');
        await AIAnalyst.runDailyAnalysis();
        return NextResponse.json({ success: true, message: 'AI Analysis triggered' });
    } catch (error: any) {
        console.error('Trigger failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
