import { query } from '@/lib/db';
import { Post } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

    let posts: Post[] = [];
    try {
        posts = await query<Post[]>(
            'SELECT * FROM posts WHERE status = ? ORDER BY published_at DESC LIMIT 50',
            ['published']
        );
    } catch (error) {
        console.error('Error fetching posts for RSS:', error);
    }

    const items = posts.map((post) => {
        const postUrl = `${siteUrl}/tin-tuc/${post.slug}`;
        const pubDate = new Date(post.published_at || post.created_at).toUTCString();
        const pubDateIso = new Date(post.published_at || post.created_at).toISOString();
        const thumbnail = post.thumbnail
            ? (post.thumbnail.startsWith('http') ? post.thumbnail : `${siteUrl}${post.thumbnail}`)
            : `${siteUrl}/logo-v5.png`;

        return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${post.excerpt || ''}]]></description>
      <news:news>
        <news:publication>
          <news:name>XSMB 24h</news:name>
          <news:language>vi</news:language>
        </news:publication>
        <news:publication_date>${pubDateIso}</news:publication_date>
        <news:title><![CDATA[${post.title}]]></news:title>
      </news:news>
      <media:content url="${thumbnail}" medium="image" width="1200" height="630">
        <media:title><![CDATA[${post.title}]]></media:title>
      </media:content>
    </item>`;
    }).join('');

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
  xmlns:media="http://search.yahoo.com/mrss/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>XSMB 24h - Tin Tức Xổ Số Miền Bắc</title>
    <link>${siteUrl}</link>
    <description>Cập nhật kết quả xổ số miền Bắc và tin tức lô đề mới nhất.</description>
    <language>vi</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${siteUrl}/logo-v5.png</url>
      <title>XSMB 24h</title>
      <link>${siteUrl}</link>
    </image>
    ${items}
  </channel>
</rss>`;

    return new Response(rss, {
        headers: {
            'Content-Type': 'application/rss+xml; charset=utf-8',
            'Cache-Control': 's-maxage=3600, stale-while-revalidate',
        },
    });
}
