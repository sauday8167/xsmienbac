import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { endpoint, keys } = await request.json();
        if (!endpoint || !keys?.p256dh || !keys?.auth) {
            return NextResponse.json({ success: false, error: 'Invalid subscription data' }, { status: 400 });
        }

        await query(
            `INSERT OR REPLACE INTO push_subscriptions (endpoint, p256dh, auth) VALUES (?, ?, ?)`,
            [endpoint, keys.p256dh, keys.auth]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('push/subscribe error:', error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { endpoint } = await request.json();
        if (!endpoint) return NextResponse.json({ success: false, error: 'Missing endpoint' }, { status: 400 });

        await query(`DELETE FROM push_subscriptions WHERE endpoint = ?`, [endpoint]);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
