import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

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
        const p = JSON.parse(val);
        return Array.isArray(p) ? p.map(String) : [String(val)];
    } catch {
        return [String(val)];
    }
}

function getLoto(result: RawResult): string[] {
    const all = [
        result.special_prize, result.prize_1,
        ...parseSafe(result.prize_2), ...parseSafe(result.prize_3),
        ...parseSafe(result.prize_4), ...parseSafe(result.prize_5),
        ...parseSafe(result.prize_6), ...parseSafe(result.prize_7),
    ].filter(Boolean);
    return all.map(n => String(n).padStart(2, '0').slice(-2));
}

export async function GET() {
    try {
        // Get last 30 days of results for pattern analysis
        const results = await query<RawResult[]>(
            'SELECT * FROM xsmb_results ORDER BY draw_date DESC LIMIT 30'
        );

        if (!results.length) {
            return NextResponse.json({ success: false, error: 'Không có dữ liệu' });
        }

        const latest = results[0];
        const latestLoto = getLoto(latest);

        // Frequency analysis over last 30 days
        const freq: Record<string, number> = {};
        for (let n = 0; n <= 99; n++) {
            freq[n.toString().padStart(2, '0')] = 0;
        }
        results.forEach(r => {
            getLoto(r).forEach(n => { freq[n] = (freq[n] || 0) + 1; });
        });

        // Tần suất cao (>= 30% = 9+ lần / 30 ngày)
        const hotNums = Object.entries(freq)
            .filter(([, c]) => c >= 9)
            .sort((a, b) => b[1] - a[1])
            .map(([n]) => n);

        // Lô gan (không về >= 5 ngày)
        const lastSeen: Record<string, number> = {};
        results.forEach((r, idx) => {
            getLoto(r).forEach(n => {
                if (lastSeen[n] === undefined) lastSeen[n] = idx;
            });
        });
        const ganNums = Object.entries(lastSeen)
            .filter(([, days]) => days >= 5)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15)
            .map(([n]) => n);

        // Ba càng từ giải đặc biệt hôm nay
        const baCang = String(latest.special_prize).slice(-3);
        const baCangLoto = [baCang.slice(-2), baCang.slice(0, 2)];

        // Dàn đề từ AI prediction (nếu có)
        let aiPredicted: string[] = [];
        try {
            const aiRow = await queryOne<{ predicted_pairs: string }>(
                'SELECT predicted_pairs FROM ai_predictions ORDER BY draw_date DESC LIMIT 1'
            );
            if (aiRow?.predicted_pairs) {
                aiPredicted = JSON.parse(aiRow.predicted_pairs);
            }
        } catch { /* no AI data */ }

        // Dàn đề tổng hợp: union of hotNums (top 10) + ganNums (top 5) + baCangLoto + aiPredicted
        const danDeSet = new Set([
            ...hotNums.slice(0, 10),
            ...ganNums.slice(0, 5),
            ...baCangLoto,
            ...aiPredicted,
        ]);
        const danDe = [...danDeSet].sort();

        return NextResponse.json({
            success: true,
            data: {
                date: latest.draw_date,
                special_prize: latest.special_prize,
                ba_cang: baCang,
                dan_de: danDe,
                hot_nums: hotNums.slice(0, 15),
                gan_nums: ganNums,
                ba_cang_loto: baCangLoto,
                ai_predicted: aiPredicted,
                days_analyzed: results.length,
            }
        });
    } catch (error) {
        console.error('soi-cau-dan-de error:', error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
