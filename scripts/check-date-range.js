const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/xsmb.sqlite');
const db = new sqlite3.Database(dbPath);

db.get('SELECT MIN(draw_date) as oldest, MAX(draw_date) as newest, COUNT(*) as total FROM xsmb_results', [], (err, row) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('Database Overview:');
        console.log('Total records:', row.total);
        console.log('Oldest date:', row.oldest);
        console.log('Newest date:', row.newest);
    }
    db.close();
});
