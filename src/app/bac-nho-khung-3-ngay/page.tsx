import { Metadata } from 'next';
import BacNhoKhung3NgayClient from './BacNhoKhung3NgayClient';
import JsonLd from '@/components/seo/JsonLd';
import { generateBreadcrumbSchema } from '@/lib/schema-generator';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

export const metadata: Metadata = {
    title: 'Bạc Nhớ Khung 3 Ngày XSMB - Soi Cầu Nuôi Lô Khung Chuẩn',
    description: 'Bạc nhớ khung 3 ngày xổ số miền Bắc. Thống kê các cặp số hay về trong chu kỳ 3 ngày dựa trên quy luật bạc nhớ lịch sử chính xác nhất.',
    alternates: {
        canonical: `${siteUrl}/bac-nho-khung-3-ngay`,
    },
    openGraph: {
        title: 'Bạc Nhớ Khung 3 Ngày XSMB - Phân Tích Chu Kỳ',
        description: 'Phân tích nuôi lô khung 3 ngày dựa trên dữ liệu bạc nhớ chuyên sâu XSMB.',
        url: `${siteUrl}/bac-nho-khung-3-ngay`,
        type: 'website',
        images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630, alt: 'Bạc Nhớ Khung 3 Ngày XSMB' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Bạc Nhớ Khung 3 Ngày XSMB - Soi Cầu Nuôi Lô Khung Chuẩn',
        description: 'Thống kê cặp số hay về chu kỳ 3 ngày theo quy luật bạc nhớ XSMB lịch sử.',
        images: [`${siteUrl}/og-image.png`],
    },
};

const breadcrumbs = [
    { name: 'Trang chủ', item: '/' },
    { name: 'Bạc Nhớ Khung 3 Ngày', item: '/bac-nho-khung-3-ngay' },
];

export default function BacNhoKhung3NgayPage() {
    return (
        <>
            <JsonLd data={generateBreadcrumbSchema(breadcrumbs)} />
            <BacNhoKhung3NgayClient />
        </>
    );
}
