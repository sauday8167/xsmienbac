import { NextResponse } from 'next/server';
import { getOrUpdateBacNhoData } from '@/lib/bac-nho-cache-service';
import { analyzeBacNho2Ngay } from '@/lib/bac-nho-2-ngay';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const toDate = searchParams.get('toDate') || undefined;

        const data = await getOrUpdateBacNhoData(
            '2-ngay',
            (d: number) => analyzeBacNho2Ngay(d, toDate),
            100,
            toDate
        );

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
