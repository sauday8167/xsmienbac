import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';


/**
 * Cron Job Endpoint: Auto AI Prediction
 * Schedule: 00:10 daily (Vietnam time)
 * 
 * This endpoint automatically runs AI predictions every day at 00:10
 * Protected by CRON_SECRET for security
 */
export async function GET(request: Request) {
    try {
        // 1. Verify Authorization
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token || token !== process.env.CRON_SECRET) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // 2. Get Vietnam time
        const vnTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
        const hour = vnTime.getHours();
        const minute = vnTime.getMinutes();

        /*
        // 3. Verify time window (00:00 - 00:20)
        if (hour !== 0 || minute > 20) {
            return NextResponse.json({
                success: false,
                error: 'Not prediction time',
                currentTime: `${hour}:${minute}`,
                expectedTime: '00:00-00:20'
            }, { status: 400 });
        }
        */

        // 4. Call the existing prediction API
        // Try to get baseUrl from environment or request headers, default to 127.0.0.1 for VPS stability
        const host = request.headers.get('host') || 'localhost:3000';
        const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;

        // Internal calls on VPS are often more stable using 127.0.0.1 if localhost fails
        const internalUrl = baseUrl.includes('localhost') || baseUrl.includes('xosomienbac24h.com')
            ? 'http://127.0.0.1:3000/api/admin/ai/run-prediction'
            : `${baseUrl}/api/admin/ai/run-prediction`;

        console.log(`[CRON] Triggering analysis at: ${internalUrl}`);

        const predictionResponse = await fetch(internalUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.CRON_SECRET}`
            },
            body: JSON.stringify({ targetDate: null }) // explicitly set targetDate null for today
        });

        const responseText = await predictionResponse.text();
        let predictionData;

        try {
            predictionData = JSON.parse(responseText);
        } catch (e) {
            console.error(`[CRON] Failed to parse JSON. Status: ${predictionResponse.status}. Body starts with: ${responseText.substring(0, 100)}`);
            return NextResponse.json({
                success: false,
                error: 'Internal API returned non-JSON response',
                status: predictionResponse.status,
                preview: responseText.substring(0, 200)
            }, { status: 500 });
        }

        if (!predictionData.success) {
            console.error('[CRON] Prediction API reported failure:', predictionData.error);
            return NextResponse.json({
                success: false,
                error: predictionData.error || 'Prediction failed'
            }, { status: 500 });
        }

        console.log('✅ Auto prediction completed successfully');

        return NextResponse.json({
            success: true,
            message: 'Auto prediction completed',
            time: vnTime.toISOString(),
            data: predictionData.data
        });

    } catch (error: any) {
        console.error('Error in auto prediction cron:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Internal server error'
        }, { status: 500 });
    }
}
