import { LotteryResultRaw, extractAllLotoNumbers } from './lottery-helpers';
import { query } from './db';

// A "Bridge" connects two positions (index1, index2) over n days to predict a number
export interface Bridge {
    index1: number;
    index2: number;
    predictedNumber: string; // The number formed by the positions for the NEXT day
    amplitude: number; // Length of the bridge (days)
    bridgepath: {
        date: string;
        val1: string; // Digit at index1
        val2: string; // Digit at index2
        result: string; // The formed number (val1 + val2)
        targetDate: string; // The day this number appeared in results
        isHit: boolean;
    }[];
}

// Helper to flatten the result object into a sequence of 107 digits
// Order: Special -> G1 -> G2 -> ... -> G7
export function flattenResult(result: LotteryResultRaw): string {
    let sequence = '';

    // DB (Special): 5 digits
    sequence += String(result.special_prize || '').trim();

    // G1: 5 digits
    sequence += String(result.prize_1 || '').trim();

    // Helper for arrays
    const parsePrize = (json: string) => {
        try {
            const arr = JSON.parse(json);
            if (Array.isArray(arr)) {
                return arr.map(s => String(s).trim()).join('');
            }
        } catch (e) { /* ignore */ }
        return '';
    };

    // G2: 2 prizes * 5
    sequence += parsePrize(result.prize_2);
    // G3: 6 prizes * 5
    sequence += parsePrize(result.prize_3);
    // G4: 4 prizes * 4
    sequence += parsePrize(result.prize_4);
    // G5: 6 prizes * 4
    sequence += parsePrize(result.prize_5);
    // G6: 3 prizes * 3
    sequence += parsePrize(result.prize_6);
    // G7: 4 prizes * 2
    sequence += parsePrize(result.prize_7);

    return sequence;
}

/**
 * Find bridges ending at 'targetDate' (exclusive, i.e., using data up to targetDate to predict targetDate+1, 
 * or more commonly: using data up to TODAY to predict TOMORROW).
 * 
 * However, "Soi Cau" usually means:
 * We want to find bridges that HAVE been correct for the last N days.
 * If today is T, we check if bridge existed from T-N to T.
 * If yes, we use T's values to predict T+1.
 * 
 * @param endDate The last date of available results to consider (e.g., Today's result).
 * @param amplitude Number of consecutive days the bridge must be correct.
 */
export async function findBridges(endDate: string, amplitude: number = 3): Promise<Bridge[]> {
    // We need data for (amplitude + 1) days:
    // To check a bridge of length 3:
    // Day T (End): Form digits. Point to T+1 (Hypothetical).
    // Day T-1: Form digits -> Checked against T
    // Day T-2: Form digits -> Checked against T-1
    // Day T-3: Form digits -> Checked against T-2
    // So we need results from T-3 to T.

    // Fetch last (amplitude + 5) results to be safe
    const limit = amplitude + 5;
    const sql = `
        SELECT * FROM xsmb_results 
        WHERE draw_date <= ? 
        ORDER BY draw_date DESC 
        LIMIT ?
    `;

    const results = await query<LotteryResultRaw[]>(sql, [endDate, limit]);

    // Pass 1: Validate we have enough data
    // results[0] is T, results[1] is T-1 ...
    if (results.length < amplitude + 1) {
        return [];
    }

    // Positions: 0 to 106
    const TOTAL_POS = 107;
    const bridges: Bridge[] = [];

    // Valid positions check:
    // Some days might have missing digits if data is malformed, so we must be careful.
    // But assuming standard XSMB, it should be consistent.

    const flattenedResults = results.map(r => ({
        date: r.draw_date,
        raw: r,
        flat: flattenResult(r),
        lotoNumbers: new Set(extractAllLotoNumbers(r)) // Use Set for O(1) lookup
    }));

    // Iterate all pairs
    for (let i = 0; i < TOTAL_POS; i++) {
        for (let j = 0; j < TOTAL_POS; j++) {
            // Check consistency backwards
            // We want bridge to hold from k=1 to amplitude
            // Let's index:
            // Check 1: Source (T-1) -> Target (T)
            // Check 2: Source (T-2) -> Target (T-1)
            // ...
            // Check N: Source (T-n) -> Target (T-n+1)

            let isBridge = true;
            const path = [];

            for (let k = 0; k < amplitude; k++) {
                const targetIdx = k;      // results[0] is T
                const sourceIdx = k + 1;  // results[1] is T-1

                const source = flattenedResults[sourceIdx];
                const target = flattenedResults[targetIdx];

                if (!source || !target) {
                    isBridge = false;
                    break;
                }

                // Check bounds
                if (i >= source.flat.length || j >= source.flat.length) {
                    isBridge = false;
                    break;
                }

                const val1 = source.flat[i];
                const val2 = source.flat[j];
                const formedNumber = val1 + val2;

                // Check if formedNumber exists in target's loto results
                // "Bach Thu" usually implies strict ordering, but sometimes people treat 
                // "Cau Lo" as inclusive of reverse. "Soi Cau Bach Thu" implies finding ONE number.
                // So strict `val1 + val2` is correct mapping.
                if (!target.lotoNumbers.has(formedNumber)) {
                    isBridge = false;
                    break;
                }

                path.push({
                    date: source.date,
                    val1,
                    val2,
                    result: formedNumber,
                    targetDate: target.date,
                    isHit: true
                });
            }

            if (isBridge) {
                // If bridge is valid, calculate prediction for T+1 using Day T
                const today = flattenedResults[0];
                if (i < today.flat.length && j < today.flat.length) {
                    const predVal1 = today.flat[i];
                    const predVal2 = today.flat[j];
                    const predicted = predVal1 + predVal2;

                    bridges.push({
                        index1: i,
                        index2: j,
                        predictedNumber: predicted,
                        amplitude,
                        bridgepath: path.reverse() // Sort chronological
                    });
                }
            }
        }
    }

    return bridges;
}
