import { AIAnalyst } from '@/lib/ai/analyst';
import { query } from '@/lib/db';

async function updateAndRegen() {
    try {
        console.log("🚀 Starting Update & Regenerate Process...");

        // 1. Force update accuracy for Jan 18
        // We can manually call checkAccuracy for specific dates
        const TARGET_DATE_PAST = '2026-01-18';
        console.log(`Checking accuracy for ${TARGET_DATE_PAST}...`);
        await AIAnalyst.checkAccuracy(TARGET_DATE_PAST);

        // Verify if it updated
        const check = await query('SELECT actual_result, is_correct FROM ai_predictions WHERE draw_date = ?', [TARGET_DATE_PAST]);
        console.log(`Status for ${TARGET_DATE_PAST}:`, JSON.stringify(check));

        // 2. Regenerate Jan 19 with NEW Prompt
        const TARGET_DATE_FUTURE = '2026-01-19';
        console.log(`Clearing existing prediction for ${TARGET_DATE_FUTURE}...`);
        await query('DELETE FROM ai_predictions WHERE draw_date = ?', [TARGET_DATE_FUTURE]);

        console.log(`Regenerating prediction for ${TARGET_DATE_FUTURE}...`);
        // We can't easily pass arguments to runDailyAnalysis as it generates date inside.
        // But since today is Jan 19 (local), runDailyAnalysis WILL target Jan 19.
        await AIAnalyst.runDailyAnalysis();

        console.log("✅ Process Complete.");
        process.exit(0);
    } catch (e) {
        console.error("❌ Error:", e);
        process.exit(1);
    }
}

updateAndRegen();
