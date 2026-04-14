import { queryOne } from '@/lib/db';
import type { LotteryResultRaw, LotteryResult } from '@/types';

/**
 * Parse raw DB result sang định dạng LotteryResult đúng.
 * Dùng được trong cả Server Components và API Routes.
 */
export function transformResult(raw: LotteryResultRaw): LotteryResult {
    const parseSafe = (val: string) => {
        try {
            if (!val || val === 'null') return [];
            const parsed = JSON.parse(val);
            if (parsed === null) return [];
            return Array.isArray(parsed) ? parsed : [String(val)];
        } catch (e) {
            return [String(val)];
        }
    };

    const parseStringSafe = (val: string) => {
        try {
            if (!val) return '';
            const parsed = JSON.parse(val);
            return Array.isArray(parsed) ? (parsed[0] || '') : String(val);
        } catch (e) {
            return String(val || '');
        }
    };

    return {
        ...raw,
        prize_1: parseStringSafe(raw.prize_1),
        prize_2: parseSafe(raw.prize_2),
        prize_3: parseSafe(raw.prize_3),
        prize_4: parseSafe(raw.prize_4),
        prize_5: parseSafe(raw.prize_5),
        prize_6: parseSafe(raw.prize_6),
        prize_7: parseSafe(raw.prize_7),
    };
}

/**
 * Lấy kết quả xổ số mới nhất từ DB — dùng trong Server Components.
 * Google Bot sẽ thấy HTML đầy đủ thay vì spinner.
 */
export async function getLatestResult(): Promise<LotteryResult | null> {
    try {
        const raw = await queryOne<LotteryResultRaw>(
            'SELECT * FROM xsmb_results ORDER BY draw_date DESC LIMIT 1'
        );
        if (!raw) return null;
        return transformResult(raw);
    } catch (error) {
        console.error('[SSR] Error fetching latest result:', error);
        return null;
    }
}
