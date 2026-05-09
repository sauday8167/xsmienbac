import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import webpush from 'web-push';

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:admin@xosomienbac24h.com';

if (VAPID_PUBLIC && VAPID_PRIVATE) {
    webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE);
}

interface Subscription {
    endpoint: string;
    p256dh: string;
    auth: string;
}

export async function POST(request: Request) {
    if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
        return NextResponse.json({ success: false, error: 'VAPID keys not configured' }, { status: 500 });
    }

    try {
        const { title, body, url } = await request.json();
        const subs = await query<Subscription[]>('SELECT endpoint, p256dh, auth FROM push_subscriptions');

        if (!subs.length) {
            return NextResponse.json({ success: true, sent: 0, message: 'No subscribers' });
        }

        const payload = JSON.stringify({ title: title || 'XSMB 24h', body: body || 'Có kết quả mới!', url: url || '/' });
        let sent = 0;
        let failed = 0;
        const toRemove: string[] = [];

        await Promise.allSettled(subs.map(async sub => {
            try {
                await webpush.sendNotification(
                    { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                    payload
                );
                sent++;
            } catch (err: any) {
                if (err.statusCode === 410 || err.statusCode === 404) {
                    toRemove.push(sub.endpoint);
                }
                failed++;
            }
        }));

        // Remove expired subscriptions
        for (const ep of toRemove) {
            await query(`DELETE FROM push_subscriptions WHERE endpoint = ?`, [ep]).catch(() => {});
        }

        return NextResponse.json({ success: true, sent, failed, removed: toRemove.length });
    } catch (error) {
        console.error('push/send error:', error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
