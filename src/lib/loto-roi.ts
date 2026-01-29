import { query } from './db';
import { extractAllLotoNumbers, type LotteryResultRaw } from './lottery-helpers';
import type {
    LotoRoiResponse,
    TypeAAnalysis,
    TypeBAnalysis,
    RiskAnalysis,
    FinancialPlan
} from '../types/loto-roi-types';

/**
 * Helper to get the last 2 digits of a string
 */
function getLast2(input: string | number): string {
    const s = String(input).trim();
    if (s.length < 2) return s.padStart(2, '0');
    return s.slice(-2);
}

/**
 * Get the pair for Loto Rơi.
 * - Normal: [AB, BA]
 * - Double (Kép): [KK, SHADOW]
 *   00-55, 11-66, 22-77, 33-88, 44-99
 */
function getPairFromNumber(num: string): [string, string] {
    const s = getLast2(num);

    // Check for double number
    if (s[0] === s[1]) {
        const map: Record<string, string> = {
            '00': '55', '11': '66', '22': '77', '33': '88', '44': '99',
            '55': '00', '66': '11', '77': '22', '88': '33', '99': '44'
        };
        const shadow = map[s];
        if (shadow) {
            // Sort to keep consistent (e.g. always return [00, 55])
            const pair = [s, shadow].sort();
            return [pair[0], pair[1]];
        }
    }

    const rev = s.split('').reverse().join('');
    return [s, rev];
}

/**
 * Calculate financial plan for 3 days (1:2:4)
 */
function calculateFinancialPlan(startPoints: number = 10): FinancialPlan {
    const ratio = [1, 2, 4];
    const pricePerPoint = 23; // k
    const winPerPoint = 80; // k

    let totalCaptial = 0;
    const dayPlans = ratio.map((r, index) => {
        const points = startPoints * r;
        const capital = points * pricePerPoint;
        totalCaptial += capital;

        // If win on this day
        const revenue = points * winPerPoint;
        const profit = revenue - totalCaptial;

        return {
            day: index + 1,
            points,
            capital,
            revenue,
            profit
        };
    });

    return {
        investmentRatio: [1, 2, 4],
        days: dayPlans
    };
}

/**
 * Check Lô Gan (Days since last appearance relative to startIndex)
 */
function calculateGan(number: string, results: LotteryResultRaw[], startIndex: number): number | null {
    // results is ordered DESC by date. i=0 is today/yesterday.
    // We search from startIndex + 1 to find the last occurrence.
    for (let i = startIndex + 1; i < results.length; i++) {
        const row = results[i];
        const allNumbers = extractAllLotoNumbers(row);
        if (allNumbers.includes(number)) {
            // Found it. i - startIndex is the number of days (draws) ago.
            return i - startIndex;
        }
    }
    return null; // Not found in loaded history (60 days)
}

function daysBetween(d1: string, d2: string): number {
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    const diff = Math.abs(date2.getTime() - date1.getTime());
    return Math.floor(diff / (1000 * 3600 * 24));
}

export async function analyzeLotoRoi(date?: string): Promise<LotoRoiResponse> {
    // 1. Fetch history
    const limit = 60;

    let sql = 'SELECT * FROM xsmb_results ORDER BY draw_date DESC LIMIT ?';
    let params: any[] = [limit];

    if (date) {
        sql = 'SELECT * FROM xsmb_results WHERE draw_date < ? ORDER BY draw_date DESC LIMIT ?';
        params = [date, limit];
    }

    const results = await query<LotteryResultRaw[]>(sql, params);

    if (results.length < 10) {
        throw new Error('Không đủ dữ liệu để phân tích (Cần ít nhất 10 ngày)');
    }

    // Current Analysis
    const baseData = await runLotoRoiAlgorithm(results);

    // History Analysis (last 5 days)
    const history = await getLotoRoiHistory(results, 5);

    return {
        ...baseData,
        history
    };
}

/**
 * Core algorithm for Loto Roi prediction
 */
