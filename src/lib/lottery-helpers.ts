
export interface LotteryResultRaw {
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

/**
 * Extract distinct loto numbers (last 2 digits) from a lottery result.
 * Ensures data is cleaned, trimmed, and deduplicated.
 */
export function extractUniqueLotoNumbers(result: LotteryResultRaw): Set<string> {
    const numbers = new Set<string>();

    const addNumber = (val: any) => {
        if (!val) return;
        const str = String(val).trim();
        if (str.length >= 2) {
            numbers.add(str.slice(-2).padStart(2, '0'));
        } else if (str.length === 1) {
            numbers.add(str.padStart(2, '0'));
        }
    };

    addNumber(result.special_prize);
    addNumber(result.prize_1);

    [result.prize_2, result.prize_3, result.prize_4, result.prize_5, result.prize_6, result.prize_7].forEach(prizeJson => {
        try {
            const prizeArray = JSON.parse(prizeJson);
            if (Array.isArray(prizeArray)) {
                prizeArray.forEach(num => addNumber(num));
            }
        } catch (e) {
            // Skip invalid JSON
        }
    });

    return numbers;
}

/**
 * Extract ALL loto numbers (last 2 digits) from a lottery result.
 * Includes duplicates (e.g. if '50' appears twice).
 */
export function extractAllLotoNumbers(result: LotteryResultRaw): string[] {
    const numbers: string[] = [];

    const addNumber = (val: any) => {
        if (!val) return;
        const str = String(val).trim();
        if (str.length >= 2) {
            numbers.push(str.slice(-2).padStart(2, '0'));
        } else if (str.length === 1) {
            numbers.push(str.padStart(2, '0'));
        }
    };

    addNumber(result.special_prize);
    addNumber(result.prize_1);

    [result.prize_2, result.prize_3, result.prize_4, result.prize_5, result.prize_6, result.prize_7].forEach(prizeJson => {
        try {
            const prizeArray = JSON.parse(prizeJson);
            if (Array.isArray(prizeArray)) {
                prizeArray.forEach(num => addNumber(num));
            }
        } catch (e) {
            // Skip invalid JSON
        }
    });

    return numbers;
}
