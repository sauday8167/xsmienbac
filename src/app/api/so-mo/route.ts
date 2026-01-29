import { NextResponse } from 'next/server';
import { searchDreams, getTrendingDreams, checkDreamMatches } from '@/lib/dream-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query) {
            // If no query, return trending/random items
            const trending = getTrendingDreams();
            const resultsWithMatches = await Promise.all(
                trending.map(async (item) => ({
                    ...item,
                    matchDate: await checkDreamMatches(item.numbers)
                }))
            );
            return NextResponse.json({ success: true, data: resultsWithMatches, mode: 'trending' });
        }

        const results = searchDreams(query);
        const resultsWithMatches = await Promise.all(
            results.map(async (item) => ({
                ...item,
                matchDate: await checkDreamMatches(item.numbers)
            }))
        );
        return NextResponse.json({
            success: true,
            data: resultsWithMatches,
            query,
            total: results.length,
            mode: 'search'
        });

    } catch (error: any) {
        console.error('Error in so-mo search:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
