import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface RawResult {
    draw_date: string;
    special_prize: string;
    prize_1: string;
    prize_2: string;
    prize_3: string;
    prize_4: string;
    prize_5: string;
    prize_6: string;
    prize_7: string;
}

function parseSafe(val: string): string[] {
    try {
        if (!val || val === 'null') return [];
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed.map(String) : [String(val)];
    } catch {
        return [String(val)];
    }
}

export async function GET() {
    try {
        const result = await queryOne<RawResult>(
            'SELECT * FROM xsmb_results ORDER BY draw_date DESC LIMIT 1'
        );

        if (!result) {
            return NextResponse.json({ success: false, error: 'Không có dữ liệu' });
        }

        const allNums = [
            result.special_prize,
            result.prize_1,
            ...parseSafe(result.prize_2),
            ...parseSafe(result.prize_3),
            ...parseSafe(result.prize_4),
            ...parseSafe(result.prize_5),
            ...parseSafe(result.prize_6),
            ...parseSafe(result.prize_7),
        ].filter(Boolean);

        // Last 2 digits of each number = loto pair
        const loto = allNums.map(n => String(n).padStart(2, '0').slice(-2));

        // Lô kép = both digits same (00, 11, 22, ...)
        const loKep = [...new Set(loto.filter(n => n.length === 2 && n[0] === n[1]))];

        // Ba càng = last 3 digits of special prize
        const baCang = String(result.special_prize).slice(-3);

        // Đầu (first digit) frequency
        const dauCount: Record<string, number> = {};
        loto.forEach(n => { dauCount[n[0]] = (dauCount[n[0]] || 0) + 1; });

        // Đuôi (last digit) frequency
        const duoiCount: Record<string, number> = {};
        loto.forEach(n => { duoiCount[n[1]] = (duoiCount[n[1]] || 0) + 1; });

        const topDau = Object.entries(dauCount).sort((a, b) => b[1] - a[1]).slice(0, 3);
        const topDuoi = Object.entries(duoiCount).sort((a, b) => b[1] - a[1]).slice(0, 3);

        return NextResponse.json({
            success: true,
            data: {
                draw_date: result.draw_date,
                special_prize: result.special_prize,
                ba_cang: baCang,
                lo_kep: loKep,
                top_dau: topDau,
                top_duoi: topDuoi,
                total_lo: loto.length,
            }
        });
    } catch (error) {
        console.error('highlights/yesterday error:', error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
