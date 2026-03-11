import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Hội Đồng Bạc Nhớ AI - Dự Đoán XSMB Thông Minh',
    description: 'AI tự học từ 4 nguồn phân tích Bạc Nhớ XSMB (Số Đơn, Cặp 2, Cặp 3, Khung 3 Ngày) để dự đoán 10 số có xác suất xuất hiện cao nhất hàng ngày.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
