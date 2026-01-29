
import { AIAnalyst } from '@/lib/ai/analyst';
import { query, queryOne } from '@/lib/db';

async function verify() {
    try {
        console.log('--- STARTING VERIFICATION ---');

        const today = new Date();
        const dates: string[] = [];
        for (let i = 1; i <= 3; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            dates.push(d.toISOString().split('T')[0]);
        }

        console.log('Cleaning up existing data for:', dates);
        for (const date of dates) {
            await query('DELETE FROM ai_predictions WHERE draw_date = ?', [date]);
        }

        // 1. Insert Fake Past Predictions
        console.log('Inserting fake past predictions...');

        // Date 1 (Yesterday): WIN (Predict 00, 11... Result has 00)
        await query(`INSERT INTO ai_predictions (draw_date, predicted_pairs, confidence_score, model_used, is_correct, accuracy_notes) VALUES (?, ?, ?, ?, ?, ?)`,
            [dates[0], JSON.stringify(['00', '11', '22', '33', '44']), 90, 'TEST_HISTORY', 1, 'Trúng 1/5 (00)']
        );

        // Date 2 (2 days ago): LOSS
        await query(`INSERT INTO ai_predictions (draw_date, predicted_pairs, confidence_score, model_used, is_correct, accuracy_notes) VALUES (?, ?, ?, ?, ?, ?)`,
            [dates[1], JSON.stringify(['88', '99']), 80, 'TEST_HISTORY', 0, 'Không trúng']
        );

        // Date 3 (3 days ago): WIN
        await query(`INSERT INTO ai_predictions (draw_date, predicted_pairs, confidence_score, model_used, is_correct, accuracy_notes) VALUES (?, ?, ?, ?, ?, ?)`,
            [dates[2], JSON.stringify(['55', '66']), 85, 'TEST_HISTORY', 1, 'Trúng 1/2 (55)']
        );

        // 2. Clear Today's prediction if exists to force regen
        const todayStr = today.toISOString().split('T')[0];
        await query('DELETE FROM ai_predictions WHERE draw_date = ?', [todayStr]);

        console.log(`Running analysis for ${todayStr}...`);

        // 3. Run Analysis
        const result = await AIAnalyst.runDailyAnalysis(todayStr);

        if (!result || !result.analysisContent) {
            console.error('FAILED: No analysis content generated.');
            return;
        }

        // 4. Verify Content
        const content = result.analysisContent;
        console.log('--- GENERATED CONTENT ---');
        console.log(content);

        const hasLoto = content.toLowerCase().includes('loto');
        // Check "lô " with space or at end of line to verify exclusion of forbidden word. 
        // Note: "lô" appears in "loto" so simple exclusion fails.
        // We verify that "lô " (with space) does NOT appear, but "loto" DOES.
        const forbiddenWord = /\blô\b/i.test(content) && !/loto/i.test(content);
        // Wait, regular expression \blô\b matches "lô" as whole word. 
        // But "loto" is allowed. 
        // If content has "lô", usually it's "lô đề", "lô gan". 
        // The prompt says "TUYỆT ĐỐI KHÔNG dùng từ lô".

        const hasForbidden = /\blô\b/i.test(content) || /\bđề\b/i.test(content);
        const hasLotoKeyword = /loto/i.test(content);

        // Check history reference
        const hasHistory = content.includes('Trúng') || content.includes('TRÚNG') || content.includes('lịch sử') || content.includes('Lịch sử');

        console.log('--- VERIFICATION RESULTS ---');
        console.log('Has "loto" keyword:', hasLotoKeyword);
        console.log('Has Forbidden ("lô", "đề"):', hasForbidden);
        console.log('Refers to history:', hasHistory);

        if (hasLotoKeyword && !hasForbidden && hasHistory) {
            console.log('SUCCESS: History integrated and styling correct.');
        } else {
            console.error('FAILURE: Missing requirements (See above).');
            // Allow soft failure on Forbidden if it's just "lô gan" which is hard to avoid sometimes, but strict user rule means we should check.
        }

    } catch (e) {
        console.error('Verification Error:', e);
    } finally {
        process.exit(0);
    }
}

verify();
