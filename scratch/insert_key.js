
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database/xsmb.sqlite');

const key = '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';
const provider = 'openrouter';

db.serialize(() => {
    db.run(
        `INSERT OR REPLACE INTO api_keys (key, provider, status) VALUES (?, ?, 'active')`,
        [key, provider],
        function(err) {
            if (err) {
                console.error('Error inserting key:', err.message);
            } else {
                console.log(`Key inserted/updated for provider: ${provider}`);
            }
            db.close();
        }
    );
});
