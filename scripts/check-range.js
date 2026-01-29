const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function checkRange() {
    const db = await open({
        filename: path.join(process.cwd(), 'database', 'xsmb.sqlite'),
        driver: sqlite3.Database
    });

    const minDate = await db.get('SELECT MIN(draw_date) as min FROM xsmb_results');
    const maxDate = await db.get('SELECT MAX(draw_date) as max FROM xsmb_results');
    const count = await db.get('SELECT COUNT(*) as count FROM xsmb_results');

    console.log(`Count: ${count.count}`);
    console.log(`Range: ${minDate.min} to ${maxDate.max}`);

    await db.close();
}

checkRange();
