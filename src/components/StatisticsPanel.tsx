'use client';

import { useEffect, useState } from 'react';

interface LotoStat {
    number: string;
    count: number;
    daysSince?: number;
}

interface StatsData {
    loGan: LotoStat[];
    frequent: LotoStat[];
}

export default function StatisticsPanel() {
    const [data, setData] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/stats')
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    setData(res.data);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-center p-4">Đang tải thống kê...</div>;
    if (!data) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
            {/* Table 1: Lo Gan */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <div className="bg-lottery-red-600 text-white p-3 text-center font-bold text-lg uppercase">
                    Thống Kê Loto Gan (10 số lâu ra nhất)
                </div>
                <div className="p-4">
                    <table className="w-full text-center">
                        <thead className="bg-gray-100 text-gray-600 font-semibold text-sm">
                            <tr>
                                <th className="py-2">Số</th>
                                <th className="py-2">Số kỳ chưa về</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.loGan.map((item, idx) => (
                                <tr key={item.number} className="hover:bg-red-50">
                                    <td className="py-2 font-bold text-lg text-lottery-red-600">
                                        {item.number}
                                    </td>
                                    <td className="py-2 text-gray-700">
                                        {item.daysSince} kỳ
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Table 2: Frequent Numbers */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <div className="bg-lottery-gold-600 text-white p-3 text-center font-bold text-lg uppercase">
                    Loto về nhiều (10 kỳ gần nhất)
                </div>
                <div className="p-4">
                    <table className="w-full text-center">
                        <thead className="bg-gray-100 text-gray-600 font-semibold text-sm">
                            <tr>
                                <th className="py-2">Số</th>
                                <th className="py-2">Số lần xuất hiện</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.frequent.map((item, idx) => (
                                <tr key={item.number} className="hover:bg-yellow-50">
                                    <td className="py-2 font-bold text-lg text-lottery-gold-700">
                                        {item.number}
                                    </td>
                                    <td className="py-2 text-gray-700">
                                        {item.count} lần
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
