'use client';

import { useState, useEffect } from 'react';
import JsonLd from '@/components/seo/JsonLd';
import { generateManualArticleSchema, generateBreadcrumbSchema, generateFAQSchema } from '@/lib/schema-generator';
import TopicHub from '@/components/TopicHub';

interface BridgePath {
    date: string;
    val1: string;
    val2: string;
    val3?: string;
    val4?: string;
    result: string;
    targetDate: string;
    isHit: boolean;
}

interface Bridge {
    index1: number;
    index2: number;
    index3?: number;
    index4?: number;
    predictedNumber: string;
    amplitude: number;
    bridgepath: BridgePath[];
}

interface AggregatedStat {
    number: string;
    count: number;
}

interface ApiResponse {
    date: string;
    amplitude: number;
    totalBridges: number;
    bridges: Bridge[];
    aggregated: AggregatedStat[];
    touchStats?: { digit: string; count: number }[];
}

const BACH_THU_BREADCRUMBS = [
    { name: 'Trang chủ', item: '/' },
    { name: 'Phân Tích Bạch Thủ', item: '/soi-cau-bach-thu' }
];

const BACH_THU_SCHEMA = {
    title: 'Soi Cầu Bạch Thủ Xổ Số Miền Bắc - Phân Tích Song Thủ & Dàn Đề Chuẩn',
    description: 'Bạch Thủ Xổ Số Miền Bắc: Phân tích Bạch Thủ và Song Thủ dựa trên thuật toán thống kê xác suất cao nhất hôm nay.',
};

const BACH_THU_FAQS = [
    { question: 'Bạch thủ là gì?', answer: 'Bạch thủ là cách chơi xổ số lô đề đặt cược vào duy nhất một con số (2 chữ số cuối) trong ngày.' },
    { question: 'Song thủ khác bạch thủ như thế nào?', answer: 'Song thủ là chọn 2 con số thay vì 1. Tỷ lệ thắng cao hơn vì có 2 cơ hội về.' },
];

