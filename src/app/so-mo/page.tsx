import { Metadata } from 'next';
import SoMoClient from './SoMoClient';
import JsonLd from '@/components/seo/JsonLd';
import { generateBreadcrumbSchema } from '@/lib/schema-generator';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

export const metadata: Metadata = {
    title: 'Sổ Mơ Lô Đề Miền Bắc Thông Dụng Nhất Ai Cũng Nên Biết',
    description: 'Từ điển sổ mơ đánh đề giải mã chính xác 2000 giấc mơ lô đề dân gian. Tìm xem nằm mơ thấy chó, mèo, rắn, đánh con gì dễ trúng nhất XSMB hôm nay.',
    alternates: {
        canonical: `${siteUrl}/so-mo`,
    },
    openGraph: {
        title: 'Sổ Mơ Lô Đề Miền Bắc Thông Dụng Nhất Ai Cũng Nên Biết',
        description: 'Từ điển sổ mơ đánh đề giải mã chính xác 2000 giấc mơ lô đề dân gian. Tìm xem nằm mơ thấy chó, mèo, rắn, đánh con gì dễ trúng nhất XSMB hôm nay.',
        url: `${siteUrl}/so-mo`,
        type: 'website',
        images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630, alt: 'Sổ Mơ Lô Đề Miền Bắc' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Sổ Mơ Lô Đề Miền Bắc - Giải Mã Giấc Mơ Đánh Con Gì',
        description: 'Từ điển sổ mơ 2000 giấc mơ: thấy chó, mèo, rắn đánh con gì? Giải mã XSMB chính xác nhất.',
        images: [`${siteUrl}/og-image.png`],
    },
};

const breadcrumbs = [
    { name: 'Trang chủ', item: '/' },
    { name: 'Sổ Mơ Lô Đề', item: '/so-mo' },
];

export default function SoMoPage() {
    return (
        <>
            <JsonLd data={generateBreadcrumbSchema(breadcrumbs)} />
            <SoMoClient />
        </>
    );
}
