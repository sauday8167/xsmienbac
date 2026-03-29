const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database/xsmb.sqlite');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

function checkResults() {
    db.all('SELECT * FROM xsmb_results ORDER BY draw_date DESC LIMIT 10', [], (err, rows) => {
        if (err) throw err;

        rows.forEach(row => {
            let totalCount = 0;
            const prizes = [];

            // Special
            if (row.special_prize) {
                totalCount++;
                prizes.push(`Special: ${row.special_prize}`);
            }

            // Prize 1
            if (row.prize_1) {
                totalCount++;
                prizes.push(`P1: ${row.prize_1}`);
            }

            // Others
            ['prize_2', 'prize_3', 'prize_4', 'prize_5', 'prize_6', 'prize_7'].forEach(key => {
                try {
                    const arr = JSON.parse(row[key]);
                    if (Array.isArray(arr)) {
                        totalCount += arr.length;
                        prizes.push(`${key}: [${arr.join(', ')}] (Len: ${arr.length})`);
                    }
                } catch (e) {
                    console.error(`Error parsing ${key} for date ${row.draw_date}`);
                }
            });

            console.log(`Date: ${row.draw_date} | Total Positions: ${totalCount}`);
            if (totalCount !== 27) {
                console.error(`!!! WARNING: Found ${totalCount} positions (expected 27) for ${row.draw_date}`);
                console.log(prizes.join('\n'));
            } else {
                // Calculate unique loto
                const set = new Set();
                if (row.special_prize) set.add(row.special_prize.slice(-2));
                if (row.prize_1) set.add(row.prize_1.slice(-2));
                ['prize_2', 'prize_3', 'prize_4', 'prize_5', 'prize_6', 'prize_7'].forEach(key => {
                    try {
                        const arr = JSON.parse(row[key]);
                        if (Array.isArray(arr)) {
                            arr.forEach(n => set.add(n.slice(-2)));
                        }
                    } catch (e) { }
                });
                console.log(`   Unique Lotos: ${set.size} (<= 27 is valid)`);
            }
        });
    });
}

checkResults();
