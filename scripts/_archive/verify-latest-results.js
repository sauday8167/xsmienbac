const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function check() {
    const db = await open({
        filename: path.join(process.cwd(), 'database', 'xsmb.sqlite'),
        driver: sqlite3.Database
    });

    const results = await db.all('SELECT draw_date, special_prize, updated_at FROM xsmb_results ORDER BY draw_date DESC LIMIT 5');
    console.log(JSON.stringify(results, null, 2));

    await db.close();
}

check();
