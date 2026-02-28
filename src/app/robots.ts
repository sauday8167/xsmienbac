import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/api/',
                '/admin/',
                '/private/',
            ],
        },
        sitemap: [
            `${siteUrl}/sitemap.xml`,
            `${siteUrl}/news-sitemap.xml`,
        ],
    };
}

