import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Quay Thử Xổ Số Miền Bắc Mô Phỏng – Dự Đoán XSMB Tự Động',
    description: 'Hệ thống quay thử xổ số miền Bắc mô phỏng tự động hàng ngày. Tổng hợp tần suất loto xuất hiện nhiều nhất từ hàng chục lần quay giả lập để tìm cặp số may mắn.',
    alternates: {
        canonical: 'https://xsmienbac24h.com/quay-mo-phong',
    },
    openGraph: {
        title: 'Quay Thử Xổ Số Miền Bắc Mô Phỏng – Dự Đoán XSMB',
        description: 'Hệ thống giả lập quy trình quay lồng cầu xổ số thực tế từ 20 đến 50 lần liên tục mỗi ngày để tìm ra điểm rơi mạnh nhất cho các cặp số hôm nay.',
        url: 'https://xsmienbac24h.com/quay-mo-phong',
        type: 'website',
    },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
