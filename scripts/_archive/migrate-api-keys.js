
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database/xsmb.sqlite');

db.serialize(() => {
    // Check if column exists first
    db.all("PRAGMA table_info(api_keys)", (err, rows) => {
        if (err) {
            console.error("Error getting table info:", err);
            return;
        }

        const hasProvider = rows.some(row => row.name === 'provider');

        if (!hasProvider) {
            console.log("Column 'provider' missing. Adding...");
            db.run("ALTER TABLE api_keys ADD COLUMN provider TEXT DEFAULT 'gemini'", (alterErr) => {
                if (alterErr) {
                    // Ignore duplicate column error
                    if (alterErr.message.includes('duplicate column')) {
                        console.log("Column 'provider' already exists (safe error).");
                    } else {
                        console.error("Error adding column:", alterErr);
                    }
                } else {
                    console.log("Column 'provider' added successfully.");
                }
                db.close();
            });
        } else {
            console.log("Column 'provider' already exists.");
            db.close();
        }
    });
});
