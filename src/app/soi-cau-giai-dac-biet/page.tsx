'use client';

import { useEffect, useState } from 'react';
import { GdbAnalysisResponse, GdbAnalysisData } from '@/types/gdb-types';
import GdbAnalysisResult from './components/GdbAnalysisResult';

export default function GdbAnalysisPage() {
    const [data, setData] = useState<GdbAnalysisData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');

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
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Date Selection Control */}
                <div className="bg-white rounded-2xl shadow-sm p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-100 p-3 rounded-xl text-2xl">🏛️</div>
                        <div>
                            <h2 className="font-bold text-slate-800 text-lg">Soi Cầu Giải Đặc Biệt</h2>
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
    );
}
