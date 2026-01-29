'use client';

import { useState } from 'react';
import { Search, History, TrendingUp, Hash, Calendar, Trophy } from 'lucide-react';

interface StatsSummary {
    number: string;
    count: number;
}

interface Prize1Data {
    targetNumber: string;
    occurrenceCount: number;
    frequencies: StatsSummary[];
    heads: StatsSummary[];
    tails: StatsSummary[];
    sums: StatsSummary[];
    history: {
        date: string;
        originalPrize1: string;
        nextDate: string;
        nextPrize1: string;
    }[];
}

export default function Prize1TomorrowStats() {
    const [targetNumber, setTargetNumber] = useState('');
    const [data, setData] = useState<Prize1Data | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchData = async (num: string) => {
        if (!num || num.length !== 2) return;
        try {
            setLoading(true);
            setError('');
            const res = await fetch(`/api/stats/prize1-tomorrow?number=${num}`);
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
            <div className="card bg-gradient-to-br from-white to-amber-50 border-amber-200">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-end gap-4">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-amber-600" />
                            Nhập 2 số cuối GIẢI NHẤT:
                        </label>
                        <input
                            type="text"
                            maxLength={2}
                            value={targetNumber}
                            onChange={(e) => setTargetNumber(e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="Ví dụ: 05"
                            className="input text-2xl font-black tracking-widest text-center h-14 border-2 border-amber-100 focus:border-amber-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || targetNumber.length !== 2}
                        className="btn bg-amber-600 hover:bg-amber-700 text-white h-14 px-8 w-full md:w-auto flex items-center justify-center gap-2 text-lg shadow-lg shadow-amber-600/20"
                    >
                        {loading ? <div className="spinner-white w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                        Phân Tích Giải Nhất
                    </button>
                </form>
                {error && <p className="mt-4 text-red-500 text-sm font-medium">{error}</p>}
            </div>

            {!data && !loading && (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <History className="w-16 h-16 mb-4 opacity-10" />
                    <p className="text-lg">Nhập số đuôi Giải Nhất để soi quy luật ngày mai</p>
                </div>
            )}

            {data && (
                <div className="space-y-8">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="card bg-white border-l-4 border-amber-600 shadow-sm">
                            <p className="text-xs uppercase font-bold text-slate-500 mb-1">Lịch sử xuất hiện</p>
                            <p className="text-3xl font-black text-slate-800">{data.occurrenceCount} <span className="text-sm font-normal text-slate-500">lần</span></p>
                        </div>
                        <div className="card bg-white border-l-4 border-lottery-red-600 shadow-sm">
                            <p className="text-xs uppercase font-bold text-slate-500 mb-1">Số hay về nhất (G1)</p>
                            <p className="text-3xl font-black text-lottery-red-600">{data.frequencies[0]?.number || '--'}</p>
                        </div>
                        <div className="card bg-white border-l-4 border-blue-500 shadow-sm">
                            <p className="text-xs uppercase font-bold text-slate-500 mb-1">Đầu/Đuôi (G1)</p>
                            <p className="text-3xl font-black text-slate-800">
                                {data.heads[0]?.number || '-'}/{data.tails[0]?.number || '-'}
                            </p>
                        </div>
                        <div className="card bg-white border-l-4 border-purple-500 shadow-sm">
                            <p className="text-xs uppercase font-bold text-slate-500 mb-1">Tổng về nhất (G1)</p>
                            <p className="text-3xl font-black text-purple-600">{data.sums[0]?.number || '--'}</p>
                        </div>
                    </div>

                    {/* Frequency Analysis Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Number Frequency */}
                        <div className="card border-slate-200">
                            <h3 className="font-bold text-lg mb-6 flex items-center gap-2 border-b pb-4 text-amber-900">
                                <Hash className="w-5 h-5 text-amber-600" />
                                Tần suất G1 ngày mai (Tất cả các giải)
                            </h3>
                            <div className="space-y-3">
                                {data.frequencies.slice(0, 10).map((item, idx) => (
                                    <div key={item.number} className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-600">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 bg-amber-50/30 rounded-lg p-3 flex justify-between items-center group hover:bg-amber-100/50 transition-colors border border-amber-100/50">
                                            <span className="text-xl font-black text-slate-700">{item.number}</span>
                                            <span className="bg-white px-3 py-1 rounded-full text-sm font-bold border border-amber-200 text-amber-600">
                                                {item.count} lần
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {data.frequencies.length === 0 && (
                                    <p className="text-center text-slate-400 py-10 italic">Không có dữ liệu</p>
                                )}
                            </div>
                        </div>

                        {/* Head/Tail Statistics */}
                        <div className="card border-slate-200 space-y-8">
                            <div>
                                <h3 className="font-bold text-lg mb-6 flex items-center gap-2 border-b pb-4 text-blue-900">
                                    <TrendingUp className="w-5 h-5 text-blue-600" />
                                    Chạm (Chỉ Giải Nhất)
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <p className="text-center text-[10px] font-black text-blue-500 uppercase tracking-widest">Đầu</p>
                                        {data.heads.slice(0, 5).map(item => (
                                            <div key={item.number} className="flex justify-between items-center p-2 bg-blue-50/50 rounded border border-blue-100">
                                                <span className="font-black text-blue-700">{item.number}</span>
                                                <span className="text-[10px] font-bold text-blue-500">{item.count} lần</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-center text-[10px] font-black text-rose-500 uppercase tracking-widest">Đuôi</p>
                                        {data.tails.slice(0, 5).map(item => (
                                            <div key={item.number} className="flex justify-between items-center p-2 bg-rose-50/50 rounded border border-rose-100">
                                                <span className="font-black text-rose-700">{item.number}</span>
                                                <span className="text-[10px] font-bold text-rose-500">{item.count} lần</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold text-lg mb-6 flex items-center gap-2 border-b pb-4 text-purple-900">
                                    <Hash className="w-5 h-5 text-purple-600" />
                                    Theo Tổng (Chỉ Giải Nhất)
                                </h3>
                                <div className="grid grid-cols-5 gap-2">
                                    {data.sums.slice(0, 10).map(item => (
                                        <div key={item.number} className="flex flex-col items-center p-2 bg-purple-50 rounded border border-purple-100">
                                            <span className="text-[10px] text-purple-400 font-bold">Tổng</span>
                                            <span className="text-lg font-black text-purple-700">{item.number}</span>
                                            <span className="text-[10px] font-bold text-purple-500">{item.count}L</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* History Timeline */}
                        <div className="card border-slate-200">
                            <div className="flex items-center justify-between border-b pb-4 mb-6">
                                <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800">
                                    <Calendar className="w-5 h-5 text-slate-600" />
                                    Lịch sử Giải Nhất
                                </h3>
                                <span className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase">Mới nhất</span>
                            </div>
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {data.history.map((record, idx) => (
                                    <div key={idx} className="group border-l-2 border-slate-200 pl-4 pb-6 last:pb-0 relative">
                                        <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-slate-300 group-hover:bg-amber-500 transition-colors"></div>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex justify-between items-center">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-slate-400">{new Date(record.date).toLocaleDateString('vi-VN')}</span>
                                                    <span className="text-sm font-black text-slate-700">G1: {record.originalPrize1}</span>
                                                </div>
                                            </div>
                                            <div className="bg-amber-50/50 p-2.5 rounded-lg flex items-center justify-between border border-dashed border-amber-200">
                                                <span className="text-[10px] text-amber-600 font-black uppercase tracking-tighter">Ngày mai về:</span>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] text-slate-400 font-medium">{new Date(record.nextDate).toLocaleDateString('vi-VN')}</span>
                                                    <span className="font-black text-amber-700 underline decoration-amber-300 underline-offset-4">{record.nextPrize1}</span>
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
