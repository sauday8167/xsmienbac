import { query } from '@/lib/db';
import { Post } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

    // Fetch latest 20 posts
    let posts: Post[] = [];
    try {
        posts = await query<Post[]>(
            'SELECT * FROM posts WHERE status = ? ORDER BY published_at DESC LIMIT 20',
            ['published']
        );
    } catch (error) {
        console.error('Error fetching posts for RSS:', error);
    }

    const items = posts.map((post) => {
        const postUrl = `${siteUrl}/tin-tuc/${post.slug}`;
        return `
        <item>
            <title><![CDATA[${post.title}]]></title>
            <link>${postUrl}</link>
            <guid>${postUrl}</guid>
            <pubDate>${new Date(post.published_at || post.created_at).toUTCString()}</pubDate>
            <description><![CDATA[${post.excerpt || ''}]]></description>
        </item>`;
    }).join('');

    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
    <channel>
        <title>XSMB 24h - Tin Tức Xổ Số</title>
        <link>${siteUrl}</link>
        <description>Cập nhật kết quả xổ số miền Bắc và tin tức lô đề mới nhất.</description>
        <language>vi</language>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        ${items}
    </channel>
</rss>`;

    return new Response(rss, {
        headers: {
            'Content-Type': 'text/xml',
            'Cache-Control': 's-maxage=3600, stale-while-revalidate',
        },
    });
}
