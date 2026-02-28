import { Post } from '@/types';
import { readFileSync } from 'fs';
import { join } from 'path';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';
const SITE_NAME = 'XSMB 24h';
const LOGO_URL = `${SITE_URL}/logo-v5.png`;

// Load site config for real info
function getSiteConfig() {
    try {
        const config = JSON.parse(readFileSync(join(process.cwd(), 'src/data/seo-config.json'), 'utf8'));
        return config;
    } catch {
        return {};
    }
}

export function generateOrganizationSchema() {
    const config = getSiteConfig();
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: config.siteName || SITE_NAME,
        url: SITE_URL,
        logo: {
            '@type': 'ImageObject',
            url: LOGO_URL,
            width: 200,
            height: 60,
        },
        sameAs: [
            config.facebookUrl || 'https://www.facebook.com/xsmb24h',
        ].filter(Boolean),
        ...(config.phone && {
            contactPoint: {
                '@type': 'ContactPoint',
                telephone: config.phone,
                contactType: 'customer service',
                areaServed: 'VN',
                availableLanguage: ['Vietnamese'],
            },
        }),
    };
}

export function generateWebSiteSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${SITE_URL}/tin-tuc?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    };
}

export function generateArticleSchema(post: Post) {
    const postUrl = `${SITE_URL}/tin-tuc/${post.slug}`;
    const imageUrl = post.thumbnail
        ? (post.thumbnail.startsWith('http') ? post.thumbnail : `${SITE_URL}${post.thumbnail}`)
        : LOGO_URL;

    return {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': postUrl,
        },
        headline: post.title,
        image: [imageUrl],
        datePublished: post.published_at || post.created_at,
        dateModified: post.updated_at || post.published_at || post.created_at,
        author: {
            '@type': 'Organization',
            name: SITE_NAME,
            url: SITE_URL,
        },
        publisher: {
            '@type': 'Organization',
            name: SITE_NAME,
            logo: {
                '@type': 'ImageObject',
                url: LOGO_URL,
            },
        },
        description: post.excerpt || post.meta_description || '',
        url: postUrl,
        ...(post.category && { keywords: post.category }),
    };
}

export function generateManualArticleSchema(title: string, description: string, url: string, image?: string, datePublished?: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${SITE_URL}${url}`,
        },
        headline: title,
        image: [image || LOGO_URL],
        datePublished: datePublished || new Date().toISOString(),
        dateModified: new Date().toISOString(),
        author: {
            '@type': 'Organization',
            name: SITE_NAME,
            url: SITE_URL,
        },
        publisher: {
            '@type': 'Organization',
            name: SITE_NAME,
            logo: {
                '@type': 'ImageObject',
                url: LOGO_URL,
            },
        },
        description,
        url: `${SITE_URL}${url}`,
    };
}

export function generateBreadcrumbSchema(items: { name: string; item: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.item.startsWith('http') ? item.item : `${SITE_URL}${item.item}`,
        })),
    };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };
}

export function generateLotteryResultSchema(drawDate: string, prizes: Record<string, string>) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: `Kết Quả Xổ Số Miền Bắc ${drawDate}`,
        startDate: drawDate,
        location: {
            '@type': 'Place',
            name: 'Hà Nội, Việt Nam',
        },
        organizer: {
            '@type': 'Organization',
            name: 'Công Ty Xổ Số Kiến Thiết Thủ Đô',
        },
        url: `${SITE_URL}/ket-qua-theo-ngay/${drawDate}`,
        description: `Kết quả xổ số miền Bắc ngày ${drawDate}: Giải đặc biệt ${prizes.special || ''}`,
    };
}
