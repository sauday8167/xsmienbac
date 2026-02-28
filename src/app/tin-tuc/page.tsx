import { Metadata } from 'next';
import { NewsClient } from './NewsClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';
const ogImageUrl = `${siteUrl}/tin-tuc/opengraph-image`;

export const metadata: Metadata = {
    title: 'Tin Tức & Soi Cầu XSMB - Phân Tích Dự Đoán Xổ Số Miền Bắc',
    description: 'Tổng hợp tin tức, nhận định và soi cầu xổ số miền Bắc mới nhất. Phân tích thống kê, kinh nghiệm soi cầu lô đề từ chuyên gia.',
    alternates: {
        canonical: `${siteUrl}/tin-tuc`,
    },
    openGraph: {
        title: 'Tin Tức & Soi Cầu XSMB',
        description: 'Tổng hợp tin tức, nhận định và soi cầu xổ số miền Bắc mới nhất.',
        url: `${siteUrl}/tin-tuc`,
        siteName: 'XSMB 24h',
        locale: 'vi_VN',
        type: 'website',
        images: [{ url: ogImageUrl, width: 1200, height: 630, alt: 'Tin Tức Xổ Số Miền Bắc' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Tin Tức & Soi Cầu XSMB',
        description: 'Tổng hợp tin tức, nhận định và soi cầu xổ số miền Bắc mới nhất.',
        images: [ogImageUrl],
    },
};

export default function TinTucPage() {
    return <NewsClient />;
}
