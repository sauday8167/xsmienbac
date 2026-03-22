'use client';

import { useState, useEffect } from 'react';
import StatisticsPanel from '@/components/statistics/StatisticsPanel';

export default function LotoByDayOfYearClient() {
    const today = new Date();
    const [day, setDay] = useState(today.getDate());
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/thong-ke/theo-ngay-trong-nam?day=${day}&month=${month}`);
                const result = await res.json();
                if (result.success) setData(result.data);
            } catch (error) {
                console.error('Error fetching statistics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [day, month]);

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-lottery-red-700 mb-4">Thống Kê Loto Theo Ngày Trong Năm</h1>
                <p className="text-gray-600">Phân tích tần suất các con số thường về vào ngày <strong>{day}/{month}</strong> qua các năm.</p>
                <div className="w-24 h-1 bg-lottery-red-600 mx-auto rounded-full mt-4"></div>
            </div>

            <div className="flex justify-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Ngày</label>
                    <select value={day} onChange={(e) => setDay(parseInt(e.target.value))} className="select select-bordered w-32 font-bold text-lg">
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Tháng</label>
                    <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="select select-bordered w-32 font-bold text-lg">
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>Tháng {m}</option>)}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><div className="loading loading-spinner loading-lg text-red-600"></div></div>
            ) : data && (
                <StatisticsPanel data={data} title={`Loto thường về vào ngày ${day}/${month} hàng năm`} />
            )}
        </div>
    );
}
