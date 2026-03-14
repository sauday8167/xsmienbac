import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const row = await queryOne<any>(`
            SELECT * FROM bac_nho_history 
            ORDER BY id DESC 
            LIMIT 1
        `);
        if (!row) {
            return NextResponse.json({ success: false, error: 'Chưa có dữ liệu' });
        }
        return NextResponse.json({ success: true, data: row });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
