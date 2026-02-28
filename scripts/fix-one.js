const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function fixOne() {
    const db = await open({
        filename: path.join(process.cwd(), 'database', 'xsmb.sqlite'),
        driver: sqlite3.Database
    });

    const drawDate = '2026-02-25';
    console.log(`Targeting ${drawDate}...`);

    const prediction = await db.get("SELECT * FROM ai_experience WHERE draw_date = ? AND prediction_type = 'funnel' ORDER BY id DESC LIMIT 1", [drawDate]);
    if (!prediction) {
        console.log("No prediction found for date.");
    } else {
        console.log(`Found prediction ID ${prediction.id}`);
        const result = await db.get("SELECT * FROM xsmb_results WHERE draw_date = ?", [drawDate]);
        if (!result) {
            console.log("No result found in DB for date.");
        } else {
            console.log("Found result. Calculating...");
            // Simple scoring logic
            const winningLotos = new Set();
            const prizeKeys = ['special_prize', 'prize_1', 'prize_2', 'prize_3', 'prize_4', 'prize_5', 'prize_6', 'prize_7'];
            prizeKeys.forEach(key => {
                const prizeData = result[key];
                if (!prizeData) return;
                try {
                    const prizes = prizeData.startsWith('[') ? JSON.parse(prizeData) : [prizeData];
                    prizes.forEach(p => { const s = String(p); if (s.length >= 2) winningLotos.add(s.slice(-2)); });
                } catch (e) {
                    const s = String(prizeData); if (s.length >= 2) winningLotos.add(s.slice(-2));
                }
            });
            const predicted = JSON.parse(prediction.predicted_numbers);
            const matches = predicted.filter(n => winningLotos.has(n));
            const score = matches.length / predicted.length;
            await db.run("UPDATE ai_experience SET accuracy_score = ? WHERE id = ?", [score, prediction.id]);
            console.log(`Updated ID ${prediction.id}: Score ${score} (Matches: ${matches.join(',')})`);
        }
    }
    await db.close();
}

fixOne().catch(console.error);
