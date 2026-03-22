'use client';

import { useState, useEffect } from 'react';
import { Loto34CangData, LotoStat } from '@/types/loto-3-4-cang';

export default function Loto34CangClient() {
    const [data, setData] = useState<Loto34CangData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDays, setSelectedDays] = useState(1000);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/thong-ke/loto-3-4-cang?days=${selectedDays}`);
            const result = await res.json();
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedDays]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lottery-red-600"></div>
            </div>
        );
    }

    if (!data) return <div className="text-center p-8">Không có dữ liệu</div>;

    const StatCard = ({ stat, type }: { stat: LotoStat, type: '3' | '4' }) => (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-2">
                <span className={`text-xl font-bold ${type === '3' ? 'text-lottery-red-600' : 'text-purple-600'}`}>
                    {stat.number}
                </span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-500">
                    {stat.appearances} lần
                </span>
            </div>
            <div className="space-y-1 text-sm">
                <div className="flex justify-between text-gray-600">
                    <span>Chu kỳ TB:</span>
                    <span className="font-semibold">{stat.averageCycle} ngày</span>
                </div>
                <div className="flex justify-between text-gray-600">
                    <span>Gan hiện tại:</span>
                    <span className={`font-semibold ${stat.isDue ? 'text-red-500 animate-pulse' : ''}`}>
                        {stat.daysSinceLastAppearance} ngày
                    </span>
                </div>
                <div className="flex justify-between text-gray-600">
                    <span>Gan cực đại:</span>
                    <span className="font-semibold">{stat.maxGan} ngày</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-gradient-to-r from-lottery-red-600 to-lottery-red-800 p-8 rounded-2xl text-white shadow-lg">
                <h1 className="text-3xl font-bold mb-3 flex items-center gap-3">
                    <span className="text-4xl">📊</span>
                    Thống Kê Loto 3 Càng & 4 Càng
                </h1>
                <p className="text-white/80 max-w-2xl">
                    Phân tích chuyên sâu các con số 3 càng (3 số cuối) và 4 càng (4 số cuối) về nhiều nhất,
                    tính toán chu kỳ và dự báo các con số có khả năng xuất hiện trong tương lai.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20">
                        Từ ngày: <span className="font-bold">{new Date(data.overview.fromDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20">
                        Đến ngày: <span className="font-bold">{new Date(data.overview.toDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <select
                        value={selectedDays}
                        onChange={(e) => setSelectedDays(Number(e.target.value))}
                        className="bg-white text-lottery-gray-800 px-4 py-2 rounded-lg outline-none font-semibold border-none ring-2 ring-transparent focus:ring-white/50 transition-all"
                    >
                        <option value={100}>100 ngày gần nhất</option>
                        <option value={500}>500 ngày gần nhất</option>
                        <option value={1000}>1000 ngày gần nhất</option>
                        <option value={2000}>2000 ngày gần nhất</option>
                    </select>
                </div>
            </div>

            {/* Definitions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card bg-blue-50 border-l-4 border-blue-500 p-6">
                    <h3 className="font-bold text-blue-900 text-lg mb-2">🔢 Loto 3 Càng là gì?</h3>
                    <p className="text-blue-800 text-sm leading-relaxed">
                        Loto 3 càng là 3 số cuối cùng của mỗi giải trong bảng kết quả xổ số (trừ giải 7 chỉ có 2 chữ số).
                        Ví dụ: Giải đặc biệt về 84522 thì loto 3 càng là <span className="font-bold underline">522</span>.
                    </p>
                </div>
                <div className="card bg-purple-50 border-l-4 border-purple-500 p-6">
                    <h3 className="font-bold text-purple-900 text-lg mb-2">🎱 Loto 4 Càng là gì?</h3>
                    <p className="text-purple-800 text-sm leading-relaxed">
                        Loto 4 càng là 4 số cuối cùng của mỗi giải trong bảng kết quả xổ số (trừ giải 6 và giải 7).
                        Ví dụ: Giải đặc biệt về 84522 thì loto 4 càng là <span className="font-bold underline">4522</span>.
                    </p>
                </div>
            </div>

            {/* Main Stats */}
            <div className="space-y-12">
                {/* Loto 3 Cang */}
                <section>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-10 w-2 bg-lottery-red-600 rounded-full"></div>
                        <h2 className="text-2xl font-bold text-lottery-gray-800">Thống Kê Loto 3 Càng</h2>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-lottery-gray-700">🔥 Top 10 về nhiều nhất</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {data.loto3Cang.top10.map(s => <StatCard key={s.number} stat={s} type="3" />)}
                        </div>

                        {data.loto3Cang.due.length > 0 && (
                            <>
                                <h3 className="text-lg font-semibold text-lottery-red-600 flex items-center gap-2 mt-8">
                                    🔔 Loto 3 Càng Sắp Ra (Khả năng về cao)
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    {data.loto3Cang.due.map(s => <StatCard key={s.number} stat={s} type="3" />)}
                                </div>
                            </>
                        )}
                    </div>
                </section>

                <hr className="border-gray-200" />

                {/* Loto 4 Cang */}
                <section>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="h-10 w-2 bg-purple-600 rounded-full"></div>
                        <h2 className="text-2xl font-bold text-lottery-gray-800">Thống Kê Loto 4 Càng</h2>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-lottery-gray-700">💎 Top 10 về nhiều nhất</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {data.loto4Cang.top10.map(s => <StatCard key={s.number} stat={s} type="4" />)}
                        </div>

                        {data.loto4Cang.due.length > 0 && (
                            <>
                                <h3 className="text-lg font-semibold text-purple-600 flex items-center gap-2 mt-8">
                                    🔔 Loto 4 Càng Sắp Ra (Khả năng về cao)
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    {data.loto4Cang.due.map(s => <StatCard key={s.number} stat={s} type="4" />)}
                                </div>
                            </>
                        )}
                    </div>
                </section>
            </div>

            <div className="mt-12 bg-gray-100 p-6 rounded-xl text-gray-600 text-sm">
                <p className="font-bold mb-2">Lưu ý:</p>
                <p>
                    Dữ liệu "Sắp ra" được tính toán dựa trên thuật toán gan cực đại và chu kỳ trung bình của mỗi con số.
                    Thông tin chỉ mang tính chất tham khảo cho những người chơi đam mê thống kê.
                </p>
            </div>
        </div>
    );
}
