'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Target, TrendingUp, ShieldCheck, Info, Award, History, ChevronRight } from 'lucide-react';
import JsonLd from '@/components/seo/JsonLd';
import { generateManualArticleSchema, generateBreadcrumbSchema } from '@/lib/schema-generator';

export default function HoiDongDePage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/hoi-dong-de');
                const result = await response.json();
                if (result.success) {
                    setData(result.data);
                } else {
                    setError(result.error);
                }
            } catch (err) {
                setError('Không thể tải dữ liệu hội đồng.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const breadcrumbs = [
        { name: 'Trang chủ', item: '/' },
        { name: 'Hội Đồng Đề', item: '/hoi-dong-de' }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
            </div>
        );
    }

    const current = data?.current;
    if (!current) return <div className="p-20 text-center">Chưa có dữ liệu dự báo cho hôm nay.</div>;

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            <JsonLd data={generateManualArticleSchema('Hội Đồng Đề - Dự Đoán Dàn Đề 36 Số Miền Bắc', 'Phân tích chuyên sâu Giải Đặc Biệt từ Hội đồng chuyên gia AI & Big Data.', '/hoi-dong-de')} />
            <JsonLd data={generateBreadcrumbSchema(breadcrumbs)} />

            {/* 1. Hero Header */}
            <div className="relative bg-slate-900 pt-20 pb-40 overflow-hidden border-b border-white/5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_-20%,_var(--tw-gradient-stops))] from-indigo-600/20 via-transparent to-transparent"></div>
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]"></div>

                <div className="container mx-auto px-4 max-w-5xl relative z-10 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-indigo-400 rounded-full text-xs font-bold uppercase tracking-wider border border-white/10 backdrop-blur-md mb-6">
                        <ShieldCheck size={12} /> Special Prize Consensus Engine
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
                        Hội Đồng <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Đề</span>
                    </h1>
                    <p className="text-slate-400 max-w-2xl text-lg mb-8">
                        Hệ thống tự học phân tích Giải Đặc Biệt dựa trên đa thuật toán. Tự động tối ưu hóa sau mỗi kỳ quay.
                    </p>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-400 text-sm">
                        <span className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                            <Calendar size={14} className="text-indigo-500" /> Kỳ quay: {current.draw_date}
                        </span>
                        <span className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                            <Target size={14} className="text-red-500" /> Dàn 36 số
                        </span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-5xl -mt-16 sm:-mt-24 relative z-20 space-y-8">
                {/* 2. Main Prediction - Dàn 36 */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-900/10 border border-indigo-100 overflow-hidden">
                    <div className="p-8 md:p-12">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 flex items-center justify-center md:justify-start gap-2">
                                    <Award className="text-indigo-600" /> DÀN ĐỀ 36 SỐ HÔM NAY
                                </h2>
                                <p className="text-sm text-slate-500 text-center md:text-left">Tổ hợp có xác suất nổ cao nhất cho Giải Đặc Biệt</p>
                            </div>
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(current.prediction_36.join(', '));
                                    alert('Đã sao chép dàn 36 số!');
                                }}
                                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95 whitespace-nowrap"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                </svg>
                                COPY DÀN SỐ
                            </button>
                        </div>

                        <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-12 gap-3 md:gap-4">
                            {current.prediction_36.map((num: string, idx: number) => (
                                <div key={num} className="group relative aspect-square">
                                    <div className="absolute inset-0 bg-indigo-600 rounded-2xl opacity-0 group-hover:opacity-10 scale-90 group-hover:scale-110 transition duration-300"></div>
                                    <div className="h-full w-full bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-xl md:text-2xl font-black text-slate-800 shadow-sm group-hover:bg-white group-hover:border-indigo-200 group-hover:text-indigo-600 transition duration-300">
                                        {num}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. Analysis Strategy */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm h-full">
                        <div className="flex items-center gap-2 text-indigo-600 mb-4">
                            <Info size={18} />
                            <span className="text-xs font-black uppercase tracking-[0.2em]">Chiến thuật hội đồng</span>
                        </div>
                        <div className="text-slate-600 leading-relaxed text-lg italic">
                             "{current.analysis_meta.top_rule || "Phân tích tổ hợp đa luồng: Tổng + Chạm + Ghép Biên."}"
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-3xl p-8 text-white h-full relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"></div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-4">Trọng số phân tích</h3>
                        <div className="space-y-4">
                            {Object.entries(current.analysis_meta.weights || {}).map(([name, weight]: [string, any]) => (
                                <div key={name}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="uppercase text-slate-400 font-bold">{name}</span>
                                        <span className="text-indigo-400">{(weight * 10).toFixed(0)}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(weight as number / 1.5) * 100}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 4. Historical Log */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-200/60 overflow-hidden relative">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black flex items-center gap-3 uppercase tracking-tight text-slate-900">
                                <History className="text-indigo-500" /> Nhật ký dự đoán 10 ngày
                            </h2>
                            <p className="text-slate-500 text-sm mt-1">Lịch sử hiệu quả của dàn Đề 36 số</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="py-4 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Ngày</th>
                                    <th className="py-4 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Dàn Đề Đề Xuất</th>
                                    <th className="py-4 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Kết quả (Đề)</th>
                                    <th className="py-4 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.history?.map((h: any, i: number) => (
                                    <tr key={i} className="group border-b border-slate-50 hover:bg-slate-50/80 transition-all">
                                        <td className="py-6 px-4 font-bold text-slate-800">{h.draw_date}</td>
                                        <td className="py-6 px-4">
                                            <div className="text-[10px] text-slate-400 max-w-[300px] truncate">
                                                {h.prediction_36.join(', ')}
                                            </div>
                                        </td>
                                        <td className="py-6 px-4 text-center">
                                            <span className="bg-slate-900 text-white px-3 py-1 rounded-lg font-black text-sm">
                                                {h.actual_de || '--'}
                                            </span>
                                        </td>
                                        <td className="py-6 px-4 text-right">
                                            {h.actual_de ? (
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${h.is_hit ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'bg-slate-100 text-slate-400'}`}>
                                                    {h.is_hit ? '🎯 TRÚNG ĐỀ' : 'CHƯA TRÚNG'}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-indigo-400 animate-pulse">🕒 ĐANG ĐỢI...</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .bg-grid-white {
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='white' stroke-opacity='0.1'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E");
                }
            ` }} />
        </div>
    );
}
