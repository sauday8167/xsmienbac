
import { query } from '../src/lib/db';

// Utils
function getLotoNumbers(result: any): Set<string> {
    const set = new Set<string>();
    const add = (s: any) => {
        if (!s) return;
        const str = String(s);
        if (str.length >= 2) set.add(str.slice(-2));
    };

    add(result.special_prize);
    add(result.prize_1);
    [result.prize_2, result.prize_3, result.prize_4, result.prize_5, result.prize_6, result.prize_7].forEach(p => {
        try {
            const arr = JSON.parse(p);
            if (Array.isArray(arr)) arr.forEach(add);
        } catch (e) { }
    });
    return set;
}

function flatten(result: any): string[] {
    let seq: string[] = [];
    const add = (v: any) => seq.push(...String(v).split(''));
    add(result.special_prize); // 5
    add(result.prize_1);       // 5
    [result.prize_2, result.prize_3, result.prize_4, result.prize_5, result.prize_6, result.prize_7].forEach(p => {
        try {
            const arr = JSON.parse(p);
            arr.forEach((v: string) => add(v));
        } catch (e) { }
    });
    return seq;
}

async function mineLoto() {
    console.log("🤖 AI Mining: Deep Searching Loto Patterns...");

    const sql = `SELECT * FROM xsmb_results ORDER BY draw_date DESC LIMIT 1000`; // Last 1000 days is enough meaningful data
    const results = await query<any[]>(sql);

    if (results.length < 50) return console.log("Not enough data.");

    // Pre-process
    const samples = results.map(r => ({
        date: r.draw_date,
        lotos: getLotoNumbers(r),
        flat: flatten(r),
        special: String(r.special_prize).slice(-2)
    }));

    // METHOD 1: Best Static Bridge (Cầu Tĩnh)
    // Checking all 107*107 pair combinations
    console.log("... Brute-forcing 10,000+ bridge combinations ...");

    let bestBridge = { i: -1, j: -1, hits: 0 };
    const maxLen = 100; // Limit positions checked to first 100 digits to save time/noise

    // We only need to check i, j once for the whole dataset?
    // Optimization: iterate i, j, then iterate days.

    for (let i = 0; i < maxLen; i++) {
        for (let j = 0; j < maxLen; j++) {
            let hits = 0;
            // Check past 365 days for this bridge
            const checkDays = Math.min(samples.length - 1, 365);

            for (let d = 0; d < checkDays; d++) {
                const today = samples[d];
                const yesterday = samples[d + 1];

                if (i < yesterday.flat.length && j < yesterday.flat.length) {
                    const pred = yesterday.flat[i] + yesterday.flat[j];
                    if (today.lotos.has(pred)) {
                        hits++;
                    }
                }
            }

            if (hits > bestBridge.hits) {
                bestBridge = { i, j, hits };
            }
        }
    }

    // METHOD 2: The "Golden Repeater" (Bạc Nhớ Loto Rơi)
    // Which position's 2-digit value re-appears most?
    // e.g. Does G7.1 repeat most often?
    console.log("... Analyzing Repeater positions ...");
    const repeaterStats: Record<string, number> = {};

    function parseG7(r: any): string[] {
        try { return JSON.parse(r.prize_7); } catch (e) { return []; }
    }

    for (let d = 0; d < samples.length - 1; d++) {
        const today = samples[d];
        const yesterday = samples[d + 1]; // Source
        const rawYest = results[d + 1];

        // Specific checks
        const candidates = {
            'GDB': String(rawYest.special_prize).slice(-2),
            'G1': String(rawYest.prize_1).slice(-2),
            'G7_1': parseG7(rawYest)[0] || 'xx',
            'G7_4': parseG7(rawYest)[3] || 'xx'
        };

        for (const [key, val] of Object.entries(candidates)) {
            if (val !== 'xx' && today.lotos.has(val)) {
                repeaterStats[key] = (repeaterStats[key] || 0) + 1;
            }
        }
    }
    const bestRepeater = Object.entries(repeaterStats).sort((a, b) => b[1] - a[1])[0];


    // METHOD 3: Frequency Weighted (The "Hot" Count)
    // If a number appeared X times in last 3 days, does it appear today?
    // Let's simplify: "The Frequency Algorithm".
    // Calculate which Frequency (0, 1, 2, or 3 appearances in last 5 days) has highest probability of hitting next.
    console.log("... Analyzing Frequency inertia ...");
    const freqHits: Record<number, { valid: number, hit: number }> = {};

    for (let d = 0; d < 365; d++) {
        const today = samples[d];
        const history5 = samples.slice(d + 1, d + 6);

        // Count freq of every number 00-99 in history5
        const counts: Record<string, number> = {};
        for (let n = 0; n < 100; n++) {
            const s = n.toString().padStart(2, '0');
            counts[s] = 0;
            history5.forEach(h => {
                if (h.lotos.has(s)) counts[s]++;
            });
        }

        // Check if high freq numbers hit today
        for (let n = 0; n < 100; n++) {
            const s = n.toString().padStart(2, '0');
            const c = counts[s];
            if (!freqHits[c]) freqHits[c] = { valid: 0, hit: 0 };
            freqHits[c].valid++;
            if (today.lotos.has(s)) freqHits[c].hit++;
        }
    }


    // REPORT
    console.log("\n====== 🧠 LOTO AI INSIGHTS ======");

    console.log(`\nMETHOD 1: "Cầu Huyền Thoại" (Legendary Bridge)`);
    console.log(`- Connection: Position #${bestBridge.i} + Position #${bestBridge.j} (from yesterday)`);
    console.log(`- Performance: ${bestBridge.hits} hits in last 365 days.`);
    console.log(`- Win Rate: ~${(bestBridge.hits / 365 * 100).toFixed(1)}% per day.`);
    console.log(`- Insight: This specific pair of positions has the highest "closeness" to the RNG outcome.`);

    console.log(`\nMETHOD 2: "Bạc Nhớ Vị Trí" (Positional Memory)`);
    console.log(`- Source: ${bestRepeater[0]}`);
    console.log(`- Logic: Taking the number from ${bestRepeater[0]} yesterday -> High chance to Drop (Rơi) today.`);
    console.log(`- Stats: ${bestRepeater[1]} hits.`);
    console.log(`- Insight: The "${bestRepeater[0]}" is the 'sticky' spot of the board.`);

    console.log(`\nMETHOD 3: "Điểm Rơi Tần Suất" (Frequency Inertia)`);
    let bestFreq = -1;
    let maxRate = 0;
    Object.entries(freqHits).forEach(([freq, data]) => {
        const rate = data.hit / data.valid;
        console.log(`- Numbers appearing ${freq} times in last 5 days -> ${Math.round(rate * 100)}% chance to return.`);
        if (rate > maxRate) { maxRate = rate; bestFreq = parseInt(freq); }
    });
    console.log(`- Recommendation: Focus on numbers that have appeared exactly ${bestFreq} times in near past.`);
}

mineLoto().catch(console.error);
