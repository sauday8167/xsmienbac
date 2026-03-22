import { Metadata } from 'next';
import LotoByDayOfMonthClient from './LotoByDayOfMonthClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

export const metadata: Metadata = {
    title: 'Thống Kê Loto Theo Ngày Trong Tháng - XSMB 24h',
    description: 'Bảng thống kê tần suất loto xuất hiện theo từng ngày trong tháng từ 1 đến 31. Tìm quy luật số hay về vào một ngày định kỳ hàng tháng chính xác.',
    alternates: {
        canonical: `${siteUrl}/thong-ke-theo-ngay`,
    },
    openGraph: {
        title: 'Thống Kê Loto Theo Ngày - XSMB chính xác',
        description: 'Phân tích tần suất loto theo ngày trong tháng.',
        url: `${siteUrl}/thong-ke-theo-ngay`,
        type: 'website',
    }
};

export default function LotoByDayOfMonthPage() {
    return <LotoByDayOfMonthClient />;
}
