import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Hội Đồng AI Dự Đoán Kết Quả Xổ Số Miền Bắc – Phân Tích Loto Thông Minh',
    description: 'Xổ Số Miền Bắc hôm nay: Hội Đồng AI dự đoán đa chiều, ứng dụng trí tuệ nhân tạo và thuật toán tự học phân tích xác suất loto chính xác nhất.',
    alternates: {
        canonical: 'https://xsmienbac24h.com/hoi-dong-ai',
    },
    openGraph: {
        title: 'Hội Đồng AI Dự Đoán Kết Quả Xổ Số Miền Bắc',
        description: 'Xổ Số Miền Bắc hôm nay: Hệ thống Hội Đồng AI dự đoán thông minh, ứng dụng trí tuệ nhân tạo phân tích chuyên sâu.',
        url: 'https://xsmienbac24h.com/hoi-dong-ai',
        type: 'website',
    },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
