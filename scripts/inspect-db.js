const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database/xsmb.sqlite');
console.log(`Connecting to database at: ${dbPath}`);

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error(err.message);
        process.exit(1);
    }
});

db.serialize(() => {
    // Check tables
    db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
        if (err) {
            throw err;
        }
        console.log("Tables found:", tables.map(t => t.name).join(', '));
    });

    // Check latest result
    db.get("SELECT * FROM xsmb_results ORDER BY draw_date DESC LIMIT 1", [], (err, row) => {
        if (err) {
            console.log("Error querying xsmb_results:", err);
        } else {
            console.log("\n--- Latest XSMB Result ---");
            if (row) {
                console.log(`Date: ${row.draw_date}`);
                console.log(`Special Prize: ${row.special_prize}`);
                console.log(`First Prize: ${row.prize_1}`);
            } else {
                console.log("No results found.");
            }
        }
    });

    // Count posts
    db.get("SELECT COUNT(*) as count FROM posts", [], (err, row) => {
        if (err) {
            console.log("Error querying posts:", err);
        } else {
            console.log(`\nTotal Posts: ${row.count}`);
        }
    });

    // Count admins
    db.get("SELECT COUNT(*) as count FROM admins", [], (err, row) => {
        if (err) {
            console.log("Error querying admins:", err);
        } else {
            console.log(`Total Admins: ${row.count}`);
        }
    });
});

db.close();
