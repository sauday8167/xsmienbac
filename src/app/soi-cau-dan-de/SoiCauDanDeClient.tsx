'use client';

import { useState, useEffect } from 'react';

interface DanDeData {
    date: string;
    special_prize: string;
    ba_cang: string;
    dan_de: string[];
    hot_nums: string[];
    gan_nums: string[];
    ba_cang_loto: string[];
    ai_predicted: string[];
    days_analyzed: number;
}

export default function SoiCauDanDeClient() {
    const [data, setData] = useState<DanDeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetch('/api/soi-cau-dan-de')
            .then(r => r.json())
            .then(d => { if (d.success) setData(d.data); })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const copyDanDe = async () => {
        if (!data) return;
        const text = `Dàn đề XSMB hôm nay:\n${data.dan_de.join(' - ')}`;
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const dateLabel = data
        ? new Date(data.date).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
        : '';

    const getNumSources = (num: string): string[] => {
        if (!data) return [];
        const sources: string[] = [];
        if (data.hot_nums.includes(num)) sources.push('Tần suất cao');
        if (data.gan_nums.includes(num)) sources.push('Lô gan chín');
        if (data.ba_cang_loto.includes(num)) sources.push('Ba càng GĐB');
        if (data.ai_predicted.includes(num)) sources.push('AI dự đoán');
        return sources;
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-lottery-gray-800 mb-2">Soi Cầu Dàn Đề</h1>
                <p className="text-lottery-gray-600">Bộ số tổng hợp từ nhiều phương pháp — tần suất, lô gan, ba càng, AI</p>
                <div className="w-20 h-1 bg-lottery-red-600 mx-auto rounded-full mt-4"></div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="loading loading-spinner loading-lg text-lottery-red-600"></div>
                </div>
            ) : !data ? (
                <div className="text-center py-12 text-gray-500">Không có dữ liệu</div>
            ) : (
                <div className="space-y-6">
                    {/* Summary cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="card bg-red-50 border-red-200 text-center">
                            <div className="text-xs text-gray-500 mb-1">Ngày phân tích</div>
                            <div className="font-bold text-red-700 text-sm">{dateLabel}</div>
                        </div>
                        <div className="card bg-amber-50 border-amber-200 text-center">
                            <div className="text-xs text-gray-500 mb-1">Giải đặc biệt gần nhất</div>
                            <div className="font-black text-amber-700 text-xl tracking-wider">{data.special_prize}</div>
                        </div>
                        <div className="card bg-orange-50 border-orange-200 text-center">
                            <div className="text-xs text-gray-500 mb-1">Ba càng GĐB</div>
                            <div className="font-black text-orange-700 text-2xl">{data.ba_cang}</div>
                        </div>
                        <div className="card bg-blue-50 border-blue-200 text-center">
                            <div className="text-xs text-gray-500 mb-1">Số trong dàn</div>
                            <div className="font-black text-blue-700 text-2xl">{data.dan_de.length}</div>
                        </div>
                    </div>

                    {/* Main dàn đề */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-black text-lg text-gray-900 uppercase tracking-wide">
                                Dàn Đề Tổng Hợp Hôm Nay
                            </h2>
                            <button
                                onClick={copyDanDe}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                                    copied ? 'bg-green-100 border-green-300 text-green-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                {copied ? '✓ Đã sao chép' : 'Sao chép dàn'}
                            </button>
                        </div>

                        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                            {data.dan_de.map(num => {
                                const sources = getNumSources(num);
                                const isAI = sources.includes('AI dự đoán');
                                const isHot = sources.includes('Tần suất cao');
                                const isGan = sources.includes('Lô gan chín');
                                const isBaCang = sources.includes('Ba càng GĐB');
                                return (
                                    <div
                                        key={num}
                                        title={sources.join(', ')}
                                        className={`relative p-2 rounded-lg border text-center cursor-help transition-all hover:scale-105 ${
                                            isAI && isHot ? 'bg-red-600 border-red-500 text-white shadow-md' :
                                            isAI ? 'bg-purple-100 border-purple-300 text-purple-800' :
                                            isHot ? 'bg-amber-100 border-amber-300 text-amber-800' :
                                            isGan ? 'bg-blue-100 border-blue-300 text-blue-800' :
                                            'bg-gray-50 border-gray-200 text-gray-700'
                                        }`}
                                    >
                                        <div className="font-black text-lg">{num}</div>
                                        <div className="flex justify-center gap-0.5 mt-0.5">
                                            {isHot && <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>}
                                            {isGan && <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>}
                                            {isBaCang && <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>}
                                            {isAI && <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-600 border-t pt-3">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Tần suất cao 30 ngày</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Lô gan chín</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Ba càng GĐB</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> AI dự đoán</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-600"></span> Nhiều nguồn + AI</span>
                        </div>
                    </div>

                    {/* Sources breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Tần suất cao */}
                        <div className="card">
                            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                                Tần suất cao ({data.days_analyzed} ngày)
                            </h3>
                            <div className="flex flex-wrap gap-1.5">
                                {data.hot_nums.map(n => (
                                    <span key={n} className="px-2 py-1 bg-amber-100 border border-amber-200 text-amber-800 font-bold text-sm rounded">{n}</span>
                                ))}
                            </div>
                        </div>

                        {/* Lô gan */}
                        <div className="card">
                            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
                                Lô gan chín (5+ ngày không về)
                            </h3>
                            <div className="flex flex-wrap gap-1.5">
                                {data.gan_nums.map(n => (
                                    <span key={n} className="px-2 py-1 bg-blue-100 border border-blue-200 text-blue-800 font-bold text-sm rounded">{n}</span>
                                ))}
                            </div>
                        </div>

                        {/* Ba càng GĐB */}
                        <div className="card">
                            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span>
                                Ba càng từ GĐB ({data.ba_cang})
                            </h3>
                            <div className="flex flex-wrap gap-1.5">
                                {data.ba_cang_loto.map(n => (
                                    <span key={n} className="px-2 py-1 bg-orange-100 border border-orange-200 text-orange-800 font-bold text-sm rounded">{n}</span>
                                ))}
                            </div>
                        </div>

                        {/* AI */}
                        <div className="card">
                            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-purple-500 inline-block"></span>
                                AI dự đoán hôm nay
                            </h3>
                            {data.ai_predicted.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                    {data.ai_predicted.map(n => (
                                        <span key={n} className="px-2 py-1 bg-purple-100 border border-purple-200 text-purple-800 font-bold text-sm rounded">{n}</span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-sm italic">Chưa có dự đoán AI</p>
                            )}
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-xs text-yellow-800">
                        <strong>Lưu ý:</strong> Dàn đề này chỉ mang tính tham khảo dựa trên phân tích thống kê lịch sử.
                        Xổ số là trò chơi may mắn với kết quả hoàn toàn ngẫu nhiên — không có phương pháp nào đảm bảo trúng thưởng.
                        Chơi có trách nhiệm, đặt mức giới hạn ngân sách cho bản thân.
                    </div>
                </div>
            )}

            <div className="mt-10 p-6 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-700 leading-relaxed text-justify shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Về Soi Cầu Dàn Đề</h2>
                <p>
                    <strong>Dàn đề</strong> là bộ nhiều số được chọn lọc để đánh cùng một lúc, giảm thiểu rủi ro so với chọn 1-2 số lẻ.
                    Hệ thống tổng hợp từ 4 nguồn: số có tần suất về cao trong 30 ngày gần nhất, lô gan đang chín muồi,
                    cặp số từ ba càng giải đặc biệt, và dự đoán thống kê AI. Số xuất hiện từ nhiều nguồn được ưu tiên.
                </p>
            </div>
        </div>
    );
}
