'use client';

import { useState, useEffect } from 'react';
import AIStatsTable from '@/components/ai/AIStatsTable';
import AIHistoryTable from '@/components/ai/AIHistoryTable';

interface AIPattern {
    name: string;
    description: string;
    numbers: string[];
    winRate: string;
    confidence: number;
    type: string;
    details: string;
}

interface ApiResponse {
    aiPatterns?: AIPattern[];
    date: string;
    personality?: {
        name: string;
        motto: string;
    };
}

export default function CaoThuAIPage() {
    const [activeTab, setActiveTab] = useState<'2d' | '3d' | '4d' | 'loto-dau'>('2d');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<ApiResponse | null>(null);
    const [historyData, setHistoryData] = useState<{ history: any[], stats: any[] } | null>(null);

    // Initial fetch
    useEffect(() => {
        handleAnalyze();
    }, [activeTab]);

    const handleAnalyze = async () => {
        setLoading(true);
        try {
            let typeParam = 'ai-mining';
            if (activeTab === '3d') typeParam = 'ai-mining-3d';
            if (activeTab === '4d') typeParam = 'ai-mining-4d';
            if (activeTab === 'loto-dau') typeParam = 'ai-mining-loto-dau';

            const promises: Promise<any>[] = [
                fetch(`/api/soi-cau-bach-thu?type=${typeParam}`).then(res => res.json())
            ];

            if (['2d', 'loto-dau', '3d', '4d'].includes(activeTab)) {
                promises.push(fetch(`/api/ai-history?days=10&type=${activeTab}`).then(res => res.json()));
            } else {
                setHistoryData(null);
            }

            const [result, historyResult] = await Promise.all(promises);

            if (result.success) {
                setData(result.data);
            }
            if (historyResult && historyResult.success) {
                setHistoryData(historyResult.data);
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
                <h1 className="text-xl md:text-4xl font-black text-gray-900 mb-2 tracking-tight">
                    🤖 CAO THỦ AI <span className="text-lottery-red-600">3.0</span>
                </h1>
                <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base font-medium">
                    Hệ thống dự đoán đa luồng tích hợp bộ não tự học (Self-Learning), tiến hóa theo từng kỳ quay.
                </p>

                {/* AI Brain Status & Reflection */}
                {data?.personality && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12 mb-12">
                        {/* Personality Banner (Moved & Refined) */}
                        <div className="lg:col-span-1 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-6 shadow-2xl border border-white/10 flex flex-col items-center justify-center text-center">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white text-5xl shadow-2xl ring-8 ring-white/5 mb-4 animate-pulse">
                                {data.personality.name.charAt(0)}
                            </div>
                            <div className="text-pink-400 text-[10px] font-black uppercase tracking-widest mb-2">Chuyên gia đang trực</div>
                            <h2 className="text-3xl font-black text-white mb-2">{data.personality.name}</h2>
                            <p className="text-indigo-200 italic text-sm px-4">"{data.personality.motto}"</p>
                        </div>

                        {/* Reflection Log (Terminal Style) */}
                        <div className="lg:col-span-2 bg-slate-950 rounded-3xl p-6 shadow-2xl border border-slate-800 font-mono text-sm relative overflow-hidden">
                            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                                </div>
                                <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">AI REASONING LOG</div>
                            </div>
                            <div className="space-y-2 text-green-400/80 max-h-[180px] overflow-y-auto custom-scrollbar pr-2">
                                <div className="flex gap-2">
                                    <span className="text-slate-600">0.00s</span>
                                    <span>🚀 Đang khởi tạo ma trận {activeTab.toUpperCase()}...</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-slate-600">0.12s</span>
                                    <span>🧠 Nạp kinh nghiệm từ 30 ngày gần nhất vào tham số personality...</span>
                                </div>
                                <div className="flex gap-2 text-yellow-500/80">
                                    <span className="text-slate-600">0.45s</span>
                                    <span>⚡ Điều chỉnh trọng số: {data.personality.name === 'Chiến Lược Gia' ? 'Tối ưu Tần Suất' : data.personality.name === 'Kẻ Độc Hành' ? 'Tối ưu Số Gan' : 'Cân bằng Entropy'}</span>
                                </div>
                                {data.aiPatterns?.map((p, i) => (
                                    <div key={i} className="flex gap-2">
                                        <span className="text-slate-600">{(0.5 + i * 0.1).toFixed(2)}s</span>
                                        <span>🔍 Đã tìm thấy mẫu hình: <span className="text-blue-400">{p.name}</span> (Conf: {p.confidence}%)</span>
                                    </div>
                                ))}
                                <div className="flex gap-2 text-pink-400/80">
                                    <span className="text-slate-600">0.89s</span>
                                    <span>✨ Kết thúc quá trình suy luận. Đang xuất bản kết quả...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex justify-center mt-8 space-x-2 md:space-x-4 flex-wrap gap-y-2">
                    {[
                        { id: '2d', label: 'Bạch Thủ 2D' },
                        { id: 'loto-dau', label: 'Loto Đầu' },
                        { id: '3d', label: 'Càng 3D' },
                        { id: '4d', label: 'Càng 4D' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-5 py-2.5 rounded-xl font-bold transition-all text-sm md:text-base border-2 ${activeTab === tab.id
                                ? 'bg-lottery-red-600 border-lottery-red-600 text-white shadow-lg'
                                : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results Grid */}
            {data?.aiPatterns && (
                <div className="space-y-8 animate-fade-in pb-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.aiPatterns.map((pattern: any, idx: number) => (
                            <div key={idx} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all group">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="bg-gray-100 text-gray-600 text-[10px] font-black px-2 py-1 rounded-lg uppercase">Logic #{idx + 1}</span>
                                        <div className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold ring-1 ring-green-100">
                                            Win Rate: {pattern.winRate}
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-black text-gray-800 mb-1">{pattern.name}</h3>
                                    <p className="text-gray-400 text-xs mb-6 font-medium line-clamp-1">{pattern.description}</p>

                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl text-center mb-6 border border-gray-200/50">
                                        <div className="flex justify-center gap-3 flex-wrap">
                                            {pattern.numbers.map((num: string) => (
                                                <span key={num} className="text-4xl md:text-5xl font-black text-lottery-red-600 tracking-tighter drop-shadow-md group-hover:scale-110 transition-transform">
                                                    {num}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-blue-50/50 rounded-xl p-3 mb-6 border border-blue-100/50">
                                        <p className="text-[11px] text-blue-800 italic leading-relaxed">
                                            " {pattern.details} "
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-gray-400 uppercase">Confidence</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-black text-gray-700">{pattern.confidence}%</span>
                                            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-lottery-red-500 to-pink-500"
                                                    style={{ width: `${pattern.confidence}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {historyData && (
                        <div className="mt-12">
                            <AIHistoryTable history={historyData.history} stats={historyData.stats} />
                        </div>
                    )}
                </div>
            )}

            {/* Disclaimer */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-sm text-yellow-800 flex items-start gap-3">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <div>
                    <strong>Khuyến cáo:</strong> Trí tuệ nhân tạo chỉ hỗ trợ phân tích dựa trên xác suất thống kê. Các con số này không đảm bảo trúng thưởng 100%. Người chơi cần cân nhắc kỹ và chịu trách nhiệm với quyết định của mình.
                </div>
            </div>

        </div>
    );
}
