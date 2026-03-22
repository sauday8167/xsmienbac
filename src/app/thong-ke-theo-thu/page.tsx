import { Metadata } from 'next';
import LotoByWeekdayClient from './LotoByWeekdayClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

export const metadata: Metadata = {
    title: 'Thống Kê Loto Theo Thứ Trong Tuần - XSMB Tần Suất Cao',
    description: 'Thống kê các cặp số hay về vào Thứ 2, Thứ 3... đến Chủ Nhật. Phân tích chu kỳ loto theo thứ trong tuần để tìm ra con số may mắn nhất mỗi ngày.',
    alternates: {
        canonical: `${siteUrl}/thong-ke-theo-thu`,
    },
    openGraph: {
        title: 'Thống Kê Loto Theo Thứ - Phân tích chu kỳ',
        description: 'Xem tần suất loto xuất hiện theo các thứ trong tuần.',
        url: `${siteUrl}/thong-ke-theo-thu`,
        type: 'website',
    }
};

export default function LotoByWeekdayPage() {
    return <LotoByWeekdayClient />;
}
