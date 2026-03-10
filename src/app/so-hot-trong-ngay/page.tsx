import React from 'react';
import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import { Calendar, Star, TrendingUp, Target, ShieldCheck, Users, Link as LinkIcon, ChevronRight, Info } from 'lucide-react';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
    title: 'Số Hot Trong Ngày - Hội Đồng Chuyên Gia AI & Big Data',
    description: 'Tổng hợp phân tích từ hàng trăm video phân tích Youtube và Website để tìm ra sự đồng thuận về các con số XSMB hôm nay.',
    alternates: {
        canonical: 'https://xosomienbac24h.com/so-hot-trong-ngay'
    }
};

async function getSoHotData() {
    const filePath = path.join(process.cwd(), 'src', 'data', 'so-hot.json');
    if (!fs.existsSync(filePath)) return null;
    try {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(fileContents);
    } catch (e) {
        return null;
    }
}

async function getSoHotHistory() {
    try {
        const history = await query(`
            SELECT * FROM so_hot_history 
            ORDER BY draw_date DESC 
            LIMIT 10
        `);
        return history || [];
    } catch (e) {
        console.error("Lỗi lấy lịch sử Số Hot:", e);
        return [];
    }
}

export default async function SoHotTrongNgayPage() {
    const [rawData, history] = await Promise.all([
        getSoHotData(),
        getSoHotHistory()
    ]);

    if (!rawData || !rawData.data) {
        return (
            <div className="container mx-auto px-4 py-20 max-w-4xl text-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Số Hot Trong Ngày</h1>
                    <p className="text-gray-500 max-w-sm">Hệ thống đang tổng hợp dữ liệu từ YouTube và Website. Vui lòng quay lại sau 17:00.</p>
                </div>
            </div>
        );
    }

    const { date, last_updated, sources, data } = rawData;
    const hotNumbers = (data.hot_numbers || []).filter((item: any) =>
        item.number && item.number.toString().trim().length === 2
    );

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* 1. Hero Header - Ultra Modern */}
            <div className="relative bg-slate-900 pt-12 pb-24 overflow-hidden border-b border-white/5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_-20%,_var(--tw-gradient-stops))] from-red-600/20 via-transparent to-transparent"></div>
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]"></div>

                <div className="container mx-auto px-4 max-w-5xl relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-red-400 rounded-full text-xs font-bold uppercase tracking-wider border border-white/10 backdrop-blur-md mb-6">
                        <Users size={12} /> Gen-AI Consensus Engine
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
                        Số Nóng <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Hội Đồng</span>
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm">
                        <span className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                            <Calendar size={14} className="text-red-500" /> {date}
                        </span>
                        <span className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                            <Users size={14} className="text-blue-500" /> {sources?.length || 0} Nguồn phân tích
                        </span>
                        <span className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50 animate-pulse">
                            <ShieldCheck size={14} className="text-green-500" /> Chốt: 17:00
                        </span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-5xl -mt-12 space-y-8">
                {/* 2. Top Consensus - The "Big Number" display */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-red-900/10 border border-red-100 overflow-hidden">
                    <div className="p-8 md:p-12">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                    <TrendingUp className="text-red-600" /> TOP SỐ ĐỒNG THUẬN CAO
                                </h2>
                                <p className="text-sm text-slate-500">Các con số được nhắc đến nhiều nhất trong ngày</p>
                            </div>
                            <div className="hidden md:block">
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded tracking-tighter uppercase">Confidence Metric v2.0</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                            {hotNumbers.slice(0, 5).map((item: any, idx: number) => (
                                <div key={idx} className="group flex flex-col items-center">
                                    <div className="relative mb-4">
                                        <div className="absolute -inset-4 bg-gradient-to-tr from-red-600 to-orange-600 rounded-full blur-xl opacity-0 group-hover:opacity-20 transition duration-500"></div>
                                        <div className="relative w-20 h-20 md:w-28 md:h-28 bg-white rounded-full flex items-center justify-center text-4xl md:text-5xl font-black text-slate-900 border-[6px] border-slate-50 shadow-xl group-hover:scale-110 group-hover:border-red-50 transition duration-300">
                                            {item.number}
                                            {idx === 0 && (
                                                <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-1 rounded-md rotate-12 shadow-lg border-2 border-white uppercase">TOP 1</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Nguồn nhắc đến</span>
                                        <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-black border border-red-100 shadow-sm">
                                            {item.count} CHUYÊN GIA
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. Detailed Selections Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Bach Thu Lo */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 transition hover:shadow-md">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center">
                                <Target size={24} />
                            </div>
                            <h3 className="font-bold text-slate-900">Bạch Thủ Lô</h3>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {data.bach_thu_lo?.map((n: string, i: number) => (
                                <span key={i} className="bg-red-600 text-white w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shadow-lg shadow-red-200">{n}</span>
                            ))}
                        </div>
                    </div>

                    {/* Song Thu Lo */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 transition hover:shadow-md">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
                                <TrendingUp size={24} />
                            </div>
                            <h3 className="font-bold text-slate-900">Song Thủ Lô</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {data.song_thu_lo?.map((n: string, i: number) => (
                                <span key={i} className="bg-white border-2 border-green-500 text-green-700 px-4 py-2 rounded-xl font-bold">{n}</span>
                            ))}
                        </div>
                    </div>

                    {/* Dan De */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 transition hover:shadow-md">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                                <Star size={24} />
                            </div>
                            <h3 className="font-bold text-slate-900">Tiềm Năng Khác</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {data.dan_de?.slice(0, 10).map((n: string, i: number) => (
                                <span key={i} className="text-slate-600 font-bold text-sm bg-slate-50 px-2 py-1 rounded-md">{n}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 4. Analysis Summary */}
                <div className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm">
                    <div className="flex items-center gap-2 text-red-600 mb-4">
                        <Info size={18} />
                        <span className="text-xs font-black uppercase tracking-[0.2em]">Báo cáo từ Hội đồng Chuyên gia</span>
                    </div>
                    <div className="text-slate-600 leading-relaxed text-lg italic">
                        "{data.tom_tat}"
                    </div>
                </div>

                {/* 5. Sources List - AI Studio Transparency Style */}
                <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden">
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-[100px]"></div>

                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black flex items-center gap-3 uppercase tracking-tight">
                                <Users className="text-red-500" /> Hệ thống dữ liệu đầu vào
                            </h2>
                            <p className="text-slate-400 text-sm mt-1">Dữ liệu được khai thác công khai từ {sources?.length || 0} nguồn chuyên sâu</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {sources?.map((s: any, i: number) => (
                            <a
                                key={i}
                                href={s.url}
                                target="_blank"
                                rel="nofollow"
                                className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition group"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0 text-xs font-black">
                                        {i + 1}
                                    </div>
                                    <span className="text-sm font-medium text-slate-200 truncate pr-4">{s.title}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 group-hover:text-white transition">
                                    <LinkIcon size={14} />
                                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </a>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10 text-center">
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">
                            ⚠️ Dữ liệu tổng hợp từ Big Data chỉ mang tính tham khảo giải trí miễn phí.
                        </p>
                    </div>
                </div>
                {/* 6. Prediction Log - Historical Accuracy */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-200/60 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl"></div>

                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div>
                            <h2 className="text-2xl font-black flex items-center gap-3 uppercase tracking-tight text-slate-900 font-sans">
                                <TrendingUp className="text-green-500" /> Nhật ký dự đoán 10 ngày
                            </h2>
                            <p className="text-slate-500 text-sm mt-1">Lịch sử độ chính xác và sự đồng thuận của hội đồng</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto relative z-10">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="py-4 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Ngày</th>
                                    <th className="py-4 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Hội đồng đề xuất (Số Hot/Bạch Thủ)</th>
                                    <th className="py-4 px-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Hiệu quả</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history?.map((h: any, i: number) => {
                                    const pred = typeof h.prediction_data === 'string' ? JSON.parse(h.prediction_data) : h.prediction_data;
                                    const hits = h.hit_details ? (typeof h.hit_details === 'string' ? JSON.parse(h.hit_details) : h.hit_details) : null;
                                    const totalHits = (hits?.bach_thu_lo?.length || 0) + (hits?.song_thu_lo?.length || 0);

                                    return (
                                        <tr key={i} className="group border-b border-slate-50 hover:bg-slate-50/80 transition-all duration-300">
                                            <td className="py-6 px-4">
                                                <div className="font-sans font-bold text-slate-800 tabular-nums">{h.draw_date}</div>
                                            </td>
                                            <td className="py-6 px-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {pred.bach_thu_lo?.map((n: string) => (
                                                        <span key={n} className={`text-xs px-2.5 py-1 rounded-lg font-black transition-colors ${hits?.bach_thu_lo?.includes(n) ? 'bg-green-600 text-white shadow-lg shadow-green-200 ring-2 ring-green-100' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                                                            {n}
                                                        </span>
                                                    ))}
                                                    {pred.song_thu_lo?.map((pair: string) => {
                                                        const isHit = pair.split('-').some((n: any) => hits?.song_thu_lo?.includes(n.trim()));
                                                        return (
                                                            <span key={pair} className={`text-xs px-2.5 py-1 rounded-lg font-black transition-colors ${isHit ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 ring-2 ring-emerald-100' : 'bg-slate-50 text-slate-300 border border-dotted border-slate-200'}`}>
                                                                {pair}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                            <td className="py-6 px-4 text-right">
                                                {h.is_verified === 1 ? (
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm transition-transform group-hover:scale-105 ${totalHits > 0 ? 'bg-gradient-to-r from-green-600 to-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                            {totalHits > 0 ? (
                                                                <>🚀 TRÚNG {totalHits} NHÁY</>
                                                            ) : 'CHƯA TRÚNG'}
                                                        </span>
                                                        <span className="text-[9px] text-slate-300 font-medium">Auto-verified</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-400 text-[10px] font-bold uppercase tracking-wider animate-pulse border border-blue-100">
                                                            🕒 ĐANG ĐỢI...
                                                        </span>
                                                        <span className="text-[9px] text-slate-300 font-medium">Results pending 18:30</span>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {(!history || history.length === 0) && (
                                    <tr>
                                        <td colSpan={3} className="py-12 text-center text-slate-400 italic text-sm">
                                            Dữ liệu lịch sử đang được hệ thống cập nhật khởi tạo...
                                        </td>
                                    </tr>
                                )}
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
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            ` }} />
        </div>
    );
}
