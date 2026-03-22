'use client';

import { useEffect, useState } from 'react';
import { LotoRoiResponse } from '@/types/loto-roi-types';
import LotoRoiResult from './components/LotoRoiResult';
import JsonLd from '@/components/seo/JsonLd';
import { generateManualArticleSchema, generateBreadcrumbSchema } from '@/lib/schema-generator';
import TopicHub from '@/components/TopicHub';

export default function LotoRoiClient() {
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
            <div className="min-h-[400px] flex flex-col justify-center items-center">
                <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mb-4"></div>
                <div className="text-gray-500">Đang phân tích số đẹp...</div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="text-center p-12 border rounded-xl bg-white shadow-sm">
                <p className="text-red-600 font-bold">{error || 'Không tìm thấy dữ liệu'}</p>
                <button onClick={() => window.location.reload()} className="mt-4 text-sm text-blue-600 underline">Thử lại</button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <JsonLd data={generateManualArticleSchema(schemaArgs.title, schemaArgs.description, '/soi-cau-loto-roi')} />
            <JsonLd data={generateBreadcrumbSchema(breadcrumbs)} />

            <div className="text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-lottery-gray-800 mb-2">
                    Phân Tích Loto Rơi Xổ Số Miền Bắc
                </h1>
                <p className="text-lottery-gray-600">Phân tích số lâu chưa về và dự đoán xác suất xuất hiện cao nhất</p>
                <div className="w-20 h-1 bg-lottery-red-600 rounded-full mt-3 md:mx-0 mx-auto"></div>
            </div>

            <div className="py-8">
                <LotoRoiResult data={data} />
            </div>

            <div className="my-6">
                <TopicHub title="Công Cụ Soi Cầu Liên Quan" />
            </div>
        </div>
    );
}