async function runLotoRoiAlgorithm(results: LotteryResultRaw[]) {
    const tMinus1 = results[0];
    const tMinus2 = results[1];

    // Prediction Date (T): The day after the latest result
    const lastDrawDate = new Date(tMinus1.draw_date);
    const targetDate = new Date(lastDrawDate);
    targetDate.setDate(targetDate.getDate() + 1);
    const targetDateStr = targetDate.toISOString().split('T')[0];

    // --- Type A: Lô rơi từ Đề ---
    const dtMinus1 = getLast2(tMinus1.special_prize);
    const predictedPair = getPairFromNumber(dtMinus1);

    let appearedInLast3Days = false;
    let lastAppearanceDate = '';

    for (let i = 1; i <= 3; i++) {
        if (i >= results.length) break;
        const row = results[i];
        const nums = extractAllLotoNumbers(row);
        // Check if either number in the pair appeared
        if (nums.includes(predictedPair[0]) || nums.includes(predictedPair[1])) {
            appearedInLast3Days = true;
            lastAppearanceDate = row.draw_date;
            break;
        }
    }

    const typeAStatus = !appearedInLast3Days ? 'Cầu đang vào nhịp' : 'Đang khan';

    const typeAAnalysis: TypeAAnalysis = {
        pair: predictedPair,
        status: typeAStatus as any,
        suggestion: !appearedInLast3Days ? 'Nuôi khung 3 ngày' : 'Tạm dừng',
        historyCheck: {
            matches3Days: appearedInLast3Days,
            lastAppearance: lastAppearanceDate
        },
        source: tMinus1.special_prize
    };

    // --- Type B: Lô rơi từ Lô ---
    const numsT1 = extractAllLotoNumbers(tMinus1);
    const setT1 = new Set(numsT1);
    const numsT2 = extractAllLotoNumbers(tMinus2);
    const setT2 = new Set(numsT2);

    const intersection = [...setT1].filter(x => setT2.has(x)).sort();

    const countsT1: Record<string, number> = {};
    numsT1.forEach(n => countsT1[n] = (countsT1[n] || 0) + 1);
    const multiHit = Object.keys(countsT1).filter(n => countsT1[n] >= 2).sort();

    const typeBAnalysis: TypeBAnalysis = {
        intersection: {
            numbers: intersection,
            description: `Xuất hiện cả ngày ${tMinus2.draw_date} và ${tMinus1.draw_date}`
        },
        multiHit: {
            numbers: multiHit,
            description: `Về 2 nháy trở lên ngày ${tMinus1.draw_date}`
        }
    };

    // --- Risks ---
    const candidates = new Set<string>([predictedPair[0], predictedPair[1], ...intersection, ...multiHit]);
    const ganList: RiskAnalysis['ganList'] = [];

    candidates.forEach(num => {
        const days = calculateGan(num, results, 0);
        if (days !== null && days > 15) {
            ganList.push({
                number: num,
                daysParams: days,
                isRisky: true
            });
        }
    });

    let brokenCount = 0;
    const checkDepth = 4;
    for (let i = 0; i < checkDepth; i++) {
        if (i + 1 >= results.length) break;
        const dayCurrent = results[i];
        const dayPrev = results[i + 1];
        const spPrev = getLast2(dayPrev.special_prize);
        const lotoCurrent = extractAllLotoNumbers(dayCurrent);
        if (!lotoCurrent.includes(spPrev)) brokenCount++;
    }

    const isCycleBroken = brokenCount === checkDepth;

    const riskAnalysis: RiskAnalysis = {
        ganList,
        cycleWarning: {
            isBroken: isCycleBroken,
            message: isCycleBroken
                ? 'CẦU KHÔ - CHUẨN BỊ NỔ (4 ngày qua chưa có lô rơi từ Đề)'
                : 'Nhịp cầu đang chạy bình thường'
        }
    };

    return {
        date: targetDateStr,
        typeA: typeAAnalysis,
        typeB: typeBAnalysis,
        risks: riskAnalysis,
        financialPlan: {
            investmentRatio: [1, 2, 4] as [number, number, number],
            days: []
        }
    };
}

/**
 * Calculates hit/miss history for Loto Roi
 */
async function getLotoRoiHistory(allResults: LotteryResultRaw[], limit: number = 5) {
    const history: any[] = [];

    // For each day, we look at the results from the day BEFORE to see the prediction
    for (let i = 0; i < Math.min(allResults.length - 1, limit); i++) {
        const outcomeResult = allResults[i];
        // We need a slice of results starting from i+1 for the prediction
        const inputResults = allResults.slice(i + 1);

        const prediction = await runLotoRoiAlgorithm(inputResults);
        const actualLoto = extractAllLotoNumbers(outcomeResult);


        const predictedDe = prediction.typeA.pair;
        const predictedLoto = [...prediction.typeB.intersection.numbers, ...prediction.typeB.multiHit.numbers];

        const hitDe = predictedDe.filter(n => actualLoto.includes(n));
        const hitLoto = predictedLoto.filter(n => actualLoto.includes(n));

        const hitNumbers = Array.from(new Set([...hitDe, ...hitLoto]));

        history.push({
            date: outcomeResult.draw_date,
            actualLoto,
            predictedDe,
            predictedLoto,
            isHitDe: hitDe.length > 0,
            isHitLoto: hitLoto.length > 0,
            hitNumbers
        });
    }

    return history;
}
