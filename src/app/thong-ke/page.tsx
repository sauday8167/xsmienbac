import { getPageMetadata } from '@/lib/metadata';
import StatisticsClient from './StatisticsClient';

export const revalidate = 0;

export async function generateMetadata() {
    const metadata = await getPageMetadata('/thong-ke');
    if (metadata) return metadata;

    return {
        title: 'Thống Kê Lô Tô Miền Bắc - Phân Tích Tần Suất, Nhịp Loto Chi Tiết',
        description: 'Công cụ thống kê lô tô XSMB đầy đủ nhất: Thống kê loto gan, tần suất xuất hiện, đầu đuôi, loto rơi, và dự đoán giải đặc biệt ngày mai.'
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
        title: 'Thống Kê Lô Tô Miền Bắc - Phân Tích Tần Suất Chi Tiết',
        description: 'Công cụ thống kê loto gan, tần suất xuất hiện, đầu đuôi, và phân tích nhịp lô tô chính xác nhất xổ số miền Bắc.'
    };

    return (
        <div className="space-y-8">
            <JsonLd data={generateManualArticleSchema(schemaArgs.title, schemaArgs.description, '/thong-ke')} />
            <JsonLd data={generateBreadcrumbSchema(breadcrumbs)} />
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
