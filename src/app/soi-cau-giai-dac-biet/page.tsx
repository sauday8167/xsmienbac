'use client';

import { useEffect, useState } from 'react';
import { GdbAnalysisData } from '@/types/gdb-types';
import GdbAnalysisResult from './components/GdbAnalysisResult';
import JsonLd from '@/components/seo/JsonLd';
import { generateManualArticleSchema, generateBreadcrumbSchema } from '@/lib/schema-generator';
import TopicHub from '@/components/TopicHub';

export default function GdbAnalysisPage() {
    const [data, setData] = useState<GdbAnalysisData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');

    const breadcrumbs = [
        { name: 'Trang chủ', item: '/' },
        { name: 'Phân Tích Giải Đặc Biệt', item: '/soi-cau-giai-dac-biet' }
    ];

    const schemaArgs = {
        title: 'Phân Tích Giải Đặc Biệt XSMB - Thống Kê Số Đầu, Đuôi, Tổng',
        description: 'Thống kê và phân tích chuyên sâu Giải Đặc Biệt XSMB. Dự đoán số đầu, số đuôi, tổng giải ĐB dựa trên dữ liệu lịch sử.'
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

            {/* Page Header with H1 */}
            <div className="text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-lottery-gray-800 mb-2">
                    Phân Tích Giải Đặc Biệt XSMB
                </h1>
                <p className="text-lottery-gray-600">Thống kê và phân tích thuật toán dựa trên dữ liệu Giải Đặc Biệt lịch sử</p>
                <div className="w-20 h-1 bg-lottery-red-600 rounded-full mt-3 md:mx-0 mx-auto"></div>
            </div>

            <div className="min-h-screen bg-gray-50 py-6 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Date Selection Control */}
                    <div className="bg-white rounded-2xl shadow-sm p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="bg-slate-100 p-3 rounded-xl text-2xl">🏛️</div>
                            <div>
                                <p className="font-bold text-slate-800 text-lg">Chọn ngày phân tích</p>
                                <p className="text-sm text-slate-500">Phân tích thuật toán Giải Đặc Biệt</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="date"
                                value={selectedDate || (data?.date || '')}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-medium text-slate-700 focus:ring-2 focus:ring-slate-500 outline-none"
                            />
                            {selectedDate && (
                                <button
                                    onClick={() => setSelectedDate('')}
                                    className="text-slate-400 hover:text-slate-600 p-2"
                                    title="Quay lại mới nhất"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    {loading && !data ? (
                        <div className="flex flex-col justify-center items-center py-20">
                            <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mb-4"></div>
                            <p className="text-slate-500 font-medium">Đang giải mã dãy số...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-white p-12 rounded-2xl shadow-lg text-center border-t-8 border-red-500">
                            <div className="text-6xl mb-6">🚫</div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Không thể truy xuất dữ liệu</h2>
                            <p className="text-slate-500 mb-8 max-w-sm mx-auto">{error}</p>
                            <button
                                onClick={() => setSelectedDate('')}
                                className="bg-slate-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-900 transition-all shadow-lg"
                            >
                                Thử lại với ngày mới nhất
                            </button>
                        </div>
                    ) : (
                        data && (
                            <div className={loading ? 'opacity-40 pointer-events-none' : ''}>
                                <GdbAnalysisResult data={data} />
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Topic Hub */}
            <div className="my-6">
                <TopicHub title="Công Cụ Phân Tích Liên Quan" />
            </div>

            {/* SEO Content Block */}
            <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-700 leading-relaxed text-justify shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Phân Tích Giải Đặc Biệt XSMB Là Gì?</h2>
                <p className="mb-3">
                    <strong>Giải Đặc Biệt</strong> là giải thưởng cao nhất trong mỗi kỳ quay xổ số miền Bắc (XSMB), gồm 5 chữ số. Đây là giải được người chơi quan tâm nhiều nhất bởi giá trị giải thưởng cao và tầm quan trọng trong việc tham chiếu cho dàn đề và cầu lô.
                </p>
                <p className="mb-3">
                    Hệ thống <strong>Phân Tích Giải Đặc Biệt</strong> của chúng tôi cung cấp nhiều chiều phân tích chuyên sâu:
                </p>
                <ul className="list-disc pl-5 mb-3 space-y-1">
                    <li><strong>Số đầu (Đầu đặc biệt):</strong> Thống kê chữ số đầu tiên của giải ĐB theo tần suất xuất hiện</li>
                    <li><strong>Số đuôi (Đuôi đặc biệt):</strong> Phân tích 2 số cuối — con số được dùng trong đánh lô</li>
                    <li><strong>Tổng 2 số cuối:</strong> Tổng hai chữ số cuối giải ĐB, dùng để tham chiếu loto tổng</li>
                    <li><strong>Chu kỳ lặp lại:</strong> Bao lâu một số đầu/đuôi xuất hiện lại một lần</li>
                </ul>
                <p>
                    Thông qua việc theo dõi <strong>quy luật giải đặc biệt XSMB theo lịch sử</strong>, người chơi có thể rút ra những nhận định có cơ sở khoa học hơn.
                    Mọi thông tin chỉ mang tính tham khảo thống kê, không đảm bảo kết quả trúng thưởng.
                </p>
            </div>
        </div>
    );
}
