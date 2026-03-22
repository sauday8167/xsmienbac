import { Metadata } from 'next';
import LotoByDayOfYearClient from './LotoByDayOfYearClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

export const metadata: Metadata = {
    title: 'Thống Kê Loto Theo Ngày Trong Năm - Thống Kê Kỷ Niệm XSMB',
    description: 'Công cụ thống kê kết quả xổ số theo ngày và tháng của mỗi năm (thống kê kỷ niệm). Xem lịch sử các con số hay về vào đúng ngày này trong 10-20 năm qua.',
    alternates: {
        canonical: `${siteUrl}/thong-ke-theo-ngay-trong-nam`,
    },
    openGraph: {
        title: 'Thống Kê Xổ Số Theo Ngày Trong Năm - XSMB 24h',
        description: 'Khám phá quy luật số hay về vào những ngày đặc biệt trong năm.',
        url: `${siteUrl}/thong-ke-theo-ngay-trong-nam`,
        type: 'website',
    }
};

export default function LotoByDayOfYearPage() {
    return <LotoByDayOfYearClient />;
}
