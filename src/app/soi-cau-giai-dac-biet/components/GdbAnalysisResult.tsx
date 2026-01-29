'use client';

import { GdbAnalysisData } from '@/types/gdb-types';

interface Props {
    data: GdbAnalysisData;
}

export default function GdbAnalysisResult({ data }: Props) {
    const { date, rawGdb, sum, edge, pivot, strategy } = data;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Report */}
            <div className="bg-slate-900 text-white rounded-2xl shadow-2xl overflow-hidden border-b-8 border-amber-500">
                <div className="p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter mb-2">
                        📑 BẢN PHÂN TÍCH GIẢI ĐẶC BIỆT
                    </h1>
                    <div className="text-amber-400 font-mono text-lg mb-4">{new Date(date).toLocaleDateString('vi-VN')}</div>

                    <div className="inline-flex flex-col items-center bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                        <span className="text-xs uppercase tracking-widest text-slate-400 mb-1">🔢 Dữ liệu gốc</span>
                        <div className="flex gap-2">
                            {rawGdb.split('').map((d, i) => (
                                <span key={i} className={`w-10 h-12 flex items-center justify-center text-3xl font-bold rounded ${i === 2 ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-white'}`}>
                                    {d}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Cầu Tổng */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden group hover:shadow-xl transition-shadow">
                    <div className="bg-slate-800 p-4 flex items-center gap-3">
                        <span className="text-2xl">🎯</span>
                        <h2 className="text-white font-bold uppercase tracking-wide">1. Cầu Tổng (Quick Play)</h2>
                    </div>
                    <div className="p-6">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <div className="text-sm text-slate-500">Tổng GĐB:</div>
                                <div className="text-4xl font-black text-slate-800">{sum.value}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-slate-500 italic">Khuyến nghị:</div>
                                <div className="text-green-600 font-bold">Đánh thẳng trong ngày</div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            {sum.pairs.map((p, i) => (
                                <div key={i} className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-xl p-3 text-center">
                                    <div className="text-2xl font-black text-slate-800">{p}</div>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-slate-400 mt-4 leading-relaxed">
                            {sum.message} Logic: Cộng 5 chữ số, lấy cặp đại diện nếu tổng &gt; 10.
                        </p>
                    </div>
                </div>

                {/* 2. Cầu Biên */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden group hover:shadow-xl transition-shadow">
                    <div className="bg-slate-800 p-4 flex items-center gap-3">
                        <span className="text-2xl">📐</span>
                        <h2 className="text-white font-bold uppercase tracking-wide">2. Cầu Biên (Head-Tail)</h2>
                    </div>
                    <div className="p-6">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <div className="text-sm text-slate-500">Cặp biên (d1-d5):</div>
                                <div className="text-4xl font-black text-slate-800">{edge.digits[0]}{edge.digits[1]}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-slate-500 italic">Nhận định:</div>
                                <div className={`font-bold ${edge.rating === 'Tốt' ? 'text-green-600' : 'text-amber-600'}`}>
                                    {edge.rating}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            {edge.pairs.map((p, i) => (
                                <div key={i} className="flex-1 bg-amber-50 border-2 border-amber-200 rounded-xl p-3 text-center">
                                    <div className="text-2xl font-black text-amber-700">{p}</div>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-slate-400 mt-4 leading-relaxed">
                            {edge.message} Nhận định dựa trên tần suất đầu đuôi 30 ngày qua.
                        </p>
                    </div>
                </div>
            </div>

            {/* 3. Cầu Nuôi */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                <div className="bg-slate-800 p-4 flex items-center gap-3">
                    <span className="text-2xl">📍</span>
                    <h2 className="text-white font-bold uppercase tracking-wide">3. Cầu Nuôi (Pivot Touch)</h2>
                </div>
                <div className="p-6">
                    <div className="flex items-center gap-6 mb-6">
                        <div className="bg-amber-500 text-slate-900 w-20 h-20 rounded-2xl flex flex-col items-center justify-center shadow-lg">
                            <span className="text-xs font-bold uppercase opacity-60">Chạm</span>
                            <span className="text-4xl font-black">{pivot.digit}</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-800 mb-1">Dàn nuôi khung 3 ngày:</h3>
                            <div className="flex flex-wrap gap-2">
                                {pivot.touchSet.map((num, i) => (
                                    <span key={i} className="bg-slate-100 text-slate-700 px-2 py-1 rounded font-mono text-sm border border-slate-200">
                                        {num}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed border-l-2 border-slate-200 pl-4">
                        {pivot.message} Loại bỏ các số trùng lặp và lọc nhiễu từ kết quả ngày trước.
                    </p>
                </div>
            </div>


            {/* 4. History Statistics */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                <div className="bg-slate-800 p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">📊</span>
                        <h2 className="text-white font-bold uppercase tracking-wide">4. Thống kê 5 ngày gần nhất</h2>
                    </div>
                    <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-amber-400 border border-white/20">
                        Độ chính xác: {(data.history.filter(h => h.isHit).length / Math.max(1, data.history.length) * 100).toFixed(0)}%
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-left">Ngày</th>
                                <th className="px-6 py-4 text-left">Dự đoán (Sum/Edge)</th>
                                <th className="px-6 py-4 text-center">Đề về</th>
                                <th className="px-6 py-4 text-right">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.history.map((h, i) => (
                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-700">
                                        {new Date(h.date).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {[...h.predictedSum, ...h.predictedEdge].map((p, idx) => (
                                                <span key={idx} className={`px-1.5 py-0.5 rounded border text-[10px] font-mono ${h.isHit && h.actualDe === p ? 'bg-amber-100 border-amber-300 text-amber-800 font-bold scale-110' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                                                    {p}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-block w-8 h-8 leading-8 bg-slate-900 text-amber-400 rounded-full font-black text-sm">
                                            {h.actualDe}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {h.isHit ? (
                                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase ring-1 ring-green-600/20">
                                                <span className="text-xs">✅</span> TRÚNG ({h.hitType})
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-400 px-3 py-1 rounded-full text-[10px] font-black uppercase ring-1 ring-slate-300">
                                                <span className="text-xs">❌</span> TRƯỢT
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden flex">
                            {(() => {
                                const hits = data.history.filter(h => h.isHit).length;
                                const total = data.history.length;
                                return (
                                    <div
                                        className="h-full bg-gradient-to-r from-green-400 to-green-600 shadow-[0_0_10px_rgba(34,197,94,0.5)] transition-all duration-1000"
                                        style={{ width: `${(hits / Math.max(1, total)) * 100}%` }}
                                    ></div>
                                );
                            })()}
                        </div>
                        <span className="text-xs font-black text-slate-500 min-w-[3rem]">
                            {data.history.filter(h => h.isHit).length}/{data.history.length} HIT
                        </span>
                    </div>
                </div>
            </div>

            {/* General Summary */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl shadow-xl p-6 text-white text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from),_transparent_70%)] opacity-20 group-hover:scale-150 transition-transform duration-1000"></div>
                <h3 className="text-sm uppercase tracking-widest font-bold opacity-70 mb-2">TỔNG KẾT THUẬT TOÁN</h3>
                <div className="flex justify-center items-center gap-8 mb-4">
                    <div>
                        <div className="text-xs opacity-60 mb-1">Mẫu số phân tích</div>
                        <div className="text-3xl font-black">{data.history.length} ngày</div>
                    </div>
                    <div className="w-px h-10 bg-white/20"></div>
                    <div>
                        <div className="text-xs opacity-60 mb-1">Hiệu suất trung bình</div>
                        <div className="text-3xl font-black text-amber-400">
                            {(data.history.filter(h => h.isHit).length / Math.max(1, data.history.length) * 100).toFixed(0)}%
                        </div>
                    </div>
                </div>
                <p className="text-xs opacity-80 max-w-lg mx-auto leading-relaxed border-t border-white/10 pt-4 cursor-default">
                    {data.history.filter(h => h.isHit).length >= 3
                        ? "🚀 Thuật toán đang trong chu kỳ ổn định. Có thể ưu tiên các cặp Sum/Edge để tối ưu vốn."
                        : "⚠️ Hệ thống đang ghi nhận nhiễu cao từ biến động thị trường. Khuyến nghị thăm dò nhẹ hoặc chờ chu kỳ mới."}
                </p>
            </div>

            {/* Disclaimer */}
            <div className="bg-slate-100 rounded-xl p-4 border border-slate-200 flex items-start gap-4">
                <span className="text-2xl mt-1">🛡️</span>
                <div className="text-xs text-slate-500 leading-relaxed">
                    <p className="font-bold text-slate-700 mb-1">CHÍNH SÁCH BẢO MẬT & TRÁCH NHIỆM:</p>
                    Hệ thống chỉ đưa ra các con số dựa trên logic toán học và phân tích thuật toán chuyên sâu.
                    Chúng tôi không khẳng định tỉ lệ trúng tuyệt đối 100%. Xổ số là trò chơi may rủi, vui lòng dự thưởng có trách nhiệm và đúng pháp luật.
                </div>
            </div>
        </div>
    );
}
