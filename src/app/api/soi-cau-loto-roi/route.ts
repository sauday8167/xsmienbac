import { NextResponse } from 'next/server';
import { analyzeLotoRoi } from '@/lib/loto-roi';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date') || undefined;

        const data = await analyzeLotoRoi(date);

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Loto Rơi API Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error', message: error.message },
            { status: 500 }
        );
    }
}
