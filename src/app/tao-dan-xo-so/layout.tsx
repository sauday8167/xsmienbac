import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Tạo Dàn Xổ Số Miền Bắc - Công Cụ Tạo Dàn 2D/3D/4D Chuyên Nghiệp',
    description: 'Công cụ tạo dàn xổ số miền Bắc miễn phí: tạo dàn 2D lọc theo chạm/tổng/đầu/đuôi, ghép dàn 3D/4D, tạo xiên tự động. Hỗ trợ tính toán bộ số thông minh cho XSMB.',
    keywords: 'tạo dàn xổ số, tạo dàn đề, ghép dàn xiên, dàn 2D 3D 4D, lọc dàn xổ số miền bắc, công cụ xổ số',
    alternates: {
        canonical: '/tao-dan-xo-so',
    },
    openGraph: {
        title: 'Tạo Dàn Xổ Số Miền Bắc - Công Cụ 2D/3D/4D',
        description: 'Công cụ tạo dàn 2D/3D/4D, lọc theo chạm, tổng, đầu, đuôi. Ghép xiên tự động cho XSMB.',
        url: '/tao-dan-xo-so',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Tạo Dàn Xổ Số Miền Bắc - Công Cụ 2D/3D/4D',
        description: 'Công cụ tạo dàn 2D/3D/4D, lọc theo chạm, tổng, đầu, đuôi. Ghép xiên tự động cho XSMB.',
    },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
