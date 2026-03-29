const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function updateAdminPassword() {
    const db = await open({
        filename: path.join(process.cwd(), 'database', 'xsmb.sqlite'),
        driver: sqlite3.Database
    });

    try {
        console.log('Updating admin password hash...');
        const newHash = '$2a$10$chTUgSiuCMS/pFb3CbWeUOUhFVmJsPst79yurspsDCCBzaXuXgUuq';
        const result = await db.run("UPDATE admins SET password_hash = ? WHERE username = 'admin'", [newHash]);
        console.log(`Updated ${result.changes} admin account.`);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await db.close();
    }
}

updateAdminPassword();
