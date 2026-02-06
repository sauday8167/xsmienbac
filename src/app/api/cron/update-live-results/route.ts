import { NextResponse } from 'next/server';
import { crawlAllAPIsRacing } from '@/lib/realtime-crawler';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60s for racing system

/**
 * Cron Job Endpoint - Updates live lottery results
 * Should be called every 3-5 seconds during live time (18:10-18:40)
 */
export async function GET(request: Request) {
    try {
        // Verify authorization (cron secret or internal call)
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET || 'default-secret-change-me';

        if (authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check if in live time window
        const now = new Date();
        const vnTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
        const hour = vnTime.getHours();
        const minute = vnTime.getMinutes();

        // Live time: 18:10 - 18:40
        const isLiveTime = hour === 18 && minute >= 10 && minute <= 40;

        if (!isLiveTime) {
            return NextResponse.json({
                success: true,
                message: 'Not in live time window',
                timestamp: vnTime.toISOString(),
                isLiveTime: false
            });
        }

        console.log('[Cron] Starting live result update...');

        // Crawl with racing system
        const result = await crawlAllAPIsRacing();

        if (!result) {
            console.log('[Cron] No valid results from any API');
            return NextResponse.json({
                success: false,
                message: 'No valid results from any API',
                timestamp: vnTime.toISOString(),
                isLiveTime: true
            });
        }

        console.log(`[Cron] Got result from ${result.source}`);

        // Update database (upsert)
        const today = vnTime.toISOString().split('T')[0];

        // Check if record exists
        const existing = await query<any[]>(
            'SELECT id FROM xsmb_results WHERE draw_date = ?',
            [today]
        );

        if (existing.length > 0) {
            // Update existing record
            await query(`
                UPDATE xsmb_results SET
                    special_prize = ?,
                    prize_1 = ?,
                    prize_2 = ?,
                    prize_3 = ?,
                    prize_4 = ?,
                    prize_5 = ?,
                    prize_6 = ?,
                    prize_7 = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE draw_date = ?
            `, [
                result.special_prize,
                result.prize_1,
                JSON.stringify(result.prize_2),
                JSON.stringify(result.prize_3),
                JSON.stringify(result.prize_4),
                JSON.stringify(result.prize_5),
                JSON.stringify(result.prize_6),
                JSON.stringify(result.prize_7),
                today
            ]);

            console.log('[Cron] Updated existing record');
        } else {
            // Insert new record
            await query(`
                INSERT INTO xsmb_results (
                    draw_date, special_prize, prize_1, prize_2, prize_3,
                    prize_4, prize_5, prize_6, prize_7, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `, [
                today,
                result.special_prize,
                result.prize_1,
                JSON.stringify(result.prize_2),
                JSON.stringify(result.prize_3),
                JSON.stringify(result.prize_4),
                JSON.stringify(result.prize_5),
                JSON.stringify(result.prize_6),
                JSON.stringify(result.prize_7)
            ]);

            console.log('[Cron] Inserted new record');
        }

        return NextResponse.json({
            success: true,
            message: 'Live result updated successfully',
            source: result.source,
            timestamp: vnTime.toISOString(),
            isLiveTime: true,
            data: {
                draw_date: result.draw_date,
                has_special: !!result.special_prize,
                has_prize_1: !!result.prize_1,
                has_prize_7: !!(result.prize_7 && result.prize_7.length > 0)
            }
        });

    } catch (error) {
        console.error('[Cron] Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
