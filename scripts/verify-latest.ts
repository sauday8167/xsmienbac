
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

async function check() {
    const db = await open({
        filename: path.join(process.cwd(), 'database', 'xsmb.sqlite'),
        driver: sqlite3.Database
    });

    const res = await db.get('SELECT * FROM xsmb_results ORDER BY draw_date DESC LIMIT 1');
    console.log('LATEST RESULT IN DB:');
    console.log(JSON.stringify(res, null, 2));

    const ai = await db.get('SELECT * FROM ai_predictions ORDER BY draw_date DESC LIMIT 1');
    console.log('\nLATEST AI PREDICTION:');
    console.log(JSON.stringify(ai, null, 2));
}

check();
