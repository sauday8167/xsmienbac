import { Metadata } from 'next';
import { NewsClient } from './NewsClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

export const metadata: Metadata = {
    title: 'Tin Tức Xổ Số Miền Bắc - Cập Nhật KQXS Mới Nhất 24h',
    description: 'Tin tức xổ số Miền Bắc nhanh nhất, chính xác 24/7. Cập nhật kết quả mở thưởng, thông báo đổi lịch quay và các phân tích chuyên sâu từ chuyên gia soi cầu xsmb.',
    alternates: {
        canonical: `${siteUrl}/tin-tuc`,
    },
    openGraph: {
        title: 'Tin Tức XSMB 24h - Cập nhật liên tục',
        description: 'Mọi thông tin hot nhất về xổ số miền Bắc đều có tại đây.',
        url: `${siteUrl}/tin-tuc`,
        type: 'website',
    }
};

export default function NewsPage() {
    return <NewsClient />;
}
