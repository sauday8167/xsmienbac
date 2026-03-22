import { Metadata } from 'next';
import RandomDrawClient from './RandomDrawClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

export const metadata: Metadata = {
    title: 'Quay Thử Xổ Số Miền Bắc - Lấy Số May Mắn Theo Ngày',
    description: 'Quay thử xổ số Miền Bắc (XSMB) hôm nay để tìm ra những bộ số may mắn nhất dựa trên thuật toán điện tử chính xác.',
    alternates: {
        canonical: `${siteUrl}/quay-thu`,
    },
    openGraph: {
        title: 'Quay Thử XSMB Hôm Nay - Lấy Số Tài Lộc',
        description: 'Dùng thử tính năng quay số ngẫu nhiên để chọn cặp số đẹp cho kỳ quay tối nay.',
        url: `${siteUrl}/quay-thu`,
        type: 'website',
    }
};

export default function RandomDrawPage() {
    return <RandomDrawClient />;
}
