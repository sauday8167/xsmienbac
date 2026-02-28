export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getDbTomorrowStats } from '@/lib/db-tomorrow-stats';
import { queryOne } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        let targetNumber = searchParams.get('number');
        const date = searchParams.get('date');

        // If date is provided, find the target number from that date's special prize
        if (date && !targetNumber) {
            const result = await queryOne<any>(
                'SELECT special_prize FROM xsmb_results WHERE draw_date = ?',
                [date]
            );
            if (result && result.special_prize) {
                targetNumber = result.special_prize.slice(-2);
            }
        }

        if (!targetNumber || targetNumber.length !== 2) {
            return NextResponse.json({
                success: false,
                message: 'Vui lòng cung cấp số gồm 2 chữ số hoặc ngày hợp lệ'
            }, { status: 400 });
        }

        const data = await getDbTomorrowStats(targetNumber);

        return NextResponse.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error in db-tomorrow stats API:', error);
        return NextResponse.json({
            success: false,
            message: 'Đã xảy ra lỗi khi tính toán thống kê'
        }, { status: 500 });
    }
}
