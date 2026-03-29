const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function main() {
    const dbPath = path.join(__dirname, '../database/xsmb.sqlite');
    console.log(`Connecting to database at ${dbPath}...`);
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });
    const targetDate = '2026-03-30';
    console.log(`Cleaning up predictions for ${targetDate}...`);
    const res = await db.run("DELETE FROM ai_predictions WHERE draw_date = ?", [targetDate]);
    console.log(`Deleted rows: ${res.changes}`);
    await db.close();
    console.log('Cleanup finished.');
}

main().catch(console.error);
