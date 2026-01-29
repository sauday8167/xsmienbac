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

export default function StatisticsPage() {
    return <StatisticsClient />;
}
