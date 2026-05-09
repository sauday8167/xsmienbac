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

// --- API 3: kqxs.vn (JSON - HIGH PRIORITY) ---
interface Api3Response {
    numbers: {
        "1": {
            "1": string[]; // Đặc biệt
            "2": string[]; // Giải 1
            "3": string[]; // Giải 2
            "4": string[]; // Giải 3
            "5": string[]; // Giải 4
            "6": string[]; // Giải 5
            "7": string[]; // Giải 6
            "8": string[]; // Giải 7
        }
    };
    directLottery?: {
        "1": string[];
    };
}

export async function crawlApi3(): Promise<RealtimeXSMB | null> {
    const url = `https://www.kqxs.vn/realtime/mien-bac.html?t=${Date.now()}`;
    try {
        const { data } = await axios.get<Api3Response>(url, {
            timeout: 5000,
            headers: {
                'User-Agent': getRandomUserAgent(),
                'Referer': 'https://www.kqxs.vn/'
            }
        });

        if (!data || !data.numbers) return null;

        const nums = data.numbers['1'];
        return {
            draw_date: new Date().toISOString().split('T')[0],
            special_prize: nums['1']?.[0] || null,
            prize_1: nums['2']?.[0] || null,
            prize_2: nums['3'] || null,
            prize_3: nums['4'] || null,
            prize_4: nums['5'] || null,
            prize_5: nums['6'] || null,
            prize_6: nums['7'] || null,
            prize_7: nums['8'] || null,
            source: 'API-3 (kqxs.vn)',
            crawled_at: new Date().toISOString()
        };
    } catch (error) {
        return null;
    }
}

// --- API 4: xskt.com.vn (JSON - HIGH PRIORITY) ---
interface Api4Response {
    kqxs: string; // "950787924397697..."
}

function parseXSKTString(str: string): RealtimeXSMB {
    // Parse chuỗi số: "950787924397697..."
    // Format: G1(5) + G2(5+5) + G3(5*6) + G4(4*4) + G5(4*6) + G6(3*3) + G7(2*4) + DB(5)
    let pos = 0;

    const prize_1 = str.substring(pos, pos + 5) || null;
    pos += 5;

    const prize_2 = [
        str.substring(pos, pos + 5),
        str.substring(pos + 5, pos + 10)
    ].filter(Boolean);
    pos += 10;

    const prize_3 = [];
    for (let i = 0; i < 6; i++) {
        const num = str.substring(pos, pos + 5);
        if (num) prize_3.push(num);
        pos += 5;
    }

    const prize_4 = [];
    for (let i = 0; i < 4; i++) {
        const num = str.substring(pos, pos + 4);
        if (num) prize_4.push(num);
        pos += 4;
    }

    const prize_5 = [];
    for (let i = 0; i < 6; i++) {
        const num = str.substring(pos, pos + 4);
        if (num) prize_5.push(num);
        pos += 4;
    }

    const prize_6 = [];
    for (let i = 0; i < 3; i++) {
        const num = str.substring(pos, pos + 3);
        if (num) prize_6.push(num);
        pos += 3;
    }

    const prize_7 = [];
    for (let i = 0; i < 4; i++) {
        const num = str.substring(pos, pos + 2);
        if (num) prize_7.push(num);
        pos += 2;
    }

    // Đặc biệt ở cuối
    const special_prize = str.substring(pos, pos + 5) || null;

    return {
        draw_date: new Date().toISOString().split('T')[0],
        special_prize,
        prize_1,
        prize_2: prize_2.length > 0 ? prize_2 : null,
        prize_3: prize_3.length > 0 ? prize_3 : null,
        prize_4: prize_4.length > 0 ? prize_4 : null,
        prize_5: prize_5.length > 0 ? prize_5 : null,
        prize_6: prize_6.length > 0 ? prize_6 : null,
        prize_7: prize_7.length > 0 ? prize_7 : null,
        source: 'API-4 (xskt.com.vn)',
        crawled_at: new Date().toISOString()
    };
}

export async function crawlApi4(): Promise<RealtimeXSMB | null> {
    const url = `https://ttttmb.xskt.com.vn/zzz/ttttxs-s.jsp?rr=${Date.now()}&areaCode=MB&s=0`;
    try {
        const { data } = await axios.get<Api4Response>(url, {
            timeout: 5000,
            headers: {
                'User-Agent': getRandomUserAgent()
            }
        });

        if (!data || !data.kqxs || data.kqxs.length < 10) return null;

        return parseXSKTString(data.kqxs);
    } catch (error) {
        return null;
    }
}

