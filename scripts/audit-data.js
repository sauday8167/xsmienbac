
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');

async function auditData() {
    const db = await open({
        filename: path.join(process.cwd(), 'database', 'xsmb.sqlite'),
        driver: sqlite3.Database
    });

    console.log('--- Database Audit Report ---');

    // 1. Check Results Count & Recency
    const resultCount = await db.get('SELECT COUNT(*) as c FROM xsmb_results');
    const latestResult = await db.get('SELECT * FROM xsmb_results ORDER BY draw_date DESC LIMIT 1');
    console.log(`Total Results: ${resultCount.c}`);
    console.log(`Latest Result Date: ${latestResult?.draw_date} (Expected near ${new Date().toISOString().split('T')[0]})`);

    // 2. Check Posts Sorting Consistency
    const posts = await db.all('SELECT id, published_at FROM posts ORDER BY published_at DESC LIMIT 5');
    console.log('Top 5 Newest Posts:');
    posts.forEach(p => console.log(`[${p.id}] ${p.published_at} (Type: ${typeof p.published_at})`));

    // 3. Check for Malformed Dates in Posts
    const malformed = await db.get("SELECT COUNT(*) as c FROM posts WHERE published_at NOT LIKE '20%'");
    if (malformed.c > 0) {
        console.error(`ERROR: Found ${malformed.c} posts with malformed dates!`);
    } else {
        console.log('OK: All post dates appear valid ISO strings.');
    }

    // 4. Check for Empty or Invalid Data
    const emptyContent = await db.get("SELECT COUNT(*) as c FROM posts WHERE content IS NULL OR content = ''");
    if (emptyContent.c > 0) console.error(`WARNING: Found ${emptyContent.c} posts with empty content.`);

    await db.close();
}

auditData().catch(console.error);
