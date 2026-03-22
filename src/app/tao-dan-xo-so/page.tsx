import { Metadata } from 'next';
import TaoDanXoSoClient from './TaoDanXoSoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

export const metadata: Metadata = {
    title: 'Công Cụ Tạo Dàn Xổ Số - Tạo Dàn 2D 3D 4D Nhanh Chóng',
    description: 'Công cụ tạo dàn xổ số, lọc dàn 2D, 3D, 4D chuyên nghiệp. Hỗ trợ lấy dàn theo chạm, tổng, bộ số và thực hiện các phép ghép dàn phức tạp.',
    alternates: {
        canonical: `${siteUrl}/tao-dan-xo-so`,
    },
    openGraph: {
        title: 'Tạo Dàn Xổ Số Online - Lọc Dàn Đề Siêu Tốc',
        description: 'Phần mềm tạo dàn đề, lọc số trực tuyến miễn phí và chính xác nhất.',
        url: `${siteUrl}/tao-dan-xo-so`,
        type: 'website',
    }
};

export default function TaoDanXoSoPage() {
    return <TaoDanXoSoClient />;
}
