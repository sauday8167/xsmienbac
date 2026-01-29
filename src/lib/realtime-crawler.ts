import axios from 'axios';

export interface RealtimeXSMB {
    draw_date: string; // YYYY-MM-DD
    special_prize: string | null;
    prize_1: string | null;
    prize_2: string[] | null;
    prize_3: string[] | null;
    prize_4: string[] | null;
    prize_5: string[] | null;
    prize_6: string[] | null;
    prize_7: string[] | null;
    source?: string;
    crawled_at?: string;
}

// User Agent Rotation
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
];

function getRandomUserAgent(): string {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Convert dd-mm-yyyy or similar to YYYY-MM-DD
 */
function normalizeDate(dateStr: string): string {
    try {
        // Remove time or extra chars if necessary, mostly input is "26-1-2026" or "26/01/2026"
        const cleanDate = dateStr.replace(/\//g, '-').trim(); // "26-1-2026"
        const parts = cleanDate.split('-');
        if (parts.length === 3) {
            const day = parts[0].padStart(2, '0');
            const month = parts[1].padStart(2, '0');
            const year = parts[2];
            return `${year}-${month}-${day}`;
        }
        return new Date().toISOString().split('T')[0]; // Fallback to today
    } catch (e) {
        return new Date().toISOString().split('T')[0];
    }
}

// --- API 1: api-xsmb-today ---
interface Api1Response {
    countNumbers: number;
    time: string; // "26-1-2026"
    results: {
        "ĐB": string[];
        "G1": string[];
        "G2": string[];
        "G3": string[];
        "G4": string[];
        "G5": string[];
        "G6": string[];
        "G7": string[];
    };
}

export async function crawlApi1(): Promise<RealtimeXSMB | null> {
    const url = 'https://api-xsmb-today.onrender.com/api/v1';
    try {
        const { data } = await axios.get<Api1Response>(url, { timeout: 5000 });
        if (!data || !data.results) return null;

        const res = data.results;
        return {
            draw_date: normalizeDate(data.time),
            special_prize: res["ĐB"]?.[0] || null,
            prize_1: res["G1"]?.[0] || null,
            prize_2: res["G2"] || null,
            prize_3: res["G3"] || null,
            prize_4: res["G4"] || null,
            prize_5: res["G5"] || null,
            prize_6: res["G6"] || null,
            prize_7: res["G7"] || null,
            source: 'API-1 (onrender)',
            crawled_at: new Date().toISOString()
        };
    } catch (error) {
        // console.warn('API 1 Failed:', (error as Error).message);
        return null;
    }
}

// --- API 2: live.xoso.com.vn ---
interface Api2Item {
    Prize: string; // "DB", "G.1", "G.2"
    Range: string; // "12345" or "123 - 456"
}
interface Api2Response {
    CrDateTime: string; // "Thứ 2, 26/01/2026"
    LotPrizes: Api2Item[];
}

export async function crawlApi2(): Promise<RealtimeXSMB | null> {
    const url = 'https://live.xoso.com.vn/lotteryLive/MB';
    try {
        const { data } = await axios.get<Api2Response[]>(url, {
            timeout: 5000,
            headers: {
                'User-Agent': getRandomUserAgent(),
                'Referer': 'https://xoso.com.vn/'
            }
        });

        if (!Array.isArray(data) || data.length === 0) return null;
        const latest = data[0]; // Assuming first item is latest

        // Parse Date: "Thứ 2, 26/01/2026" -> get "26/01/2026"
        const dateMatch = latest.CrDateTime.match(/(\d{2}\/\d{2}\/\d{4})/);
        const dateStr = dateMatch ? dateMatch[1] : new Date().toLocaleDateString('en-GB');

        const result: RealtimeXSMB = {
            draw_date: normalizeDate(dateStr),
            special_prize: null,
            prize_1: null,
            prize_2: null,
            prize_3: null,
            prize_4: null,
            prize_5: null,
            prize_6: null,
            prize_7: null,
            source: 'API-2 (xoso.com.vn)',
            crawled_at: new Date().toISOString()
        };

        latest.LotPrizes.forEach(item => {
            const numbers = item.Range.split('-').map(s => s.trim()).filter(s => s.length > 0);
            if (numbers.length === 0) return;

            switch (item.Prize) {
                case 'DB': result.special_prize = numbers[0]; break;
                case 'G.1': result.prize_1 = numbers[0]; break;
                case 'G.2': result.prize_2 = numbers; break;
                case 'G.3': result.prize_3 = numbers; break;
                case 'G.4': result.prize_4 = numbers; break;
                case 'G.5': result.prize_5 = numbers; break;
                case 'G.6': result.prize_6 = numbers; break;
                case 'G.7': result.prize_7 = numbers; break;
            }
        });

        return result;

    } catch (error) {
        // console.warn('API 2 Failed:', (error as Error).message);
        return null;
    }
}

/**
 * Main crawler function - Tries API 1 then API 2
 */
export async function crawlLiveXSMB(): Promise<RealtimeXSMB | null> {
    // 1. Try API 1 (Fastest, JSON)
    const data1 = await crawlApi1();
    if (data1 && (data1.special_prize || data1.prize_1 || (data1.prize_7 && data1.prize_7.length > 0))) {
        return data1;
    }

    // 2. Try API 2 (Official, Reliable)
    const data2 = await crawlApi2();
    if (data2 && (data2.special_prize || data2.prize_1 || (data2.prize_7 && data2.prize_7.length > 0))) {
        return data2;
    }

    return null;
}
