const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function audit() {
    console.log('--- XSMB SYSTEM AUDIT START ---');
    
    const db = await open({
        filename: path.join(__dirname, '../database/xsmb.sqlite'),
        driver: sqlite3.Database
    });

    try {
        // 1. Latest Results
        const latestResult = await db.get("SELECT draw_date FROM xsmb_results ORDER BY draw_date DESC LIMIT 1");
        console.log('Latest Result:', latestResult ? latestResult.draw_date : 'MISSING');

        // 2. Latest AI Predictions
        const aiPredictions = await db.all("SELECT model_used, MAX(draw_date) as last_date FROM ai_predictions GROUP BY model_used");
        console.log('AI Predictions:', JSON.stringify(aiPredictions));

        // 3. Latest News Posts
        const latestPost = await db.get("SELECT title, published_at FROM posts ORDER BY published_at DESC LIMIT 1");
        console.log('Latest News:', latestPost ? `${latestPost.title} (${latestPost.published_at})` : 'MISSING');

        // 4. Statistics Cache
        const statsCount = await db.get("SELECT COUNT(*) as count, MAX(updated_at) as last_update FROM statistics_cache");
        console.log('Stats Cache Count:', statsCount.count, '| Last Update:', statsCount.last_update);

        // 5. API Keys
        const keys = await db.all("SELECT provider, status, COUNT(*) as count FROM api_keys GROUP BY provider, status");
        console.log('API Keys:', JSON.stringify(keys));

        // 6. Recent Accuracy Records
        const accuracy = await db.all("SELECT draw_date, accuracy_score FROM ai_predictions WHERE accuracy_score > 0 ORDER BY draw_date DESC LIMIT 3");
        console.log('Recent Accuracy Records:', JSON.stringify(accuracy));

        console.log('--- AUDIT COMPLETE ---');
    } catch (e) {
        console.error('Audit Error:', e.message);
    } finally {
        await db.close();
    }
}

audit();
