const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/xsmb.sqlite');
const db = new sqlite3.Database(dbPath);

db.get('SELECT COUNT(*) as total FROM xsmb_results', [], (err, row) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('Total records in xsmb_results:', row.total);
    }
    db.close();
});
