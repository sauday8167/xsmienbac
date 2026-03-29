
import { queryOne } from '../src/lib/db';

async function check() {
    const res = await queryOne<{ draw_date: string }>('SELECT draw_date FROM xsmb_results ORDER BY draw_date DESC LIMIT 1');
    console.log('Latest DB Date:', res?.draw_date);
}

check();
