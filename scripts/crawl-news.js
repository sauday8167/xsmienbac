const axios = require('axios');
const cheerio = require('cheerio');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function crawlNews() {
    let db;
    try {
        console.log('🔌 Connecting to database...');
        db = await open({
            filename: path.join(process.cwd(), 'database', 'xsmb.sqlite'),
            driver: sqlite3.Database
        });

        const targetUrl = 'https://xoso.com.vn/tin-xo-so-c404-p1.html';
        console.log(`🌐 Fetching news list from ${targetUrl}...`);

        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
        });

        const $ = cheerio.load(response.data);
        const articleLinks = [];

        // Select the first 4 articles from the list using the identified selectors
        // Structure: article.article-list > header > h2/h3.article-title > a
        $('.article-list').slice(0, 4).each((i, el) => {
            const titleLink = $(el).find('.article-title a');
            const thumbImg = $(el).find('.thumb img');

            const link = titleLink.attr('href');
            const title = titleLink.attr('title') || titleLink.text().trim();
            const thumb = thumbImg.attr('data-src') || thumbImg.attr('src');

            if (link) {
                const fullUrl = link.startsWith('http') ? link : `https://xoso.com.vn${link}`;
                articleLinks.push({ url: fullUrl, thumb, title });
            }
        });

        console.log(`📝 Found ${articleLinks.length} articles to crawl.`);

        for (const article of articleLinks) {
            console.log(`\n📄 Crawling: ${article.url}`);
            try {
                const detailRes = await axios.get(article.url, {
                    headers: { 'User-Agent': 'Mozilla/5.0' },
                    timeout: 5000
                });
                const $$ = cheerio.load(detailRes.data);

                // Extraction
                let title = $$('h1').first().text().trim();
                // If detailed title is missing, fallback to list title
                if (!title) title = article.title || 'No Title';

                const slug = article.url.split('/').pop().replace('.html', '');

                // Content cleanup
                $$('.related-posts, script, iframe, .ads, .box-quang-cao, .adsbygoogle').remove();

                // Content extraction
                // Try multiple common content containers
                let content = $$('.article-content').html() ||
                    $$('.content-detail').html() ||
                    $$('#content').html() ||
                    $$('.entry-content').html();

                if (!content) {
                    console.log('⚠️ Content selector failed, skipping content update but saving minimal info.');
                    content = '<p>Nội dung đang cập nhật...</p>';
                }

                // Excerpt
                const excerpt = $$('.sapo').text().trim() ||
                    $$('meta[name="description"]').attr('content') ||
                    title;

                const thumbnail = article.thumb ||
                    $$('meta[property="og:image"]').attr('content') || '';

                // Upsert
                const existing = await db.get('SELECT id FROM posts WHERE slug = ?', slug);
                if (existing) {
                    console.log(`🔄 Article exists: ${title}. Updating...`);
                    await db.run(`
                        UPDATE posts 
                        SET title = ?, content = ?, excerpt = ?, thumbnail = ?, updated_at = CURRENT_TIMESTAMP, status = 'published'
                        WHERE id = ?
                    `, [title, content, excerpt, thumbnail, existing.id]);
                } else {
                    console.log(`➕ Inserting new article: ${title}`);
                    await db.run(`
                        INSERT INTO posts (title, slug, content, excerpt, thumbnail, status, published_at)
                        VALUES (?, ?, ?, ?, ?, 'published', CURRENT_TIMESTAMP)
                    `, [title, slug, content, excerpt, thumbnail]);
                }

            } catch (err) {
                console.error(`❌ Failed to crawl ${article.url}:`, err.message);
            }

            // Wait a bit
            await new Promise(r => setTimeout(r, 1000));
        }

        // Get count
        const result = await db.get('SELECT COUNT(*) as count FROM posts');
        console.log(`\n✅ Verification: ${result.count} posts in database.`);

    } catch (error) {
        console.error('Fatal error:', error);
    } finally {
        if (db) await db.close();
    }
}

crawlNews();
