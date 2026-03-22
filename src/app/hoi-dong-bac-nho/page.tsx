import { Metadata } from 'next';
import HoiDongBacNhoClient from './HoiDongBacNhoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

export const metadata: Metadata = {
    title: 'Hội Đồng Bạc Nhớ AI - Dự Đoán XSMB Thông Minh',
    description: 'Hệ thống Hội Đồng Bạc Nhớ sử dụng Claude AI Engine v2.5. Phân tích 10 bộ số tiềm năng nhất mỗi ngày với KPI 5+ nháy cực chuẩn.',
    alternates: {
        canonical: `${siteUrl}/hoi-dong-bac-nho`,
    },
    openGraph: {
        title: 'Hội Đồng Bạc Nhớ AI - Dự Đoán XSMB',
        description: 'Phân tích soi cầu bạc nhớ chuyên sâu bằng trí tuệ nhân tạo.',
        url: `${siteUrl}/hoi-dong-bac-nho`,
        type: 'website',
    }
};

export default function HoiDongBacNhoPage() {
    return <HoiDongBacNhoClient />;
}
