import { Metadata } from 'next';
import SoiCauDanDeClient from './SoiCauDanDeClient';
import JsonLd from '@/components/seo/JsonLd';
import { generateBreadcrumbSchema, generateManualArticleSchema } from '@/lib/schema-generator';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

export const metadata: Metadata = {
    title: 'Soi Cầu Dàn Đề XSMB - Bộ Số Tổng Hợp Hôm Nay',
    description: 'Soi cầu dàn đề xổ số Miền Bắc: tổng hợp số hay về từ tần suất cao, lô gan chín, ba càng giải đặc biệt và dự đoán AI thành bộ dàn đề tham khảo hôm nay.',
    alternates: {
        canonical: `${siteUrl}/soi-cau-dan-de`,
    },
    openGraph: {
        title: 'Soi Cầu Dàn Đề XSMB hôm nay',
        description: 'Dàn đề tổng hợp từ nhiều phương pháp: tần suất, lô gan, ba càng, AI dự đoán.',
        url: `${siteUrl}/soi-cau-dan-de`,
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Soi Cầu Dàn Đề XSMB hôm nay',
        description: 'Dàn đề tổng hợp: tần suất, lô gan, ba càng, AI dự đoán.',
    },
};

const breadcrumbs = [
    { name: 'Trang chủ', item: `${siteUrl}/` },
    { name: 'Soi Cầu Dàn Đề', item: `${siteUrl}/soi-cau-dan-de` },
];

export default function SoiCauDanDePage() {
    return (
        <>
            <JsonLd data={generateBreadcrumbSchema(breadcrumbs)} />
            <JsonLd data={generateManualArticleSchema(
                'Soi Cầu Dàn Đề XSMB - Bộ Số Tổng Hợp Hôm Nay',
                'Soi cầu dàn đề xổ số Miền Bắc: tổng hợp số hay về từ tần suất cao, lô gan chín, ba càng giải đặc biệt và dự đoán AI.',
                `${siteUrl}/soi-cau-dan-de`
            )} />
            <div className="container mx-auto px-4 py-8">
                <SoiCauDanDeClient />
            </div>
        </>
    );
}
