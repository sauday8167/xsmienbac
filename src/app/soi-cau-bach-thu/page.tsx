import { Metadata } from 'next';
import SoiCauBachThuClient from './SoiCauBachThuClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

export const metadata: Metadata = {
    title: 'Soi Cầu Bạch Thủ Xổ Số Miền Bắc - Chốt Số Song Thủ Đề Hôm Nay',
    description: 'Bạch Thủ Lô Miền Bắc chính xác nhất. Công cụ soi cầu bạch thủ lô, song thủ đề dựa trên thuật toán ghép cầu vị trí ổn định nhất.',
    alternates: {
        canonical: `${siteUrl}/soi-cau-bach-thu`,
    },
    openGraph: {
        title: 'Soi Cầu Bạch Thủ XSMB - Cầu Lô Chạy Ăn Thông',
        description: 'Tìm kiếm những đường cầu bạch thủ lô có biên độ dài và ổn định nhất.',
        url: `${siteUrl}/soi-cau-bach-thu`,
        type: 'website',
    }
};

export default function SoiCauBachThuPage() {
    return <SoiCauBachThuClient />;
}
