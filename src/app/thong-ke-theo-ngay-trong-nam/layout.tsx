import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Thống Kê XSMB Theo Ngày Trong Năm - Lô Hay Về Ngày Kỷ Niệm',
    description: 'Tra cứu thống kê xổ số miền Bắc theo ngày trong năm: sinh nhật, kỷ niệm, lễ tết. Xem lô số hay về nhất trong lịch sử XSMB theo từng ngày DD/MM.',
    keywords: 'thống kê xsmb theo ngày, lô hay về ngày sinh nhật, xổ số ngày kỷ niệm, tra cứu lô theo ngày trong năm',
    alternates: {
        canonical: '/thong-ke-theo-ngay-trong-nam',
    },
    openGraph: {
        title: 'Thống Kê XSMB Theo Ngày Trong Năm - Lô Hay Về Ngày Kỷ Niệm',
        description: 'Tra cứu thống kê xổ số miền Bắc theo ngày trong năm: sinh nhật, kỷ niệm, lễ tết.',
        url: '/thong-ke-theo-ngay-trong-nam',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Thống Kê XSMB Theo Ngày Trong Năm - Lô Hay Về Ngày Kỷ Niệm',
        description: 'Tra cứu thống kê XSMB theo ngày sinh nhật, kỷ niệm. Xem lô hay về nhất lịch sử.',
    },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
