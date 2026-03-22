import { Metadata } from 'next';
import GdbAnalysisClient from './GdbAnalysisClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

export const metadata: Metadata = {
    title: 'Soi Cầu Giải Đặc Biệt XSMB - Dự Đoán Đầu Đuôi Đề Chính Xác',
    description: 'Phân tích soi cầu giải đặc biệt miền Bắc. Thống kê chạm, tổng, đầu đuôi đề và dự đoán bộ số đặc biệt có xác suất về cao nhất hôm nay.',
    alternates: {
        canonical: `${siteUrl}/soi-cau-giai-dac-biet`,
    },
    openGraph: {
        title: 'Soi Cầu GĐB Miền Bắc - Chốt Số Đề Hôm Nay',
        description: 'Phân tích chuyên sâu giải đặc biệt XSMB dựa trên dữ liệu lịch sử.',
        url: `${siteUrl}/soi-cau-giai-dac-biet`,
        type: 'website',
    }
};

export default function GdbAnalysisPage() {
    return <GdbAnalysisClient />;
}
