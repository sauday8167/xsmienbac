
import { AIAnalyst } from '@/lib/ai/analyst';
import { getDb } from '@/lib/db';

async function forceRegen() {
    try {
        const db = await getDb();
        console.log("🚀 Starting Forced Regeneration for Jan 19...");

        // 1. Run Analysis (This will Upsert/Replace)
        // We need to ensure targetDate is correct. runDailyAnalysis defaults to 'tomorrow' relative to now.
        // Today is 19th. Tomorrow is 20th? No.
        // runDailyAnalysis logic:
        // const today = new Date();
        // if (currentHour >= 18 && currentMinute >= 30) targetDate.setDate(today.getDate() + 1);

        // It's 16:00. So target is TODAY (19th)?
        // Wait, if it's 19th 16:00. Results for 19th are NOT out.
        // So prediction is FOR 19th.

        // Let's modify analyst.ts? No, let's just run it and see logs.
        // If it generates for 19th, good.

        await AIAnalyst.runDailyAnalysis();

        console.log("✅ Analysis Complete.");

        // 2. Force Checkpoint
        console.log("💾 Forcing WAL Checkpoint...");
        await db.run('PRAGMA wal_checkpoint(TRUNCATE)');
        console.log("✅ Checkpoint Complete.");

        // 3. Verify
        const check = await db.queryOne("SELECT id, draw_date FROM ai_predictions WHERE draw_date = '2026-01-19'");
        if (check) {
            console.log("✅ VERIFIED: Found Jan 19 data in DB.");
        } else {
            console.log("❌ FAILED: Jan 19 data MISSING after save.");
        }

    } catch (error) {
        console.error("❌ Error:", error);
    }
}

forceRegen();
