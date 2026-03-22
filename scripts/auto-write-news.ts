import { AutoArticleGenerator } from '../src/lib/services/article-generator';
import { queryOne } from '../src/lib/db';

async function main() {
    const isCheckMode = process.argv.includes('--check');
    
    // XSMB predictions are for tomorrow
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const targetDate = tomorrow.toISOString().split('T')[0];
    const slug = `du-doan-xsmb-${targetDate}`;

    console.log(`[NewsBot] Running in ${isCheckMode ? 'CHECK' : 'WRITE'} mode for date: ${targetDate}`);

    if (isCheckMode) {
        // Check if article exists
        const existing = await queryOne('SELECT id FROM posts WHERE slug = ?', [slug]);
        if (existing) {
            console.log(`[NewsBot] Article for ${targetDate} already exists. Skipping.`);
            return;
        }
        console.log(`[NewsBot] Article for ${targetDate} is missing. Writing now...`);
    }

    try {
        const article = await AutoArticleGenerator.generateDailyPost(targetDate);
        console.log(`[NewsBot] Successfully generated: ${article.title}`);
    } catch (error) {
        console.error(`[NewsBot] Error generating article:`, error);
        process.exit(1);
    }
}

main();
