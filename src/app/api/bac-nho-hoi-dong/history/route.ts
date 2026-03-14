import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const rows = await query<any[]>(`
            SELECT * FROM bac_nho_history 
            ORDER BY id DESC 
            LIMIT 10
        `);
        return NextResponse.json({ success: true, data: rows || [] });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
