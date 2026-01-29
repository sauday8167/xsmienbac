import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';
import type { NextRequest } from 'next/server';

export async function DELETE(request: NextRequest) {
    try {
        const admin = verifyAdmin(request);
        if (!admin) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Missing id parameter' },
                { status: 400 }
            );
        }

        await query(
            'DELETE FROM ai_predictions WHERE id = ?',
            [id]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting prediction:', error);
        return NextResponse.json(
            { error: 'Failed to delete prediction' },
            { status: 500 }
        );
    }
}
