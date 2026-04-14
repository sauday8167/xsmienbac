import { Metadata } from 'next';
import { NewsClient } from './NewsClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

export const metadata: Metadata = {
    title: 'Tin Tức XSMB - Phân Tích & Soi Cầu Dự Đoán Bạch Thủ VIP Hằng Ngày',
    description: 'Chuyên trang tin tức cập nhật tin nóng dự đoán xổ số miền Bắc hôm nay. Dữ liệu phân tích xác suất từ AI, chốt số bạch thủ lô, song thủ, dàn đề 36 VIP bách phát bách trúng.',
    alternates: {
        canonical: `${siteUrl}/tin-tuc`,
    },
    openGraph: {
        title: 'Tin Tức XSMB - Phân Tích & Soi Cầu Dự Đoán Bạch Thủ VIP Hằng Ngày',
        description: 'Chuyên trang tin tức cập nhật tin nóng dự đoán xổ số miền Bắc hôm nay. Dữ liệu phân tích xác suất từ AI, chốt số bạch thủ lô, song thủ, dàn đề 36 VIP bách phát bách trúng.',
        url: `${siteUrl}/tin-tuc`,
        type: 'website',
        images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630, alt: 'Tin Tức XSMB - Phân Tích Xổ Số' }],
    }
};

export default function NewsPage() {
    return <NewsClient />;
}
