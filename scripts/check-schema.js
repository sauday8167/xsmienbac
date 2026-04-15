const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function check() {
    const db = await open({
        filename: path.join(__dirname, '../database/xsmb.sqlite'),
        driver: sqlite3.Database
    });
    
    console.log('--- TABLE: ai_predictions ---');
    const aiSchema = await db.all("PRAGMA table_info(ai_predictions)");
    console.log(JSON.stringify(aiSchema, null, 2));

    console.log('--- TABLE: xsmb_results ---');
    const xsmbSchema = await db.all("PRAGMA table_info(xsmb_results)");
    console.log(JSON.stringify(xsmbSchema, null, 2));

    await db.close();
}

check();
