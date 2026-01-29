
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database/xsmb.sqlite');
const db = new sqlite3.Database(dbPath);

async function checkPredictions() {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM ai_predictions ORDER BY draw_date DESC LIMIT 5", [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

async function main() {
    try {
        console.log('Checking recent AI predictions in:', dbPath);
        const predictions = await checkPredictions();
        console.log('Recent predictions:', JSON.stringify(predictions, null, 2));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        db.close();
    }
}

main();
