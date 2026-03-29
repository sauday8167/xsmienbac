const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function migrateData() {
    const db = await open({
        filename: path.join(process.cwd(), 'database', 'xsmb.sqlite'),
        driver: sqlite3.Database
    });

    console.log('--- BEFORE MIGRATION ---');
    const before = await db.all("SELECT id, draw_date, accuracy_score, created_at FROM ai_experience WHERE prediction_type = 'funnel' ORDER BY draw_date DESC LIMIT 10;");
    console.table(before);

    // Shift all funnel predictions made before today's fix by +1 day
    // This aligns 'source date' with 'target date'
    const predictions = await db.all("SELECT id, draw_date FROM ai_experience WHERE prediction_type = 'funnel' AND draw_date <= '2026-02-24'");

    for (const p of predictions) {
        const d = new Date(p.draw_date);
        d.setDate(d.getDate() + 1);
        const newDate = d.toISOString().split('T')[0];

        await db.run("UPDATE ai_experience SET draw_date = ?, accuracy_score = 0 WHERE id = ?", [newDate, p.id]);
        console.log(`Updated ID ${p.id}: ${p.draw_date} -> ${newDate}`);
    }

    console.log('--- AFTER MIGRATION ---');
    const after = await db.all("SELECT id, draw_date, accuracy_score, created_at FROM ai_experience WHERE prediction_type = 'funnel' ORDER BY draw_date DESC LIMIT 10;");
    console.table(after);

    await db.close();
}

migrateData().catch(console.error);
