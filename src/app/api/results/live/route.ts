import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const now = new Date();
        const vnTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
        const hour = vnTime.getHours();
        const minute = vnTime.getMinutes();

        const today = vnTime.toISOString().split('T')[0];
        console.log('API Live Debug:', { serverTime: now, vnTime, today });

        // Fetch today's result from database
        const result = await queryOne<any>(
            'SELECT * FROM xsmb_results WHERE draw_date = ?',
            [today]
        );
        console.log('API Live Result:', result);

        // Check if special prize exists - if yes, LIVE is over
        const hasSpecialPrize = result?.special_prize && result.special_prize.length === 5;

        // Check if in live time window AND special prize not yet revealed
        const isLiveTime = !hasSpecialPrize && (hour === 18 && minute >= 10 && minute <= 40);

        // Determine current phase
        let phase = 'IDLE';
        if (isLiveTime) { // Simplify for test
            phase = 'PRIZES_1_TO_7'; // Default phase
        }

        if (!result) {
            // Return SKELETON if live
            if (isLiveTime) {
                return NextResponse.json({
                    success: true, // Success = true to render table
                    isLive: true,
                    phase,
                    data: {
                        draw_date: today,
                        special_prize: null,
                        prize_1: null,
                        prize_2: null,
                        prize_3: null,
                        prize_4: null,
                        prize_5: null,
                        prize_6: null,
                        prize_7: null
                    }
                });
            }

            return NextResponse.json({
                success: false,
                isLive: isLiveTime,
                phase,
                message: 'Chưa có dữ liệu cho hôm nay',
                data: null
            });
        }

        // Parse JSON fields
        const parsed = {
            ...result,
            prize_2: result.prize_2 ? JSON.parse(result.prize_2) : null,
            prize_3: result.prize_3 ? JSON.parse(result.prize_3) : null,
            prize_4: result.prize_4 ? JSON.parse(result.prize_4) : null,
            prize_5: result.prize_5 ? JSON.parse(result.prize_5) : null,
            prize_6: result.prize_6 ? JSON.parse(result.prize_6) : null,
            prize_7: result.prize_7 ? JSON.parse(result.prize_7) : null,
        };

        return NextResponse.json({
            success: true,
            isLive: isLiveTime,
            phase,
            data: parsed
        });

    } catch (error) {
        console.error('Live API Error:', error);
        return NextResponse.json(
            { success: false, error: 'Lỗi hệ thống' },
            { status: 500 }
        );
    }
}
