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
    synthesis: { number: string; repCount: number; totalCount: number }[];
    dateRange: { from: string; to: string } | null;
}

const BASELINE = 27;

export default function ThongKeTheoNgayClient() {
    const [activeDay, setActiveDay] = useState<number>(new Date().getDate());
    const [data, setData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [dateRangeFilter, setDateRangeFilter] = useState<number>(540); // 18 months default
    const [showAll, setShowAll] = useState(false);

    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    useEffect(() => {
        fetchData(activeDay, dateRangeFilter);
    }, [activeDay, dateRangeFilter]);

    const fetchData = async (day: number, limit: number) => {
        try {
            setLoading(true);
            const res = await fetch(`/api/thong-ke/theo-ngay?day=${day}&daysLimit=${limit}`);
            const result = await res.json();
            if (result.success) setData(result.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPct = (count: number) =>
        data && data.daysAnalyzed > 0 ? (count / data.daysAnalyzed * 100) : 0;

    const getDeviation = (count: number) =>
        data && data.daysAnalyzed > 0 ? (count / data.daysAnalyzed * 100 - BASELINE) : 0;

    const getBarColor = (idx: number) => {
        if (idx < 3) return 'bg-red-500';
        if (idx < 10) return 'bg-orange-400';
        return 'bg-blue-400';
    };

    const expectedCount = data ? Math.round(BASELINE / 100 * data.daysAnalyzed) : 0;
    const maxCount = data?.stats[0]?.count || 1;
    const isSmallSample = data ? data.daysAnalyzed < 12 : false;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-lottery-gray-800 mb-2">Thống Kê Lô Tô Theo Ngày Trong Tháng</h1>
                <p className="text-lottery-gray-600">Phân tích tần suất xuất hiện của các cặp số vào một ngày cố định hàng tháng</p>
                <div className="w-20 h-1 bg-lottery-red-600 mx-auto rounded-full mt-4"></div>
            </div>

            {/* Controls */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-sm font-bold text-gray-700 uppercase tracking-wider">Chọn ngày trong tháng:</div>
                    <select value={dateRangeFilter} onChange={(e) => setDateRangeFilter(Number(e.target.value))} className="select select-bordered select-sm w-full md:w-auto">
                        <option value={90}>3 tháng (~3 kỳ)</option>
                        <option value={180}>6 tháng (~6 kỳ)</option>
                        <option value={365}>12 tháng (~12 kỳ)</option>
                        <option value={540}>18 tháng (~18 kỳ)</option>
                    </select>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                    {days.map((day) => (
                        <button
                            key={day}
                            onClick={() => setActiveDay(day)}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all font-bold text-sm ${
                                activeDay === day ? 'bg-lottery-red-600 text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {day}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><div className="loading loading-spinner loading-lg text-lottery-red-600"></div></div>
            ) : data ? (
                <div className="space-y-6">
                    {/* Summary */}
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
                            <div className="text-sm text-gray-500">Kỳ vọng mỗi số (~27%)</div>
                            <div className="text-2xl font-bold text-purple-700">~{expectedCount} lần</div>
                        </div>
                    </div>

                    {/* Small sample warning */}
                    {isSmallSample && (
                        <div className="bg-yellow-50 border border-yellow-300 rounded-lg px-4 py-3 text-sm text-yellow-800 flex items-start gap-2">
                            <span className="text-lg">⚠️</span>
                            <div>
                                <strong>Mẫu nhỏ ({data.daysAnalyzed} kỳ):</strong> Ngày {data.dayOfMonth} chỉ xuất hiện ~1 lần/tháng. Với ít kỳ quay, kết quả có sai số lớn và chưa đủ ý nghĩa thống kê. Nên chọn khoảng thời gian dài hơn (18 tháng) để có kết quả tin cậy hơn.
                            </div>
                        </div>
                    )}

                    {/* Baseline notice */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-xs text-blue-700 flex items-center gap-2">
                        <span>ℹ️</span>
                        <span>Baseline ngẫu nhiên XSMB ≈ <strong>27%</strong> (kỳ vọng ~{expectedCount}/{data.daysAnalyzed} kỳ). Cột xanh trong biểu đồ = đường baseline.</span>
                    </div>

                    {/* Top 10 Chart */}
                    <div className="card">
                        <h3 className="card-header flex items-center gap-2">
                            🏆 Top 10 Số Xuất Hiện Nhiều Nhất Vào Ngày {data.dayOfMonth} Hàng Tháng
                        </h3>
                        <div className="space-y-3 mt-2">
                            {data.stats.slice(0, 10).map((stat, idx) => {
                                const pct = getPct(stat.count);
                                const dev = getDeviation(stat.count);
                                return (
                                    <div key={stat.number} className="flex items-center gap-3">
                                        <div className="w-7 font-bold text-gray-500 text-center text-sm">#{idx + 1}</div>
                                        <div className="w-10 font-bold text-xl text-lottery-red-600 border border-lottery-red-200 rounded text-center bg-white">{stat.number}</div>
                                        <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden relative">
                                            <div className="absolute top-0 bottom-0 w-0.5 bg-blue-400 z-10" style={{ left: `${Math.min((expectedCount / maxCount) * 100, 100)}%` }}></div>
                                            <div className={`h-full ${getBarColor(idx)} transition-all duration-500`} style={{ width: `${data.stats[0].count > 0 ? (stat.count / maxCount) * 100 : 0}%` }}></div>
                                        </div>
                                        <div className="w-12 text-right font-semibold text-gray-700 text-sm">{stat.count} lần</div>
                                        <div className="w-16 text-right text-xs">
                                            <span className="font-bold text-gray-700">{pct.toFixed(1)}%</span>
                                            <span className={`ml-1 font-semibold ${dev >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                {dev >= 0 ? '+' : ''}{dev.toFixed(0)}%
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-xs text-gray-400 mt-3">Đường xanh = baseline ngẫu nhiên 27%. Cột vượt qua đường xanh = cao hơn kỳ vọng.</p>
                    </div>

                    {/* High/Low grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="card">
                            <h3 className="card-header bg-green-600 text-white">Số Dễ Về Nhất (Top 20)</h3>
                            <div className="grid grid-cols-5 gap-2 text-center text-sm">
                                {data.stats.slice(0, 20).map((stat) => {
                                    const dev = getDeviation(stat.count);
                                    return (
                                        <div key={stat.number} className="p-2 bg-green-50 rounded border border-green-100 hover:bg-green-100">
                                            <div className="font-bold text-lg text-green-700">{stat.number}</div>
                                            <div className="text-gray-500 text-[10px]">{stat.count} lần</div>
                                            <div className={`text-[10px] font-bold ${dev >= 0 ? 'text-green-600' : 'text-gray-400'}`}>{dev >= 0 ? '+' : ''}{dev.toFixed(0)}%</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="card">
                            <h3 className="card-header bg-gray-600 text-white">Số Ít Về Nhất — Lô Khan (Top 20)</h3>
                            <div className="grid grid-cols-5 gap-2 text-center text-sm">
                                {[...data.stats].reverse().slice(0, 20).map((stat) => {
                                    const dev = getDeviation(stat.count);
                                    return (
                                        <div key={stat.number} className="p-2 bg-gray-50 rounded border border-gray-100 hover:bg-gray-100">
                                            <div className="font-bold text-lg text-gray-700">{stat.number}</div>
                                            <div className="text-gray-500 text-[10px]">{stat.count} lần</div>
                                            <div className={`text-[10px] font-bold ${dev < 0 ? 'text-red-500' : 'text-gray-400'}`}>{dev >= 0 ? '+' : ''}{dev.toFixed(0)}%</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Full table */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-gray-800">Bảng Đầy Đủ 100 Số</h3>
                            <button onClick={() => setShowAll(!showAll)} className="text-sm text-blue-600 hover:underline">
                                {showAll ? 'Thu gọn ▲' : 'Xem tất cả ▼'}
                            </button>
                        </div>
                        {showAll && (
                            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                                {data.stats.map((stat) => {
                                    const dev = getDeviation(stat.count);
                                    const color = dev >= 5 ? 'bg-green-100 border-green-300' : dev <= -5 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200';
                                    return (
                                        <div key={stat.number} className={`p-1.5 rounded border text-center ${color}`}>
                                            <div className="font-bold text-sm text-gray-800">{stat.number}</div>
                                            <div className="text-[10px] text-gray-500">{stat.count}</div>
                                            <div className={`text-[9px] font-bold ${dev >= 0 ? 'text-green-600' : 'text-red-500'}`}>{dev >= 0 ? '+' : ''}{dev.toFixed(0)}%</div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Synthesis */}
                    <div className="bg-gradient-to-r from-lottery-red-600 to-lottery-red-800 rounded-xl shadow-lg p-6 text-white overflow-hidden relative">
                        <div className="relative z-10 text-center mb-6">
                            <h2 className="text-xl font-black uppercase tracking-widest mb-1">
                                🌟 TỔNG HỢP ĐA CHU KỲ — TOP 10 SỐ ỔN ĐỊNH NHẤT
                            </h2>
                            <p className="text-xs opacity-80">
                                Số nào nằm trong Top 10 nhất quán qua nhiều khung thời gian (3 / 6 / 12 / 18 tháng) — ít bị ảnh hưởng bởi nhiễu ngắn hạn
                            </p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 relative z-10">
                            {data.synthesis.map((item, idx) => (
                                <div key={item.number} className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20 hover:bg-white/20 transition-all group">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] bg-amber-400 text-amber-900 font-black px-1.5 py-0.5 rounded-full">#{idx + 1}</span>
                                        <span className="text-[10px] opacity-70 font-bold">{item.repCount}/4 khung</span>
                                    </div>
                                    <div className="text-3xl font-black mb-1 group-hover:scale-110 transition-transform">{item.number}</div>
                                    <div className="text-[10px] opacity-80">Về {item.totalCount} lần / 18 tháng</div>
                                    <div className="flex gap-0.5 mt-2">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className={`h-1 flex-1 rounded-full ${i <= item.repCount ? 'bg-amber-400' : 'bg-white/10'}`}></div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 text-center text-[10px] opacity-70 italic border-t border-white/10 pt-4 max-w-2xl mx-auto">
                            Phương pháp: Số xuất hiện trong Top 10 của càng nhiều khung thời gian (điểm /4) thì càng ổn định — lọc được các số "nổi tình cờ" trong ngắn hạn. Lưu ý: mỗi ngày trong tháng chỉ có ~1 kỳ/tháng nên tổng mẫu còn hạn chế.
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500">Không có dữ liệu</div>
            )}

            <div className="mt-10 p-6 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-700 leading-relaxed text-justify shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Giới thiệu về Thống Kê Theo Ngày</h2>
                <p>
                    Lịch sử luôn có xu hướng lặp lại, và xổ số cũng không ngoại lệ. Công cụ <strong>Thống Kê Theo Ngày</strong> cho phép bạn xem kết quả xổ số của chính ngày này trong các tháng trước.
                    Ví dụ: Ngày 15 hàng tháng trong 18 tháng qua thường về những con số nào? Dữ liệu thống kê theo ngày tháng là nguồn tư liệu quý giá để soi cầu ngày (cầu nhật).
                </p>
            </div>
        </div>
    );
}
