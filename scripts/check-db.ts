
import { query } from '../src/lib/db';

async function check() {
    try {
        const rows = await query('SELECT id, draw_date, created_at FROM bac_nho_history ORDER BY id DESC LIMIT 5');
        console.log('Latest 5 rows (by ID DESC):');
        console.table(rows);
        
        const latest = await query('SELECT * FROM bac_nho_history ORDER BY draw_date DESC LIMIT 5');
        console.log('Latest 5 rows (by draw_date DESC):');
        console.table(latest.map(r => ({ id: r.id, draw_date: r.draw_date })));
    } catch (e) {
        console.error(e);
    }
}

check();
