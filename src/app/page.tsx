import { Metadata } from 'next';
import HomeClient from './HomeClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

export const metadata: Metadata = {
    title: 'Xổ Số Miền Bắc - Kết Quả SXMB - KQXS Miền Bắc Hôm Nay 24h',
    description: 'KQXS Miền Bắc 24h - Cập nhật trực tiếp kết quả xổ số Miền Bắc nhanh nhất, chính xác nhất từ trường quay. Bảng kết quả XSMB, thống kê loto, soi cầu và dự đoán AI.',
    alternates: {
        canonical: siteUrl,
    },
    openGraph: {
        title: 'Xổ Số Miền Bắc - KQXS Miền Bắc Hôm Nay',
        description: 'Xem trực tiếp KQXS Miền Bắc nhanh nhất và chính xác nhất.',
        url: siteUrl,
        type: 'website',
    }
};

export default function HomePage() {
    return <HomeClient />;
}
