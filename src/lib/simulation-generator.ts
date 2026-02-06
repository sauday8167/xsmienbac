import crypto from 'crypto';

export interface SimulationResult {
    simulation_date: string;
    simulation_hour: number;
    simulation_time: string;
    special_prize: string;
    prize_1: string;
    prize_2: string[];
    prize_3: string[];
    prize_4: string[];
    prize_5: string[];
    prize_6: string[];
    prize_7: string[];
}

function randomInt(min: number, max: number): number {
    return crypto.randomInt(min, max + 1);
}

function generateUniqueNumbers(count: number, digits: number, exclude: Set<string> = new Set()): string[] {
    const results: string[] = [];
    const max = Math.pow(10, digits) - 1;

    let attempts = 0;
    const maxAttempts = count * 100;

    while (results.length < count && attempts < maxAttempts) {
        attempts++;
        const num = randomInt(0, max).toString().padStart(digits, '0');
        if (!exclude.has(num) && !results.includes(num)) {
            results.push(num);
        }
    }

    return results;
}

export function generateSimulationResult(hour: number): SimulationResult {
    const now = new Date();
    const vnTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
    const date = vnTime.toISOString().split('T')[0];

    const used = new Set<string>();

    // Special prize (5 digits)
    const special = generateUniqueNumbers(1, 5, used)[0];
    used.add(special);

    // Prize 1 (5 digits)
    const prize1 = generateUniqueNumbers(1, 5, used)[0];
    used.add(prize1);

    // Prize 2 (2 numbers, 5 digits each)
    const prize2 = generateUniqueNumbers(2, 5, used);
    prize2.forEach(n => used.add(n));

    // Prize 3 (6 numbers, 5 digits each)
    const prize3 = generateUniqueNumbers(6, 5, used);
    prize3.forEach(n => used.add(n));

    // Prize 4 (4 numbers, 4 digits each)
    const prize4 = generateUniqueNumbers(4, 4);

    // Prize 5 (6 numbers, 4 digits each)
    const prize5 = generateUniqueNumbers(6, 4);

    // Prize 6 (3 numbers, 3 digits each)
    const prize6 = generateUniqueNumbers(3, 3);

    // Prize 7 (4 numbers, 2 digits each)
    const prize7 = generateUniqueNumbers(4, 2);

    return {
        simulation_date: date,
        simulation_hour: hour,
        simulation_time: `${hour.toString().padStart(2, '0')}:15:00`,
        special_prize: special,
        prize_1: prize1,
        prize_2: prize2,
        prize_3: prize3,
        prize_4: prize4,
        prize_5: prize5,
        prize_6: prize6,
        prize_7: prize7
    };
}
