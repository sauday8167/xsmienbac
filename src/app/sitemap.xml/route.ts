import { query } from '@/lib/db';

export async function GET(request: Request) {
    try {
        // Dynamic Domain Detection
        const host = request.headers.get('host') || 'localhost:3000';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const BASE_URL = `${protocol}://${host}`;


        // 1. Static Routes
        const staticRoutes = [
            '',
            '/ket-qua-theo-ngay',
            '/thong-ke',
            '/soi-cau-bac-nho',
            '/bac-nho-khung-3-ngay',
            '/tin-tuc',
            '/quay-thu',
            '/do-ve-so',
            '/tao-dan-xo-so',
            '/soi-cau-loto-roi',
            '/soi-cau-giai-dac-biet',
            '/so-mo',
            '/du-doan-ai',
            '/thong-ke/loto-3-4-cang',
            '/du-doan',
            '/thong-ke-theo-thu',
            '/thong-ke-theo-ngay',
            '/soi-cau-bach-thu'
        ];

        // 2. Fetch Blog Posts from DB
        const posts = await query<{ slug: string, updated_at: string }[]>(
            'SELECT slug, updated_at FROM posts WHERE status = "published" ORDER BY created_at DESC'
        );

        // Build XML
        let xml = '<?xml version="1.0" encoding="UTF-8"?>';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        // Add static routes
        staticRoutes.forEach(route => {
            const priority = route === '' ? '1.0' : '0.8';
            const changefreq = route === '' ? 'always' : 'daily';

            xml += `
  <url>
    <loc>${BASE_URL}${route}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
        });

        // Add Posts
        posts.forEach(post => {
            xml += `
  <url>
    <loc>${BASE_URL}/tin-tuc/${post.slug}</loc>
    <lastmod>${new Date(post.updated_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
        });

        xml += '\n</urlset>';

        return new Response(xml, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600'
            },
        });
    } catch (error) {
        console.error('Sitemap error:', error);
        return new Response('Error generating sitemap', { status: 500 });
    }
}
