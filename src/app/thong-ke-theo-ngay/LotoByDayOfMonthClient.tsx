'use client';

import { useState, useEffect } from 'react';
import StatisticsPanel from '@/components/stats-display/StatisticsPanel';

export default function LotoByDayOfMonthClient() {
    const [day, setDay] = useState(new Date().getDate());
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/thong-ke/theo-ngay?day=${day}`);
                const result = await res.json();
                if (result.success) setData(result.data);
            } catch (error) {
                console.error('Error fetching statistcs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [day]);

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-lottery-red-700 mb-4">Thống Kê Loto Theo Ngày Trong Tháng</h1>
                <p className="text-gray-600">Phân tích tần suất các con số thường về vào ngày <strong>{day}</strong> hàng tháng.</p>
                <div className="w-24 h-1 bg-lottery-red-600 mx-auto rounded-full mt-4"></div>
            </div>

            <div className="flex justify-center gap-4 flex-wrap">
                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                    <button
                        key={d}
                        onClick={() => setDay(d)}
                        className={`w-10 h-10 rounded-full font-bold transition-all ${day === d ? 'bg-red-600 text-white shadow-lg transform scale-110' : 'bg-white text-gray-700 hover:bg-gray-100 border'}`}
                    >
                        {d}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><div className="loading loading-spinner loading-lg text-red-600"></div></div>
            ) : data && (
                <StatisticsPanel data={data} title={`Kết quả thống kê cho ngày ${day} hàng tháng`} />
            )}
        </div>
    );
}
