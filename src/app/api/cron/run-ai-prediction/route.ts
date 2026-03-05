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

        // 3. Verify time window (00:00 - 00:20)
        if (hour !== 0 || minute > 20) {
            return NextResponse.json({
                success: false,
                error: 'Not prediction time',
                currentTime: `${hour}:${minute}`,
                expectedTime: '00:00-00:20'
            }, { status: 400 });
        }

        // 4. Call the existing prediction API
        // On VPS, internal fetch to 127.0.0.1 might hit a generic web server block.
        // We will try localhost:3000 which is where Next.js is bound according to logs.
        const host = request.headers.get('host') || 'xosomienbac24h.com';
        const internalUrl = `http://localhost:3000/api/admin/ai/run-prediction`;

        console.log(`[CRON] Internal Trigger: ${internalUrl} (Host: ${host})`);

        try {
            const predictionResponse = await fetch(internalUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.CRON_SECRET}`,
                    'Host': host // Pass the original host just in case middleware/proxy needs it
                },
                body: JSON.stringify({ targetDate: null }),
                cache: 'no-store'
            });

            const responseText = await predictionResponse.text();

            // Check if it's HTML (error page)
            if (responseText.trim().toLowerCase().startsWith('<!doctype html') ||
                responseText.trim().toLowerCase().startsWith('<html')) {
                console.error(`[CRON] Received HTML instead of JSON. Status: ${predictionResponse.status}`);
                return NextResponse.json({
                    success: false,
                    error: 'Server returned HTML error page instead of JSON',
                    status: predictionResponse.status,
                    preview: responseText.substring(0, 300).replace(/<\/?[^>]+(>|$)/g, "")
                }, { status: 500 });
            }

            const predictionData = JSON.parse(responseText);

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
                data: predictionData.data
            });

        } catch (fetchError: any) {
            console.error('[CRON] Fetch Failed:', fetchError.message);
            return NextResponse.json({
                success: false,
                error: 'Connection to internal API failed',
                details: fetchError.message
            }, { status: 500 });
        }

    } catch (error: any) {
        console.error('Error in auto prediction cron:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Internal server error'
        }, { status: 500 });
    }
}
