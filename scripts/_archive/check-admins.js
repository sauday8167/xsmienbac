const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function check() {
    const db = await open({
        filename: path.join(process.cwd(), 'database', 'xsmb.sqlite'),
        driver: sqlite3.Database
    });

    const admins = await db.all("SELECT id, username, full_name, email, avatar FROM admins");
    console.log('Admins data:', JSON.stringify(admins, null, 2));

    await db.close();
}

check();