// --- API 5: xosodaiphat.com (JSON - MEDIUM PRIORITY) ---
interface Api5Item {
    Prize: string;
    Range: string;
}
interface Api5Response {
    CrDateTime: string;
    LotPrizes: Api5Item[];
}

export async function crawlApi5(): Promise<RealtimeXSMB | null> {
    // Generate ID: yyyyMMdd + session code
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    // Try multiple session codes
    const sessionCodes = ['11180', '11190', '11200', '11210', '11220', '11230', '11240', '11250', '11260', '11270', '11280', '11290'];

    for (const code of sessionCodes) {
        const url = `https://live.xosodaiphat.com/lotteryLive/1/${dateStr}${code}`;
        try {
            const { data } = await axios.get<Api5Response[]>(url, {
                timeout: 3000,
                headers: {
                    'User-Agent': getRandomUserAgent(),
                    'Referer': 'https://xosodaiphat.com/'
                }
            });

            if (!Array.isArray(data) || data.length === 0) continue;
            const latest = data[0];

            const result: RealtimeXSMB = {
                draw_date: new Date().toISOString().split('T')[0],
                special_prize: null,
                prize_1: null,
                prize_2: null,
                prize_3: null,
                prize_4: null,
                prize_5: null,
                prize_6: null,
                prize_7: null,
                source: 'API-5 (xosodaiphat)',
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

            // If we got some data, return it
            if (result.prize_1 || result.prize_7) {
                return result;
            }
        } catch (error) {
            continue;
        }
    }

    return null;
}

// --- API 6 & 7: mketqua.net & ketqua04.net (Raw Text - LOW PRIORITY) ---
function parseRawTextFormat(rawText: string): RealtimeXSMB | null {
    try {
        // Format: "timestamp;;symbol;prize_data;..."
        // Example: "1770377145;;05-61-18-*;562-720-581;8225-8191-6358-0638-1942-7726;..."
        const parts = rawText.split(';');
        if (parts.length < 8) return null;

        // Skip timestamp and symbol (first 2 parts)
        let idx = 2;

        const prize_7 = parts[idx++]?.split('-').filter(Boolean) || null;
        const prize_6 = parts[idx++]?.split('-').filter(Boolean) || null;
        const prize_5 = parts[idx++]?.split('-').filter(Boolean) || null;
        const prize_4 = parts[idx++]?.split('-').filter(Boolean) || null;
        const prize_3 = parts[idx++]?.split('-').filter(Boolean) || null;
        const prize_2 = parts[idx++]?.split('-').filter(Boolean) || null;
        const prize_1 = parts[idx++] || null;
        const special_prize = parts[idx++] || null;

        return {
            draw_date: new Date().toISOString().split('T')[0],
            special_prize,
            prize_1,
            prize_2: prize_2 && prize_2.length > 0 ? prize_2 : null,
            prize_3: prize_3 && prize_3.length > 0 ? prize_3 : null,
            prize_4: prize_4 && prize_4.length > 0 ? prize_4 : null,
            prize_5: prize_5 && prize_5.length > 0 ? prize_5 : null,
            prize_6: prize_6 && prize_6.length > 0 ? prize_6 : null,
            prize_7: prize_7 && prize_7.length > 0 ? prize_7 : null,
            source: 'Raw Text Parser',
            crawled_at: new Date().toISOString()
        };
    } catch (error) {
        return null;
    }
}

export async function crawlApi6(): Promise<RealtimeXSMB | null> {
    const url = `https://data.mketqua.net/pre_loads/kq-mb.raw?t=${Date.now()}`;
    try {
        const { data } = await axios.get<string>(url, {
            timeout: 5000,
            headers: {
                'User-Agent': getRandomUserAgent()
            }
        });

        if (!data || typeof data !== 'string') return null;

        const result = parseRawTextFormat(data);
        if (result) {
            result.source = 'API-6 (mketqua.net)';
        }
        return result;
    } catch (error) {
        return null;
    }
}

export async function crawlApi7(): Promise<RealtimeXSMB | null> {
    const url = `https://data.ketqua04.net/pre_loads/kq-mb.raw?t=${Date.now()}`;
    try {
        const { data } = await axios.get<string>(url, {
            timeout: 5000,
            headers: {
                'User-Agent': getRandomUserAgent()
            }
        });

        if (!data || typeof data !== 'string') return null;

        const result = parseRawTextFormat(data);
        if (result) {
            result.source = 'API-7 (ketqua04.net)';
        }
        return result;
    } catch (error) {
        return null;
    }
}

// --- HELPER FUNCTIONS ---
function isValidResult(result: RealtimeXSMB | null): boolean {
    if (!result) return false;
    return !!(result.special_prize || result.prize_1 || (result.prize_7 && result.prize_7.length > 0));
}

function getResultCompleteness(result: RealtimeXSMB): number {
    let score = 0;
    if (result.special_prize) score += 20;
    if (result.prize_1) score += 15;
    if (result.prize_2 && result.prize_2.length > 0) score += 10;
    if (result.prize_3 && result.prize_3.length > 0) score += 10;
    if (result.prize_4 && result.prize_4.length > 0) score += 10;
    if (result.prize_5 && result.prize_5.length > 0) score += 10;
    if (result.prize_6 && result.prize_6.length > 0) score += 10;
    if (result.prize_7 && result.prize_7.length > 0) score += 15;
    return score;
}

const API_PRIORITIES: { [key: string]: number } = {
    'API-1 (onrender)': 3,
    'API-2 (xoso.com.vn)': 4,
    'API-3 (kqxs.vn)': 5,
    'API-4 (xskt.com.vn)': 5,
    'API-5 (xosodaiphat)': 3,
    'API-6 (mketqua.net)': 2,
    'API-7 (ketqua04.net)': 2,
};

function selectBestResult(results: (RealtimeXSMB | null)[]): RealtimeXSMB | null {
    const validResults = results.filter(isValidResult) as RealtimeXSMB[];
    if (validResults.length === 0) return null;

    // Sort by: completeness DESC, then priority DESC
    validResults.sort((a, b) => {
        const scoreA = getResultCompleteness(a);
        const scoreB = getResultCompleteness(b);
        if (scoreA !== scoreB) return scoreB - scoreA;

        const priorityA = API_PRIORITIES[a.source || ''] || 0;
        const priorityB = API_PRIORITIES[b.source || ''] || 0;
        return priorityB - priorityA;
    });

    return validResults[0];
}

// --- RACING SYSTEM (Early-exit: resolve as soon as a good result arrives) ---
export async function crawlAllAPIsRacing(): Promise<RealtimeXSMB | null> {
    const startTime = Date.now();
    const collected: (RealtimeXSMB | null)[] = [];
    let done = false;
    let resolveRace!: (r: RealtimeXSMB | null) => void;

    const racePromise = new Promise<RealtimeXSMB | null>((res) => {
        resolveRace = res;
    });

    const onResult = (result: RealtimeXSMB | null, idx: number) => {
        if (result) {
            const score = getResultCompleteness(result);
            console.log(`[Racing] API ${idx + 1} (${result.source}): ✅ ${score}% in ${Date.now() - startTime}ms`);
        } else {
            console.log(`[Racing] API ${idx + 1}: ❌ (${Date.now() - startTime}ms)`);
        }

        collected.push(result);

        // Resolve early if we have a high-quality result (score >= 60 = at least prizes 1-7)
        if (!done && result && getResultCompleteness(result) >= 60) {
            done = true;
            resolveRace(result);
        }
    };

    // Priority order: fastest/most reliable APIs first
    // API-3 (kqxs.vn) and API-4 (xskt.com.vn) are typically fastest
    // API-1 (onrender) is slowest — start last, longer timeout
    crawlApi3().then(r => onResult(r, 2)).catch(() => onResult(null, 2));
    crawlApi4().then(r => onResult(r, 3)).catch(() => onResult(null, 3));
    crawlApi6().then(r => onResult(r, 5)).catch(() => onResult(null, 5));
    crawlApi7().then(r => onResult(r, 6)).catch(() => onResult(null, 6));
    crawlApi2().then(r => onResult(r, 1)).catch(() => onResult(null, 1));
    crawlApi5().then(r => onResult(r, 4)).catch(() => onResult(null, 4));
    crawlApi1().then(r => onResult(r, 0)).catch(() => onResult(null, 0)); // slowest last

    // Hard timeout: 4s — take best available if no high-quality result yet
    const timeoutPromise = new Promise<RealtimeXSMB | null>((res) =>
        setTimeout(() => {
            if (!done) {
                done = true;
                const best = selectBestResult(collected);
                console.log(`[Racing] Timeout 4s — best: ${best?.source || 'none'} (${best ? getResultCompleteness(best) : 0}%)`);
                res(best);
            } else {
                res(null); // already resolved by early exit
            }
        }, 4000)
    );

    const result = await Promise.race([racePromise, timeoutPromise]);
    const duration = Date.now() - startTime;
    console.log(`[Racing] Done in ${duration}ms — source: ${result?.source || 'none'}`);

    return result;
}

/**
 * Main crawler function - Uses racing system or fallback
 */
export async function crawlLiveXSMB(): Promise<RealtimeXSMB | null> {
    return await crawlAllAPIsRacing();
}
