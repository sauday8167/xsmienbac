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
        // Advise Google to show large image previews for all pages
        // This is a global setting that complements the individual meta tags
        // @ts-ignore - MetadataRoute.Robots might not have this in some versions, but Next.js renders it
        robots: {
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
        sitemap: [
            `${siteUrl}/sitemap.xml`,
            `${siteUrl}/news-sitemap.xml`,
        ],
    };
}

