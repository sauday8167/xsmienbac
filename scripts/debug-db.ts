import { query } from '@/lib/db';

async function debug() {
    console.log('--- DEBUG AI PREDICTIONS ---');
    const rows = await query(`SELECT id, draw_date, created_at, model_used FROM ai_predictions ORDER BY id DESC LIMIT 5`);
    console.table(rows);

    console.log('--- CHECK DATE FORMAT ---');
    rows.forEach((r: any) => {
        console.log(`ID: ${r.id}, Date: "${r.draw_date}" (Type: ${typeof r.draw_date}), Length: ${r.draw_date?.length}`);
    });
}

debug();
