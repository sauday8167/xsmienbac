import { Metadata } from 'next';
import LotoRoiClient from './LotoRoiClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

export const metadata: Metadata = {
    title: 'Soi Cầu Loto Rơi XSMB - Thống Kê Lô Rơi Từ Giải Đặc Biệt',
    description: 'Bảng thống kê lô rơi từ đề và lô rơi từ lô miền Bắc. Phân tích nhịp rơi của các con số để dự đoán lô rơi chính xác cho kỳ quay tiếp theo.',
    alternates: {
        canonical: `${siteUrl}/soi-cau-loto-roi`,
    },
    openGraph: {
        title: 'Soi Cầu Loto Rơi Miền Bắc - Theo Dõi Nhịp Rơi',
        description: 'Công cụ phân tích lô rơi chuyên nghiệp cho người chơi xổ số XSMB.',
        url: `${siteUrl}/soi-cau-loto-roi`,
        type: 'website',
        images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630, alt: 'Soi Cầu Loto Rơi XSMB' }],
    }
};

export default function LotoRoiPage() {
    return <LotoRoiClient />;
}
