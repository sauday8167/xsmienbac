import { Metadata } from 'next';
import AIPredictionClient from './AIPredictionClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

export const metadata: Metadata = {
    title: 'Dự Đoán AI Siêu Chuẩn - Soi Cầu Claude AI Hôm Nay',
    description: 'Hệ thống dự đoán xổ số bằng trí tuệ nhân tạo Claude AI. Phân tích bạc nhớ chuyên sâu, chốt số chính xác với KPI 2+ nháy mỗi ngày.',
    alternates: {
        canonical: `${siteUrl}/du-doan-ai`,
    },
    openGraph: {
        title: 'Dự Đoán AI Siêu Chuẩn - Soi Cầu Claude AI',
        description: 'Phân tích xổ số bằng AI giúp bạn có những bộ số với tỷ lệ nổ cao nhất.',
        url: `${siteUrl}/du-doan-ai`,
        type: 'website',
    }
};

export default function AIPredictionPage() {
    return <AIPredictionClient />;
}
