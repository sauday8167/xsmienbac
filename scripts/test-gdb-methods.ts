
import { query } from '../src/lib/db';

async function testMethods() {
    console.log("🔍 Testing Prediction Methods...");

    // Fetch last 365 days
    const sql = `SELECT * FROM xsmb_results ORDER BY draw_date DESC LIMIT 365`;
    const results = await query<any[]>(sql);

    // We process chronologically: reverse
    results.reverse(); // Now index 0 is old, index N is recent

    let pascalHits = 0;
    let rank1TouchHits = 0;

    // Method 2: Sum Correlation
    const sumMap: Record<number, Record<number, number>> = {}; // prevSum -> { nextSum: count }

    for (let i = 0; i < results.length - 1; i++) {
        const today = results[i];
        const tomorrow = results[i + 1];

        // ----------------------------------------------------
        // Method 1: Pascal (GDB + G1)
        // ----------------------------------------------------
        const s = String(today.special_prize).trim();
        const g1 = String(today.prize_1).trim();

        if (s.length === 5 && g1.length === 5) {
            let seq = (s + g1).split('').map(Number);
            while (seq.length > 2) {
                const nextSeq: number[] = [];
                for (let k = 0; k < seq.length - 1; k++) {
                    nextSeq.push((seq[k] + seq[k + 1]) % 10);
                }
                seq = nextSeq;
            }
            const predicted = seq.join(''); // "XY"
            const reversed = seq.reverse().join(''); // "YX" - usually people play both

            const tomorrowSpecial = String(tomorrow.special_prize).slice(-2);
            if (predicted === tomorrowSpecial || reversed === tomorrowSpecial) {
                pascalHits++;
            }
        }

        // ----------------------------------------------------
        // Method 2: Middle of G1 -> Touch for Tomorrow
        // ----------------------------------------------------
        if (g1.length === 5) {
            const middleDigit = g1[2]; // Index 2 is middle of 5
            const tomorrowSpecial = String(tomorrow.special_prize).slice(-2);
            if (tomorrowSpecial.includes(middleDigit)) {
                rank1TouchHits++;
            }
        }

        // ----------------------------------------------------
        // Method 3: Sum Pattern
        // ----------------------------------------------------
        // prevSum -> nextSum likelihood
        const todaySum = String(today.special_prize).slice(-2).split('').reduce((a, b) => a + Number(b), 0) % 10;
        const tomSum = String(tomorrow.special_prize).slice(-2).split('').reduce((a, b) => a + Number(b), 0) % 10;

        if (!sumMap[todaySum]) sumMap[todaySum] = {};
        sumMap[todaySum][tomSum] = (sumMap[todaySum][tomSum] || 0) + 1;
    }

    console.log("--- RESULTS (over " + (results.length - 1) + " days) ---");
    console.log(`1. Pascal Method Hits (Bach Thu): ${pascalHits} times.`);
    console.log(`   Hit Rate: ${(pascalHits / (results.length - 1) * 100).toFixed(2)}% (Very hard for exact number)`);

    console.log(`2. G1 Middle Digit Touch Hits: ${rank1TouchHits} times.`);
    console.log(`   Hit Rate: ${(rank1TouchHits / (results.length - 1) * 100).toFixed(2)}% (Target > 15-20% is good for single touch)`);

    console.log(`3. Sum Analysis Sample:`);
    // Print stats for Sum 7 (arbitrary example)
    const s7 = sumMap[7];
    if (s7) {
        const sorted = Object.entries(s7).sort((a, b) => b[1] - a[1]);
        console.log(`   If today Sum is 7, next day most likely sums: ${sorted.slice(0, 3).map(x => `Sum ${x[0]} (${x[1]})`).join(', ')}`);
    }

}

testMethods().catch(console.error);
