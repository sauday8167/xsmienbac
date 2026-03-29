const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function check() {
    const db = await open({
        filename: path.join(process.cwd(), 'database', 'xsmb.sqlite'),
        driver: sqlite3.Database
    });

    const info = await db.all("PRAGMA table_info(admins)");
    console.log('Admins table info:', JSON.stringify(info, null, 2));

    await db.close();
}

check();
