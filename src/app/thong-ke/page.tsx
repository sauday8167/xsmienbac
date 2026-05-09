import { getPageMetadata } from '@/lib/metadata';
import StatisticsClient from './StatisticsClient';

export const revalidate = 0;

export async function generateMetadata() {
    const metadata = await getPageMetadata('/thong-ke');
    if (metadata) return metadata;

    return {
        title: 'Thống Kê Xổ Số Miền Bắc - Bảng Lô Gan & Lô Về Nhiều Đỉnh Nhất',
        description: 'Hệ thống phân tích thống kê xổ số cực khủng. Liệt kê bảng loto gan cực đại miền bắc, lô ra nhiều, đầu đuôi câm. Cơ sở dữ liệu XSMB 1000 ngày siêu chuẩn xác.',
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com'}/thong-ke`,
        },
        twitter: {
            card: 'summary_large_image',
            title: 'Thống Kê Xổ Số Miền Bắc - Bảng Lô Gan & Lô Về Nhiều Đỉnh Nhất',
            description: 'Thống kê XSMB: bảng lô gan, tần suất xuất hiện, đầu đuôi câm. Cơ sở dữ liệu 1000 ngày chính xác.',
        },
    };
}

import JsonLd from '@/components/seo/JsonLd';
import { generateManualArticleSchema, generateBreadcrumbSchema } from '@/lib/schema-generator';
import TopicHub from '@/components/TopicHub';

export default function StatisticsPage() {
    const breadcrumbs = [
        { name: 'Trang chủ', item: '/' },
        { name: 'Thống Kê', item: '/thong-ke' }
    ];

    const schemaArgs = {
        title: 'Thống Kê Xổ Số Miền Bắc - Phân Tích Tần Suất Loto Chi Tiết',
        description: 'Thống Kê Xổ Số Miền Bắc: Công cụ thống kê loto gan, tần suất xuất hiện và phân tích nhịp lô tô chính xác nhất.'
    };

    return (
        <div className="space-y-8">
            <JsonLd data={generateManualArticleSchema(schemaArgs.title, schemaArgs.description, '/thong-ke')} />
            <JsonLd data={generateBreadcrumbSchema(breadcrumbs)} />

            {/* Page H1 — visible to Google and users */}
            <div className="text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-lottery-gray-800 mb-2">
                    Thống Kê Xổ Số Miền Bắc
                </h1>
                <p className="text-lottery-gray-600 text-sm">Phân tích tần suất, lô gan, đầu đuôi và chu kỳ số từ dữ liệu lịch sử Xổ Số Miền Bắc</p>
                <div className="w-20 h-1 bg-lottery-red-600 rounded-full mt-3 md:mx-0 mx-auto"></div>
            </div>

            <StatisticsClient />
            {/* Topic Cluster Hub */}
            <div className="my-8">
                <TopicHub title="Các Công Cụ Thống Kê Khác" />
            </div>

            {/* SEO Content */}
            <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-700 leading-relaxed text-justify shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Giới thiệu về Thống Kê Xổ Số</h2>
                <p>
                    Chuyên trang <strong>Thống Kê Xổ Số</strong> cung cấp cái nhìn toàn diện và sâu sắc nhất về quy luật vận động của các con số.
                    Tại đây, hệ thống liên tục tổng hợp dữ liệu lịch sử trong nhiều năm để tạo ra các bảng thống kê đa chiều: từ nhịp lô tô, tần suất xuất hiện, lô gan lì lợm cho đến thống kê giải đặc biệt theo tuần, tháng, năm.
                    Dữ liệu được trình bày khoa học, trực quan giúp người chơi dễ dàng nhận diện xu hướng, loại bỏ cảm tính và đưa ra những quyết định xuống tiền sáng suốt hơn.
                    Dù bạn là người mới chơi hay cao thủ lão luyện, công cụ thống kê của chúng tôi chính là chiếc chìa khóa vàng giúp bạn giải mã bí ẩn của những vòng quay số và nâng cao tỷ lệ chiến thắng.
                </p>
            </div>
        </div>
    );
}
