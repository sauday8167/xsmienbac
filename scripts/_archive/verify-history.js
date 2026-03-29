const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function main() {
    const db = await open({
        filename: path.join(process.cwd(), 'database', 'xsmb.sqlite'),
        driver: sqlite3.Database
    });

    try {
        console.log('Fetching recent predictions...');
        const predictions = await db.all('SELECT * FROM ai_predictions ORDER BY draw_date DESC');

        for (const prediction of predictions) {
            const drawDate = prediction.draw_date;
            console.log(`Checking ${drawDate}...`);

            const result = await db.get('SELECT * FROM xsmb_results WHERE draw_date = ?', [drawDate]);

            if (!result) {
                console.log(`No results found for ${drawDate}`);
                continue;
            }

            const winningLotos = new Set();
            const prizeKeys = ['special_prize', 'prize_1', 'prize_2', 'prize_3', 'prize_4', 'prize_5', 'prize_6', 'prize_7'];

            prizeKeys.forEach(key => {
                const data = result[key];
                if (!data) return;
                try {
                    const prizes = data.startsWith('[') ? JSON.parse(data) : [data];
                    prizes.forEach(p => {
                        const s = String(p);
                        if (s.length >= 2) winningLotos.add(s.slice(-2));
                    });
                } catch (e) {
                    const s = String(data);
                    if (s.length >= 2) winningLotos.add(s.slice(-2));
                }
            });

            const predicted = JSON.parse(prediction.predicted_pairs || '[]');
            const matches = predicted.filter(num => winningLotos.has(num));
            const isCorrect = matches.length > 0;

            await db.run(
                `UPDATE ai_predictions SET actual_result = ?, is_correct = ?, accuracy_notes = ? WHERE id = ?`,
                [
                    Array.from(winningLotos).sort().join(','),
                    isCorrect ? 1 : 0,
                    isCorrect ? `Trúng ${matches.length}/${predicted.length} loto (${matches.join(', ')})` : 'Không trúng',
                    prediction.id
                ]
            );
            console.log(`Updated ${drawDate}: ${isCorrect ? 'WIN' : 'FAIL'}`);
        }
    } finally {
        await db.close();
    }
}

main();
