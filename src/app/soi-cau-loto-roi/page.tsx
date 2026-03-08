'use client';

import { useEffect, useState } from 'react';
import { LotoRoiResponse } from '@/types/loto-roi-types';
import LotoRoiResult from './components/LotoRoiResult';
import JsonLd from '@/components/seo/JsonLd';
import { generateManualArticleSchema, generateBreadcrumbSchema } from '@/lib/schema-generator';
import TopicHub from '@/components/TopicHub';

export default function LotoRoiPage() {
    const [data, setData] = useState<LotoRoiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const breadcrumbs = [
        { name: 'Trang chủ', item: '/' },
        { name: 'Phân Tích Loto Rơi', item: '/soi-cau-loto-roi' }
    ];

    const schemaArgs = {
        title: 'Phân Tích Loto Rơi Xổ Số Miền Bắc - Dự Đoán Số Sắp Ra',
        description: 'Loto Rơi Xổ Số Miền Bắc: Phân tích theo thuật toán chuyên sâu để dự đoán các cặp số có xác suất xuất hiện cao nhất.'
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/soi-cau-loto-roi');
                const result = await response.json();

                if (result.success) {
                    setData(result.data);
                } else {
                    setError(result.error || 'Có lỗi xảy ra khi tải dữ liệu');
                }
            } catch (err) {
                setError('Không thể kết nối đến máy chủ');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
                <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mb-4"></div>
                <div className="text-gray-500 font-medium">Đang phân tích số đẹp...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
                <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md w-full">
                    <div className="text-5xl mb-4">😕</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Đã có lỗi xảy ra</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-red-600 text-white px-6 py-2 rounded-full font-bold hover:bg-red-700 transition-colors shadow-lg"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="space-y-6">
            <JsonLd data={generateManualArticleSchema(schemaArgs.title, schemaArgs.description, '/soi-cau-loto-roi')} />
            <JsonLd data={generateBreadcrumbSchema(breadcrumbs)} />

            {/* Page Header with H1 */}
            <div className="text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-lottery-gray-800 mb-2">
                    Phân Tích Loto Rơi Xổ Số Miền Bắc
                </h1>
                <p className="text-lottery-gray-600">Phân tích số lâu chưa về và dự đoán xác suất xuất hiện cao nhất</p>
                <div className="w-20 h-1 bg-lottery-red-600 rounded-full mt-3 md:mx-0 mx-auto"></div>
            </div>

            <div className="min-h-screen bg-lottery-pattern bg-fixed font-sans">
                <div className="max-w-5xl mx-auto px-4 py-8">
                    <LotoRoiResult data={data} />
                </div>
            </div>

            {/* Topic Hub */}
            <div className="my-6">
                <TopicHub title="Công Cụ Soi Cầu Liên Quan" />
            </div>

            {/* SEO Content Block */}
            <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-700 leading-relaxed text-justify shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Phân Tích Loto Rơi Xổ Số Miền Bắc Là Gì?</h2>
                <p className="mb-3">
                    <strong>Loto Rơi</strong> (hay còn gọi là <strong>Lô Rơi</strong>) là thuật ngữ trong giới lô đề dùng để chỉ những con số đã <em>vắng mặt lâu ngày</em> trong kết quả Xổ Số Miền Bắc.
                    Theo lý thuyết xác suất, một số đã không xuất hiện trong nhiều kỳ quay sẽ có xu hướng "rơi" trở lại trong kỳ quay tiếp theo.
                </p>
                <p>
                    Hệ thống <strong>Phân Tích Loto Rơi Xổ Số Miền Bắc</strong> của chúng tôi hoạt động bằng cách quét toàn bộ dữ liệu kết quả lịch sử để xác định các số vắng mặt lâu nhất và dự đoán điểm xác suất tổng hợp.
                </p>
                <p>
                    Đây là công cụ hữu ích cho người chơi muốn tìm kiếm các <strong>cặp lô chưa về lâu ngày</strong>, <strong>số đặc biệt Xổ Số Miền Bắc sắp ra</strong>, hay đơn giản là muốn phân tích dữ liệu một cách khoa học.
                    Lưu ý: Mọi thông tin chỉ mang tính tham khảo thống kê, không đảm bảo kết quả trúng thưởng.
                </p>
            </div>
        </div>
    );
}
