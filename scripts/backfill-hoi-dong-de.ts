import { getDb } from '../src/lib/db';
import { analyzeHoiDongDe } from '../src/lib/hoi-dong-de';

async function backfillHoiDongDe() {
    console.log('--- Starting Backfill for Hội Đồng Đề ---');
    const results = await (await getDb()).all('SELECT draw_date, special_prize FROM xsmb_results ORDER BY draw_date DESC LIMIT 15');
    
    // We need at least 11 results (10 to predict one day before)
    for (let i = results.length - 2; i >= 0; i--) {
        const sourceResult = results[i+1]; // The day before
        const targetResult = results[i]; // The day of results
        
        console.log(`Analyzing for target date: ${targetResult.draw_date}...`);
        const prediction = await analyzeHoiDongDe(sourceResult.draw_date);
        
        if (prediction) {
            const actualDe = targetResult.special_prize.slice(-2);
            const isHit = prediction.prediction_36.includes(actualDe);
            
            await (await getDb()).run(`
                INSERT OR REPLACE INTO hoi_dong_de_history 
                (draw_date, prediction_36, actual_de, is_hit, analysis_meta)
                VALUES (?, ?, ?, ?, ?)
            `, [
                targetResult.draw_date,
                JSON.stringify(prediction.prediction_36),
                actualDe,
                isHit ? 1 : 0,
                JSON.stringify(prediction.analysis_meta)
            ]);
            console.log(`  Target ${targetResult.draw_date}: De=${actualDe} | Hit=${isHit}`);
        }
    }
    
    console.log('--- Backfill Completed ---');
    process.exit(0);
}

backfillHoiDongDe().catch(err => {
    console.error('Backfill failed:', err);
    process.exit(1);
});
