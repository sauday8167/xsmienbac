import { Metadata } from 'next';
import ThongKeTheoNgayClient from './ThongKeTheoNgayClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

export const metadata: Metadata = {
    title: 'Thống Kê Xổ Số Theo Ngày Trong Tháng - XSMB Lịch Sử Từng Ngày',
    description: 'Thống kê lô tô xổ số miền Bắc theo ngày trong tháng. Phân tích tần suất xuất hiện cặp số vào ngày 1-31 hàng tháng trong 12-18 tháng qua.',
    alternates: { canonical: `${siteUrl}/thong-ke-theo-ngay` },
    openGraph: {
        title: 'Thống Kê Xổ Số Theo Ngày Trong Tháng - XSMB',
        description: 'Phân tích tần suất lô tô XSMB theo ngày trong tháng, top 10 số hay về nhất.',
        url: `${siteUrl}/thong-ke-theo-ngay`,
        type: 'website',
        images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630, alt: 'Thống Kê XSMB Theo Ngày' }],
    },
};

export default function ThongKeTheoNgayPage() {
    return <ThongKeTheoNgayClient />;
}
