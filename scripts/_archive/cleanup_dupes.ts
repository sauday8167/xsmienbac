import { getDb } from '@/lib/db';

async function cleanup() {
    try {
        const db = await getDb();

        console.log("🧹 Cleaning duplicate Jan 19 records...");

        // Get all Jan 19 records
        const dupes = await db.all("SELECT id, created_at FROM ai_predictions WHERE draw_date = '2026-01-19' ORDER BY id");
        console.log("Found records:", dupes);

        // Keep ID 5, delete ID 7
        if (dupes.length > 1) {
            await db.run("DELETE FROM ai_predictions WHERE draw_date = '2026-01-19' AND id != 5");
            console.log("✅ Deleted duplicate records (kept ID 5)");
        }

        // Verify
        const remaining = await db.all("SELECT id, draw_date, created_at FROM ai_predictions ORDER BY id DESC");
        console.log("Final records:", remaining);

    } catch (e) {
        console.error("❌ Error:", e);
    }
}

cleanup();
