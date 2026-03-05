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
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        console.log(`[CRON] Calling internal API: ${baseUrl}/api/admin/ai/run-prediction`);

        const predictionResponse = await fetch(`${baseUrl}/api/admin/ai/run-prediction`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.CRON_SECRET}`
            },
            body: JSON.stringify({})
        });

        const contentType = predictionResponse.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const errorText = await predictionResponse.text();
            console.error(`[CRON] Internal API returned non-JSON response (${predictionResponse.status}):`, errorText.substring(0, 200));
            return NextResponse.json({
                success: false,
                error: `Internal API returned ${predictionResponse.status}`,
                details: errorText.substring(0, 100)
            }, { status: 500 });
        }

        const predictionData = await predictionResponse.json();

        if (!predictionData.success) {
            console.error('Prediction failed:', predictionData.error);
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
