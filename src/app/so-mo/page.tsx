import { Metadata } from 'next';
import SoMoClient from './SoMoClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

export const metadata: Metadata = {
    title: 'Sổ Mơ Lô Đề - Giải Mã Giấc Mơ Tìm Số May Mắn XSMB',
    description: 'Tra cứu sổ mơ lô đề toàn tập. Giải mã hơn 2000 giấc mơ phổ biến để tìm ra các cặp số may mắn tương ứng theo kinh nghiệm dân gian và thuật toán xác suất.',
    alternates: {
        canonical: `${siteUrl}/so-mo`,
    },
    openGraph: {
        title: 'Giải Mã Giấc Mơ - Sổ Mơ Đánh Đề',
        description: 'Khám phá ý nghĩa giấc mơ và những con số tài lộc đi kèm.',
        url: `${siteUrl}/so-mo`,
        type: 'website',
    }
};

export default function SoMoPage() {
    return <SoMoClient />;
}
