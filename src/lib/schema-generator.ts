import { Post } from '@/types';

const SITE_URL = 'https://xosomienbac24h.com';
const SITE_NAME = 'XSMB 24h';
const LOGO_URL = `${SITE_URL}/logo-v5.png`;

export function generateOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'XSMB 24h - Xổ Số Miền Bắc',
        url: SITE_URL,
        logo: LOGO_URL,
        sameAs: [
            'https://www.facebook.com/xsmb24h',
            // Add other social links here
        ],
        contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+84-999-999-999',
            contactType: 'customer service',
            areaServed: 'VN',
            availableLanguage: ['Vietnamese']
        }
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
                urlTemplate: `${SITE_URL}/tim-kiem?q={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
        }
    };
}

export function generateArticleSchema(post: Post) {
    return {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: post.title,
        image: [
            post.thumbnail || LOGO_URL
        ],
        datePublished: post.created_at,
        dateModified: post.updated_at || post.created_at,
        author: {
            '@type': 'Person',
            name: 'Admin',
            url: SITE_URL
        },
        publisher: {
            '@type': 'Organization',
            name: SITE_NAME,
            logo: {
                '@type': 'ImageObject',
                url: LOGO_URL
            }
        },
        description: post.excerpt
    };
}

export function generateManualArticleSchema(title: string, description: string, url: string, image?: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        image: [
            image || LOGO_URL
        ],
        datePublished: new Date().toISOString(), // Static or updated manually
        author: {
            '@type': 'Organization',
            name: SITE_NAME,
            url: SITE_URL
        },
        publisher: {
            '@type': 'Organization',
            name: SITE_NAME,
            logo: {
                '@type': 'ImageObject',
                url: LOGO_URL
            }
        },
        description: description
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
            item: `${SITE_URL}${item.item}`
        }))
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
                text: faq.answer
            }
        }))
    };
}
