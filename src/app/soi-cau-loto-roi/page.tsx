'use client';

import { useEffect, useState } from 'react';
import { LotoRoiResponse } from '@/types/loto-roi-types';
import LotoRoiResult from './components/LotoRoiResult';

export default function LotoRoiPage() {
    const [data, setData] = useState<LotoRoiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
        <div className="min-h-screen bg-lottery-pattern bg-fixed font-sans">
            <div className="max-w-5xl mx-auto px-4 py-8">
                <LotoRoiResult data={data} />
            </div>
        </div>
    );
}
