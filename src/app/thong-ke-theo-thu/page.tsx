import { Metadata } from 'next';
import ThongKeTheoThuClient from './ThongKeTheoThuClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

export const metadata: Metadata = {
    title: 'Thống Kê Xổ Số Theo Thứ - XSMB Lô Tô Hay Về Nhất Theo Ngày Tuần',
    description: 'Thống kê lô tô xổ số miền Bắc theo thứ trong tuần. Phân tích tần suất cặp số xuất hiện vào Thứ 2, Thứ 3... Chủ Nhật trong 1-3 năm qua.',
    alternates: { canonical: `${siteUrl}/thong-ke-theo-thu` },
    openGraph: {
        title: 'Thống Kê Xổ Số Theo Thứ - XSMB Lô Tô Hay Về Nhất',
        description: 'Phân tích tần suất lô tô XSMB theo từng ngày trong tuần.',
        url: `${siteUrl}/thong-ke-theo-thu`,
        type: 'website',
        images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630, alt: 'Thống Kê XSMB Theo Thứ' }],
    },
};

export default function ThongKeTheoThuPage() {
    return <ThongKeTheoThuClient />;
}
