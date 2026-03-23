import { query } from './src/lib/db';
import fs from 'fs';

async function main() {
    const records = await query('SELECT * FROM ai_predictions ORDER BY id DESC LIMIT 10');
    fs.writeFileSync('tmp_ai_debug.json', JSON.stringify(records, null, 2));
    console.log('Exported 10 latest predictions to tmp_ai_debug.json');
}

main();
