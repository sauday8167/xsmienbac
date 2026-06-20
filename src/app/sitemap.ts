import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

    // 1. Static Routes — High priority tool/analysis pages
    const toolRoutes = [
        '',
        '/soi-cau-bac-nho',
        '/soi-cau-bach-thu',
        '/thong-ke',
        '/thong-ke-theo-ngay',
        '/thong-ke-theo-thu',
        '/thong-ke/loto-3-4-cang',
        '/du-doan',
        '/du-doan-ai',
        '/ket-qua-theo-ngay',
        '/do-ve-so',
        '/quay-thu',
        '/tao-dan-xo-so',
        '/so-mo',
        '/thong-ke-theo-ngay-trong-nam',
    ].map((route) => ({
        url: `${siteUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.85,
    }));


    // 2. Static Info/Policy Routes — Lower priority
    const infoRoutes = [
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

    return [...routes, ...resultRoutes];
}
