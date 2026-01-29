'use client';

import { useState, useEffect } from 'react';

interface BridgePath {
    date: string;
    val1: string;
    val2: string;
    result: string;
    targetDate: string;
    isHit: boolean;
}

interface Bridge {
    index1: number;
    index2: number;
    predictedNumber: string;
    amplitude: number;
    bridgepath: BridgePath[];
}

interface AggregatedStat {
    number: string;
    count: number;
}

interface ApiResponse {
    date: string;
    amplitude: number;
    totalBridges: number;
    bridges: Bridge[];
    aggregated: AggregatedStat[];
}

export default function SoiCauBachThuPage() {
    const [amplitude, setAmplitude] = useState<number>(3);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<ApiResponse | null>(null);
    const [selectedBridge, setSelectedBridge] = useState<Bridge | null>(null);

    useEffect(() => {
        // Initial fetch
        handleAnalyze();
    }, []);

    const handleAnalyze = async () => {
        setLoading(true);
        setSelectedBridge(null);
        try {
            const res = await fetch(`/api/soi-cau-bach-thu?amplitude=${amplitude}`);
            const result = await res.json();
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 p-4">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-lottery-gray-800 mb-2">
                    Soi Cầu Loto Bạch Thủ
                </h1>
                <div className="w-24 h-1 bg-lottery-red-600 mx-auto rounded-full mt-4"></div>
                <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
                    Hệ thống tự động tìm kiếm các vị trí ghép cầu có chu kỳ ổn định từ dữ liệu lịch sử.
                </p>

                {/* Warning */}
                <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 text-sm border border-yellow-200 rounded-lg inline-block">
                    ⚠️ <strong>Lưu ý:</strong> Kết quả chỉ mang tính chất tham khảo thống kê. Không có giá trị cam kết trúng thưởng.
                </div>
            </div>

            {/* Controls */}
            <div className="card bg-white shadow-lg border border-gray-100 p-6 rounded-xl">
                <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
                    <div className="w-full md:w-1/2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Biên độ cầu (Số ngày liên tiếp): <span className="text-lottery-red-600 text-lg">{amplitude} ngày</span>
                        </label>
                        <input
                            type="range"
                            min="3"
                            max="10"
                            value={amplitude}
                            onChange={(e) => setAmplitude(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-lottery-red-600"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>3 ngày</span>
                            <span>10 ngày</span>
                        </div>
                    </div>

                    <button
                        onClick={handleAnalyze}
                        disabled={loading}
                        className="btn bg-gradient-to-r from-lottery-red-600 to-lottery-red-700 text-white px-8 py-3 rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-0.5 transition-all text-lg font-bold disabled:opacity-50"
                    >
                        {loading ? 'Đang Phân Tích...' : '🔍 Soi Cầu Ngay'}
                    </button>
                </div>
            </div>

            {data && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Top Predictions */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="card bg-white shadow border border-gray-200 p-0 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
                                <h3 className="font-bold text-lg">🔥 Top Bạch Thủ Đẹp Nhất</h3>
                                <p className="text-blue-100 text-xs">Sắp xếp theo số lượng cầu</p>
                            </div>
                            <div className="p-4 max-h-[500px] overflow-y-auto">
                                {data.aggregated.map((item, idx) => (
                                    <div
                                        key={item.number}
                                        className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0 hover:bg-blue-50 cursor-pointer transition-colors"
                                        onClick={() => {
                                            // Find first bridge with this number
                                            const bridge = data.bridges.find(b => b.predictedNumber === item.number);
                                            if (bridge) setSelectedBridge(bridge);
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`
                                                w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                                ${idx < 3 ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-100 text-gray-500'}
                                            `}>
                                                #{idx + 1}
                                            </div>
                                            <span className="text-2xl font-bold text-lottery-red-600">{item.number}</span>
                                        </div>
                                        <div className="text-sm font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                            {item.count} đường cầu
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Detail View */}
                    <div className="lg:col-span-2 space-y-6">
                        {selectedBridge ? (
                            <div className="card bg-white shadow-lg border border-lottery-red-100 p-6 animate-fade-in relative">
                                <button
                                    onClick={() => setSelectedBridge(null)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                                    Chi tiết Cầu Bạch Thủ: <span className="text-lottery-red-600 text-3xl mx-2">{selectedBridge.predictedNumber}</span>
                                </h3>

                                <div className="space-y-6">
                                    <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 border border-blue-100">
                                        Vị trí ghép cầu: <strong>#{selectedBridge.index1}</strong> và <strong>#{selectedBridge.index2}</strong>
                                        {/* Ideally we would map these indices to "Giải G3.1 số thứ 2" etc, but that's complex mapping. */}
                                    </div>

                                    <div className="relative border-l-2 border-gray-200 ml-4 space-y-8 py-4">
                                        {/* History */}
                                        {selectedBridge.bridgepath.map((step, i) => (
                                            <div key={i} className="relative pl-8">
                                                <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-green-500 border-4 border-white shadow-sm"></div>
                                                <div className="text-sm text-gray-500 mb-1">
                                                    Ngày lấy số: {new Date(step.date).toLocaleDateString('vi-VN')}
                                                </div>
                                                <div className="bg-gray-50 p-3 rounded border border-gray-200 inline-block">
                                                    <div className="flex items-center gap-2">
                                                        <span>Vị trí 1: <strong className="text-red-600 text-lg">{step.val1}</strong></span>
                                                        <span className="text-gray-400">+</span>
                                                        <span>Vị trí 2: <strong className="text-red-600 text-lg">{step.val2}</strong></span>
                                                        <span>→</span>
                                                        <span>Ra số: <strong className="text-blue-600 text-lg">{step.result}</strong></span>
                                                    </div>
                                                </div>
                                                <div className="mt-2 text-sm">
                                                    ⬇ Xuất hiện tại ngày <strong>{new Date(step.targetDate).toLocaleDateString('vi-VN')}</strong>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Prediction */}
                                        <div className="relative pl-8">
                                            <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-red-600 border-4 border-white shadow-md animate-pulse"></div>
                                            <div className="text-sm text-gray-500 mb-1">
                                                Dự báo cho ngày mai (dựa trên kết quả {new Date(data.date).toLocaleDateString('vi-VN')})
                                            </div>
                                            <div className="bg-red-50 p-4 rounded border border-red-200 inline-block">
                                                <div className="text-center">
                                                    <div className="text-gray-600 text-sm mb-1">Cặp số dự đoán</div>
                                                    <div className="text-4xl font-black text-lottery-red-600 tracking-wider">
                                                        {selectedBridge.predictedNumber}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl p-12 bg-gray-50">
                                <div className="text-6xl mb-4">🔍</div>
                                <p className="text-lg">Chọn một bộ số bên trái để xem chi tiết đường cầu</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
