import { NextResponse } from 'next/server';
import { getOrUpdateBacNhoData } from '@/lib/bac-nho-cache-service';
import { analyzeBacNhoCap3 } from '@/lib/bac-nho-cap-3';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const toDate = searchParams.get('toDate') || undefined;

        const data = await getOrUpdateBacNhoData(
            'cap-3',
            (d: number) => analyzeBacNhoCap3(d, toDate),
            100,
            toDate
        );

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
