'use client';

import { useState, useEffect } from 'react';

interface BridgePath {
    date: string;
    val1: string;
    val2: string;
    val3?: string;
    val4?: string;
    result: string;
    targetDate: string;
    isHit: boolean;
}

interface Bridge {
    index1: number;
    index2: number;
    index3?: number;
    index4?: number;
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
    touchStats?: { digit: string; count: number }[];
}

export default function SoiCauBachThuPage() {
    const [amplitude, setAmplitude] = useState<number>(3);
    const [activeTab, setActiveTab] = useState<'loto' | 'special' | 'loto3d' | 'loto4d' | 'special-touch' | 'loto-dau'>('loto');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<ApiResponse | null>(null);
    const [selectedBridge, setSelectedBridge] = useState<Bridge | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);

    // Dynamic min amplitude: 1 for Special Prize, 3 for others
    const minAmplitude = activeTab === 'special' ? 1 : 3;

    useEffect(() => {
        // Enforce min amplitude when switching tabs
        if (amplitude < minAmplitude) {
            setAmplitude(minAmplitude);
        } else {
            // Trigger analyze if amplitude is already valid (if it wasn't, the setAmplitude above will trigger re-render -> effect)
            // Actually, we should just depend on activeTab/amplitude to trigger fetch?
            // The original code called handleAnalyze() in useEffect[activeTab].
            // If we setAmplitude, that might not trigger handleAnalyze if handleAnalyze is not in dependency of amplitude.
            // Let's keep original logic: explicit call.
            handleAnalyze();
        }
    }, [activeTab]);

    // Helper to calculate next day
    const getNextDate = (dateStr: string) => {
        const d = new Date(dateStr);
        d.setDate(d.getDate() + 1);
        return d.toLocaleDateString('vi-VN');
    };

    const handleAnalyze = async () => {
        setLoading(true);
        setSelectedBridge(null);
        try {
            // Ensure we use the current valid amplitude
            const effectiveAmplitude = amplitude < minAmplitude ? minAmplitude : amplitude;

            const res = await fetch(`/api/soi-cau-bach-thu?amplitude=${effectiveAmplitude}&type=${activeTab}`);
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

    const handleCopy = () => {
        if (!data || !data.aggregated.length) return;
        const numbers = data.aggregated.map(item => item.number).join(', ');
        navigator.clipboard.writeText(numbers).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 p-4">
            <div className="text-center">
                <h1 className="text-xl md:text-3xl font-bold text-lottery-gray-800 mb-2">
                    {activeTab === 'loto' ? 'Soi Cầu Loto Bạch Thủ' :
                        activeTab === 'special' ? 'Soi Cầu Bạch Thủ Đặc Biệt' :
                            activeTab === 'special-touch' ? 'Soi Cầu Chạm Đặc Biệt' :
                                activeTab === 'loto-dau' ? 'Soi Cầu Loto Đầu (2 Số Đầu)' :
                                    activeTab === 'loto3d' ? 'Soi Cầu Loto 3D (3 Càng)' :
                                        'Soi Cầu Loto 4D (4 Càng)'}
                </h1>

                {data && (
                    <div className="inline-block bg-green-100 text-green-800 px-4 py-1 rounded-full text-sm font-semibold mt-2 border border-green-200 animate-fade-in shadow-sm">
                        ✅ Đã có kết quả {new Date(data.date).toLocaleDateString('vi-VN')} → Dự báo cho: <span className="text-lottery-red-600 font-bold text-base">{getNextDate(data.date)}</span>
                    </div>
                )}

                <div className="w-24 h-1 bg-lottery-red-600 mx-auto rounded-full mt-4"></div>

                {/* ... description ... */}
                <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
                    {activeTab === 'loto' ? 'Hệ thống tự động tìm kiếm các vị trí ghép cầu có chu kỳ ổn định từ dữ liệu lịch sử.' :
                        activeTab === 'special' ? 'Hệ thống tìm kiếm các vị trí ghép cầu ăn thẳng Giải Đặc Biệt (2 số cuối) từ dữ liệu lịch sử.' :
                            activeTab === 'special-touch' ? 'Hệ thống tìm các vị trí ghép cầu có ít nhất một số trùng với các số của Giải Đặc Biệt (Chạm).' :
                                activeTab === 'loto-dau' ? 'Hệ thống quét cầu ăn 2 số ĐẦU của các giải từ Đặc Biệt đến Giải 6.' :
                                    activeTab === 'loto3d' ? 'Hệ thống tìm kiếm 3 vị trí ghép thành bộ 3 số (3 càng) ăn các giải từ ĐB đến Giải 6.' :
                                        'Hệ thống tìm kiếm 4 vị trí ghép thành bộ 4 số (4 càng) ăn các giải từ ĐB đến Giải 5.'}
                </p>

                {/* Tabs */}
                <div className="flex justify-center mt-6 space-x-4 flex-wrap gap-2">
                    {[
                        { id: 'loto', label: 'Bạch Thủ Loto' },
                        { id: 'loto-dau', label: 'Loto Đầu' },
                        { id: 'special', label: 'Bạch Thủ Đặc Biệt' },
                        { id: 'special-touch', label: 'Chạm Đặc Biệt' },
                        { id: 'loto3d', label: 'Loto 3D' },
                        { id: 'loto4d', label: 'Loto 4D' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2 rounded-full font-bold transition-all text-sm md:text-base ${activeTab === tab.id
                                ? 'bg-lottery-red-600 text-white shadow-lg transform scale-105'
                                : 'bg-white text-gray-600 border hover:bg-gray-50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Warning */}
                <div className="mt-6 p-3 bg-yellow-50 text-yellow-800 text-sm border border-yellow-200 rounded-lg inline-block">
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
                            min={minAmplitude}
                            max="20"
                            value={amplitude}
                            onChange={(e) => setAmplitude(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-lottery-red-600"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>{minAmplitude} ngày</span>
                            <span>20 ngày</span>
                        </div>
                    </div>

                    <button
                        onClick={handleAnalyze}
                        disabled={loading}
                        className="btn bg-gradient-to-r from-lottery-red-600 to-lottery-red-700 text-white px-8 py-3 rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-0.5 transition-all text-lg font-bold disabled:opacity-50"
                    >
                        {loading ? 'Đang Phân Tích...' : '🔍 Soi Cầu Ngay'}
                    </button>
                </div >
            </div >

            {/* Standard View */}
            {data && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ... Existing Standard View ... */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* Touch Stats (Only for Special Touch) */}
                        {activeTab === 'special-touch' && data.touchStats && data.touchStats.length > 0 && (
                            <div className="card bg-white shadow border border-gray-200 p-0 overflow-hidden">
                                <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 text-white">
                                    <h3 className="font-bold text-lg">📊 Thống Kê Chạm</h3>
                                    <p className="text-purple-100 text-xs">Tần suất xuất hiện các chạm trong cầu</p>
                                </div>
                                <div className="p-4">
                                    <div className="grid grid-cols-5 gap-2">
                                        {data.touchStats.map((item) => (
                                            <div key={item.digit} className="flex flex-col items-center p-2 bg-gray-50 rounded border border-gray-100 hover:bg-purple-50 transition-colors">
                                                <span className="text-xl font-bold text-gray-800">{item.digit}</span>
                                                <span className="text-xs text-purple-600 font-semibold">{item.count} cầu</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="card bg-white shadow border border-gray-200 p-0 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white flex justify-between items-center group">
                                <div>
                                    <h3 className="font-bold text-lg">
                                        🔥 Top {activeTab === 'loto4d' ? '4D' : activeTab === 'loto3d' ? '3D' : activeTab === 'special' ? 'ĐB' : activeTab === 'special-touch' ? 'Chạm' : 'Loto'} Đẹp Nhất
                                    </h3>
                                    <p className="text-blue-100 text-xs">Sắp xếp theo số lượng cầu (Biên độ {amplitude} ngày)</p>
                                </div>
                                <button
                                    onClick={handleCopy}
                                    className="bg-white/20 hover:bg-white/30 text-white rounded px-3 py-1.5 text-xs font-semibold backdrop-blur-sm transition-all flex items-center gap-1.5 border border-white/20 shadow-sm md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
                                    title="Sao chép toàn bộ danh sách"
                                >
                                    {copySuccess ? (
                                        <>
                                            <span className="text-green-300">✓</span> Đã chép
                                        </>
                                    ) : (
                                        <>
                                            📋 Copy
                                        </>
                                    )}
                                </button>
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
                                {data.aggregated.length === 0 && (
                                    <div className="text-center py-8 text-gray-500 italic">
                                        Không tìm thấy cầu nào với biên độ {amplitude} ngày.
                                        <br />
                                        Hãy thử giảm biên độ xuống.
                                    </div>
                                )}
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
                                    Chi tiết Cầu {activeTab === 'loto4d' ? '4D' : activeTab === 'loto3d' ? '3D' : activeTab === 'special' ? 'Đặc Biệt' : activeTab === 'special-touch' ? 'Chạm ĐB' : 'Bạch Thủ'}:
                                    <span className="text-lottery-red-600 text-3xl mx-2">{selectedBridge.predictedNumber}</span>
                                </h3>

                                <div className="space-y-6">
                                    <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 border border-blue-100">
                                        Vị trí ghép cầu: <strong>#{selectedBridge.index1}</strong> - <strong>#{selectedBridge.index2}</strong>
                                        {activeTab === 'loto3d' && <span> - <strong>#{selectedBridge.index3}</strong></span>}
                                        {activeTab === 'loto4d' && <span> - <strong>#{selectedBridge.index3}</strong> - <strong>#{selectedBridge.index4}</strong></span>}
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
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span>VT1: <strong className="text-red-600 text-lg">{step.val1}</strong></span>
                                                        <span className="text-gray-400">+</span>
                                                        <span>VT2: <strong className="text-red-600 text-lg">{step.val2}</strong></span>
                                                        {step.val3 !== undefined && (
                                                            <>
                                                                <span className="text-gray-400">+</span>
                                                                <span>VT3: <strong className="text-red-600 text-lg">{step.val3}</strong></span>
                                                            </>
                                                        )}
                                                        {step.val4 !== undefined && (
                                                            <>
                                                                <span className="text-gray-400">+</span>
                                                                <span>VT4: <strong className="text-red-600 text-lg">{step.val4}</strong></span>
                                                            </>
                                                        )}
                                                        <span>→</span>
                                                        <span>Ra số: <strong className="text-blue-600 text-lg">{step.result}</strong></span>
                                                    </div>
                                                </div>
                                                <div className="mt-2 text-sm">
                                                    ⬇ Xuất hiện tại {activeTab === 'special' ? 'GIẢI ĐẶC BIỆT' : ''} ngày <strong>{new Date(step.targetDate).toLocaleDateString('vi-VN')}</strong>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Prediction */}
                                        <div className="relative pl-8">
                                            <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-red-600 border-4 border-white shadow-md animate-pulse"></div>
                                            <div className="text-sm text-gray-500 mb-1">
                                                Dự báo cho ngày mai <strong className="text-lottery-red-600">({data && getNextDate(data.date)})</strong>
                                            </div>
                                            <div className="bg-red-50 p-4 rounded border border-red-200 inline-block">
                                                <div className="text-center">
                                                    <div className="text-gray-600 text-sm mb-1">Bộ số dự đoán</div>
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
            {/* SEO Content */}
            <div className="mt-10 p-6 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-700 leading-relaxed text-justify shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Giới thiệu về Soi Cầu Bạch Thủ</h2>
                <p>
                    Công cụ <strong>Soi Cầu Bạch Thủ</strong> được thiết kế dành riêng cho những người chơi yêu thích lối đánh 'nhất tiễn hạ song điêu' – một ăn cả, ngã về không.
                    Hệ thống tự động quét hàng triệu biến thể cầu chạy trong quá khứ để tìm ra các vị trí ghép cầu ổn định nhất (cầu chạy đều 3-5 ngày).
                    Bạn có thể tùy chỉnh biên độ ngày, xem chi tiết đường đi của cầu trên bảng kết quả để kiểm chứng độ tin cậy.
                    Dù là cầu bạch thủ lô, cầu giải đặc biệt hay cầu 3 càng, 4 càng, công cụ này sẽ giúp bạn sàng lọc ra những con số tinh túy nhất, giảm thiểu rủi ro và tối ưu hóa nguồn vốn đầu tư.
                </p>
            </div>
        </div>
    );
}
