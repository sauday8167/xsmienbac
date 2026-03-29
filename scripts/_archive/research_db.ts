
import { query } from '../src/lib/db';

async function research() {
    try {
        const tableInfo = await query('PRAGMA table_info(xsmb_results);');
        console.log('TABLE INFO:', JSON.stringify(tableInfo, null, 2));
        
        const lastRow = await query('SELECT * FROM xsmb_results ORDER BY draw_date DESC LIMIT 1;');
        console.log('LAST ROW:', JSON.stringify(lastRow, null, 2));
    } catch (e) {
        console.error(e);
    }
}

research();
