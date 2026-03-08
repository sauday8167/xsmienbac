import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // Allow 2 minutes for YouTube cào + AI processing

/**
 * Cron Endpoint: Run So Hot
 * GET /api/cron/run-so-hot
 * 
 * Schedule: 17:00 VN Time hàng ngày (qua crontab hoặc PM2 module)
 * Calls POST /api/admin/update-so-hot internally to update so-hot.json
 */
export async function GET(request: Request) {
    try {
        // 1. Xác thực tự động: CRON_SECRET auth header
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token || token !== process.env.CRON_SECRET) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized CRON endpoint' },
                { status: 401 }
            );
        }

        const vnTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
        console.log(`[Cron] Bắt đầu tự động cập nhật so-hot.json lúc ${vnTime.toISOString()}`);

        // 2. Gọi logic update-so-hot 
        // Trong môi trường Next.js production / server, 
        // tốt nhất là call thẳng URL full nếu environment variables baseUrl tồn tại,
        // hoặc gọi fetch local tới chính server.

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const updateUrl = `${baseUrl}/api/admin/update-so-hot`;

        const response = await fetch(updateUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.CRON_SECRET}` // Pass through
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to call update API: ${response.status} ${errorText}`);
        }

        const data = await response.json();

        return NextResponse.json({
            success: true,
            cron_run_at: vnTime.toISOString(),
            result: data
        });

    } catch (error: any) {
        console.error('[Cron] Lỗi khi chạy update-so-hot:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
