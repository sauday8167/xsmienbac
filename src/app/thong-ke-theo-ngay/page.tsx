'use client';

import { useState, useEffect } from 'react';

interface StatsData {
    number: string;
    count: number;
}

interface ApiResponse {
    dayOfMonth: number;
    daysAnalyzed: number;
    totalAppearances: number;
    stats: StatsData[];
    synthesis: {
        number: string;
        repCount: number;
        totalCount: number;
    }[];
    dateRange: {
        from: string;
        to: string;
    } | null;
}

export default function LotoByDayOfMonthPage() {
    const [activeDay, setActiveDay] = useState<number>(new Date().getDate()); // Default to today
    const [data, setData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [dateRangeFilter, setDateRangeFilter] = useState<number>(365); // Default 365 days

    useEffect(() => {
        fetchData(activeDay, dateRangeFilter);
    }, [activeDay, dateRangeFilter]);

    const fetchData = async (day: number, limit: number) => {
        try {
            setLoading(true);
            const res = await fetch(`/api/thong-ke/theo-ngay?day=${day}&daysLimit=${limit}`);
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

    const getBarColor = (index: number) => {
        if (index < 3) return 'bg-red-500'; // Top 3
        if (index < 10) return 'bg-orange-400';
        return 'bg-blue-400';
    };

    // Generate days 1-31
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-lottery-gray-800 mb-2">
                    Thống Kê Lô Tô Theo Ngày Trong Tháng
                </h1>
                <p className="text-lottery-gray-600">
                    Phân tích tần suất xuất hiện của các cặp số vào một ngày cố định hàng tháng
                </p>
                <div className="w-20 h-1 bg-lottery-red-600 mx-auto rounded-full mt-4"></div>
            </div>

            {/* Controls */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-sm font-bold text-gray-700 uppercase tracking-wider">Chọn ngày trong tháng:</div>
                    <select
                        value={dateRangeFilter}
                        onChange={(e) => setDateRangeFilter(Number(e.target.value))}
                        className="select select-bordered select-sm w-full md:w-auto"
                    >
                        <option value={90}>3 tháng gần nhất</option>
                        <option value={180}>6 tháng gần nhất</option>
                        <option value={365}>12 tháng gần nhất</option>
                        <option value={540}>18 tháng gần nhất</option>
                    </select>
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                    {days.map((day) => (
                        <button
                            key={day}
                            onClick={() => setActiveDay(day)}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all font-bold text-sm
                                ${activeDay === day
                                    ? 'bg-lottery-red-600 text-white shadow-lg scale-110'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {day}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="loading loading-spinner loading-lg text-lottery-red-600"></div>
                </div>
            ) : data ? (
                <div className="space-y-6">
                    {/* Summary Card */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="card bg-blue-50 border-blue-200">
                            <div className="text-sm text-gray-500">Ngày được chọn</div>
                            <div className="text-2xl font-bold text-blue-700">Ngày {data.dayOfMonth} hàng tháng</div>
                        </div>
                        <div className="card bg-green-50 border-green-200">
                            <div className="text-sm text-gray-500">Số kỳ quay tìm thấy</div>
                            <div className="text-2xl font-bold text-green-700">{data.daysAnalyzed} kỳ</div>
                        </div>
                        <div className="card bg-purple-50 border-purple-200">
                            <div className="text-sm text-gray-500">Phạm vi dữ liệu</div>
                            <div className="text-xs font-semibold text-purple-700">
                                {data.dateRange ? (
                                    `${new Date(data.dateRange.from).toLocaleDateString('vi-VN')} - ${new Date(data.dateRange.to).toLocaleDateString('vi-VN')}`
                                ) : 'Không có dữ liệu'}
                            </div>
                        </div>
                    </div>

                    {/* Top 10 Chart */}
                    <div className="card">
                        <h3 className="card-header flex items-center gap-2">
                            <span>🏆 Top 10 Số Xuất Hiện Nhiều Nhất Vào Ngày {data.dayOfMonth}</span>
                        </h3>
                        <div className="space-y-3 mt-2">
                            {data.stats.slice(0, 10).map((stat, idx) => (
                                <div key={stat.number} className="flex items-center gap-3">
                                    <div className="w-8 font-bold text-gray-500 text-center">#{idx + 1}</div>
                                    <div className="w-10 font-bold text-xl text-lottery-red-600 border border-lottery-red-200 rounded text-center bg-white">{stat.number}</div>
                                    <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${getBarColor(idx)} transition-all duration-500`}
                                            style={{ width: `${data.stats[0].count > 0 ? (stat.count / data.stats[0].count) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                    <div className="w-16 text-right font-semibold text-gray-700">{stat.count} lần</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* High Frequency */}
                        <div className="card">
                            <h3 className="card-header bg-green-600 text-white">Số Dễ Về Nhất</h3>
                            <div className="grid grid-cols-5 gap-2 text-center text-sm">
                                {data.stats.slice(0, 20).map((stat) => (
                                    <div key={stat.number} className="p-2 bg-green-50 rounded border border-green-100 hover:bg-green-100">
                                        <div className="font-bold text-lg text-green-700">{stat.number}</div>
                                        <div className="text-gray-500 text-xs">{stat.count} lần</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Low Frequency (Lô Khan) */}
                        <div className="card">
                            <h3 className="card-header bg-gray-600 text-white">Số Ít Về Nhất (Lô Khan)</h3>
                            <div className="grid grid-cols-5 gap-2 text-center text-sm">
                                {[...data.stats].reverse().slice(0, 20).map((stat) => (
                                    <div key={stat.number} className="p-2 bg-gray-50 rounded border border-gray-100 hover:bg-gray-100">
                                        <div className="font-bold text-lg text-gray-700">{stat.number}</div>
                                        <div className="text-gray-500 text-xs">{stat.count} lần</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Synthesis Section */}
                    <div className="bg-gradient-to-r from-lottery-red-600 to-lottery-red-800 rounded-xl shadow-lg p-6 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        </div>

                        <div className="relative z-10 text-center mb-6">
                            <h2 className="text-xl font-black uppercase tracking-widest mb-1 italic">
                                🌟 TỔNG HỢP SIÊU CẤP: TOP 10 SỐ HAY VỀ NHẤT 🌟
                            </h2>
                            <p className="text-xs opacity-80 font-medium">
                                (Dựa trên tổng hợp Top 10 từ các mốc 3, 6, 12 và 18 tháng)
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 relative z-10">
                            {data.synthesis.map((item, idx) => (
                                <div key={item.number} className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20 hover:bg-white/20 transition-all group">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] bg-amber-400 text-amber-900 font-black px-1.5 py-0.5 rounded-full">#{idx + 1}</span>
                                        <span className="text-[10px] opacity-70 font-bold uppercase">Rep: {item.repCount}/4</span>
                                    </div>
                                    <div className="text-3xl font-black mb-1 group-hover:scale-110 transition-transform">{item.number}</div>
                                    <div className="text-[10px] opacity-80 font-medium">Về {item.totalCount} lần (1 năm)</div>

                                    {/* Indicator bars */}
                                    <div className="flex gap-0.5 mt-2">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className={`h-1 flex-1 rounded-full ${i <= item.repCount ? 'bg-amber-400' : 'bg-white/10'}`}></div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 text-center text-[10px] opacity-70 italic border-t border-white/10 pt-4 max-w-2xl mx-auto">
                            "Thuật toán Siêu Cấp lọc ra những cặp số xuất hiện ổn định nhất trong nhiều khung thời gian khác nhau, giúp loại bỏ nhiễu và tìm ra quy luật thực sự của các con số vào ngày {data.dayOfMonth} hàng tháng."
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500">Không có dữ liệu</div>
            )}
        </div>
    );
}
