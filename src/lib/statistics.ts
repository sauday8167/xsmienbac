import { query } from './db';

interface LotoStat {
    number: string;
    count: number;
    lastDate?: string;
    daysSince?: number;
}

// Helper to get all loto numbers (last 2 digits) from a draw result
function getLotoFromDraw(row: any): string[] {
    const lotos: string[] = [];

    const addLoto = (val: string) => {
        if (!val) return;
        // Take last 2 digits
        const loto = val.trim().slice(-2);
        if (loto.length === 2 && !isNaN(Number(loto))) {
            lotos.push(loto);
        }
    };

    // Special prize
    addLoto(row.special_prize);

    // Prize 1 (single)
    addLoto(row.prize_1);

    // Arrays stored as JSON strings
    const parseAndAdd = (jsonStr: string) => {
        try {
            const arr = JSON.parse(jsonStr);
            if (Array.isArray(arr)) {
                arr.forEach(val => addLoto(val));
            }
        } catch (e) { }
    };

    parseAndAdd(row.prize_2);
    parseAndAdd(row.prize_3);
    parseAndAdd(row.prize_4);
    parseAndAdd(row.prize_5);
    parseAndAdd(row.prize_6);
    parseAndAdd(row.prize_7);

    return lotos;
}

export async function calculateLoGan(limit: number = 10, periods: number = 100) {
    // Get last N results
    const rows = await query<any[]>(`
        SELECT * FROM xsmb_results 
        ORDER BY draw_date DESC 
        LIMIT ?
    `, [periods]);

    if (!rows || rows.length === 0) return [];

    // Track last appearance of each number 00-99
    const lastAppearance: Record<string, number> = {};
    const allNumbers = Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, '0'));

    // Initialize with "infinity" (not seen in this window)
    // simpler: Iterate from latest to oldest.
    // If we see a number, record its index (0 = latest today).

    const seenMap: Record<string, number> = {};

    rows.forEach((row, index) => {
        // index 0 is latest
        const lotos = getLotoFromDraw(row);
        lotos.forEach(num => {
            if (seenMap[num] === undefined) {
                seenMap[num] = index; // Found at 'index' days ago
            }
        });
    });

    const results: LotoStat[] = [];
    const today = new Date(); // Or the latest draw date from DB? 
    // "Gan" usually means days/draws since last appearance.
    // If seenMap has it, gan = seenMap[num].
    // If not seen in 100 draws, gan >= 100.

    allNumbers.forEach(num => {
        const days = seenMap[num] !== undefined ? seenMap[num] : periods;
        // Only count if it hasn't appeared recently? No, Lô Gan tracks max days hidden.
        results.push({
            number: num,
            count: 0, // Not used here
            daysSince: days
        });
    });

    // Sort by daysSince DESC
    results.sort((a, b) => (b.daysSince || 0) - (a.daysSince || 0));

    return results.slice(0, limit);
}

export async function calculateFrequent(limit: number = 10, periods: number = 10) {
    const rows = await query<any[]>(`
        SELECT * FROM xsmb_results 
        ORDER BY draw_date DESC 
        LIMIT ?
    `, [periods]);

    if (!rows || rows.length === 0) return [];

    const counts: Record<string, number> = {};

    rows.forEach(row => {
        const lotos = getLotoFromDraw(row);
        lotos.forEach(num => {
            counts[num] = (counts[num] || 0) + 1;
        });
    });

    const results: LotoStat[] = [];
    Object.keys(counts).forEach(num => {
        results.push({
            number: num,
            count: counts[num]
        });
    });

    // Sort by count DESC
    results.sort((a, b) => b.count - a.count);

    return results.slice(0, limit);
}

/**
 * Tìm các cặp số (Rare Pairs) hiếm khi xuất hiện cùng nhau nhưng có tần suất lịch sử tốt.
 * Giúp AI tìm ra các con số "phá vỡ" sự lặp lại.
 */
export async function calculateRarePairs(limit: number = 20, historyDays: number = 365, silentDays: number = 14) {
    const rows = await query<any[]>(`
        SELECT * FROM xsmb_results 
        ORDER BY draw_date DESC 
        LIMIT ?
    `, [historyDays]);

    if (!rows || rows.length < silentDays) return [];

    const pairCounts: Record<string, number> = {};
    const lastSeenPair: Record<string, number> = {};

    rows.forEach((row, index) => {
        const lotos = Array.from(new Set(getLotoFromDraw(row))).sort();
        for (let i = 0; i < lotos.length; i++) {
            for (let j = i + 1; j < lotos.length; j++) {
                const pair = `${lotos[i]},${lotos[j]}`;
                pairCounts[pair] = (pairCounts[pair] || 0) + 1;
                if (lastSeenPair[pair] === undefined) {
                    lastSeenPair[pair] = index; // 0 là hôm nay
                }
            }
        }
    });

    const results = Object.keys(pairCounts)
        .map(pair => ({
            pair: pair.split(','),
            frequency: pairCounts[pair],
            daysSince: lastSeenPair[pair]
        }))
        .filter(item => item.daysSince >= silentDays) // Đã "câm" ít nhất silentDays ngày
        .sort((a, b) => b.frequency - a.frequency) // Ưu tiên cặp có tần suất lịch sử cao nhất
        .slice(0, limit);

    return results;
}
