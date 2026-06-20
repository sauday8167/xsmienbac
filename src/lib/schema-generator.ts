import siteConfig from '@/data/seo-config.json';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';
const SITE_NAME = 'XSMB 24h';
const LOGO_URL = `${SITE_URL}/logo-v5.png`;

// Site config for real info
function getSiteConfig() {
    return siteConfig || {};
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
            config.social?.facebook,
            config.social?.youtube,
        ].filter(Boolean),
    };
}

export function generateWebSiteSchema() {
    // KHÔNG khai báo SearchAction vì website không có ô tìm kiếm (sitelinks searchbox)
    // → tránh structured data sai sự thật theo chính sách Google.
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
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
