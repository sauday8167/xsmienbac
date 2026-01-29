import { query } from './db';

interface DbTomorrowResult {
    date: string;
    originalSpecial: string;
    nextDate: string | null;
    nextSpecial: string | null;
}

interface StatsSummary {
    number: string;
    count: number;
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

export async function getDbTomorrowStats(targetNumber: string) {
    // 1. Find all dates where Special Prize ends with targetNumber
    const sql = `
        SELECT draw_date, special_prize 
        FROM xsmb_results 
        WHERE special_prize LIKE ? 
        ORDER BY draw_date DESC
    `;
    const historicalOccurrences = await query<any[]>(sql, [`%${targetNumber}`]);

    const results: DbTomorrowResult[] = [];
    const nextDayRecords: any[] = [];

    for (const record of historicalOccurrences) {
        // Find the complete record for the next day (all prize columns)
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
            originalSpecial: record.special_prize,
            nextDate: nextRecord[0]?.draw_date || null,
            nextSpecial: nextRecord[0]?.special_prize || null
        });

        // Store the complete next day record for loto extraction
        if (nextRecord[0]) {
            nextDayRecords.push(nextRecord[0]);
        }
    }

    // Filter out historical occurrences where we don't have the next day's data (e.g., today)
    const validResults = results.filter(r => r.nextSpecial !== null);

    // 2. Aggregate statistics from ALL loto numbers in next day's draws
    interface StatTracker {
        count: number;
        firstIndex: number;
    }

    const frequencies: Record<string, StatTracker> = {};
    const heads: Record<string, StatTracker> = {};
    const tails: Record<string, StatTracker> = {};
    const sums: Record<string, StatTracker> = {};

    const updateStat = (repo: Record<string, StatTracker>, key: string, index: number) => {
        if (!repo[key]) {
            repo[key] = { count: 0, firstIndex: index };
        }
        repo[key].count++;
    };

    nextDayRecords.forEach((nextDayRecord, index) => {
        // 1. Frequency statistics: Use ALL loto numbers from the complete next day's draw
        const allLotos = getLotoFromDraw(nextDayRecord);
        allLotos.forEach(loto => {
            updateStat(frequencies, loto, index);
        });

        // 2. Head/Tail/Sum statistics: Use ONLY the Special Prize
        if (nextDayRecord.special_prize) {
            const specialLoto = nextDayRecord.special_prize.trim().slice(-2);
            if (specialLoto.length === 2 && !isNaN(Number(specialLoto))) {
                const head = specialLoto[0];
                const tail = specialLoto[1];
                const sum = (parseInt(head) + parseInt(tail)) % 10;

                updateStat(heads, head, index);
                updateStat(tails, tail, index);
                updateStat(sums, sum.toString(), index);
            }
        }
    });

    const formatStats = (obj: Record<string, StatTracker>): StatsSummary[] =>
        Object.entries(obj)
            .map(([number, val]) => ({ number, count: val.count, firstIndex: val.firstIndex }))
            .sort((a, b) => {
                const countDiff = b.count - a.count;
                if (countDiff !== 0) return countDiff;
                return a.firstIndex - b.firstIndex; // Lower index = More Recent = Better
            })
            .map(({ number, count }) => ({ number, count }));

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

