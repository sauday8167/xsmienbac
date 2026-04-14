import { Metadata } from 'next';
import DuDoanClient from './DuDoanClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

export const metadata: Metadata = {
    title: 'Dự Đoán Xổ Số Miền Bắc - Phân Tích Thống Kê Big Data',
    description: 'Phân tích dự đoán xổ số miền Bắc từ dữ liệu thống kê big data 100 ngày. Xem top 10 số có xác suất cao nhất, lô gan lâu ngày và số xuất hiện đều đặn.',
    alternates: {
        canonical: `${siteUrl}/du-doan`,
    },
    openGraph: {
        title: 'Dự Đoán Xổ Số Miền Bắc - Phân Tích Thống Kê Big Data',
        description: 'Phân tích dự đoán xổ số miền Bắc từ dữ liệu thống kê big data 100 ngày.',
        url: `${siteUrl}/du-doan`,
        type: 'website',
        images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630, alt: 'Dự Đoán XSMB Big Data' }],
    },
    twitter: {
        card: 'summary_large_image',
        images: [`${siteUrl}/og-image.png`],
    },
};

export default function DuDoanPage() {
    return <DuDoanClient />;
}
