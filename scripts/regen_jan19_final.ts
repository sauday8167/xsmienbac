
import { AIAnalyst } from '@/lib/ai/analyst';
import { getDb } from '@/lib/db';

async function main() {
    try {
        const db = await getDb();
        console.log("🚀 Final Regeneration for Jan 19...");

        // 1. Delete Existing (Dummy)
        console.log("🗑️ Deleting existing record for 2026-01-19...");
        await db.run("DELETE FROM ai_predictions WHERE draw_date = '2026-01-19'");

        // 2. Run Analysis
        console.log("🤖 Running AI Analysis...");
        await AIAnalyst.runDailyAnalysis();

        // 3. Force Checkpoint
        console.log("💾 Forcing WAL Checkpoint...");
        await db.run('PRAGMA wal_checkpoint(TRUNCATE)');

        // 4. Verify
        const row = await db.get("SELECT id, analysis_content FROM ai_predictions WHERE draw_date = '2026-01-19'");
        if (row) {
            const preview = row.analysis_content.substring(0, 50);
            console.log(`✅ VERIFIED: Found ID ${row.id}. Content: ${preview}...`);
            if (row.analysis_content.includes("Test Content")) {
                console.log("❌ WARNING: Content still looks like dummy!");
            }
        } else {
            console.log("❌ FAILED: Jan 19 missing after save.");
        }

    } catch (error) {
        console.error("❌ Error:", error);
    }
}

main();
