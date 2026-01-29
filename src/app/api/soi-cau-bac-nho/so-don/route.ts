import { NextResponse } from 'next/server';
import { getOrUpdateBacNhoData } from '@/lib/bac-nho-cache-service';
import { analyzeBacNhoSoDon } from '@/lib/bac-nho-so-don';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '100');

        const data = await getOrUpdateBacNhoData(
            days === 100 ? 'so-don' : `so-don-${days}`,
            (d: number) => analyzeBacNhoSoDon(d),
            days
        );

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
