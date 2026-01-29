const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function checkLatest() {
    const db = await open({
        filename: path.join(process.cwd(), 'database', 'xsmb.sqlite'),
        driver: sqlite3.Database
    });

    const latest = await db.get('SELECT draw_date FROM xsmb_results ORDER BY draw_date DESC LIMIT 1');
    console.log('Latest date in DB:', latest ? latest.draw_date : 'No data');

    await db.close();
}

checkLatest();
