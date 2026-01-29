import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Tạo Dàn Xổ Số - Công Cụ Lọc Ghép Dàn Đề, Dàn Lô Nhanh',
    description: 'Công cụ tạo dàn đề, ghép dàn xiên, lọc dàn 3D, 4D tự động. Hỗ trợ anh em lên dàn số nhanh chóng, chính xác để chơi web hoặc ghi bảng.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
