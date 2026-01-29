const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/xsmb.sqlite');
const db = new sqlite3.Database(dbPath);

db.all('SELECT draw_date, prize_2, prize_3 FROM xsmb_results ORDER BY draw_date ASC LIMIT 5', [], (err, rows) => {
    if (err) {
        console.error('Error fetching rows:', err);
    } else {
        console.log('Oldest data:');
        rows.forEach(row => {
            console.log(`Date: ${row.draw_date}`);
            console.log(`Prize 2: ${row.prize_2}`);
            console.log(`Prize 3: ${row.prize_3}`);
            console.log('---');
        });
    }
    db.close();
});
