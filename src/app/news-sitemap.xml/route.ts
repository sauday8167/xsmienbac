import { query } from '@/lib/db';
import { Post } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

    // Fetch articles from last 2 days (Google News requirement)
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const cutoffDate = twoDaysAgo.toISOString();

    let posts: Post[] = [];
    try {
        posts = await query<Post[]>(
            `SELECT id, title, slug, thumbnail, published_at, created_at, category
             FROM posts
             WHERE status = 'published'
               AND (published_at >= ? OR created_at >= ?)
             ORDER BY published_at DESC
             LIMIT 50`,
            [cutoffDate, cutoffDate]
        );
    } catch (error) {
        console.error('Error fetching posts for news sitemap:', error);
    }

    const urlEntries = posts.map((post) => {
        const postUrl = `${siteUrl}/tin-tuc/${post.slug}`;
        const pubDate = new Date(post.published_at || post.created_at).toISOString();
        const escapedTitle = post.title
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        return `
  <url>
    <loc>${postUrl}</loc>
    <news:news>
      <news:publication>
        <news:name>XSMB 24h</news:name>
        <news:language>vi</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapedTitle}</news:title>
    </news:news>
    <lastmod>${pubDate}</lastmod>
    <changefreq>never</changefreq>
    <priority>0.8</priority>
  </url>`;
    }).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urlEntries}
</urlset>`;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 's-maxage=900, stale-while-revalidate', // 15 min cache
        },
    });
}
