'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

interface AIPrediction {
    draw_date: string;
    analysis_content: string;
    predicted_pairs: any;
    confidence_score: number;
}

interface AIHistory {
    draw_date: string;
    predicted_pairs: string;
    actual_result: string | null;
    is_correct: number;
    accuracy_notes: string;
}

export default function AIPredictionPage() {
    const [prediction, setPrediction] = useState<AIPrediction | null>(null);
    const [history, setHistory] = useState<AIHistory[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch latest
                const resLatest = await fetch('/api/ai-prediction/latest', { cache: 'no-store' });
                const dataLatest = await resLatest.json();
                if (dataLatest.success) {
                    setPrediction(dataLatest.data);
                }

                // Fetch history
                const resHistory = await fetch('/api/ai-prediction/history', { cache: 'no-store' });
                const dataHistory = await resHistory.json();
                if (dataHistory.success) {
                    setHistory(dataHistory.data);
                }
            } catch (error) {
                console.error('Failed to load AI data');
            }
        };
        fetchData();
    }, []);

    const formatShortDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    };

    // Helper to extract JSON analysis data safely
    const getAnalysisData = (content: string) => {
        try {
            // New Format: JSON string or wrapped in markdown code block
            const match = content.match(/```json\s*([\s\S]*?)\s*```/);
            const jsonStr = match ? match[1] : content;
            const data = JSON.parse(jsonStr);

            // Normalize old format vs new format
            return {
                summary: data.analysis?.summary || data.reasoning || "Đang cập nhật phân tích...",
                evidence: data.analysis?.top_evidence || data.key_insights || [],
                advice: data.analysis?.advice || "",
                // Support legacy fields just in case
                convergence: data.method_convergence
            };
        } catch (e) {
            return null; // Fallback for raw markdown
        }
    };

    // Parse predicted pairs safely
    const getPredictedPairs = () => {
        if (!prediction) return [];
        try {
            return typeof prediction.predicted_pairs === 'string'
                ? JSON.parse(prediction.predicted_pairs)
                : prediction.predicted_pairs;
        } catch (e) {
            return [];
        }
    };

    const predictedPairs = getPredictedPairs().slice(0, 5);

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-12 font-sans">
            {/* 1. Header & Title - Centered, Single Column */}
            <div className="text-center space-y-2 pt-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold uppercase tracking-wider">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    AI Analysis v2.5
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                    Dự Đoán Xổ Số Miền Bắc
                </h1>
                <p className="text-gray-500">
                    Phân tích & Dự báo kết quả hàng ngày bằng Trí tuệ nhân tạo
                </p>
            </div>

            {prediction ? (
                <>
                    {/* 2. Main Prediction Card - RED THEME */}
                    <div className="bg-gradient-to-b from-red-600 to-red-800 rounded-2xl shadow-xl overflow-hidden text-white relative">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent"></div>

                        <div className="p-8 text-center relative z-10">
                            <h2 className="text-red-100 font-medium text-lg mb-1">Dự đoán cho ngày</h2>
                            <div className="text-3xl font-bold mb-8">
                                {new Date(prediction.draw_date).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </div>

                            {/* Numbers Display - Large & Centered */}
                            <div className="flex flex-wrap justify-center gap-4 mb-8">
                                {predictedPairs.map((num: string, idx: number) => (
                                    <div key={idx} className="flex flex-col items-center">
                                        <div className="w-16 h-16 md:w-20 md:h-20 bg-white text-red-600 rounded-full flex items-center justify-center font-bold text-3xl md:text-4xl shadow-lg ring-4 ring-red-500/50">
                                            {num}
                                        </div>
                                        {idx === 0 && <span className="mt-2 text-xs font-bold bg-white/20 px-2 py-0.5 rounded text-white">Bạch Thủ</span>}
                                    </div>
                                ))}
                            </div>

                            {/* Confidence Meter */}
                            <div className="inline-flex items-center gap-3 bg-black/20 px-5 py-2 rounded-full backdrop-blur-sm">
                                <span className="text-sm font-medium text-red-100">Độ tin cậy mô hình:</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 h-2 bg-gray-700/50 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-400 rounded-full" style={{ width: `${prediction.confidence_score}%` }}></div>
                                    </div>
                                    <span className="font-bold text-green-300">{prediction.confidence_score}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Analysis Content - Wide Single Column */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center gap-3">
                            <span className="p-2 bg-red-100 text-red-600 rounded-lg">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            </span>
                            <h3 className="text-lg font-bold text-gray-900">Chi Tiết Phân Tích Kỹ Thuật</h3>
                        </div>

                        <div className="p-6 md:p-8 space-y-8">
                            {(() => {
                                const data = getAnalysisData(prediction.analysis_content);

                                // NEW FORMAT RENDER
                                if (data && data.evidence.length > 0) {
                                    return (
                                        <div className="space-y-6">
                                            {/* Summary */}
                                            <div>
                                                <h4 className="text-gray-900 font-bold mb-3 flex items-center gap-2">
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    Tổng Quan
                                                </h4>
                                                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                    {data.summary}
                                                </p>
                                            </div>

                                            {/* Evidence List */}
                                            <div>
                                                <h4 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
                                                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    Dữ Liệu Soi Cầu
                                                </h4>
                                                <ul className="space-y-4">
                                                    {data.evidence.map((item: string, idx: number) => (
                                                        <li key={idx} className="flex gap-4 items-start">
                                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs mt-0.5">
                                                                {idx + 1}
                                                            </span>
                                                            <span className="text-gray-700">{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Advice */}
                                            <div className="border-t border-gray-100 pt-6 mt-6">
                                                <div className="flex gap-4 bg-blue-50 p-5 rounded-xl border border-blue-100 items-start">
                                                    <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                    <div>
                                                        <h4 className="text-blue-900 font-bold text-sm uppercase mb-1">Khuyến Nghị Đầu Tư</h4>
                                                        <p className="text-blue-800 text-sm italic">
                                                            "{data.advice}"
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                // FALLBACK: OLD MARKDOWN RENDER (if json parse fails)
                                return (
                                    <div className="prose prose-red max-w-none prose-headings:text-red-800 prose-headings:font-bold prose-p:text-gray-700 prose-strong:text-gray-900 prose-li:text-gray-700">
                                        <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                                            {prediction.analysis_content.replace(/^```json[\s\S]*```$/gm, '> *Nội dung phân tích kỹ thuật (JSON)*')}
                                        </ReactMarkdown>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-white rounded-xl p-12 text-center shadow border border-gray-200">
                    <div className="animate-pulse flex justify-center mb-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                    </div>
                    <h2 className="text-xl font-medium text-gray-900">Đang tải dữ liệu...</h2>
                    <p className="text-gray-500 mt-2">Đang kết nối đến máy chủ phân tích Gemini AI.</p>
                </div>
            )}

            {/* 4. History Table - Simplified */}
            <div className="pt-8 border-t border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Lịch Sử Dự Đoán Gần Đây</h3>
                <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Ngày</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Dàn Số</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">KQ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {history.slice(0, 10).map((item, idx) => {
                                const predicted = JSON.parse(item.predicted_pairs || '[]');
                                const isWin = item.is_correct === 1;
                                const hasResult = !!item.actual_result;

                                return (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                            {formatShortDate(item.draw_date)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-center gap-1.5">
                                                {predicted.slice(0, 5).map((n: string, i: number) => {
                                                    const isMatched = item.accuracy_notes?.includes(n);
                                                    return (
                                                        <span key={i} className={`text-xs font-bold px-1.5 py-0.5 rounded ${isMatched ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                                                            }`}>
                                                            {n}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm">
                                            {hasResult ? (
                                                <span className={`font-bold ${isWin ? 'text-green-600' : 'text-gray-400'}`}>
                                                    {isWin ? 'WIN' : '-'}
                                                </span>
                                            ) : (
                                                <span className="text-yellow-600 text-xs">Waiting</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div className="p-3 text-center border-t border-gray-100">
                        <a href="#" className="text-xs text-red-600 font-bold hover:underline">Xem tất cả lịch sử</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
