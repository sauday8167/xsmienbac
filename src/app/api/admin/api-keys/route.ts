import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { ApiResponse } from '@/types';

// GET /api/admin/api-keys
export async function GET() {
    try {
        const keys = await query('SELECT * FROM api_keys ORDER BY created_at DESC');
        return NextResponse.json<ApiResponse>({
            success: true,
            data: keys
        });
    } catch (error) {
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Failed to fetch keys'
        }, { status: 500 });
    }
}

// POST /api/admin/api-keys - Add new key
export async function POST(request: Request) {
    try {
        const { key, provider = 'gemini' } = await request.json();
        if (!key) {
            return NextResponse.json({ success: false, error: 'Key is required' }, { status: 400 });
        }

        await query(
            `INSERT INTO api_keys (key, provider, status) VALUES (?, ?, 'active')`,
            [key, provider]
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.message?.includes('UNIQUE')) {
            return NextResponse.json({ success: false, error: 'Key already exists' }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: 'Failed to add key' }, { status: 500 });
    }
}

// DELETE /api/admin/api-keys?id=x
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

        await query('DELETE FROM api_keys WHERE id = ?', [id]);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
    }
}
