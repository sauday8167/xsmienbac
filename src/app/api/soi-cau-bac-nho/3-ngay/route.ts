import { NextResponse } from 'next/server';
import { getOrUpdateBacNhoData } from '@/lib/bac-nho-cache-service';
import { analyzeBacNho3Ngay } from '@/lib/bac-nho-3-ngay';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '100');

        const data = await getOrUpdateBacNhoData(
            days === 100 ? '3-ngay' : `3-ngay-${days}`,
            (d: number) => analyzeBacNho3Ngay(d),
            days
        );

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
