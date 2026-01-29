import { queryOne, query } from './db';
import { GdbAnalysisData } from '@/types/gdb-types';

export async function analyzeAntigravityGdb(targetDate?: string): Promise<GdbAnalysisData | null> {
    // 1. Fetch current day GĐB from xsmb_results (correct table)
    let sql = 'SELECT * FROM xsmb_results ORDER BY draw_date DESC LIMIT 1';
    let params: any[] = [];

    if (targetDate) {
        sql = 'SELECT * FROM xsmb_results WHERE draw_date <= ? ORDER BY draw_date DESC LIMIT 1';
        params = [targetDate];
    }

    const currentResult = await queryOne(sql, params);
    if (!currentResult) return null;

    const gdb = String(currentResult.special_prize || '');
    if (!gdb || gdb.length !== 5) return null;

    // Run core analysis logic for the current result
    const baseData = await runGdbAlgorithm(currentResult);
    if (!baseData) return null;

    // 2. Fetch history for the last 5 days
    const history = await getGdbRecentHistory(currentResult.draw_date);

    return {
        ...baseData,
        history
    };
}

/**
 * Core algorithm logic separated for reuse in history calculation
 */
async function runGdbAlgorithm(currentResult: any) {
    const gdb = String(currentResult.special_prize || '');
    const digits = gdb.split('');
    const d1 = digits[0];
    const d3 = digits[2];
    const d5 = digits[4];

    // Fetch previous day GĐB for noise filtering
    const prevResult = await queryOne(
        'SELECT special_prize FROM xsmb_results WHERE draw_date < ? ORDER BY draw_date DESC LIMIT 1',
        [currentResult.draw_date]
    );

    let prevDe = null;
    if (prevResult && prevResult.special_prize) {
        prevDe = String(prevResult.special_prize).slice(-2);
    }

    // A. Sum (The Sum)
    const sumValue = digits.reduce((a: number, b: string) => a + (parseInt(b) || 0), 0);
    let sumPairs: string[] = [];
    if (sumValue < 10) {
        sumPairs = [`0${sumValue}`, `${sumValue}0`];
    } else {
        const sStr = sumValue.toString();
        const rev = sStr.split('').reverse().join('');
        sumPairs = [sStr, rev];
    }
    sumPairs = Array.from(new Set(sumPairs)).filter(p => p !== prevDe);

    // B. Edge Pairing (Ghép Biên)
    let edgePairs = [d1 + d5, d5 + d1];
    edgePairs = Array.from(new Set(edgePairs)).filter(p => p !== prevDe);

    // C. Pivot Touch (Điểm Chạm)
    const touchSet: string[] = [];
    for (let i = 0; i < 10; i++) {
        touchSet.push(d3 + i.toString());
        touchSet.push(i.toString() + d3);
    }
    const finalTouchSet = Array.from(new Set(touchSet))
        .filter(p => p !== prevDe)
        .sort();

    // Check rating for edge pairs
    const monthResults = await query(
        'SELECT special_prize FROM xsmb_results WHERE draw_date < ? ORDER BY draw_date DESC LIMIT 30',
        [currentResult.draw_date]
    );
    const desInRange = (monthResults || [])
        .filter((r: any) => r && r.special_prize)
        .map((r: any) => String(r.special_prize).slice(-2));
    const hitCount = desInRange.filter((de: string) => edgePairs.includes(de)).length;
    const rating = hitCount > 2 ? 'Tốt' : 'Thường';

    return {
        date: currentResult.draw_date,
        rawGdb: gdb,
        sum: {
            value: sumValue,
            pairs: sumPairs,
            message: "Tổng giá trị 5 chữ số của Giải Đặc Biệt."
        },
        edge: {
            digits: [d1, d5] as [string, string],
            pairs: edgePairs,
            rating: rating as 'Tốt' | 'Thường',
            message: `Ghép biên từ chữ số đầu (${d1}) và chữ số cuối (${d5}).`
        },
        pivot: {
            digit: d3,
            touchSet: finalTouchSet,
            message: `Lấy chữ số trung tâm (${d3}) làm điểm chạm chính cho dàn nuôi.`
        },
        strategy: {
            method: "Antigravity 1-3-8",
            advice: "Sử dụng cho dàn nuôi khung 3 ngày. Ngày 1: 1đ, Ngày 2: 3đ, Ngày 3: 8đ. Dừng lại ngay khi trúng để bảo toàn vốn."
        }
    };
}

/**
 * Calculates the hit/miss history for the last 5 days
 */
async function getGdbRecentHistory(latestDate: string, limit: number = 5) {
    const results = await query(
        'SELECT * FROM xsmb_results WHERE draw_date <= ? ORDER BY draw_date DESC LIMIT ?',
        [latestDate, limit + 1]
    );

    const history: any[] = [];

    // For each result (the "outcome"), we look at the results from the day BEFORE to see the prediction
    for (let i = 0; i < Math.min(results.length - 1, limit); i++) {
        const outcomeResult = results[i];
        const inputResult = results[i + 1];

        const prediction = await runGdbAlgorithm(inputResult);
        const actualDe = String(outcomeResult.special_prize || '').slice(-2);

        const hitInSum = prediction.sum.pairs.includes(actualDe);
        const hitInEdge = prediction.edge.pairs.includes(actualDe);
        const hitInTouch = prediction.pivot.touchSet.includes(actualDe);

        const isHit = hitInSum || hitInEdge || hitInTouch;
        let hitType = undefined;
        if (hitInSum) hitType = 'Sum';
        else if (hitInEdge) hitType = 'Edge';
        else if (hitInTouch) hitType = 'Touch';

        history.push({
            date: outcomeResult.draw_date,
            actualDe,
            predictedSum: prediction.sum.pairs,
            predictedEdge: prediction.edge.pairs,
            isHit,
            hitType
        });
    }

    return history;
}
