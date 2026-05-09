'use client';

import { useState, useEffect } from 'react';

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

export default function AIPredictionClient() {
    const [prediction, setPrediction] = useState<AIPrediction | null>(null);
    const [history, setHistory] = useState<AIHistory[]>([]);
    const [realAccuracy, setRealAccuracy] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resLatest = await fetch('/api/ai-prediction/latest', { cache: 'no-store' });
                const dataLatest = await resLatest.json();
                if (dataLatest.success) {
                    setPrediction(dataLatest.data);
                } else {
                    setPrediction({
                        draw_date: new Date().toISOString(),
                        analysis_content: JSON.stringify({
                            summary: dataLatest.error || 'Dữ liệu AI đang được tính toán, vui lòng quay lại sau.',
                            top_evidence: [],
                            advice: 'Hệ thống đang chờ lệnh chạy AI đầu tiên.'
                        }),
                        predicted_pairs: '[]',
                        confidence_score: 0
                    });
                }

                const resHistory = await fetch('/api/ai-prediction/history', { cache: 'no-store' });
                const dataHistory = await resHistory.json();
                if (dataHistory.success) {
                    const hist: AIHistory[] = dataHistory.data;
                    setHistory(hist);

                    // Tính accuracy thực tế từ các ngày đã có kết quả
                    const verified = hist.filter(h => h.actual_result !== null);
                    if (verified.length > 0) {
                        const wins = verified.filter(h => h.is_correct === 1).length;
                        setRealAccuracy(Math.round((wins / verified.length) * 100));
                    }
                }
            } catch {
                setPrediction({
                    draw_date: new Date().toISOString(),
                    analysis_content: JSON.stringify({
                        summary: 'Lỗi kết nối tới máy chủ AI.',
                        top_evidence: [],
                        advice: 'Lỗi mạng.'
                    }),
                    predicted_pairs: '[]',
                    confidence_score: 0
                });
            }
        };
        fetchData();
    }, []);

    const formatShortDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    };

    const getAnalysisData = (content: string) => {
        try {
            const match = content.match(/```json\s*([\s\S]*?)\s*```/);
            const jsonStr = match ? match[1] : content;
            const data = JSON.parse(jsonStr);
            return {
                summary: data.summary || data.analysis?.summary || data.reasoning || 'Đang cập nhật phân tích...',
                evidence: data.top_evidence || data.analysis?.top_evidence || data.key_insights || [],
                advice: data.advice || data.analysis?.advice || '',
                top7Detail: data.top7_detail || null,
            };
        } catch {
            return null;
        }
    };

    const getPredictedPairs = (): string[] => {
        if (!prediction) return [];
        try {
            return typeof prediction.predicted_pairs === 'string'
                ? JSON.parse(prediction.predicted_pairs)
                : prediction.predicted_pairs;
        } catch {
            return [];
        }
    };

    const getVotingScores = (): Record<string, number> => {
        if (!prediction) return {};
        try {
            const data = JSON.parse(prediction.analysis_content);
            return data.voting_scores || {};
        } catch {
            return {};
        }
    };

    const accuracyDisplay = realAccuracy !== null ? `${realAccuracy}%` : '–';
    const verifiedCount = history.filter(h => h.actual_result !== null).length;

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-12 font-sans">
            <div className="text-center space-y-2 pt-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-bold uppercase tracking-wider border border-purple-100 shadow-sm">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                    </span>
                    Statistical Voting Engine v2
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                    Dự Đoán <span className="text-red-600">Thống Kê Bỏ Phiếu</span>
                </h1>
                <p className="text-gray-500 max-w-lg mx-auto text-sm">
                    6 phương pháp thống kê độc lập cùng bỏ phiếu cho từng số, chọn ra 7 số có tổng điểm cao nhất để đạt KPI 2+ nháy.
                </p>
            </div>

            {prediction ? (
                <>
                    <div className="bg-slate-900 rounded-3xl shadow-2xl overflow-hidden text-white relative border border-slate-800">
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-red-500 via-transparent to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>

                        <div className="p-8 md:p-12 text-center relative z-10">
                            <div className="flex justify-between items-start mb-8">
                                <div className="text-left">
                                    <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">Kỳ phân tích</h2>
                                    <div className="text-xl font-bold text-white">
                                        {new Date(prediction.draw_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-lg">
                                        <span className="text-red-400 text-[10px] font-bold">MỤC TIÊU KPI: 2+ NHÁY với 7 số</span>
                                    </div>
                                </div>
                            </div>

                            {/* 7 số dự đoán — grid flex-wrap */}
                            {(() => {
                                const pairs = getPredictedPairs();
                                const vScores = getVotingScores();
                                return (
                                    <div className="flex flex-wrap justify-center gap-4 mb-10">
                                        {pairs.map((num: string, idx: number) => (
                                            <div key={idx} className="group relative flex flex-col items-center">
                                                <div className={`absolute -inset-3 rounded-full blur-xl opacity-30 group-hover:opacity-80 transition duration-500 ${idx === 0 ? 'bg-gradient-to-tr from-red-600 to-amber-500' : 'bg-gradient-to-tr from-blue-600 to-purple-500'}`}></div>
                                                <div className={`relative w-16 h-16 md:w-20 md:h-20 text-slate-900 rounded-full flex items-center justify-center font-black text-3xl md:text-4xl shadow-2xl border-4 border-slate-900 ${idx === 0 ? 'bg-gradient-to-br from-amber-300 to-amber-500' : 'bg-white'}`}>
                                                    {num}
                                                </div>
                                                {idx === 0 && (
                                                    <div className="absolute -top-2 -right-2 bg-red-600 text-[8px] font-black px-1.5 py-0.5 rounded rotate-12 shadow-lg border border-red-400 uppercase">
                                                        #1
                                                    </div>
                                                )}
                                                {vScores[num] !== undefined && (
                                                    <span className="mt-1.5 text-[10px] font-bold text-slate-400">{vScores[num]}đ</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-slate-800/50">
                                <div className="p-3 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                                    <div className="text-xs text-slate-500 font-bold uppercase mb-1">Xác suất KPI</div>
                                    <div className="text-xl font-black text-green-400">~60%</div>
                                </div>
                                <div className="p-3 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                                    <div className="text-xs text-slate-500 font-bold uppercase mb-1">Engine</div>
                                    <div className="text-xl font-black text-purple-400">STATS</div>
                                </div>
                                <div className="p-3 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                                    <div className="text-xs text-slate-500 font-bold uppercase mb-1">Số chọn</div>
                                    <div className="text-xl font-black text-yellow-400">7 số</div>
                                </div>
                                <div className="p-3 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                                    <div className="text-xs text-slate-500 font-bold uppercase mb-1">Phương pháp</div>
                                    <div className="text-xl font-black text-blue-400">6 votes</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-6">
                            {(() => {
                                const data = getAnalysisData(prediction.analysis_content);
                                if (!data) return null;

                                return (
                                    <>
                                        <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
                                            <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-8 h-8 bg-red-600 text-white rounded-lg flex items-center justify-center">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                    </span>
                                                    <h3 className="font-black text-red-900 uppercase tracking-tight text-sm">Phân tích thống kê</h3>
                                                </div>
                                                <span className="text-[10px] font-bold bg-red-200 text-red-700 px-2 py-0.5 rounded">6 PHƯƠNG PHÁP</span>
                                            </div>
                                            <div className="p-6">
                                                <div className="bg-red-50/30 p-4 rounded-xl border border-red-100/50 italic text-red-900 leading-relaxed text-sm">
                                                    "{data.summary}"
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                                                <h3 className="font-black text-gray-900 uppercase tracking-tight text-sm">Căn cứ chốt số</h3>
                                            </div>
                                            <div className="p-6">
                                                <ul className="space-y-4">
                                                    {data.evidence.map((item: string, idx: number) => (
                                                        <li key={idx} className="flex gap-4 items-start group">
                                                            <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-black text-[10px] mt-0.5 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                                                {idx + 1}
                                                            </span>
                                                            <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>

                        <div className="space-y-6">
                            <div className="bg-slate-900 rounded-2xl shadow-lg p-6 text-white text-center relative overflow-hidden">
                                <div className="absolute -top-4 -right-4 w-24 h-24 bg-red-600/20 rounded-full blur-2xl"></div>
                                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
                                    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                                </div>
                                <h4 className="font-black text-[10px] uppercase tracking-widest mb-2 opacity-80">Lời khuyên</h4>
                                <div className="text-lg font-black mb-3">LƯU Ý CHIẾN THUẬT</div>
                                <div className="text-[11px] text-slate-300 leading-normal italic">
                                    {(() => {
                                        const data = getAnalysisData(prediction.analysis_content);
                                        return data?.advice || 'Đang chốt lời khuyên...';
                                    })()}
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Mục tiêu:</div>
                                    <div className="text-xs font-black text-red-500">2+ NHÁY với 7 số</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-white rounded-xl p-12 text-center shadow border border-gray-200">
                    <div className="animate-pulse flex justify-center mb-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                    </div>
                    <h2 className="text-xl font-medium text-gray-900">Đang tải dữ liệu...</h2>
                    <p className="text-gray-500 mt-2">Đang tải kết quả phân tích thống kê...</p>
                </div>
            )}

            <div className="pt-12 border-t border-gray-100 text-center">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Nhật ký dự đoán</h3>
                    <div className="flex gap-2">
                        <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-1 rounded">
                            THỰC TẾ: {accuracyDisplay}
                        </span>
                        <span className="bg-gray-100 text-gray-700 text-[10px] font-black px-2 py-1 rounded">
                            {verifiedCount > 0 ? `${verifiedCount} NGÀY ĐÃ KIỂM TRA` : 'CHƯA CÓ DỮ LIỆU'}
                        </span>
                    </div>
                </div>

                <div className="bg-white shadow-2xl border border-gray-100 rounded-3xl overflow-hidden text-left">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Thời gian</th>
                                <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">7 số đã chọn</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {history.slice(0, 10).map((item, idx) => {
                                const predicted: string[] = (() => {
                                    try { return JSON.parse(item.predicted_pairs || '[]'); } catch { return []; }
                                })();
                                const isWin = item.is_correct === 1;
                                const hasResult = !!item.actual_result;

                                return (
                                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-5 text-sm font-bold text-gray-900">
                                            {formatShortDate(item.draw_date)}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-wrap justify-center gap-1.5">
                                                {predicted.map((n: string, i: number) => {
                                                    const isMatched = item.accuracy_notes?.includes(n);
                                                    return (
                                                        <span key={i} className={`text-xs font-black w-8 h-8 rounded-lg flex items-center justify-center shadow-sm border ${isMatched
                                                            ? 'bg-red-600 text-white border-red-500 scale-110'
                                                            : 'bg-white text-gray-500 border-gray-100'
                                                        }`}>
                                                            {n}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            {hasResult ? (
                                                <div className={`inline-flex items-center gap-1.5 font-black text-[10px] px-3 py-1 rounded-full ${isWin
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-400'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${isWin ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                                                    {isWin ? 'SUCCESS' : 'FAILED'}
                                                </div>
                                            ) : (
                                                <div className="text-amber-600 font-black text-[10px] animate-pulse">
                                                    PENDING...
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-10 p-6 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-700 leading-relaxed text-justify shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Giới thiệu về Dự Đoán Thống Kê</h2>
                <p>
                    Hệ thống <strong>Bỏ Phiếu Thống Kê (Statistical Voting Engine)</strong> sử dụng 6 phương pháp phân tích dữ liệu độc lập —
                    lô rơi GĐB, tần suất 30 ngày, Bạc Nhớ nhiều khung, lô gan chín, bias theo thứ trong tuần, và mô hình follow-up GĐB —
                    để bỏ phiếu cho từng số từ 00–99. 7 số có tổng điểm bỏ phiếu cao nhất được chọn mỗi ngày.
                    Với 7 số, xác suất cơ sở để đạt KPI 2+ nháy tăng từ ~18% (3 số) lên ~60%, phản ánh đúng thực tế thống kê xổ số.
                    AI chỉ đóng vai trò viết phần giải thích ngắn gọn — không tham gia chọn số.
                </p>
            </div>
        </div>
    );
}
