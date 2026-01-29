
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database/xsmb.sqlite');
const db = new sqlite3.Database(dbPath);

async function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

async function main() {
    try {
        console.log('Resetting prediction for 2026-01-18...');
        await run(`UPDATE ai_predictions 
                   SET actual_result = NULL, is_correct = NULL, accuracy_notes = NULL 
                   WHERE draw_date = '2026-01-18'`);
        console.log('Success.');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        db.close();
    }
}

main();
