'use client';

import { useState, useEffect } from 'react';
import { Search, History, TrendingUp, Hash, Calendar } from 'lucide-react';

interface StatsSummary {
    number: string;
    count: number;
}

interface DbTomorrowData {
    targetNumber: string;
    occurrenceCount: number;
    frequencies: StatsSummary[];
    heads: StatsSummary[];
    tails: StatsSummary[];
    sums: StatsSummary[];
    history: {
        date: string;
        originalSpecial: string;
        nextDate: string;
        nextSpecial: string;
    }[];
}

export default function DbTomorrowStats() {
    const [targetNumber, setTargetNumber] = useState('');
    const [data, setData] = useState<DbTomorrowData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchData = async (num: string) => {
        if (!num || num.length !== 2) return;
        try {
            setLoading(true);
            setError('');
            const res = await fetch(`/api/stats/db-tomorrow?number=${num}`);
            const result = await res.json();
            if (result.success) {
                setData(result.data);
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Lỗi kết nối server');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchData(targetNumber);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Search Section */}
            <div className="card bg-gradient-to-br from-white to-slate-50 border-slate-200">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-end gap-4">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                            <Search className="w-4 h-4 text-lottery-red-600" />
                            Nhập 2 số cuối Giải Đặc Biệt:
                        </label>
                        <input
                            type="text"
                            maxLength={2}
                            value={targetNumber}
                            onChange={(e) => setTargetNumber(e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="Ví dụ: 82"
                            className="input text-2xl font-black tracking-widest text-center h-14 border-2 focus:border-lottery-red-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || targetNumber.length !== 2}
                        className="btn btn-primary h-14 px-8 w-full md:w-auto flex items-center justify-center gap-2 text-lg"
                    >
                        {loading ? <div className="spinner-white w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                        Phân Tích Ngay
                    </button>
                </form>
                {error && <p className="mt-4 text-red-500 text-sm font-medium">{error}</p>}
            </div>

            {!data && !loading && (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <History className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-lg">Nhập số để xem lịch sử và dự đoán cho ngày mai</p>
                </div>
            )}

            {data && (
                <div className="space-y-8">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="card bg-white border-l-4 border-lottery-red-600 shadow-sm">
                            <p className="text-xs uppercase font-bold text-slate-500 mb-1">Số lần xuất hiện</p>
                            <p className="text-3xl font-black text-slate-800">{data.occurrenceCount} <span className="text-sm font-normal text-slate-500">lần</span></p>
                        </div>
                        <div className="card bg-white border-l-4 border-amber-500 shadow-sm">
                            <p className="text-xs uppercase font-bold text-slate-500 mb-1">Cặp số về nhiều nhất</p>
                            <p className="text-3xl font-black text-amber-600">{data.frequencies[0]?.number || '--'}</p>
                        </div>
                        <div className="card bg-white border-l-4 border-blue-500 shadow-sm">
                            <p className="text-xs uppercase font-bold text-slate-500 mb-1">Đầu/Đuôi phổ biến</p>
                            <p className="text-3xl font-black text-slate-800">
                                {data.heads[0]?.number || '-'}/{data.tails[0]?.number || '-'}
                            </p>
                        </div>
                        <div className="card bg-white border-l-4 border-purple-500 shadow-sm">
                            <p className="text-xs uppercase font-bold text-slate-500 mb-1">Tổng hay về nhất</p>
                            <p className="text-3xl font-black text-purple-600">{data.sums[0]?.number || '--'}</p>
                        </div>
                    </div>

                    {/* Frequency Analysis Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Number Frequency */}
                        <div className="card border-slate-200">
                            <h3 className="font-bold text-lg mb-6 flex items-center gap-2 border-b pb-4">
                                <Hash className="w-5 h-5 text-lottery-red-600" />
                                Tần suất loto ngày mai (Tất cả các giải)
                            </h3>
                            <div className="space-y-3">
                                {data.frequencies.slice(0, 10).map((item, idx) => (
                                    <div key={item.number} className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 bg-slate-50 rounded-lg p-3 flex justify-between items-center group hover:bg-lottery-red-50 transition-colors">
                                            <span className="text-xl font-black text-slate-700">{item.number}</span>
                                            <span className="bg-white px-3 py-1 rounded-full text-sm font-bold border border-slate-200 text-lottery-red-600">
                                                {item.count} lần
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Head/Tail Statistics */}
                        <div className="card border-slate-200 space-y-8">
                            <div>
                                <h3 className="font-bold text-lg mb-6 flex items-center gap-2 border-b pb-4">
                                    <TrendingUp className="w-5 h-5 text-blue-600" />
                                    Bảng chạm (Chỉ Giải ĐB)
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <p className="text-center text-xs font-bold text-slate-500 uppercase">Đầu</p>
                                        {data.heads.slice(0, 5).map(item => (
                                            <div key={item.number} className="flex justify-between items-center p-2 bg-blue-50 rounded border border-blue-100">
                                                <span className="font-black text-blue-700">{item.number}</span>
                                                <span className="text-xs font-bold">{item.count} lần</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-center text-xs font-bold text-slate-500 uppercase">Đuôi</p>
                                        {data.tails.slice(0, 5).map(item => (
                                            <div key={item.number} className="flex justify-between items-center p-2 bg-amber-50 rounded border border-amber-100">
                                                <span className="font-black text-amber-700">{item.number}</span>
                                                <span className="text-xs font-bold">{item.count} lần</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold text-lg mb-6 flex items-center gap-2 border-b pb-4">
                                    <TrendingUp className="w-5 h-5 text-purple-600" />
                                    Theo Tổng (Chỉ Giải ĐB)
                                </h3>
                                <div className="grid grid-cols-5 gap-2">
                                    {data.sums.slice(0, 10).map(item => (
                                        <div key={item.number} className="flex flex-col items-center p-2 bg-purple-50 rounded border border-purple-100">
                                            <span className="text-xs text-purple-400 font-bold">Tổng</span>
                                            <span className="text-lg font-black text-purple-700">{item.number}</span>
                                            <span className="text-[10px] font-bold">{item.count} L</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* History Timeline */}
                        <div className="card border-slate-200 lg:col-span-1">
                            <h3 className="font-bold text-lg mb-6 flex items-center gap-2 border-b pb-4">
                                <Calendar className="w-5 h-5 text-slate-600" />
                                Lịch sử xuất hiện
                            </h3>
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {data.history.map((record, idx) => (
                                    <div key={idx} className="border-l-2 border-slate-200 pl-4 pb-4 last:pb-0 relative">
                                        <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-slate-300"></div>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-slate-500">{new Date(record.date).toLocaleDateString('vi-VN')}</span>
                                                <span className="text-sm font-black text-slate-700">{record.originalSpecial}</span>
                                            </div>
                                            <div className="bg-slate-50 p-2 rounded flex items-center justify-between border border-dashed border-slate-300">
                                                <span className="text-[10px] text-slate-400 font-medium">Hôm sau:</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-slate-400">{new Date(record.nextDate).toLocaleDateString('vi-VN')}</span>
                                                    <span className="font-black text-lottery-red-600">{record.nextSpecial}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
