import { NextResponse } from 'next/server';
import { getOrUpdateBacNhoData } from '@/lib/bac-nho-cache-service';
import { analyzeBacNhoCap3 } from '@/lib/bac-nho-cap-3';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '100');

        const data = await getOrUpdateBacNhoData(
            days === 100 ? 'cap-3' : `cap-3-${days}`,
            (d: number) => analyzeBacNhoCap3(d),
            days
        );

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
