'use client';

import { useState, useEffect } from 'react';

interface StatsData {
    number: string;
    count: number;
}

interface ApiResponse {
    day: number;
    month: number;
    yearsAnalyzed: number;
    totalAppearances: number;
    stats: StatsData[];
    synthesis: {
        number: string;
        repCount: number;
        totalCount: number;
    }[];
    availableYears: number[];
}

export default function LotoByDayOfYearPage() {
    const today = new Date();
    const [activeDay, setActiveDay] = useState<number>(today.getDate());
    const [activeMonth, setActiveMonth] = useState<number>(today.getMonth() + 1);
    const [data, setData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [yearsLimitFilter, setYearsLimitFilter] = useState<number>(10); // Default 10 years

    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    useEffect(() => {
        fetchData(activeDay, activeMonth, yearsLimitFilter);
    }, [activeDay, activeMonth, yearsLimitFilter]);

    const fetchData = async (day: number, month: number, limit: number) => {
        try {
            setLoading(true);
            const res = await fetch(`/api/thong-ke/theo-ngay-trong-nam?day=${day}&month=${month}&yearsLimit=${limit}`);
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

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-lottery-gray-800 mb-2">
                    Thống Kê Kỷ Niệm (Theo Ngày Của Mỗi Năm)
                </h1>
                <p className="text-lottery-gray-600">
                    Phân tích kết quả xổ số đúng vào ngày này qua các năm trong lịch sử
                </p>
                <div className="w-20 h-1 bg-lottery-red-600 mx-auto rounded-full mt-4"></div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200 gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
                        <select
                            value={activeDay}
                            onChange={(e) => setActiveDay(Number(e.target.value))}
                            className="bg-transparent px-3 py-2 font-semibold text-gray-700 focus:outline-none appearance-none cursor-pointer"
                        >
                            {days.map(d => (
                                <option key={d} value={d}>Ngày {d}</option>
                            ))}
                        </select>
                        <span className="text-gray-400 self-center px-1">/</span>
                        <select
                            value={activeMonth}
                            onChange={(e) => setActiveMonth(Number(e.target.value))}
                            className="bg-transparent px-3 py-2 font-semibold text-gray-700 focus:outline-none appearance-none cursor-pointer"
                        >
                            {months.map(m => (
                                <option key={m} value={m}>Tháng {m}</option>
                            ))}
                        </select>
                    </div>

                    <select
                        value={yearsLimitFilter}
                        onChange={(e) => setYearsLimitFilter(Number(e.target.value))}
                        className="select select-bordered"
                    >
                        <option value={5}>5 năm gần nhất</option>
                        <option value={10}>10 năm gần nhất</option>
                        <option value={15}>15 năm gần nhất</option>
                        <option value={20}>20 năm gần nhất</option>
                        <option value={0}>Tất cả các năm</option>
                    </select>
                </div>

                <div className="text-sm font-semibold text-lottery-red-600 bg-red-50 px-4 py-2 rounded-full border border-red-100">
                    Sự kiện: Ngày {activeDay}/{activeMonth} hàng năm
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="loading loading-spinner loading-lg text-lottery-red-600"></div>
                </div>
            ) : data && data.stats.length > 0 ? (
                <div className="space-y-6">
                    {/* Summary Card */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="card bg-blue-50 border-blue-200">
                            <div className="text-sm text-gray-500">Mốc thời gian</div>
                            <div className="text-2xl font-bold text-blue-700">{data.day}/{data.month}</div>
                        </div>
                        <div className="card bg-green-50 border-green-200">
                            <div className="text-sm text-gray-500">Số năm có kết quả</div>
                            <div className="text-2xl font-bold text-green-700">{data.yearsAnalyzed} năm</div>
                        </div>
                        <div className="card bg-purple-50 border-purple-200">
                            <div className="text-sm text-gray-500">Giai đoạn khả dụng</div>
                            <div className="text-sm font-semibold text-purple-700">
                                {data.availableYears.length > 0
                                    ? `Từ ${Math.min(...data.availableYears)} đến ${Math.max(...data.availableYears)}`
                                    : 'Không có dữ liệu'
                                }
                            </div>
                        </div>
                    </div>

                    {/* Top 10 Chart */}
                    <div className="card">
                        <h3 className="card-header flex items-center gap-2">
                            <span>🏆 Top 10 Xuất Hiện Nhiều Nhất Vào Ngày {data.day}/{data.month}</span>
                        </h3>
                        <div className="space-y-3 mt-2">
                            {data.stats.slice(0, 10).map((stat, idx) => (
                                <div key={stat.number} className="flex items-center gap-3">
                                    <div className="w-8 font-bold text-gray-500 text-center">#{idx + 1}</div>
                                    <div className="w-10 font-bold text-xl text-lottery-red-600 border border-lottery-red-200 rounded text-center bg-white">{stat.number}</div>
                                    <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${getBarColor(idx)} transition-all duration-500`}
                                            style={{ width: `${(stat.count / data.stats[0].count) * 100}%` }}
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
                            <h3 className="card-header bg-gray-600 text-white">Số Ít Về Nhất</h3>
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
                    {data.synthesis.length > 0 && (
                        <div className="bg-gradient-to-r from-lottery-red-600 to-lottery-red-800 rounded-xl shadow-lg p-6 text-white overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                            </div>

                            <div className="relative z-10 text-center mb-6">
                                <h2 className="text-xl font-black uppercase tracking-widest mb-1 italic">
                                    🌟 NGOI SAO KỶ NIỆM: SỐ BẤT BẠI 🌟
                                </h2>
                                <p className="text-xs opacity-80 font-medium">
                                    (Những con số giữ độ trúng ổn định qua nhiều mốc chu kỳ: 3, 5, 10, 20 năm)
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
                                        <div className="text-[10px] opacity-80 font-medium">Tổng xuất hiện: {item.totalCount}</div>

                                        {/* Indicator bars */}
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
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-100 shadow-sm">
                    <div className="text-gray-400 mb-2">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="text-gray-600 font-semibold text-lg">Không có dữ liệu xổ số</div>
                    <div className="text-gray-500 text-sm mt-1">Vào ngày {activeDay}/{activeMonth} không có kỳ quay nào hoặc nằm ngoài vùng dữ liệu.</div>
                </div>
            )}

            {/* SEO Content */}
            <div className="mt-10 p-6 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-700 leading-relaxed text-justify shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Thống Kê Xổ Số Theo Kỷ Niệm (Ngày Trong Năm)</h2>
                <p>
                    Bạn có bao giờ tự hỏi vào <strong>ngày sinh nhật, ngày lễ hay một sự kiện đặc biệt</strong> nào đó, xổ số miền Bắc thường ra những con số nào?
                    Công cụ "Thống Kê Theo Ngày Của Mỗi Năm" được thiết kế đặc biệt để giúp bạn tìm ra quy luật đó bằng cách xuyên không về quá khứ,
                    thống kê toàn bộ kết quả của đúng ngày và tháng đó qua hàng chục năm liên tiếp.
                </p>
                <p className="mt-2">
                    Những con số "kỷ niệm" có thể là sự lặp lại đầy thú vị của xác suất thống kê. Hãy chọn một ngày ý nghĩa với bạn và xem thuật toán chỉ ra cặp lô tô nào là "ngôi sao" của ngày đó.
                </p>
            </div>
        </div>
    );
}
