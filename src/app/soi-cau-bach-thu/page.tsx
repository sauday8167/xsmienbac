import { Metadata } from 'next';
import SoiCauBachThuClient from './SoiCauBachThuClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

export const metadata: Metadata = {
    title: 'Soi Cầu Bạch Thủ Xổ Số Miền Bắc - Phân Tích Song Thủ & Dàn Đề Chuẩn',
    description: 'Bạch Thủ Xổ Số Miền Bắc: Phân tích Bạch Thủ và Song Thủ dựa trên thuật toán thống kê xác suất cao nhất hôm nay. Cầu lô đẹp, soi cầu 3 càng 4 càng chính xác.',
    alternates: {
        canonical: `${siteUrl}/soi-cau-bach-thu`,
    },
    openGraph: {
        title: 'Soi Cầu Bạch Thủ Xổ Số Miền Bắc - Phân Tích Song Thủ & Dàn Đề Chuẩn',
        description: 'Phân tích Bạch Thủ XSMB dựa trên thuật toán thống kê xác suất cao nhất hôm nay.',
        url: `${siteUrl}/soi-cau-bach-thu`,
        type: 'website',
        images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630, alt: 'Soi Cầu Bạch Thủ XSMB' }],
    },
    twitter: {
        card: 'summary_large_image',
        images: [`${siteUrl}/og-image.png`],
    },
};

export default function SoiCauBachThuPage() {
    return <SoiCauBachThuClient />;
}
