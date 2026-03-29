
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database/xsmb.sqlite');
const db = new sqlite3.Database(dbPath);

const result = {
    draw_date: '2026-01-27',
    special_prize: '39380',
    prize_1: '69281',
    prize_2: JSON.stringify(['70859', '75870']),
    prize_3: JSON.stringify(['82722', '33319', '97062', '92220', '40431', '67129']),
    prize_4: JSON.stringify(['0741', '2920', '6534', '9310']),
    prize_5: JSON.stringify(['4422', '5543', '2892', '1930', '4862', '5929']),
    prize_6: JSON.stringify(['733', '014', '672']),
    prize_7: JSON.stringify(['22', '20', '16', '61'])
};

// Also calculate loto (first and last digits) for easy display/verification if needed
// But the schema likely just stores the full prizes.

db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    // Check if exists
    db.get("SELECT id FROM xsmb_results WHERE draw_date = ?", [result.draw_date], (err, row) => {
        if (err) {
            console.error(err);
            return db.run("ROLLBACK");
        }

        if (row) {
            console.log(`Updating existing result for ${result.draw_date}`);
            const stmt = db.prepare(`
                UPDATE xsmb_results SET
                    special_prize = ?, prize_1 = ?, prize_2 = ?, prize_3 = ?,
                    prize_4 = ?, prize_5 = ?, prize_6 = ?, prize_7 = ?
                WHERE draw_date = ?
            `);
            stmt.run(
                result.special_prize, result.prize_1, result.prize_2, result.prize_3,
                result.prize_4, result.prize_5, result.prize_6, result.prize_7,
                result.draw_date,
                (err) => {
                    if (err) console.error("Update failed:", err);
                    else console.log("Update successful");
                    stmt.finalize();
                }
            );
        } else {
            console.log(`Inserting new result for ${result.draw_date}`);
            const stmt = db.prepare(`
                INSERT INTO xsmb_results (
                    draw_date, special_prize, prize_1, prize_2, prize_3,
                    prize_4, prize_5, prize_6, prize_7
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            stmt.run(
                result.draw_date,
                result.special_prize, result.prize_1, result.prize_2, result.prize_3,
                result.prize_4, result.prize_5, result.prize_6, result.prize_7,
                (err) => {
                    if (err) console.error("Insert failed:", err);
                    else console.log("Insert successful");
                    stmt.finalize();
                }
            );
        }
    });

    db.run("COMMIT", () => {
        console.log("Transaction committed.");
        db.close();
    });
});
