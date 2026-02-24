import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Hội Đồng AI Dự Đoán Kết Quả XSMB – Phân Tích Loto Thông Minh',
    description: 'Hệ thống Hội Đồng AI dự đoán xổ số miền Bắc (XSMB) đa chiều. Ứng dụng trí tuệ nhân tạo và thuật toán tự học phân tích xác suất loto miễn phí chính xác.',
    alternates: {
        canonical: 'https://xsmienbac24h.com/hoi-dong-ai',
    },
    openGraph: {
        title: 'Hội Đồng AI Dự Đoán Kết Quả XSMB',
        description: 'Hệ thống Hội Đồng AI dự đoán xổ số miền Bắc (XSMB) thông minh. Ứng dụng trí tuệ nhân tạo phân tích chuyên sâu.',
        url: 'https://xsmienbac24h.com/hoi-dong-ai',
        type: 'website',
    },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
