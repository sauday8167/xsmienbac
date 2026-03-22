'use client';

import { useState, useEffect } from 'react';
import StatisticsPanel from '@/components/statistics/StatisticsPanel';

const weekdays = [
    { label: 'Chủ Nhật', value: 0 },
    { label: 'Thứ Hai', value: 1 },
    { label: 'Thứ Ba', value: 2 },
    { label: 'Thứ Tư', value: 3 },
    { label: 'Thứ Năm', value: 4 },
    { label: 'Thứ Sáu', value: 5 },
    { label: 'Thứ Bảy', value: 6 },
];

export default function LotoByWeekdayClient() {
    const [weekday, setWeekday] = useState(new Date().getDay());
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/thong-ke/theo-thu?weekday=${weekday}`);
                const result = await res.json();
                if (result.success) setData(result.data);
            } catch (error) {
                console.error('Error fetching statistics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [weekday]);

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-lottery-red-700 mb-4">Thống Kê Loto Theo Thứ Trong Tuần</h1>
                <p className="text-gray-600">Phân tích tần suất các con số thường về vào các ngày <strong>{weekdays.find(w => w.value === weekday)?.label}</strong> hàng tuần.</p>
                <div className="w-24 h-1 bg-lottery-red-600 mx-auto rounded-full mt-4"></div>
            </div>

            <div className="flex justify-center flex-wrap gap-2">
                {weekdays.map(w => (
                    <button
                        key={w.value}
                        onClick={() => setWeekday(w.value)}
                        className={`px-6 py-2 rounded-full font-bold transition-all ${weekday === w.value ? 'bg-red-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-100 border'}`}
                    >
                        {w.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><div className="loading loading-spinner loading-lg text-red-600"></div></div>
            ) : data && (
                <StatisticsPanel data={data} title={`Thống kê kết quả về vào ${weekdays.find(w => w.value === weekday)?.label}`} />
            )}
        </div>
    );
}
