import { Metadata } from 'next';
import GdbAnalysisClient from './GdbAnalysisClient';
import JsonLd from '@/components/seo/JsonLd';
import { generateBreadcrumbSchema } from '@/lib/schema-generator';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

export const metadata: Metadata = {
    title: 'Soi Cầu Giải Đặc Biệt KQXSMB - Bắt Dàn Đề 36 Số VIP',
    description: 'Công cụ soi cầu tài lộc đặc biệt miền Bắc miễn phí. Phân tích cầu chạm (Touch), cầu kép (Double) cho dàn đề XSMB hằng ngày dựa trên thuật toán máy học.',
    alternates: {
        canonical: `${siteUrl}/soi-cau-giai-dac-biet`,
    },
    openGraph: {
        title: 'Soi Cầu Giải Đặc Biệt KQXSMB - Bắt Dàn Đề 36 Số VIP',
        description: 'Công cụ soi cầu tài lộc đặc biệt miền Bắc miễn phí. Phân tích cầu chạm, kép cho dàn đề XSMB.',
        url: `${siteUrl}/soi-cau-giai-dac-biet`,
        type: 'website',
        images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630, alt: 'Soi Cầu Giải Đặc Biệt XSMB' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Soi Cầu Giải Đặc Biệt KQXSMB - Bắt Dàn Đề 36 Số VIP',
        description: 'Phân tích cầu chạm, kép từ giải đặc biệt XSMB. Chốt dàn đề 36 số VIP mỗi ngày.',
        images: [`${siteUrl}/og-image.png`],
    },
};

const breadcrumbs = [
    { name: 'Trang chủ', item: '/' },
    { name: 'Soi Cầu Giải Đặc Biệt', item: '/soi-cau-giai-dac-biet' },
];

export default function GdbAnalysisPage() {
    return (
        <>
            <JsonLd data={generateBreadcrumbSchema(breadcrumbs)} />
            <GdbAnalysisClient />
        </>
    );
}
