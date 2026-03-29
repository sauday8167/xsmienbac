
import { getDb } from '@/lib/db';

async function main() {
    try {
        const db = await getDb();
        console.log("🚀 Manual Insert Test for Jan 19...");

        // Manual Insert
        const sql = `
            INSERT OR REPLACE INTO ai_predictions 
            (draw_date, predicted_pairs, analysis_content, confidence_score, created_at) 
            VALUES (?, ?, ?, ?, ?)
        `;
        const params = [
            '2026-01-19',
            JSON.stringify(["01", "02", "03", "04", "05"]),
            '## Test Content Manual Insert',
            88,
            new Date().toISOString()
        ];

        await db.run(sql, params);
        console.log("✅ Insert executed.");

        console.log("💾 Forcing Checkpoint...");
        await db.run('PRAGMA wal_checkpoint(TRUNCATE)');

        // Verify
        const row = await db.get("SELECT * FROM ai_predictions WHERE draw_date = '2026-01-19'");
        if (row) {
            console.log("✅ VERIFIED in Script: Found Jan 19:", row.id);
        } else {
            console.log("❌ FAILED in Script: Jan 19 missing.");
        }

    } catch (e) {
        console.error("❌ Error:", e);
    }
}

main();
