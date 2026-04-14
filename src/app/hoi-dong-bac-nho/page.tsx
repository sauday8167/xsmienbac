import { Metadata } from 'next';
import HoiDongBacNhoClient from './HoiDongBacNhoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

export const metadata: Metadata = {
    title: 'Hội Đồng Chốt Số AI Bạc Nhớ Miền Bắc - Siêu Trí Tuệ Dự Đoán',
    description: 'Máy học AI Hội Đồng Bạc Nhớ soi cầu phân tích dữ liệu vĩ mô. Tra cứu ngay bảng chốt dự báo 10 con số tiềm năng được máy tính bình chọn để chốt hạ hôm nay.',
    alternates: {
        canonical: `${siteUrl}/hoi-dong-bac-nho`,
    },
    openGraph: {
        title: 'Hội Đồng Chốt Số AI Bạc Nhớ Miền Bắc - Siêu Trí Tuệ Dự Đoán',
        description: 'Máy học AI Hội Đồng Bạc Nhớ soi cầu phân tích dữ liệu vĩ mô. Tra cứu ngay bảng chốt dự báo 10 con số tiềm năng được máy tính bình chọn để chốt hạ hôm nay.',
        url: `${siteUrl}/hoi-dong-bac-nho`,
        type: 'website',
        images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630, alt: 'Hội Đồng Chốt Số AI Bạc Nhớ XSMB' }],
    }
};

export default function HoiDongBacNhoPage() {
    return <HoiDongBacNhoClient />;
}
