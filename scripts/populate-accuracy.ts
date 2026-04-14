
import { AIAnalyst } from '../src/lib/ai/analyst';
import { query } from '../src/lib/db';

async function main() {
    console.log('--- POPulating AI ACCURACY ---');
    try {
        const rows = await query<any[]>(
            'SELECT DISTINCT draw_date FROM ai_predictions WHERE is_correct IS NULL ORDER BY draw_date DESC'
        );

        if (!rows || rows.length === 0) {
            console.log('No missing accuracy records found.');
            return;
        }

        console.log(`Found ${rows.length} dates to check.`);

        for (const row of rows) {
            const date = row.draw_date;
            console.log(`Checking accuracy for: ${date}...`);
            await AIAnalyst.checkAccuracy(date);
        }

        console.log('--- POPULATION COMPLETE ---');
    } catch (error) {
        console.error('Population failed:', error);
    }
}

main();
