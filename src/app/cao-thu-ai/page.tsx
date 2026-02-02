'use client';

import { useState, useEffect } from 'react';

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
}

export default function CaoThuAIPage() {
    const [activeTab, setActiveTab] = useState<'2d' | '3d' | '4d' | 'loto-dau'>('2d');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<ApiResponse | null>(null);

    // Initial fetch
    useEffect(() => {
        handleAnalyze();
    }, [activeTab]); // Trigger when tab changes

    const handleAnalyze = async () => {
        setLoading(true);
        try {
            let typeParam = 'ai-mining';
            if (activeTab === '3d') typeParam = 'ai-mining-3d';
            if (activeTab === '4d') typeParam = 'ai-mining-4d';
            if (activeTab === 'loto-dau') typeParam = 'ai-mining-loto-dau';

            // We use existing API.
            const res = await fetch(`/api/soi-cau-bach-thu?type=${typeParam}`);
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
                <h1 className="text-xl md:text-3xl font-bold text-lottery-gray-800 mb-2">
                    🤖 Cao Thủ AI - Dự Đoán Thông Minh
                </h1>
                <div className="w-24 h-1 bg-lottery-red-600 mx-auto rounded-full mt-4"></div>
                <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
                    Sử dụng thuật toán Học Máy (Machine Learning) để phân tích hàng triệu dữ liệu lịch sử, tìm ra quy luật ẩn không thể thấy bằng mắt thường.
                </p>

                {/* Tabs */}
                <div className="flex justify-center mt-6 space-x-4 flex-wrap gap-2">
                    {[
                        { id: '2d', label: 'Số 2D (Loto)' },
                        { id: 'loto-dau', label: 'Loto Đầu (2 Số)' },
                        { id: '3d', label: 'Số 3D (3 Càng)' },
                        { id: '4d', label: 'Số 4D (4 Càng)' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2 rounded-full font-bold transition-all text-sm md:text-base relative ${activeTab === tab.id
                                ? 'bg-lottery-red-600 text-white shadow-lg transform scale-105'
                                : 'bg-white text-gray-600 border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center">
                <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="btn bg-gradient-to-r from-lottery-red-600 to-lottery-red-700 text-white px-8 py-3 rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-0.5 transition-all text-lg font-bold disabled:opacity-50 flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Đang Phân Tích...
                        </>
                    ) : '🚀 Phân Tích Lại'}
                </button>
            </div>

            {/* Results */}
            {data?.aiPatterns && (
                <div className="space-y-6 animate-fade-in pb-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {data.aiPatterns.map((pattern, idx) => (
                            <div key={idx} className="card bg-white shadow-xl border-t-4 border-lottery-red-600 rounded-xl overflow-hidden transform hover:-translate-y-1 transition-all">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                                            Phương pháp #{idx + 1}
                                        </div>
                                        <div className="flex items-center text-green-600 text-sm font-bold">
                                            <span className="mr-1">Win: {pattern.winRate}</span>
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">{pattern.name}</h3>
                                    <p className="text-gray-500 text-sm mb-6 h-10">{pattern.description}</p>

                                    <div className="bg-gray-50 p-4 rounded-lg text-center mb-6">
                                        <div className="text-sm text-gray-400 mb-1 uppercase text-xs font-bold">Số Đề Xuất</div>
                                        <div className="flex justify-center gap-2 flex-wrap">
                                            {pattern.numbers.map(num => (
                                                <span key={num} className="text-4xl font-black text-lottery-red-600 tracking-widest drop-shadow-sm">
                                                    {num}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="text-xs text-gray-400 border-t pt-4 italic h-16 overflow-y-auto">
                                        "{pattern.details}"
                                    </div>

                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-500">Độ tin cậy AI:</span>
                                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${pattern.confidence > 90 ? 'bg-green-500' : pattern.confidence > 80 ? 'bg-blue-500' : 'bg-yellow-500'}`}
                                                style={{ width: `${pattern.confidence}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
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
