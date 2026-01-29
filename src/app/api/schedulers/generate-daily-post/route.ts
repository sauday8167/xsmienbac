import { NextResponse } from 'next/server';
import { AutoArticleGenerator } from '@/lib/services/article-generator';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for AI generation

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');
        const date = searchParams.get('date'); // Optional target date

        // Simple security check (replace with env var in production)
        if (secret !== 'cron_secret_password') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const targetDate = date || getTomorrowDate();

        console.log(`[API] Triggering article generation for ${targetDate}`);
        const article = await AutoArticleGenerator.generateDailyPost(targetDate);

        return NextResponse.json({
            success: true,
            message: 'Article generated successfully',
            article
        });

    } catch (error: any) {
        console.error('[API] Article generation failed:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}

function getTomorrowDate() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
}
