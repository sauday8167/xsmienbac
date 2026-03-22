'use client';

import { useEffect, useState } from 'react';
import { GdbAnalysisData } from '@/types/gdb-types';
import GdbAnalysisResult from './components/GdbAnalysisResult';
import JsonLd from '@/components/seo/JsonLd';
import { generateManualArticleSchema, generateBreadcrumbSchema } from '@/lib/schema-generator';
import TopicHub from '@/components/TopicHub';

export default function GdbAnalysisClient() {
    const [data, setData] = useState<GdbAnalysisData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');

    const breadcrumbs = [
        { name: 'Trang chủ', item: '/' },
        { name: 'Phân Tích Giải Đặc Biệt', item: '/soi-cau-giai-dac-biet' }
    ];

    const schemaArgs = {
        title: 'Phân Tích Giải Đặc Biệt Xổ Số Miền Bắc - Thống Kê Số Đầu, Đuôi, Tổng',
        description: 'Giải Đặc Biệt Xổ Số Miền Bắc: Thống kê và phân tích chuyên sâu số đầu, số đuôi, tổng giải dựa trên dữ liệu lịch sử chính xác.'
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const url = selectedDate
                    ? `/api/soi-cau-gdb?date=${selectedDate}`
                    : '/api/soi-cau-gdb';
                const response = await fetch(url);
                const result = await response.json();

                if (result.success) {
                    setData(result.data);
                    setError(null);
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
    }, [selectedDate]);

    return (
        <div className="space-y-6">
            <JsonLd data={generateManualArticleSchema(schemaArgs.title, schemaArgs.description, '/soi-cau-giai-dac-biet')} />
            <JsonLd data={generateBreadcrumbSchema(breadcrumbs)} />

            <div className="text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-lottery-gray-800 mb-2">
                    Phân Tích Giải Đặc Biệt Xổ Số Miền Bắc
                </h1>
                <p className="text-lottery-gray-600">Thống kê và phân tích thuật toán dựa trên dữ liệu Giải Đặc Biệt lịch sử</p>
                <div className="w-20 h-1 bg-lottery-red-600 rounded-full mt-3 md:mx-0 mx-auto"></div>
            </div>

            <div className="min-h-[500px] bg-gray-50 py-6 px-4 rounded-2xl">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-sm p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-100">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🏛️</span>
                            <p className="font-bold text-slate-800">Chọn ngày phân tích</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="date"
                                value={selectedDate || (data?.date || '')}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-medium text-slate-700 outline-none"
                            />
                        </div>
                    </div>

                    {loading && !data ? (
                        <div className="flex flex-col justify-center items-center py-20">
                            <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mb-4"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center p-12 bg-white rounded-2xl shadow">
                            <p className="text-red-500 font-bold">{error}</p>
                            <button onClick={() => setSelectedDate('')} className="mt-4 text-sm text-blue-600 hover:underline">Thử lại với ngày mới nhất</button>
                        </div>
                    ) : (
                        data && (
                            <div className={loading ? 'opacity-40' : ''}>
                                <GdbAnalysisResult data={data} />
                            </div>
                        )
                    )}
                </div>
            </div>

            <div className="my-6">
                <TopicHub title="Công Cụ Phân Tích Liên Quan" />
            </div>
        </div>
    );
}
