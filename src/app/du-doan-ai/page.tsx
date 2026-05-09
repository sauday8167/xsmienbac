import { Metadata } from 'next';
import AIPredictionClient from './AIPredictionClient';
import JsonLd from '@/components/seo/JsonLd';
import { generateBreadcrumbSchema } from '@/lib/schema-generator';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

export const metadata: Metadata = {
    title: 'Dự Đoán AI Siêu Chuẩn - Soi Cầu Thống Kê AI Hôm Nay',
    description: 'Hệ thống dự đoán xổ số bằng trí tuệ nhân tạo. Phân tích thống kê bạc nhớ chuyên sâu, chốt 7 số có xác suất cao nhất dựa trên 6 phương pháp thống kê.',
    alternates: {
        canonical: `${siteUrl}/du-doan-ai`,
    },
    openGraph: {
        title: 'Dự Đoán AI Siêu Chuẩn - Soi Cầu Thống Kê AI Hôm Nay',
        description: 'Phân tích xổ số bằng AI thống kê: 6 phương pháp, chốt 7 số xác suất cao nhất.',
        url: `${siteUrl}/du-doan-ai`,
        type: 'website',
        images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630, alt: 'Dự Đoán AI Xổ Số Miền Bắc' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Dự Đoán AI Siêu Chuẩn - Soi Cầu Thống Kê AI Hôm Nay',
        description: 'Phân tích xổ số bằng AI thống kê: 6 phương pháp, chốt 7 số xác suất cao nhất.',
        images: [`${siteUrl}/og-image.png`],
    },
};

const breadcrumbs = [
    { name: 'Trang chủ', item: '/' },
    { name: 'Dự Đoán AI', item: '/du-doan-ai' },
];

export default function AIPredictionPage() {
    return (
        <>
            <JsonLd data={generateBreadcrumbSchema(breadcrumbs)} />
            <AIPredictionClient />
        </>
    );
}
