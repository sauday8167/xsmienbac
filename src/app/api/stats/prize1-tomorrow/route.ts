import { NextResponse } from 'next/server';
import { getPrize1TomorrowStats } from '@/lib/prize1-tomorrow-stats';
import { queryOne } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        let targetNumber = searchParams.get('number');
        const date = searchParams.get('date');

        if (date && !targetNumber) {
            const result = await queryOne<any>(
                'SELECT prize_1 FROM xsmb_results WHERE draw_date = ?',
                [date]
            );
            if (result && result.prize_1) {
                targetNumber = result.prize_1.slice(-2);
            }
        }

        if (!targetNumber || targetNumber.length !== 2) {
            return NextResponse.json({
                success: false,
                message: 'Vui lòng cung cấp số gồm 2 chữ số hoặc ngày hợp lệ'
            }, { status: 400 });
        }

        const data = await getPrize1TomorrowStats(targetNumber);

        return NextResponse.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error in prize1-tomorrow stats API:', error);
        return NextResponse.json({
            success: false,
            message: 'Đã xảy ra lỗi khi tính toán thống kê'
        }, { status: 500 });
    }
}
