
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve('database/xsmb.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // 1. Fix 'google' -> 'gemini'
    db.run("UPDATE api_keys SET provider = 'gemini' WHERE provider = 'google'", function (err) {
        if (err) console.error("Update Error:", err);
        else console.log(`Updated ${this.changes} keys from 'google' to 'gemini'`);
    });

    // 2. Reset error counts
    db.run("UPDATE api_keys SET error_count = 0", function (err) {
        if (err) console.error("Reset Error:", err);
        else console.log(`Reset error counts for ${this.changes} keys`);
    });
});

db.close();
