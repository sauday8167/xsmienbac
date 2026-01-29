import { query } from './db';

interface Prize1TomorrowResult {
    date: string;
    originalPrize1: string;
    nextDate: string | null;
    nextPrize1: string | null;
}

interface StatsSummary {
    number: string;
    count: number;
}

// Helper to get all loto numbers (last 2 digits) from a draw result
function getLotoFromDrawLocal(row: any): string[] {
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

export async function getPrize1TomorrowStats(targetNumber: string) {
    // 1. Find all dates where First Prize ends with targetNumber
    const sql = `
        SELECT draw_date, prize_1 
        FROM xsmb_results 
        WHERE prize_1 LIKE ? 
        ORDER BY draw_date DESC
    `;
    const historicalOccurrences = await query<any[]>(sql, [`%${targetNumber}`]);

    const results: Prize1TomorrowResult[] = [];
    const nextDayRecords: any[] = [];

    for (const record of historicalOccurrences) {
        // Find the complete record for the next day
        const nextSql = `
            SELECT * 
            FROM xsmb_results 
            WHERE draw_date > ? 
            ORDER BY draw_date ASC 
            LIMIT 1
        `;
        const nextRecord = await query<any[]>(nextSql, [record.draw_date]);

        results.push({
            date: record.draw_date,
            originalPrize1: record.prize_1,
            nextDate: nextRecord[0]?.draw_date || null,
            nextPrize1: nextRecord[0]?.prize_1 || null
        });

        if (nextRecord[0]) {
            nextDayRecords.push(nextRecord[0]);
        }
    }

    // Filter out historical occurrences where we don't have the next day's data
    const validResults = results.filter(r => r.nextPrize1 !== null);

    // 2. Aggregate statistics
    const frequencies: Record<string, number> = {};
    const heads: Record<string, number> = {};
    const tails: Record<string, number> = {};
    const sums: Record<string, number> = {};

    nextDayRecords.forEach(nextDayRecord => {
        // 2a. Frequency: Use ALL loto numbers from the complete next day's draw
        const allLotos = getLotoFromDrawLocal(nextDayRecord);
        allLotos.forEach(loto => {
            frequencies[loto] = (frequencies[loto] || 0) + 1;
        });

        // 2b. Head/Tail/Sum: Use ONLY Prize 1
        if (nextDayRecord.prize_1) {
            const p1Loto = nextDayRecord.prize_1.trim().slice(-2);
            if (p1Loto.length === 2 && !isNaN(Number(p1Loto))) {
                const head = p1Loto[0];
                const tail = p1Loto[1];
                const sum = (parseInt(head) + parseInt(tail)) % 10;

                heads[head] = (heads[head] || 0) + 1;
                tails[tail] = (tails[tail] || 0) + 1;
                sums[sum.toString()] = (sums[sum.toString()] || 0) + 1;
            }
        }
    });

    const formatStats = (obj: Record<string, number>): StatsSummary[] =>
        Object.entries(obj)
            .map(([number, count]) => ({ number, count }))
            .sort((a, b) => b.count - a.count);

    return {
        targetNumber,
        occurrenceCount: validResults.length,
        frequencies: formatStats(frequencies),
        heads: formatStats(heads),
        tails: formatStats(tails),
        sums: formatStats(sums),
        history: validResults
    };
}
