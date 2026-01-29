
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../database/xsmb.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('--- Environment Variables (from fs) ---');
try {
    const envLocal = fs.readFileSync(path.resolve(__dirname, '../.env.local'), 'utf8');
    const googleKey = envLocal.match(/GOOGLE_API_KEY=(.*)/)?.[1];
    const anthropicKey = envLocal.match(/ANTHROPIC_API_KEY=(.*)/)?.[1];

    console.log('GOOGLE_API_KEY:', googleKey ? 'Set (Length: ' + googleKey.trim().length + ')' : 'Not Set');
    console.log('ANTHROPIC_API_KEY:', anthropicKey ? 'Set (Length: ' + anthropicKey.trim().length + ')' : 'Not Set');
} catch (e) {
    console.log('Could not read .env.local', e.message);
}

console.log('\n--- Database API Keys ---');
db.all("SELECT * FROM api_keys", [], (err, rows) => {
    if (err) {
        if (err.message.includes("no such table")) {
            console.log('Table `api_keys` does not exist.');
        } else {
            console.error('Error querying database:', err);
        }
    } else {
        if (rows.length === 0) {
            console.log('No keys found in database table `api_keys`.');
        } else {
            console.table(rows);
        }
    }
    db.close();
});
