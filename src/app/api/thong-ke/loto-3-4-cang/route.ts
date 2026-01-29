import { NextResponse } from 'next/server';
import { analyzeLoto34Cang } from '@/lib/loto-3-4-cang';
import { getCache, setCache } from '@/lib/cache';
import { queryOne } from '@/lib/db';
import { Loto34CangData } from '@/types/loto-3-4-cang';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '1000');

    try {
        // Cache key based on latest result date to ensure data is fresh
        const latestResult = await queryOne<{ draw_date: string }>(
            'SELECT draw_date FROM xsmb_results ORDER BY draw_date DESC LIMIT 1'
        );

        const latestDate = latestResult?.draw_date || 'no-date';
        const cacheKey = `loto-3-4-cang-${days}-${latestDate}`;

        const cachedData = await getCache<Loto34CangData>(cacheKey, latestDate);
        if (cachedData) {
            return NextResponse.json({ success: true, data: cachedData });
        }

        const data = await analyzeLoto34Cang(days);
        await setCache(cacheKey, latestDate, data);

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('API Error (Loto 3-4 Cang):', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Lỗi khi phân tích dữ liệu' },
            { status: 500 }
        );
    }
}
