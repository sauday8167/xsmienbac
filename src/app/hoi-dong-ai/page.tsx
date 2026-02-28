'use client';

import { useEffect, useState } from 'react';

interface AIPersonality {
    id: string;
    name: string;
    description: string;
    motto: string;
}

interface FunnelNumber {
    number: string;
    score: number;
    reasons: string[];
    badges: string[];
}

interface FunnelStage {
    level: 1 | 2 | 3 | 4;
    name: string;
    description: string;
    count: number;
    numbers: FunnelNumber[];
}

interface ReflectionLog {
    speaker: string;
    message: string;
    type: 'info' | 'argument' | 'consensus' | 'dissent';
}

interface AIHistoryItem {
    draw_date: string;
    predicted_numbers: string; // JSON string
    accuracy_score: number;
    created_at: string;
}

interface AIFunnelData {
    date: string;
    personalities: AIPersonality[];
    reflectionLog: ReflectionLog[];
    funnel: FunnelStage[];
    finalPrediction: string[];
    history: AIHistoryItem[];
    tactics?: {
        risk_level: string;
        advice: string;
    };
}

export default function DuDoanAI2Page() {
    const [data, setData] = useState<AIFunnelData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/ai-funnel')
            .then(res => res.json())
            .then(res => {
                if (res.success) setData(res.data);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
            <div className="flex flex-col items-center gap-6">
                <div className="relative w-24 h-24">
                    <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-4 bg-purple-500/10 rounded-full animate-pulse flex items-center justify-center text-purple-400 font-black">AI</div>
                </div>
                <div className="text-purple-400 font-bold tracking-widest animate-pulse uppercase text-sm text-center">
                    Hội đồng AI đang học tập & tranh luận...<br />
                    <span className="text-[10px] opacity-70 mt-2 block font-medium uppercase">Gemini Gen-Next-3.5 is thinking</span>
                </div>
            </div>
        </div>
    );

    if (!data) return <div className="p-8 text-center text-red-500">Lỗi kết nối AI. Vui lòng thử lại.</div>;

    const avgAccuracy = data.history.length > 0
        ? (data.history.reduce((a, b) => a + b.accuracy_score, 0) / data.history.length * 100).toFixed(1)
        : '0';

    // The API returns data.date = last draw date in DB.
    // The prediction is for the NEXT draw, so add 1 day.
    const predictionDate = (() => {
        if (!data.date) return '';
        const d = new Date(data.date);
        if (isNaN(d.getTime())) return data.date;
        // API already returns target draw date now
        return d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
    })();

    const formatShortDate = (dateStr: string) => {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans">
            {/* Header / Intro */}
            <div className="bg-[#0f172a] text-white py-12 px-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-block bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] font-black px-4 py-1 rounded-full mb-6 uppercase tracking-[0.2em] shadow-lg shadow-purple-500/20">
                        Gen-Next 3.5 Learning Council
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter leading-none">
                        DỰ ĐOÁN <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400">HỘI ĐỒNG TỰ HỌC</span>
                    </h1>
                    <p className="text-slate-400 text-sm max-w-xl mx-auto mb-6 leading-relaxed font-medium uppercase tracking-wide">
                        "Mỗi sai lầm là một bài học. Hội đồng AI tự học hỏi từ Gemini để nâng cao tỷ lệ trúng mỗi ngày."
                    </p>

                    {/* Lock-time notice */}
                    <div className="inline-flex items-center gap-3 bg-amber-500/10 border border-amber-400/30 rounded-2xl px-5 py-3 mb-8">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-amber-300 text-xs font-black uppercase tracking-wider">Hội đồng chốt số lúc</span>
                            <span className="text-white text-base font-black">08:00</span>
                            <span className="text-amber-300 text-xs font-black uppercase tracking-wider">hàng ngày</span>
                        </div>
                        <div className="w-px h-4 bg-amber-400/30"></div>
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Cập nhật trước giờ XSMB quay số</span>
                    </div>

                    {/* Stats Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-10">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                            <div className="text-emerald-400 text-2xl font-black">{avgAccuracy}%</div>
                            <div className="text-slate-500 text-[10px] font-bold uppercase">Avg Accuracy</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                            <div className="text-purple-400 text-2xl font-black">5</div>
                            <div className="text-slate-500 text-[10px] font-bold uppercase">Experts Online</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                            <div className={`text-${data.tactics?.risk_level === 'low' ? 'emerald' : 'amber'}-400 text-2xl font-black uppercase`}>{data.tactics?.risk_level || 'MED'}</div>
                            <div className="text-slate-500 text-[10px] font-bold uppercase">Market Risk</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                            <div className="text-blue-400 text-2xl font-black">10D</div>
                            <div className="text-slate-500 text-[10px] font-bold uppercase">Memory Window</div>
                        </div>
                    </div>

                    {/* Expert Team Display */}
                    <div className="flex flex-wrap justify-center gap-4 mt-8">
                        {data.personalities.map((p) => (
                            <div key={p.id} className="group transition-all duration-300 hover:-translate-y-1">
                                <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 w-40 text-left shadow-xl hover:border-emerald-500/50 hover:bg-slate-800">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.id === 'gan_expert' ? 'from-rose-500 to-red-700' : 'from-purple-500 to-pink-500'} mb-3 flex items-center justify-center text-white font-black text-xs shadow-lg ring-2 ring-white/5`}>
                                        {p.name.charAt(0)}
                                    </div>
                                    <div className="text-white font-bold text-xs truncate mb-1">{p.name}</div>
                                    <div className="text-slate-500 text-[10px] font-bold uppercase tracking-tighter">{p.id === 'gan_expert' ? 'Risk Auditor' : 'Expert'}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 mt-[-40px] relative z-20">

                {/* 1. Learning Corner */}
                <div className="mb-12">
                    <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-200 p-8 flex flex-col">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                <span className="font-black text-xs">AI</span>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Góc Học Tập (Gemini)</h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Phân tích sai lầm & Chiến thuật</p>
                            </div>
                        </div>
                        <div className="flex-1 space-y-4">
                            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4">
                                <p className="text-slate-600 text-xs italic leading-relaxed">
                                    "{data.tactics?.advice || 'AI đang tiếp tục thu thập dữ liệu về các nhịp số biến động để đưa ra lời khuyên tối ưu cho phiên này.'}"
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <span className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Mục tiêu</span>
                                    <span className="text-xs font-black text-emerald-600">≥ 2 nháy hôm nay</span>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <span className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Trạng thái</span>
                                    <span className="text-xs font-black text-blue-600">Đã cập nhật Memory</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. The Debate Group Chat UI */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden mb-12 flex flex-col h-[600px]">
                    <div className="bg-slate-900 px-8 py-6 flex items-center justify-between border-b border-slate-800">
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-3">
                                {data.personalities.map(p => (
                                    <div key={p.id} className={`w-8 h-8 rounded-full border-2 border-slate-900 ${p.id === 'gan_expert' ? 'bg-rose-500' : 'bg-slate-700'} flex items-center justify-center text-[10px] font-bold text-white ring-1 ring-purple-500/30`}>AI</div>
                                ))}
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-white uppercase tracking-[0.15em]">Phòng Họp Hội Đồng</h2>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Đang Trực Tuyến</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#f1f5f9] space-y-6">
                        {data.reflectionLog.map((log, idx) => {
                            const isSystem = log.speaker === 'Hệ thống';
                            const isGan = log.speaker === 'Chuyên Gia Gan';
                            return (
                                <div key={idx} className={`flex flex-col ${isSystem ? 'items-center' : 'items-start'}`}>
                                    {isSystem ? (
                                        <div className="bg-slate-200 text-slate-500 text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-widest mb-2">
                                            {log.message}
                                        </div>
                                    ) : (
                                        <div className="max-w-[85%] animate-in slide-in-from-left-4 duration-500">
                                            <div className="flex items-center gap-2 mb-1.5 ml-2">
                                                <span className={`text-[10px] font-black uppercase tracking-tight ${isGan ? 'text-rose-600' : 'text-slate-500'}`}>{log.speaker}</span>
                                                <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-bold uppercase ${log.type === 'consensus' ? 'bg-green-100 text-green-600' :
                                                    log.type === 'dissent' ? 'bg-rose-100 text-rose-600' :
                                                        log.type === 'argument' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
                                                    }`}>
                                                    {log.type}
                                                </span>
                                            </div>
                                            <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm border ${log.type === 'consensus' ? 'bg-green-50 border-green-100 text-green-900 rounded-tl-none' :
                                                log.type === 'dissent' ? 'bg-rose-50 border-rose-100 text-rose-900 rounded-tl-none font-bold' :
                                                    'bg-white border-slate-200 text-slate-700 rounded-tl-none'
                                                }`}>
                                                {log.message}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <div className="bg-white p-4 border-t border-slate-100 flex items-center justify-between px-8">
                        <div className="flex gap-2">
                            <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hội đồng đang ghi nhận...</span>
                    </div>
                </div>

                {/* 3. Visual Funnel Stages */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
                    {data.funnel.map((stage) => (
                        <div key={stage.level} className="relative group">
                            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 h-full transition-all duration-500 hover:shadow-2xl hover:border-purple-200">
                                <div className="text-[10px] font-black text-purple-600 mb-2 uppercase tracking-widest bg-purple-50 inline-block px-3 py-1 rounded-lg">Giai Đoạn {stage.level}</div>
                                <h3 className="text-lg font-black text-slate-900 mb-1">{stage.name}</h3>
                                <p className="text-slate-400 text-[10px] font-bold uppercase mb-4 tracking-tighter">{stage.description}</p>
                                <div className="text-3xl font-black text-slate-900 mb-4">{stage.count} <span className="text-xs text-slate-400">số</span></div>
                                <div className="flex flex-wrap gap-1.5">
                                    {stage.numbers.slice(0, 10).map((num, nidx) => (
                                        <div key={nidx} className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600">
                                            {num.number}
                                        </div>
                                    ))}
                                    {stage.numbers.length > 10 && (
                                        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-[10px] font-black text-white">
                                            +{stage.numbers.length - 10}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 4. Final VIP Predictions – with clear date label */}
                <div className="bg-slate-900 rounded-[3rem] p-1 shadow-2xl overflow-hidden mb-12 ring-4 ring-white shadow-slate-300">
                    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 md:p-14 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
                            <div className="absolute top-[-50%] left-[-20%] w-[100%] h-[200%] bg-gradient-to-r from-emerald-500/20 to-transparent rotate-12 blur-3xl"></div>
                        </div>

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 mb-4">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
                                <span className="text-[10px] text-white font-black uppercase tracking-[0.2em]">Dàn Số Đồng Thuận VIP</span>
                            </div>

                            {/* *** Prediction Date Label *** */}
                            <div className="mb-8">
                                <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 px-5 py-2 rounded-2xl">
                                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-emerald-300 text-sm font-bold">Dự đoán cho kỳ:</span>
                                    <span className="text-white text-base font-black">{predictionDate}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-12">
                                {data.finalPrediction.map((num, idx) => (
                                    <div key={idx} className="group relative">
                                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-indigo-600 rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
                                        <div className="relative w-24 h-24 md:w-32 md:h-32 bg-white rounded-full flex items-center justify-center text-3xl md:text-5xl font-black text-slate-900 shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                                            {num}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="max-w-2xl mx-auto bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-emerald-200 text-sm font-bold uppercase tracking-widest">Kết luận Gen-Next 3.5</p>
                                    <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/30 rounded-full px-3 py-1">
                                        <svg className="w-3 h-3 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-amber-300 text-[10px] font-black uppercase tracking-widest">Chốt số: 08:00 hàng ngày</span>
                                    </div>
                                </div>
                                <p className="text-white text-lg font-medium leading-relaxed italic">
                                    "Hội đồng đã rút kinh nghiệm từ 10 ngày qua và điều chỉnh chiến thuật. Bộ số này được bảo vệ bởi Chuyên Gia Gan để giảm thiểu tối đa rủi ro."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. History Table – Full Width, styled like /du-doan-ai */}
                <div className="pt-4">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Lịch Sử 10 Ngày Gần Nhất</h3>
                            <p className="text-sm text-gray-500 mt-1">Thống kê kết quả dự đoán các kỳ đã có kết quả xổ số</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1.5 rounded-lg">AVG: {avgAccuracy}%</span>
                            <span className="bg-slate-100 text-slate-700 text-[10px] font-black px-3 py-1.5 rounded-lg">MEM: 10D</span>
                        </div>
                    </div>

                    <div className="bg-white shadow-2xl border border-gray-100 rounded-3xl overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Kỳ xổ số</th>
                                    <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Hội đồng đề xuất</th>
                                    <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Tỉ lệ trúng</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng Thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {(() => {
                                    const evaluated = data.history.filter(h => h.accuracy_score > 0);
                                    if (evaluated.length === 0) {
                                        return (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-10 text-center text-slate-400 text-sm italic">
                                                    Chưa có dữ liệu lịch sử được đánh giá. Hệ thống sẽ tự động cập nhật sau mỗi kỳ xổ số.
                                                </td>
                                            </tr>
                                        );
                                    }
                                    return evaluated.slice(0, 10).map((h, i) => {
                                        const predicted: string[] = (() => {
                                            try { return JSON.parse(h.predicted_numbers); } catch { return []; }
                                        })();
                                        const hitPercent = Math.round(h.accuracy_score * 100);
                                        const isWin = h.accuracy_score >= 0.4;

                                        return (
                                            <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-5 text-sm font-bold text-gray-900">
                                                    {formatShortDate(h.draw_date)}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex justify-center flex-wrap gap-1.5">
                                                        {predicted.slice(0, 5).map((n, ni) => (
                                                            <span key={ni} className="text-xs font-black w-8 h-8 rounded-lg flex items-center justify-center shadow-sm border bg-white text-gray-700 border-gray-100">
                                                                {n}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <div className={`inline-flex items-center gap-1 font-black text-xs px-2 py-1 rounded-full ${isWin ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        {hitPercent}% Hit
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <div className={`inline-flex items-center gap-1.5 font-black text-[10px] px-3 py-1 rounded-full ${isWin
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-400'
                                                        }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${isWin ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                                                        {isWin ? 'SUCCESS' : 'FAILED'}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    });
                                })()}

                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
            `}</style>
        </div>
    );
}
