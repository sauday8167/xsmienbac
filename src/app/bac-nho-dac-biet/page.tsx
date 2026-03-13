'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Search, 
  TrendingUp, 
  Clock, 
  Target, 
  Info,
  RefreshCw,
  Zap,
  Award,
  Copy,
  CheckCircle2
} from 'lucide-react';

interface Prediction {
    number: string;
    count: number;
    probability: number;
}

export default function BacNhoDacBietPage() {
    const [mode, setMode] = useState<'today' | 'khung'>('today');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<Prediction[]>([]);
    const [baseDate, setBaseDate] = useState<string>('');
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const [copied, setCopied] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/bac-nho-special?mode=${mode}`);
            const json = await res.json();
            if (json.success) {
                setData(json.data);
                setBaseDate(json.baseDate);
                setLastUpdated(json.lastUpdated);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [mode]);

    const handleCopyAll = () => {
        const numbers = data.map(d => d.number).join(', ');
        navigator.clipboard.writeText(numbers);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getPredictionDate = () => {
        if (!baseDate) return '';
        const date = new Date(baseDate);
        
        if (mode === 'today') {
            date.setDate(date.getDate() + 1);
            return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } else {
            const date1 = new Date(baseDate);
            date1.setDate(date1.getDate() + 1);
            const date3 = new Date(baseDate);
            date3.setDate(date3.getDate() + 3);
            return `${date1.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} - ${date3.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 font-sans">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-white border-b border-slate-200 pt-10 pb-16 px-4">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-red-500/5 -skew-x-12 transform translate-x-1/2"></div>
                
                <div className="max-w-6xl mx-auto relative z-10 text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-black uppercase tracking-widest mb-4 border border-red-100">
                            <Zap className="w-3.5 h-3.5 fill-current" />
                            <span>PHÂN TÍCH TỔ HỢP 2,925 BỘ 3</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight uppercase">
                            Bạc Nhớ <span className="text-red-600">Đặc Biệt</span>
                        </h1>
                        <p className="text-slate-500 text-base md:text-lg max-w-xl leading-relaxed">
                            Công nghệ phân tích đối chiếu lịch giúp tìm kiếm dàn số tiềm năng dựa trên sự vận động của bộ 3 số xuất hiện trong kỳ quay {baseDate ? new Date(baseDate).toLocaleDateString('vi-VN') : 'gần nhất'}.
                        </p>
                    </div>

                    <div className="flex flex-col md:items-end gap-3 text-sm text-slate-400">
                        <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                            Cập nhật: <span className="font-bold text-slate-700">{lastUpdated ? new Date(lastUpdated).toLocaleTimeString('vi-VN') : '--:--'}</span>
                        </div>
                        <div className="flex items-center gap-2 px-4">
                            <Calendar className="w-3.5 h-3.5" />
                            Dữ liệu: <span className="font-bold text-slate-700">365 ngày lịch sử</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-20">
                <div className="flex flex-col gap-8">
                    {/* Navigation Tabs */}
                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-2.5 flex flex-col sm:flex-row gap-3 border border-white">
                        <button
                            onClick={() => setMode('today')}
                            className={`flex-1 px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 ${
                                mode === 'today' 
                                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 ring-4 ring-red-50' 
                                : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                            }`}
                        >
                            <Calendar className="w-5 h-5 transition-transform group-hover:scale-110" />
                            Đặc Biệt Hôm Nay
                        </button>
                        <button
                            onClick={() => setMode('khung')}
                            className={`flex-1 px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 ${
                                mode === 'khung' 
                                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 ring-4 ring-red-50' 
                                : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                            }`}
                        >
                            <Clock className="w-5 h-5 transition-transform group-hover:scale-110" />
                            Đặc Biệt Khung 3 Ngày
                        </button>
                    </div>

                    {/* Result Grid Section */}
                    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-100 rounded-2xl text-red-600">
                                    <Award className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Dàn 36 Số Đề</h2>
                                        <span className="bg-red-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                                            Dự đoán ngày: {getPredictionDate()}
                                        </span>
                                    </div>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-0.5">Xếp hạng theo điểm số tần suất triplet</p>
                                </div>
                            </div>
                            
                            <button
                                onClick={handleCopyAll}
                                className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 transform active:scale-95 ${
                                    copied 
                                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' 
                                    : 'bg-slate-900 text-white hover:bg-red-600 shadow-lg shadow-slate-900/20'
                                }`}
                            >
                                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Đã Sao Chép!' : 'Copy Toàn Bộ 36 Số'}
                            </button>
                        </div>

                        <div className="p-8 md:p-12">
                            {loading ? (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-5">
                                    {[...Array(36)].map((_, i) => (
                                        <div key={i} className="aspect-square rounded-3xl bg-slate-50 animate-pulse border border-slate-100"></div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-5">
                                    {data.map((item, idx) => (
                                        <div 
                                            key={item.number}
                                            className={`group relative aspect-square rounded-[2rem] border flex flex-col items-center justify-center transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-300 cursor-pointer overflow-hidden ${
                                                idx < 6 
                                                ? 'bg-gradient-to-br from-red-600 to-rose-700 border-red-500 shadow-xl shadow-red-200 ring-4 ring-red-50' 
                                                : 'bg-white border-slate-100 hover:border-red-300'
                                            }`}
                                        >
                                            {idx < 6 && (
                                                <div className="absolute top-0 right-0 p-1.5 overflow-hidden">
                                                    <div className="bg-white/20 w-8 h-8 flex items-center justify-center rounded-bl-xl">
                                                        <Zap className="w-3.5 h-3.5 text-white" />
                                                    </div>
                                                </div>
                                            )}
                                            <div className={`text-3xl font-black mb-0.5 transition-colors ${idx < 6 ? 'text-white' : 'text-slate-900 group-hover:text-red-600'}`}>
                                                {item.number}
                                            </div>
                                            <div className={`text-[10px] font-black uppercase tracking-widest ${idx < 6 ? 'text-red-100/70' : 'text-slate-400'}`}>
                                                {item.count} Lần
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Dashboard Metrics (Small) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5 group hover:border-red-200 transition-colors">
                            <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 group-hover:bg-orange-100 transition-colors">
                                <Search className="w-7 h-7" />
                            </div>
                            <div>
                                <div className="text-slate-400 text-[10px] uppercase font-black mb-1">Cụm tổ hợp</div>
                                <div className="text-2xl font-black text-slate-800">2,925 Triplets</div>
                            </div>
                        </div>
                        <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5 group hover:border-green-200 transition-colors">
                            <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-green-500 group-hover:bg-green-100 transition-colors">
                                <TrendingUp className="w-7 h-7" />
                            </div>
                            <div>
                                <div className="text-slate-400 text-[10px] uppercase font-black mb-1">Dữ liệu nguồn</div>
                                <div className="text-2xl font-black text-slate-800">01 Năm (365 kỳ)</div>
                            </div>
                        </div>
                        <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5 group hover:border-red-200 transition-colors">
                            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 group-hover:bg-red-100 transition-colors">
                                <Target className="w-7 h-7" />
                            </div>
                            <div>
                                <div className="text-slate-400 text-[10px] uppercase font-black mb-1">Mức độ hội tụ</div>
                                <div className="text-2xl font-black text-slate-800">Top 36 Nhất Quán</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
