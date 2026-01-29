'use client';

import { LotoRoiResponse } from '@/types/loto-roi-types';

interface Props {
    data: LotoRoiResponse;
}

export default function LotoRoiResult({ data }: Props) {
    const { date, typeA, typeB, risks, financialPlan, history } = data;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-yellow-600 mb-2">
                    📊 KẾT QUẢ SOI CẦU LOTO RƠI MB
                </h1>
                <div className="inline-block bg-lottery-gray-100 text-lottery-gray-800 px-4 py-1 rounded-full text-sm font-semibold border border-lottery-gray-300">
                    📅 Dự đoán ngày: {new Date(date).toLocaleDateString('vi-VN')}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Type A: Loto rơi từ Giải Đặc Biệt */}
                <div className="bg-white rounded-xl shadow-lg border-t-4 border-red-500 overflow-hidden">
                    <div className="bg-red-50 p-4 border-b border-red-100">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-red-700">
                            🎯 1. Chốt số Loto rơi từ Giải Đặc Biệt
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="flex flex-col items-center justify-center mb-8">
                            <div className="text-sm text-gray-500 mb-2 font-medium">Cặp số chính (từ Giải ĐB {typeA.source})</div>
                            <div className="flex items-center gap-6">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-red-200 rounded-full blur group-hover:blur-md transition-all"></div>
                                    <span className="relative text-5xl font-black text-red-600 bg-red-50 w-20 h-20 rounded-full flex items-center justify-center shadow-lg border-2 border-red-100">
                                        {typeA.pair[0]}
                                    </span>
                                </div>
                                <span className="text-gray-300 font-bold text-2xl">-</span>
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-red-200 rounded-full blur group-hover:blur-md transition-all"></div>
                                    <span className="relative text-5xl font-black text-red-600 bg-red-50 w-20 h-20 rounded-full flex items-center justify-center shadow-lg border-2 border-red-100">
                                        {typeA.pair[1]}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
                            <div className="flex justify-between items-center p-4 bg-white hover:bg-gray-50 transition-colors">
                                <span className="text-gray-600 font-medium">Trạng thái:</span>
                                <span className={`font-bold px-3 py-1 rounded-full text-sm ${typeA.status === 'Cầu đang vào nhịp' ? 'bg-green-100 text-green-700 ring-1 ring-green-500/20' : 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-500/20'
                                    }`}>
                                    {typeA.status}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-white hover:bg-gray-50 transition-colors">
                                <span className="text-gray-600 font-medium">Lịch sử 3 ngày:</span>
                                <span className={`font-bold ${typeA.historyCheck.matches3Days ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {typeA.historyCheck.matches3Days ? 'Đã xuất hiện' : 'Chưa xuất hiện'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-blue-50/50">
                                <span className="text-gray-700 font-bold">Gợi ý:</span>
                                <span className="font-bold text-blue-600">
                                    {typeA.suggestion}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Type B: Loto rơi từ Loto */}
                <div className="bg-white rounded-xl shadow-lg border-t-4 border-blue-500 overflow-hidden">
                    <div className="bg-blue-50 p-4 border-b border-blue-100">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-blue-700">
                            ⚡ 2. Chốt số Loto rơi từ Loto
                        </h2>
                    </div>
                    <div className="p-6 space-y-6">
                        {/* Intersection */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                Rơi lại ngày thứ 2 (Giao thoa)
                            </h3>
                            {typeB.intersection.numbers.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {typeB.intersection.numbers.map(num => (
                                        <span key={num} className="font-bold text-lg text-blue-700 bg-blue-100 px-3 py-1 rounded shadow-sm border border-blue-200">
                                            {num}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <span className="text-gray-400 italic text-sm">Không có dữ liệu</span>
                            )}
                            <p className="text-xs text-gray-500 mt-1">{typeB.intersection.description}</p>
                        </div>

                        {/* Multi-hit */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                Về nhiều nháy hôm qua
                            </h3>
                            {typeB.multiHit.numbers.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {typeB.multiHit.numbers.map(num => (
                                        <span key={num} className="font-bold text-lg text-purple-700 bg-purple-100 px-3 py-1 rounded shadow-sm border border-purple-200">
                                            {num}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <span className="text-gray-400 italic text-sm">Không có dữ liệu</span>
                            )}
                            <p className="text-xs text-gray-500 mt-1">{typeB.multiHit.description}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Risk Warning */}
            <div className="bg-white rounded-xl shadow-lg border-t-4 border-yellow-500 overflow-hidden">
                <div className="bg-yellow-50 p-4 border-b border-yellow-100">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-yellow-800">
                        🛡️ 3. Cảnh báo rủi ro
                    </h2>
                </div>
                <div className="p-6">
                    <div className="mb-4">
                        <h3 className="font-semibold text-gray-700 mb-2">⚠️ Danh sách Loto Gan ({'>'}15 ngày):</h3>
                        {risks.ganList.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {risks.ganList.map(item => (
                                    <div key={item.number} className="flex items-center bg-red-50 border border-red-200 rounded px-2 py-1">
                                        <span className="font-bold text-red-700 mr-2">{item.number}</span>
                                        <span className="text-xs text-red-500">({item.daysParams} kỳ chưa về)</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <span className="text-green-600 italic font-medium">✅ Không có số gợi ý nào dính Gan. An toàn.</span>
                        )}
                    </div>

                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                        <h3 className="font-semibold text-gray-700 mb-1">🔎 Nhận định nhịp cầu:</h3>
                        <p className={`font-bold ${risks.cycleWarning.isBroken ? 'text-red-600' : 'text-green-600'}`}>
                            {risks.cycleWarning.message}
                        </p>
                    </div>
                </div>
            </div>

            {/* 4. Thống kê hiệu quả 5 ngày */}
            <div className="bg-white rounded-xl shadow-lg border-t-4 border-slate-800 overflow-hidden">
                <div className="bg-slate-800 p-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                        📊 4. Thống kê hiệu quả 5 ngày gần nhất
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b">
                            <tr>
                                <th className="px-4 py-4">Ngày</th>
                                <th className="px-4 py-4 w-1/3">Giải Đặc Biệt (Gợi ý)</th>
                                <th className="px-4 py-4 w-1/3">Loto Rơi (Gợi ý)</th>
                                <th className="px-4 py-4 w-1/6 text-center">Loto nhiều nháy</th>
                                <th className="px-6 py-4 text-right">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {history.map((h, i) => (
                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-4 font-medium text-slate-700 whitespace-nowrap">
                                        {new Date(h.date).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {h.predictedDe.map(n => (
                                                <span key={n} className={`px-2 py-1 rounded text-xs font-bold border ${h.hitNumbers.includes(n) ? 'bg-red-100 border-red-300 text-red-700' : 'bg-white border-slate-200 text-slate-500'}`}>
                                                    {n}
                                                </span>
                                            ))}
                                            {h.isHitDe && <span className="ml-1 text-[10px] text-red-600 font-bold">✅ Nổ</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {h.predictedLoto.map(n => (
                                                <span key={n} className={`px-2 py-1 rounded text-xs font-bold border ${h.hitNumbers.includes(n) ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-500'}`}>
                                                    {n}
                                                </span>
                                            ))}
                                            {h.isHitLoto && <span className="ml-1 text-[10px] text-blue-600 font-bold">✅ Nổ</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span className="text-xs text-gray-400 italic">Xem chi tiết</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {h.hitNumbers.length > 0 ? (
                                            <div className="flex flex-col items-end gap-0.5">
                                                <span className="inline-block bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ring-1 ring-green-600/20">
                                                    ✅ TRÚNG
                                                </span>
                                                {h.isHitDe && h.isHitLoto ? (
                                                    <span className="text-[8px] text-amber-600 font-bold italic">Nổ cả Đề & Loto!</span>
                                                ) : h.isHitDe ? (
                                                    <span className="text-[8px] text-red-500 font-bold italic">Nổ Loto rơi từ ĐB</span>
                                                ) : (
                                                    <span className="text-[8px] text-blue-500 font-bold italic">Nổ Loto rơi từ Loto</span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="inline-block bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ring-1 ring-slate-300">
                                                ❌ TRƯỢT
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
                    <p className="mb-1 font-bold">Ghi chú:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li><b>Giải Đặc Biệt:</b> Loto rơi từ giải đặc biệt ngày hôm trước.</li>
                        <li><b>Loto Rơi:</b> Loto rơi lại từ kết quả ngày hôm trước (Loto rơi từ Loto).</li>
                        <li><b>Loto nhiều nháy:</b> Các cặp số về nhiều nháy được dự đoán có khả năng rơi lại.</li>
                    </ul>
                </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-gradient-to-br from-red-600 via-red-700 to-red-900 rounded-xl shadow-xl p-6 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
                    </svg>
                </div>
                <h3 className="text-xs uppercase tracking-widest font-black opacity-80 mb-4">TỔNG KẾT HIỆU SUẤT CẦU LÔ RƠI</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                        <div className="text-[10px] opacity-70 mb-1 uppercase">Mẫu phân tích</div>
                        <div className="text-2xl font-black">{history.length} ngày</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                        <div className="text-[10px] opacity-70 mb-1 uppercase">Tỷ lệ nổ Giải Đặc Biệt</div>
                        <div className="text-2xl font-black text-amber-400">
                            {Math.round((history.filter(h => h.isHitDe).length / Math.max(1, history.length)) * 100)}%
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                        <div className="text-[10px] opacity-70 mb-1 uppercase">Tỷ lệ nổ Loto</div>
                        <div className="text-2xl font-black text-blue-400">
                            {Math.round((history.filter(h => h.isHitLoto).length / Math.max(1, history.length)) * 100)}%
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                        <div className="text-[10px] opacity-70 mb-1 uppercase">Trạng thái nhịp</div>
                        <div className="text-lg font-black leading-none mt-1">
                            {history.filter(h => h.isHitDe || h.isHitLoto).length >= 3 ? 'ĐANG CHẠY' : 'DÒ NHỊP'}
                        </div>
                    </div>
                </div>
                <p className="text-xs italic opacity-90 max-w-2xl mx-auto leading-relaxed border-t border-white/20 pt-4">
                    "Dựa trên dữ liệu 5 ngày qua, cầu {history.filter(h => h.isHitDe).length >= history.filter(h => h.isHitLoto).length ? 'Loto rơi từ Giải Đặc Biệt' : 'Loto rơi từ Loto'} đang có phong độ ổn định hơn. Khuyến nghị tập trung vốn vào danh mục nổ cao để tối ưu lợi nhuận."
                </p>
            </div>

            {/* Disclaimer */}
            <div className="text-center text-xs text-gray-400 mt-4 px-4 bg-gray-50 py-4 rounded-lg border border-gray-100">
                <p className="font-bold mb-1">CẢNH BÁO TRÁCH NHIỆM:</p>
                Xổ số là trò chơi may rủi. Các phân tích trên được thực hiện bằng thuật toán thống kê dựa trên dữ liệu lịch sử và chỉ mang tính chất tham khảo, không đảm bảo trúng 100%. Hãy cân nhắc tài chính và chơi có trách nhiệm theo đúng quy định pháp luật.
            </div>
        </div>
    );
}
