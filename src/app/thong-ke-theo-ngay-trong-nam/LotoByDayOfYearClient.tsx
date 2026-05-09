'use client';

import { useState, useEffect } from 'react';

interface StatsData { number: string; count: number; }
interface SynthesisItem { number: string; repCount: number; totalCount: number; }

interface ApiResponse {
    day: number;
    month: number;
    yearsAnalyzed: number;
    totalAppearances: number;
    stats: StatsData[];
    synthesis: SynthesisItem[];
    availableYears: number[];
}

const BASELINE = 27;
const MONTHS_VI = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

export default function LotoByDayOfYearClient() {
    const today = new Date();
    const [day, setDay] = useState(today.getDate());
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [data, setData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        fetchData();
    }, [day, month]);

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

    const getPct = (count: number) =>
        data && data.yearsAnalyzed > 0 ? (count / data.yearsAnalyzed * 100) : 0;

    const getDeviation = (count: number) =>
        data && data.yearsAnalyzed > 0 ? (count / data.yearsAnalyzed * 100 - BASELINE) : 0;

    const getBarColor = (idx: number) => {
        if (idx < 3) return 'bg-red-500';
        if (idx < 10) return 'bg-orange-400';
        return 'bg-blue-400';
    };

    const nDraws = data?.yearsAnalyzed || 0;
    const expectedCount = Math.round(BASELINE / 100 * nDraws);
    const maxCount = data?.stats[0]?.count || 1;

    // Confidence level based on sample size
    const getConfidence = (n: number) => {
        if (n < 5) return { label: '❌ Không đủ mẫu', cls: 'bg-red-50 border-red-300 text-red-800' };
        if (n < 10) return { label: '⚠️ Mẫu rất nhỏ', cls: 'bg-orange-50 border-orange-300 text-orange-800' };
        if (n < 20) return { label: '⚡ Mẫu nhỏ', cls: 'bg-yellow-50 border-yellow-300 text-yellow-800' };
        return { label: '✅ Đủ tin cậy', cls: 'bg-green-50 border-green-300 text-green-800' };
    };
    const confidence = getConfidence(nDraws);

    return (
        <div className="container mx-auto px-4 py-8 space-y-6 max-w-6xl">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-lottery-red-700 mb-2">Thống Kê Loto Theo Ngày Trong Năm</h1>
                <p className="text-gray-600">Phân tích tần suất các con số thường về vào ngày <strong>{day}/{month}</strong> qua các năm.</p>
                <div className="w-24 h-1 bg-lottery-red-600 mx-auto rounded-full mt-4"></div>
            </div>

            {/* Date picker */}
            <div className="flex justify-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Ngày</label>
                    <select value={day} onChange={(e) => setDay(parseInt(e.target.value))} className="select select-bordered w-28 font-bold text-lg">
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Tháng</label>
                    <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="select select-bordered w-36 font-bold text-lg">
                        {MONTHS_VI.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><div className="loading loading-spinner loading-lg text-red-600"></div></div>
            ) : data ? (
                <div className="space-y-6">
                    {/* Summary cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="card bg-blue-50 border-blue-200">
                            <div className="text-sm text-gray-500">Ngày tra cứu</div>
                            <div className="text-2xl font-bold text-blue-700">{day}/{month}</div>
                        </div>
                        <div className="card bg-green-50 border-green-200">
                            <div className="text-sm text-gray-500">Số năm có dữ liệu</div>
                            <div className="text-2xl font-bold text-green-700">{nDraws} năm</div>
                            <div className="text-xs text-green-600">= {nDraws} kỳ quay</div>
                        </div>
                        <div className="card bg-purple-50 border-purple-200">
                            <div className="text-sm text-gray-500">Kỳ vọng / số (~27%)</div>
                            <div className="text-2xl font-bold text-purple-700">~{expectedCount} lần</div>
                        </div>
                        <div className={`card border ${confidence.cls}`}>
                            <div className="text-sm font-semibold">Độ tin cậy</div>
                            <div className="text-base font-bold mt-1">{confidence.label}</div>
                        </div>
                    </div>

                    {/* Critical sample size warning */}
                    {nDraws < 10 && (
                        <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-4 text-orange-800">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">⚠️</span>
                                <div>
                                    <div className="font-bold text-base mb-1">Cảnh báo mẫu nhỏ — Kết quả chưa đủ ý nghĩa thống kê</div>
                                    <p className="text-sm">
                                        Ngày <strong>{day}/{month}</strong> chỉ xảy ra <strong>1 lần mỗi năm</strong>. Với {nDraws} năm dữ liệu ({nDraws} kỳ quay),
                                        mỗi số trong 100 số chỉ kỳ vọng về ~{(BASELINE / 100 * nDraws).toFixed(1)} lần. Sự chênh lệch giữa các số gần như
                                        hoàn toàn là <strong>ngẫu nhiên</strong>. Cần ≥20 năm dữ liệu để có ý nghĩa thống kê sơ bộ.
                                    </p>
                                    {data.availableYears.length > 0 && (
                                        <p className="text-xs mt-2 opacity-80">
                                            Năm có dữ liệu: {data.availableYears.join(', ')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {nDraws >= 10 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-xs text-blue-700 flex items-center gap-2">
                            <span>ℹ️</span>
                            <span>
                                Baseline ngẫu nhiên XSMB ≈ <strong>27%</strong> (kỳ vọng ~{expectedCount}/{nDraws} kỳ).
                                Lưu ý: ngày {day}/{month} chỉ có <strong>{nDraws} kỳ quay</strong> (1/năm) — kết quả mang tính tham khảo.
                            </span>
                        </div>
                    )}

                    {nDraws === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <div className="text-4xl mb-3">🔍</div>
                            <p>Không có dữ liệu cho ngày {day}/{month}</p>
                        </div>
                    ) : (
                        <>
                            {/* Top 10 Chart */}
                            <div className="card">
                                <h3 className="card-header flex items-center gap-2">
                                    🏆 Top 10 Số Xuất Hiện Nhiều Nhất Vào Ngày {day}/{month}
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
                                                    <div className={`h-full ${getBarColor(idx)} transition-all duration-500`} style={{ width: `${(stat.count / maxCount) * 100}%` }}></div>
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
                            {data.synthesis.length > 0 && (
                                <div className="bg-gradient-to-r from-lottery-red-600 to-lottery-red-800 rounded-xl shadow-lg p-6 text-white overflow-hidden relative">
                                    <div className="relative z-10 text-center mb-6">
                                        <h2 className="text-xl font-black uppercase tracking-widest mb-1">
                                            🌟 TỔNG HỢP ĐA CHU KỲ — TOP 10 SỐ ỔN ĐỊNH NHẤT
                                        </h2>
                                        <p className="text-xs opacity-80">
                                            Số nào nằm trong Top 10 nhất quán qua nhiều khung thời gian (3 / 5 / 10 / tất cả năm) — lọc nhiễu ngắn hạn
                                        </p>
                                        {nDraws < 10 && (
                                            <p className="text-xs bg-white/10 rounded px-2 py-1 mt-2 inline-block">
                                                ⚠️ Mẫu chỉ {nDraws} năm — kết quả tổng hợp có thể không đáng tin
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 relative z-10">
                                        {data.synthesis.map((item, idx) => (
                                            <div key={item.number} className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20 hover:bg-white/20 transition-all group">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-[10px] bg-amber-400 text-amber-900 font-black px-1.5 py-0.5 rounded-full">#{idx + 1}</span>
                                                    <span className="text-[10px] opacity-70 font-bold">{item.repCount} khung</span>
                                                </div>
                                                <div className="text-3xl font-black mb-1 group-hover:scale-110 transition-transform">{item.number}</div>
                                                <div className="text-[10px] opacity-80">Về {item.totalCount} lần (toàn bộ)</div>
                                                <div className="flex gap-0.5 mt-2">
                                                    {[1, 2, 3, 4].map(i => (
                                                        <div key={i} className={`h-1 flex-1 rounded-full ${i <= item.repCount ? 'bg-amber-400' : 'bg-white/10'}`}></div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Year list */}
                            {data.availableYears.length > 0 && (
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                    <h3 className="text-sm font-bold text-gray-700 mb-2">Các năm có kết quả ngày {day}/{month}:</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {data.availableYears.map(y => (
                                            <span key={y} className="px-2 py-1 bg-white border border-gray-200 rounded text-sm font-semibold text-gray-600 shadow-sm">{y}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500">Không có dữ liệu</div>
            )}

            <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-700 leading-relaxed text-justify shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Giới thiệu về Thống Kê Theo Ngày Trong Năm</h2>
                <p>
                    Công cụ <strong>Thống Kê Theo Ngày Trong Năm</strong> cho phép bạn xem kết quả xổ số của chính ngày/tháng này qua các năm trước.
                    Ví dụ: ngày 15/5 trong 20 năm qua thường về những con số nào? Do mỗi ngày trong năm chỉ xảy ra 1 lần/năm,
                    cần lưu ý rằng với ít năm dữ liệu, kết quả mang tính tham khảo và cần kết hợp với các phương pháp soi cầu khác.
                </p>
            </div>
        </div>
    );
}
