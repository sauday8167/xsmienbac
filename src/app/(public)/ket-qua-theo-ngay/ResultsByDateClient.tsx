'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { vi } from 'date-fns/locale';
import ResultTable from '@/components/ResultTable';

interface LotteryResult {
    draw_date: string;
    special_prize: string;
    prize_1: string;
    prize_2: string[];
    prize_3: string[];
    prize_4: string[];
    prize_5: string[];
    prize_6: string[];
    prize_7: string[];
}

export default function ResultsByDateClient() {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [resultsList, setResultsList] = useState<LotteryResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState('');
    const [hasMore, setHasMore] = useState(true);

    const fetchInitialData = async () => {
        setLoading(true);
        setError('');
        setResultsList([]);
        setHasMore(true);

        try {
            if (selectedDate) {
                // Fetch specific date
                const formattedDate = format(selectedDate, 'yyyy-MM-dd');
                const res = await fetch(`/api/results?date=${formattedDate}`);
                const data = await res.json();

                if (data.success) {
                    setResultsList([data.data]);
                    setHasMore(false); // Single result, no load more
                } else {
                    setError(data.error || 'Không có kết quả cho ngày này');
                    setResultsList([]);
                }
            } else {
                // Fetch latest 7 days
                const res = await fetch(`/api/results?limit=7&offset=0`);
                const data = await res.json();

                if (data.success) {
                    setResultsList(data.data);
                    if (data.data.length < 7) setHasMore(false);
                } else {
                    setError('Không thể tải dữ liệu');
                }
            }
        } catch (err) {
            setError('Lỗi kết nối');
        } finally {
            setLoading(false);
        }
    };

    const loadMore = async () => {
        if (loadingMore || !hasMore || selectedDate) return;
        setLoadingMore(true);
        try {
            const offset = resultsList.length;
            const res = await fetch(`/api/results?limit=7&offset=${offset}`);
            const data = await res.json();

            if (data.success && data.data.length > 0) {
                setResultsList(prev => [...prev, ...data.data]);
                if (data.data.length < 7) setHasMore(false);
            } else {
                setHasMore(false);
            }
        } catch (err) {
            console.error('Error loading more:', err);
        } finally {
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, [selectedDate]);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header placeholder is usually in the layouts but this component has its own */}
            <h1 className="text-3xl font-bold text-center text-lottery-red-700 mb-8">
                KẾT QUẢ XỔ SỐ MIỀN BẮC THEO NGÀY
            </h1>

            {/* Date Picker Section */}
            <div className="flex justify-center mb-8">
                <div className="flex items-center space-x-4 bg-white p-4 rounded-xl shadow-md">
                    <span className="font-semibold text-gray-700">Chọn ngày:</span>
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        dateFormat="dd/MM/yyyy"
                        locale={vi}
                        maxDate={new Date()}
                        placeholderText="Xem 7 ngày gần nhất"
                        isClearable
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lottery-red-500 font-medium text-lg text-center w-60"
                    />
                    <button
                        onClick={() => fetchInitialData()}
                        className="px-6 py-2 bg-lottery-red-600 text-white rounded-lg hover:bg-lottery-red-700 font-bold transition-colors"
                    >
                        Tìm Kiếm
                    </button>
                </div>
            </div>

            {/* Result Display */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lottery-red-600"></div>
                </div>
            ) : error ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500 text-lg">{error}</p>
                    <p className="text-gray-400 mt-2">Hãy thử chọn một ngày khác</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {resultsList.map((res) => (
                        <ResultTable key={res.draw_date} result={res} />
                    ))}

                    {!selectedDate && hasMore && resultsList.length > 0 && (
                        <div className="flex justify-center pt-4 pb-8">
                            <button
                                onClick={loadMore}
                                disabled={loadingMore}
                                className="px-8 py-3 bg-white border-2 border-lottery-red-600 text-lottery-red-600 rounded-full hover:bg-lottery-red-50 font-bold text-lg transition-colors shadow-sm flex items-center"
                            >
                                {loadingMore ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-lottery-red-600 mr-2"></div>
                                        Đang tải...
                                    </>
                                ) : (
                                    'Xem Thêm'
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
