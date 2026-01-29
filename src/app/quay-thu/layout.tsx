import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Quay Thử XSMB - Quay Thử Xổ Số Miền Bắc Giờ Hoàng Đạo',
    description: 'Quay thử xổ số miền Bắc (XSMB) hôm nay. Hệ thống quay thử điện tử ngẫu nhiên dựa trên thuật toán xác suất, lấy hên trước giờ quay chính thức.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
