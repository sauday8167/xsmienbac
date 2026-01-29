const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database/xsmb.sqlite');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

function checkDate(date) {
    db.get('SELECT * FROM xsmb_results WHERE draw_date = ?', [date], (err, row) => {
        if (err) throw err;
        if (!row) {
            console.log(`No data for ${date}`);
            return;
        }

        const set = new Set();
        const add = (v) => {
            if (!v) return;
            const s = String(v).trim();
            if (s.length >= 2) set.add(s.slice(-2));
        };

        add(row.special_prize);
        add(row.prize_1);
        ['prize_2', 'prize_3', 'prize_4', 'prize_5', 'prize_6', 'prize_7'].forEach(k => {
            try {
                JSON.parse(row[k]).forEach(add);
            } catch (e) { }
        });

        const sorted = Array.from(set).sort();
        console.log(`Date: ${date}`);
        console.log(`Lotos: ${sorted.join(', ')}`);
        console.log(`Has 49? ${set.has('49')}`);
        console.log(`Has 55? ${set.has('55')}`);
    });
}

checkDate('2026-01-10');
checkDate('2026-01-11');