export default function SoiCauBachThuClient() {
    const [amplitude, setAmplitude] = useState<number>(3);
    const [activeTab, setActiveTab] = useState<'loto' | 'special' | 'loto3d' | 'loto4d' | 'special-touch' | 'loto-dau'>('loto');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<ApiResponse | null>(null);
    const [selectedBridge, setSelectedBridge] = useState<Bridge | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);

    const minAmplitude = activeTab === 'special' ? 1 : 3;

    useEffect(() => {
        if (amplitude < minAmplitude) {
            setAmplitude(minAmplitude);
        } else {
            handleAnalyze();
        }
    }, [activeTab]);

    const getNextDate = (dateStr: string) => {
        const d = new Date(dateStr);
        d.setDate(d.getDate() + 1);
        return d.toLocaleDateString('vi-VN');
    };

    const handleAnalyze = async () => {
        setLoading(true);
        setSelectedBridge(null);
        try {
            const effectiveAmplitude = amplitude < minAmplitude ? minAmplitude : amplitude;
            const res = await fetch(`/api/soi-cau-bach-thu?amplitude=${effectiveAmplitude}&type=${activeTab}`);
            const result = await res.json();
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (!data || !data.aggregated.length) return;
        const numbers = data.aggregated.map(item => item.number).join(', ');
        navigator.clipboard.writeText(numbers).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 p-4">
            <JsonLd data={generateManualArticleSchema(BACH_THU_SCHEMA.title, BACH_THU_SCHEMA.description, '/soi-cau-bach-thu')} />
            <JsonLd data={generateBreadcrumbSchema(BACH_THU_BREADCRUMBS)} />
            <JsonLd data={generateFAQSchema(BACH_THU_FAQS)} />
            
            <div className="text-center">
                <h1 className="text-xl md:text-3xl font-bold text-lottery-gray-800 mb-2">
                    {activeTab === 'loto' ? 'Soi Cầu Loto Bạch Thủ' :
                        activeTab === 'special' ? 'Soi Cầu Bạch Thủ Đặc Biệt' :
                            activeTab === 'special-touch' ? 'Soi Cầu Chạm Đặc Biệt' :
                                activeTab === 'loto-dau' ? 'Soi Cầu Loto Đầu' :
                                    activeTab === 'loto3d' ? 'Soi Cầu Loto 3D' :
                                        'Soi Cầu Loto 4D'}
                </h1>

                {data && (
                    <div className="inline-block bg-green-100 text-green-800 px-4 py-1 rounded-full text-sm font-semibold mt-2 border border-green-200">
                        ✅ Đã có kết quả {new Date(data.date).toLocaleDateString('vi-VN')} → Dự báo cho: <span className="text-lottery-red-600 font-bold text-base">{getNextDate(data.date)}</span>
                    </div>
                )}

                <div className="flex justify-center mt-6 space-x-4 flex-wrap gap-2">
                    {[
                        { id: 'loto', label: 'Bạch Thủ Loto' },
                        { id: 'loto-dau', label: 'Loto Đầu' },
                        { id: 'special', label: 'Bạch Thủ Đặc Biệt' },
                        { id: 'special-touch', label: 'Chạm Đặc Biệt' },
                        { id: 'loto3d', label: 'Loto 3D' },
                        { id: 'loto4d', label: 'Loto 4D' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2 rounded-full font-bold transition-all text-sm ${activeTab === tab.id ? 'bg-lottery-red-600 text-white shadow-lg' : 'bg-white text-gray-600 border'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="card bg-white shadow-lg border border-gray-100 p-6 rounded-xl">
                <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
                    <div className="w-full md:w-1/2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Biên độ cầu: <span className="text-lottery-red-600">{amplitude} ngày</span></label>
                        <input type="range" min={minAmplitude} max="20" value={amplitude} onChange={(e) => setAmplitude(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-lottery-red-600" />
                    </div>
                    <button onClick={handleAnalyze} disabled={loading} className="btn bg-lottery-red-600 text-white px-8 py-3 rounded-lg font-bold disabled:opacity-50">
                        {loading ? 'Đang Phân Tích...' : '🔍 Soi Cầu Ngay'}
                    </button>
                </div>
            </div>

            {data && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="card bg-white shadow border border-gray-200 p-0 overflow-hidden">
                            <div className="bg-blue-600 p-4 text-white flex justify-between items-center group">
                                <h3 className="font-bold">🔥 Top số Đẹp Nhất</h3>
                            </div>
                            <div className="p-4 max-h-[500px] overflow-y-auto">
                                {data.aggregated.map((item, idx) => (
                                    <div key={item.number} className="flex items-center justify-between p-3 border-b hover:bg-blue-50 cursor-pointer" onClick={() => {
                                        const bridge = data.bridges.find(b => b.predictedNumber === item.number);
                                        if (bridge) setSelectedBridge(bridge);
                                    }}>
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl font-bold text-lottery-red-600">{item.number}</span>
                                        </div>
                                        <div className="text-sm font-semibold text-gray-600">{item.count} đường cầu</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        {selectedBridge ? (
                            <div className="card bg-white shadow-lg p-6 border border-lottery-red-100">
                                <h3 className="text-xl font-bold mb-4">Chi tiết Cầu: <span className="text-lottery-red-600 text-3xl">{selectedBridge.predictedNumber}</span></h3>
                                <div className="space-y-6">
                                    <div className="relative border-l-2 ml-4 space-y-8 py-4">
                                        {selectedBridge.bridgepath.map((step, i) => (
                                            <div key={i} className="relative pl-8">
                                                <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-green-500 border-4 border-white shadow-sm"></div>
                                                <div className="text-sm text-gray-500">Lấy số: {new Date(step.date).toLocaleDateString('vi-VN')} → Ra số: <strong className="text-blue-600">{step.result}</strong> ngày {new Date(step.targetDate).toLocaleDateString('vi-VN')}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed rounded-xl p-12 bg-gray-50 text-center">
                                🔍 Chọn một bộ số để xem chi tiết đường cầu
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            <div className="my-6">
                <TopicHub title="Công Cụ Soi Cầu Liên Quan" />
            </div>
        </div>
    );
}
