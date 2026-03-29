
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database/xsmb.sqlite');
const db = new sqlite3.Database(dbPath);

const result = {
    draw_date: '2026-01-28',
    special_prize: '24121',
    prize_1: '96394',
    prize_2: JSON.stringify(['18979', '53028']),
    prize_3: JSON.stringify(['17851', '36689', '93457', '43975', '85524', '91533']),
    prize_4: JSON.stringify(['3309', '9602', '5037', '3432']),
    prize_5: JSON.stringify(['2740', '8739', '6150', '3804', '2269', '4778']),
    prize_6: JSON.stringify(['801', '295', '993']),
    prize_7: JSON.stringify(['76', '47', '21', '77'])
};

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
