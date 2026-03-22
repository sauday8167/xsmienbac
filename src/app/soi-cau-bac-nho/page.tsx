import { Metadata } from 'next';
import SoiCauBacNhoClient from './SoiCauBacNhoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

export const metadata: Metadata = {
    title: 'Soi Cầu Bạc Nhớ Xổ Số Miền Bắc - Dự Đoán KQXS Chính Xác',
    description: 'Công cụ soi cầu bạc nhớ XSMB chuẩn nhất. Phân tích thống kê bạc nhớ lô đề dựa trên các cặp số xuất hiện cùng nhau từ lịch sử quay thưởng.',
    alternates: {
        canonical: `${siteUrl}/soi-cau-bac-nho`,
    },
    openGraph: {
        title: 'Soi Cầu Bạc Nhớ Miền Bắc - Phân Tích Thông Minh',
        description: 'Tìm kiếm quy luật các bộ số thường về cùng nhau dựa trên dữ liệu bạc nhớ lịch sử.',
        url: `${siteUrl}/soi-cau-bac-nho`,
        type: 'website',
    }
};

export default function SoiCauBacNhoPage() {
    return <SoiCauBacNhoClient />;
}
