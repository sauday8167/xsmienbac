import { Metadata } from 'next';
import SoiCauBacNhoClient from './SoiCauBacNhoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

export const metadata: Metadata = {
    title: 'Soi Cầu Bạc Nhớ Loto XSMB hôm nay - Độc Chiêu Bắt Số Chuẩn',
    description: 'Ứng dụng tra cứu soi cầu bạc nhớ lô đề lô ra cùng lô, loto theo thứ dễ dùng nhất. Xem cao thủ miền bắc thống kê đánh lô miền bắc theo giải đặc biệt bất bại.',
    alternates: {
        canonical: `${siteUrl}/soi-cau-bac-nho`,
    },
    openGraph: {
        title: 'Soi Cầu Bạc Nhớ Loto XSMB hôm nay - Độc Chiêu Bắt Số Chuẩn',
        description: 'Ứng dụng tra cứu soi cầu bạc nhớ lô đề lô ra cùng lô, loto theo thứ dễ dùng nhất. Xem cao thủ miền bắc thống kê đánh lô miền bắc theo giải đặc biệt bất bại.',
        url: `${siteUrl}/soi-cau-bac-nho`,
        type: 'website',
        images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630, alt: 'Soi Cầu Bạc Nhớ XSMB' }],
    }
};

export default function SoiCauBacNhoPage() {
    return <SoiCauBacNhoClient />;
}
