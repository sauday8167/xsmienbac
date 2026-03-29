
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database/xsmb.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Checking posts for 2026-01-28...');
db.all("SELECT id, title, slug FROM posts WHERE slug LIKE '%2026-01-28%'", [], (err, rows) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.table(rows);
    }
    db.close();
});
