import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const now = new Date();
        const vnTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
        const hour = vnTime.getHours();
        const minute = vnTime.getMinutes();

        // Get today's date in Vietnam timezone (YYYY-MM-DD)
        const today = vnTime.toLocaleDateString('sv-SE'); // e.g. "2026-05-07"

        // Fetch today's result from database
        const result = await queryOne<any>(
            'SELECT * FROM xsmb_results WHERE draw_date = ?',
            [today]
        );

        // Special prize present = draw is complete, live is over
        const hasSpecialPrize = result?.special_prize && result.special_prize.length === 5;

        // Live window: 18:05–18:45 VN time AND special prize not yet revealed
        const inDrawWindow = hour === 18 && minute >= 5 && minute <= 45;
        const isLiveTime = inDrawWindow && !hasSpecialPrize;

        // Determine phase based on actual time
        let phase = 'IDLE';
        if (inDrawWindow) {
            if (minute >= 5 && minute <= 26) phase = 'PRIZES_1_TO_7';
            else if (minute >= 27 && minute <= 29) phase = 'WAITING_FOR_SPECIAL';
            else if (minute >= 30 && minute <= 45) phase = 'SPECIAL_PRIZE';
        }

        if (!result) {
            // No DB record yet — return skeleton if in live window
            if (isLiveTime) {
                return NextResponse.json({
                    success: true,
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
                isLive: false,
                phase: 'IDLE',
                message: 'Chưa có dữ liệu cho hôm nay',
                data: null
            });
        }

        // Parse JSON array fields
        const parsed = {
            ...result,
            prize_2: result.prize_2 ? safeParseJSON(result.prize_2) : null,
            prize_3: result.prize_3 ? safeParseJSON(result.prize_3) : null,
            prize_4: result.prize_4 ? safeParseJSON(result.prize_4) : null,
            prize_5: result.prize_5 ? safeParseJSON(result.prize_5) : null,
            prize_6: result.prize_6 ? safeParseJSON(result.prize_6) : null,
            prize_7: result.prize_7 ? safeParseJSON(result.prize_7) : null,
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

function safeParseJSON(val: string): any {
    try {
        return JSON.parse(val);
    } catch {
        return val;
    }
}
