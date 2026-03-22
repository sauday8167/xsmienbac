import { Metadata } from 'next';
import Loto34CangClient from './Loto34CangClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

export const metadata: Metadata = {
    title: 'Thống Kê Loto 3 Càng & 4 Càng - Tần Suất Loto Đặc Biệt XSMB',
    description: 'Bảng thống kê loto 3 càng (3 số cuối) và 4 càng (4 số cuối) xuất hiện nhiều nhất trong 100-2000 ngày qua. Phân tích chu kỳ gan loto 3, 4 càng chính xác.',
    alternates: {
        canonical: `${siteUrl}/thong-ke/loto-3-4-cang`,
    },
    openGraph: {
        title: 'Thống Kê Loto 3-4 Càng - XSMB 24h',
        description: 'Xem tần suất xuất hiện và chu kỳ gan của loto 3 số, 4 số cuối.',
        url: `${siteUrl}/thong-ke/loto-3-4-cang`,
        type: 'website',
    }
};

export default function Loto34CangPage() {
    return <Loto34CangClient />;
}
