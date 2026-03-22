import { Metadata } from 'next';
import PredictionClient from './PredictionClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

export const metadata: Metadata = {
    title: 'Dự Đoán Xổ Số Miền Bắc Hôm Nay - Chốt Số Giờ Vàng XSMB',
    description: 'Chuyên mục dự đoán XSMB hàng ngày. Chốt số đầu đuôi giải đặc biệt, bao lô 2 số, xiên 2, xiên 3 với tỷ lệ chính xác cao từ các chuyên gia.',
    alternates: {
        canonical: `${siteUrl}/du-doan`,
    },
    openGraph: {
        title: 'Dự Đoán XSMB Hôm Nay - Chốt Số May Mắn',
        description: 'Tham khảo bộ số dự đoán xổ số miền Bắc từ hội đồng chuyên gia soi cầu.',
        url: `${siteUrl}/du-doan`,
        type: 'website',
    }
};

export default function PredictionPage() {
    return <PredictionClient />;
}
