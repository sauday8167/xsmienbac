import { MetadataRoute } from 'next';
import { query } from '@/lib/db';
import { Post } from '@/types';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

    // 1. Static Routes — High priority tool/analysis pages
    const toolRoutes = [
        '',
        '/soi-cau-bac-nho',
        '/soi-cau-bach-thu',
        '/soi-cau-loto-roi',
        '/soi-cau-giai-dac-biet',
        '/bac-nho-khung-3-ngay',
        '/thong-ke',
        '/thong-ke-theo-ngay',
        '/thong-ke-theo-thu',
        '/thong-ke/loto-3-4-cang',
        '/du-doan',
        '/du-doan-ai',
        '/hoi-dong-bac-nho',
        '/ket-qua-theo-ngay',
        '/do-ve-so',
        '/quay-thu',
        '/tao-dan-xo-so',
        '/so-mo',
    ].map((route) => ({
        url: `${siteUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.85,
    }));


    // 2. Static Info/Policy Routes — Lower priority
    const infoRoutes = [
        '/tin-tuc',
        '/chinh-sach-bao-mat',
        '/dieu-khoan-su-dung',
        '/mien-tru-trach-nhiem',
        '/lien-he',
        '/gioi-thieu/ban-bien-tap',
    ].map((route) => ({
        url: `${siteUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
    }));

    const routes = [...toolRoutes, ...infoRoutes];

    // 2. Blog Posts
    let posts: Post[] = [];
    try {
        posts = await query<Post[]>(
            'SELECT slug, updated_at, published_at FROM posts WHERE status = ? ORDER BY published_at DESC LIMIT 1000',
            ['published']
        );
    } catch (error) {
        console.error('Error fetching posts for sitemap:', error);
    }

    const postRoutes = posts.map((post) => ({
        url: `${siteUrl}/tin-tuc/${post.slug}`,
        lastModified: new Date(post.updated_at || post.published_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // 3. Daily Results (Last 30 days)
    const resultRoutes = [];
    for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '-'); // 02-02-2026

        resultRoutes.push({
            url: `${siteUrl}/ket-qua-theo-ngay/${dateStr}`,
            lastModified: new Date(), // Results don't change after draw, but page might
            changeFrequency: 'never' as const, // Historical results are static
            priority: 0.6,
        });
    }

    return [...routes, ...postRoutes, ...resultRoutes];
}
