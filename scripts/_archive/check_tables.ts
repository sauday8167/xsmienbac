
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

async function checkTables() {
    const dbPath = path.join(process.cwd(), 'database', 'xsmb.sqlite');
    console.log(`Checking database: ${dbPath}`);

    try {
        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
        console.log("Tables found:", tables.map(t => t.name));

        const hasAdmins = tables.some(t => t.name === 'admins');
        console.log(`Table 'admins' exists? ${hasAdmins ? 'YES' : 'NO'}`);

    } catch (error) {
        console.error("Check failed:", error);
    }
}

checkTables();
