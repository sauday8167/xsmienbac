
import { NextResponse } from 'next/server';
import { BacNhoSpecial } from '@/lib/bac-nho-special';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') === 'khung' ? 'khung' : 'today';

    try {
        const result = await BacNhoSpecial.analyze(mode);
        
        return NextResponse.json({
            success: true,
            data: result.data,
            baseDate: result.baseDate,
            lastUpdated: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('API Bac Nho Special Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
