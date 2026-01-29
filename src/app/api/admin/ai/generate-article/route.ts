import { NextRequest, NextResponse } from 'next/server';
import { AutoArticleGenerator } from '@/lib/services/article-generator';
import { verifyAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for AI writing

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
        const targetDate = body.targetDate || getTomorrowDate();

        console.log(`[ADMIN AI] ${admin.username} triggered article generation for date: ${targetDate}`);

        // Generate article
        const article = await AutoArticleGenerator.generateDailyPost(targetDate);

        return NextResponse.json({
            success: true,
            message: 'Article generated and published successfully',
            data: {
                title: article.title,
                targetDate,
                excerpt: article.excerpt
            }
        });

    } catch (error: any) {
        console.error('[ADMIN AI] Article generation error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to generate article',
                details: error.stack
            },
            { status: 500 }
        );
    }
}

function getTomorrowDate() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
}
