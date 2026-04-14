import { Metadata } from 'next';
import QuayThuClient from './QuayThuClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

export const metadata: Metadata = {
    title: 'Quay Thử Xổ Số Miền Bắc - Tạo Số Ngẫu Nhiên May Mắn',
    description: 'Công cụ quay thử xổ số miền Bắc trực tuyến. Mô phỏng quay thưởng thực tế với 27 giải, tạo bộ số ngẫu nhiên may mắn theo kiểu quay từng giải.',
    alternates: { canonical: `${siteUrl}/quay-thu` },
    openGraph: {
        title: 'Quay Thử Xổ Số Miền Bắc - Tạo Số Ngẫu Nhiên May Mắn',
        description: 'Mô phỏng quay thưởng xổ số miền Bắc trực tuyến, tạo bộ số may mắn ngẫu nhiên.',
        url: `${siteUrl}/quay-thu`,
        type: 'website',
        images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630, alt: 'Quay Thử XSMB' }],
    },
};

export default function QuayThuPage() {
    return <QuayThuClient />;
}
