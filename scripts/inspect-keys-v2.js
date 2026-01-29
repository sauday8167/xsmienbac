
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database/xsmb.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('--- Database API Keys ---');
db.all("SELECT id, key, provider, status, error_count, last_used FROM api_keys", [], (err, rows) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.table(rows);
    }
    db.close();
});
