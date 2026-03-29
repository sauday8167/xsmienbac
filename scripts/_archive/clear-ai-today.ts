import { query } from '@/lib/db';

async function clearToday() {
    try {
        const targetDate = '2026-01-19';
        console.log(`🗑️ Deleting AI prediction for ${targetDate}...`);

        await query('DELETE FROM ai_predictions WHERE draw_date = ?', [targetDate]);

        console.log('✅ Deleted successfully.');
    } catch (e) {
        console.error('❌ Error:', e);
    }
}

clearToday();
