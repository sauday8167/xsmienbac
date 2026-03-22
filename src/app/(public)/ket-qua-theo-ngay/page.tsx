import { Metadata } from 'next';
import ResultsByDateClient from './ResultsByDateClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

export const metadata: Metadata = {
    title: 'Kết Quả Xổ Số Miền Bắc Theo Ngày - Tra Cứu XSMB Hôm Nay',
    description: 'Tra cứu kết quả xổ số Miền Bắc (XSMB) theo ngày nhanh nhất và chính xác nhất. Lưu trữ dữ liệu XSMB nhiều năm giúp bạn dễ dàng xem lại kết quả mọi ngày trong quá khứ.',
    alternates: {
        canonical: `${siteUrl}/ket-qua-theo-ngay`,
    },
    openGraph: {
        title: 'Kết Quả XSMB Theo Ngày - Tra Cứu Trực Tuyến',
        description: 'Xem lại kết quả xổ số kiến thiết Miền Bắc theo từng ngày cụ thể.',
        url: `${siteUrl}/ket-qua-theo-ngay`,
        type: 'website',
    }
};

export default function ResultsByDatePage() {
    return <ResultsByDateClient />;
}
