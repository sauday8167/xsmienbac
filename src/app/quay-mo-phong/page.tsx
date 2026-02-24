'use client';

import { useState, useEffect } from 'react';

interface MockStats {
    number: string;
    count: number;
}

interface MockData {
    draw_date: string;
    run_time: string;
    total_runs: number;
    stats: MockStats[];
}

export default function MockDrawPage() {
    const [data, setData] = useState<MockData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [runningMock, setRunningMock] = useState<boolean>(false);

    useEffect(() => {
        fetchLatestData();
    }, []);

    const fetchLatestData = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/quay-mo-phong/latest', { cache: 'no-store' });
            const result = await res.json();
            if (result.success && result.data) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch mock data:', error);
        } finally {
            setLoading(false);
        }
    };

    const triggerMockSimulation = async () => {
        try {
            setRunningMock(true);
            const res = await fetch('/api/quay-mo-phong/run', {
                method: 'GET',
                cache: 'no-store'
            });
            const result = await res.json();
            if (result.success) {
                await fetchLatestData();
            } else {
                alert('Có lỗi xảy ra khi chạy quay thử.');
            }
        } catch (error) {
            console.error('Failed to run mock:', error);
            alert('Lỗi kết nối.');
        } finally {
            setRunningMock(false);
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
                    Quay Mô Phỏng (Hệ Thống Tự Học)
                </h1>
                <p className="text-lottery-gray-600">
                    Hệ thống sẽ tiến hành quay thử hàng loạt từ 20 đến 50 lần kết quả xổ số mỗi ngày.
                    <br />Dữ liệu này giúp tìm ra những cặp số "vàng" xuất hiện nhiều nhất trong chuỗi lặp không gian số học ngẫu nhiên.
                </p>
                <div className="w-20 h-1 bg-lottery-red-600 mx-auto rounded-full mt-4"></div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200 gap-4">
                <div className="text-sm font-semibold text-gray-700">
                    Lưu ý: Dữ liệu này chỉ mang tính tham khảo và sẽ bị ghi đè sau mỗi lần hệ thống chạy (thường là 18:00 - 18:04 hằng ngày).
                </div>
                <button
                    onClick={triggerMockSimulation}
                    disabled={runningMock}
                    className="btn bg-lottery-red-600 hover:bg-lottery-red-700 text-white border-0 shadow-lg min-w-[200px]"
                >
                    {runningMock ? (
                        <><span className="loading loading-spinner rounded-full w-4 h-4 mr-2"></span> Đang mô phỏng...</>
                    ) : (
                        "Chạy Mô Phỏng Thủ Công Ngay"
                    )}
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="loading loading-spinner loading-lg text-lottery-red-600"></div>
                </div>
            ) : data ? (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="card bg-blue-50 border-blue-200">
                            <div className="text-sm text-gray-500">Kỳ mô phỏng</div>
                            <div className="text-2xl font-bold text-blue-700">Ngày {new Date(data.draw_date).toLocaleDateString('vi-VN')}</div>
                        </div>
                        <div className="card bg-purple-50 border-purple-200">
                            <div className="text-sm text-gray-500">Giờ hoàn tất</div>
                            <div className="text-2xl font-bold text-purple-700">{data.run_time}</div>
                        </div>
                        <div className="card bg-green-50 border-green-200 relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="text-sm text-gray-500">Tổng số lần quay thử</div>
                                <div className="text-3xl font-black text-green-700">{data.total_runs} <span className="text-sm font-medium">lần</span></div>
                            </div>
                            <div className="absolute -right-4 -bottom-4 opacity-10">
                                <svg className="w-24 h-24 text-green-700" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        {/* Top Hit Chart */}
                        <div className="card bg-white shadow-xl border border-gray-100 p-0 overflow-hidden">
                            <h3 className="card-header bg-gradient-to-r from-lottery-red-600 to-red-800 text-white rounded-t-xl py-4 flex items-center gap-2 m-0 px-6">
                                <span>🏆 TOP 15 SỐ MÔ PHỎNG XUẤT HIỆN NHIỀU NHẤT</span>
                            </h3>
                            <div className="p-6 space-y-4">
                                {data.stats.slice(0, 15).map((stat, idx) => (
                                    <div key={stat.number} className="flex items-center gap-4 group">
                                        <div className="w-8 font-black text-gray-400 text-right group-hover:text-lottery-red-500 transition-colors">#{idx + 1}</div>
                                        <div className="w-12 font-black text-2xl text-lottery-red-600 bg-red-50 py-1 rounded-lg text-center shadow-inner border border-red-100">{stat.number}</div>
                                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden relative">
                                            <div
                                                className={`absolute top-0 left-0 h-full ${getBarColor(idx)} transition-all duration-1000 ease-out rounded-full shadow-sm`}
                                                style={{ width: `${(stat.count / data.stats[0].count) * 100}%` }}
                                            ></div>
                                        </div>
                                        <div className="w-16 text-right font-bold text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-200">{stat.count} lần</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Synthesis Card */}
                            <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden ring-4 ring-white shadow-purple-500/20">
                                <div className="absolute top-[-50%] right-[-20%] w-[100%] h-[200%] bg-gradient-to-l from-emerald-500/10 to-transparent rotate-12 blur-3xl pointer-events-none"></div>
                                <div className="relative z-10 text-center mb-6">
                                    <div className="inline-block bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-3 border border-white/20">
                                        Thuật toán hội tụ
                                    </div>
                                    <h2 className="text-2xl font-black uppercase tracking-widest mb-2 italic bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400">
                                        Tứ Trụ Số Học VIP
                                    </h2>
                                    <p className="text-xs opacity-70 font-medium max-w-sm mx-auto">
                                        (4 con số thống trị tuyệt đối qua hàng loạt lần mô phỏng liên tiếp)
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10 justify-center">
                                    {data.stats.slice(0, 4).map((item, idx) => (
                                        <div key={item.number} className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:border-emerald-400/50 hover:bg-white/10 transition-all group shadow-xl">
                                            <div className="text-center group-hover:-translate-y-1 transition-transform">
                                                <div className="text-4xl font-black mb-2 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">{item.number}</div>
                                                <div className="text-[10px] opacity-80 font-bold uppercase tracking-widest text-emerald-300">Xuất hiện {item.count} Lần</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Giải Thích Thuật Toán</h3>
                                <p className="text-sm text-gray-600 leading-relaxed text-justify">
                                    Tính năng <strong>Quay Mô Phỏng</strong> hoạt động như một hệ thống máy tính lượng tử mô phỏng xác suất. Nó giả lập quy trình quay lồng cầu xổ số thực tế từ 20 đến 50 lần liên tục trong một khoảng thời gian ngắn (18:00 - 18:04), tạo ra một khối lượng dữ liệu khổng lồ (tương đương với 1 đến gần 2 tháng quay ngoài đời thực). Qua đó, hệ thống sẽ lọc và tổng hợp xem các cặp số nào có "tần số cộng hưởng" cao nhất, liên tục xuất hiện xuyên suốt các lần quay thử ảo này. Các con số này được đánh giá là có điểm rơi cực kỳ mạnh trong ngày.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white p-12 text-center rounded-xl shadow border border-gray-200">
                    <div className="text-5xl mb-4 opacity-50">🎲</div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">Chưa có dữ liệu mô phỏng</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Hệ thống tự động quay mô phỏng chưa được chạy. Hệ thống sẽ tự kích hoạt hằng ngày vào 18:00 đến 18:04. Bạn cũng có thể nhấn "Chạy Mô Phỏng Thủ Công" để kiểm tra tính năng.
                    </p>
                </div>
            )}
        </div>
    );
}
