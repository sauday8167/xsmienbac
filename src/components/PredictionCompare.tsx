'use client';

import { useEffect, useState } from 'react';

interface CompareData {
    draw_date: string;
    predicted_pairs: string;
    actual_result: string | null;
    is_correct: number;
    accuracy_notes: string;
}

interface PredictionCompareProps {
    apiDate: string; // yyyy-mm-dd
    specialPrize: string;
    allLoto: string[]; // all 2-digit loto from this draw
}

export default function PredictionCompare({ apiDate, specialPrize, allLoto }: PredictionCompareProps) {
    const [data, setData] = useState<CompareData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/ai-prediction/by-date?date=${apiDate}`)
            .then(r => r.json())
            .then(d => { if (d.success) setData(d.data); })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [apiDate]);

    if (loading) return null;
    if (!data) return null;

    const predicted: string[] = (() => {
        try { return JSON.parse(data.predicted_pairs || '[]'); } catch { return []; }
    })();

    if (predicted.length === 0) return null;

    const matched = predicted.filter(n => allLoto.includes(n));
    const hitRate = predicted.length > 0 ? Math.round(matched.length / predicted.length * 100) : 0;

    return (
        <div className="mt-6 bg-slate-900 rounded-xl overflow-hidden text-white">
            <div className="px-5 py-3 border-b border-slate-700 flex items-center justify-between">
                <h3 className="font-bold text-sm uppercase tracking-wide text-slate-200">
                    So sánh dự đoán AI vs thực tế
                </h3>
                <div className={`text-[10px] font-black px-2 py-0.5 rounded ${
                    matched.length >= 2 ? 'bg-green-500 text-white' : matched.length >= 1 ? 'bg-yellow-500 text-black' : 'bg-slate-700 text-slate-300'
                }`}>
                    {matched.length >= 2 ? 'KPI ĐẠT' : matched.length === 1 ? '1 NHÁY' : 'MISS'}
                </div>
            </div>

            <div className="p-5">
                <div className="flex flex-wrap gap-2 mb-4">
                    {predicted.map((n, i) => {
                        const hit = allLoto.includes(n);
                        return (
                            <div key={i} className={`relative w-10 h-10 rounded-lg flex items-center justify-center font-black text-lg border-2 transition-all ${
                                hit
                                    ? 'bg-green-500 border-green-400 text-white scale-110 shadow-lg shadow-green-500/30'
                                    : 'bg-slate-800 border-slate-700 text-slate-400'
                            }`}>
                                {n}
                                {hit && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-slate-900"></div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                    <div className="bg-slate-800 rounded-lg p-2">
                        <div className="text-slate-400 mb-0.5">Dự đoán</div>
                        <div className="font-black text-white text-lg">{predicted.length} số</div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-2">
                        <div className="text-slate-400 mb-0.5">Nháy</div>
                        <div className={`font-black text-lg ${matched.length >= 2 ? 'text-green-400' : matched.length === 1 ? 'text-yellow-400' : 'text-slate-500'}`}>
                            {matched.length} số
                        </div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-2">
                        <div className="text-slate-400 mb-0.5">Tỷ lệ hit</div>
                        <div className="font-black text-purple-400 text-lg">{hitRate}%</div>
                    </div>
                </div>

                {matched.length > 0 && (
                    <div className="mt-3 text-xs text-slate-400 text-center">
                        Số trúng: {matched.map(n => <span key={n} className="font-bold text-green-400 mx-1">{n}</span>)}
                    </div>
                )}
            </div>
        </div>
    );
}
