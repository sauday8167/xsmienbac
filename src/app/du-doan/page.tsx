'use client';

import { useEffect, useState } from 'react';
import type { NumberPrediction } from '@/lib/prediction';

interface PredictionData {
    overview: {
        latestDate: string;
        analyzedDays: number;
        dataRange: {
            from: string;
            to: string;
        };
    };
    allNumbers: NumberPrediction[];
    topPredictions: NumberPrediction[];
    longAbsence: NumberPrediction[];
    regularNumbers: NumberPrediction[];
    consecutiveNumbers: NumberPrediction[];
}

export default function PredictionPage() {
    const [data, setData] = useState<PredictionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'top' | 'long' | 'regular' | 'consecutive' | 'all'>('top');
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchPredictions();
    }, []);

    const fetchPredictions = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/prediction?days=100');
            const result = await response.json();

            if (result.success && result.data) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Error fetching predictions:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleRow = (number: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(number)) {
            newExpanded.delete(number);
        } else {
            newExpanded.add(number);
        }
        setExpandedRows(newExpanded);
    };

    const getLikelihoodBadge = (likelihood: string) => {
        const colors = {
            'RẤT CAO': 'bg-red-500 text-white',
            'CAO': 'bg-orange-500 text-white',
            'TRUNG BÌNH': 'bg-blue-500 text-white',
            'THẤP': 'bg-gray-400 text-white'
        };
        return colors[likelihood as keyof typeof colors] || colors['TRUNG BÌNH'];
    };

    const exportToCSV = () => {
        if (!data) return;

        const headers = ['Số', 'Lần xuất hiện', 'Tần suất', 'Chu kỳ TB', 'Số ngày gan', 'Điểm', 'Khả năng'];
        const rows = data.allNumbers.map(n => [
            n.number,
            n.appearances,
            (n.frequency * 100).toFixed(1) + '%',
            n.averageCycle?.toFixed(1) || 'N/A',
            n.daysSinceLastAppearance?.toString() || 'N/A',
            n.score.toFixed(2),
            n.likelihood
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `du-doan-xsmb-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!data) {
        return <div className="card text-center">Không có dữ liệu dự đoán</div>;
    }

    const currentData =
        activeTab === 'top' ? data.topPredictions :
            activeTab === 'long' ? data.longAbsence :
                activeTab === 'regular' ? data.regularNumbers :
                    activeTab === 'consecutive' ? data.consecutiveNumbers :
                        data.allNumbers;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-4xl font-bold text-lottery-gray-800 mb-2">
                    Tần Suất Loto
                </h1>
                <p className="text-lottery-gray-600">Phân tích thống kê và dự đoán dựa trên dữ liệu lịch sử</p>
                <div className="w-24 h-1 bg-purple-600 mx-auto rounded-full mt-4"></div>
            </div>

            {/* Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-600">
                    <div className="text-sm text-lottery-gray-600 mb-1">Ngày phân tích mới nhất</div>
                    <div className="text-2xl font-bold text-purple-600">
                        {new Date(data.overview.latestDate).toLocaleDateString('vi-VN')}
                    </div>
                </div>
                <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-600">
                    <div className="text-sm text-lottery-gray-600 mb-1">Số ngày phân tích</div>
                    <div className="text-2xl font-bold text-blue-600">{data.overview.analyzedDays} ngày</div>
                </div>
                <div className="card bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-600">
                    <div className="text-sm text-lottery-gray-600 mb-1">Khoảng thời gian</div>
                    <div className="text-lg font-bold text-green-600">
                        {new Date(data.overview.dataRange.from).toLocaleDateString('vi-VN')} - {new Date(data.overview.dataRange.to).toLocaleDateString('vi-VN')}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="card">
                <div className="flex flex-wrap gap-2 mb-4">
                    <button
                        onClick={() => setActiveTab('top')}
                        className={`btn ${activeTab === 'top' ? 'btn-primary' : 'btn-outline'}`}
                    >
                        Top 10 Dự Đoán
                    </button>
                    <button
                        onClick={() => setActiveTab('long')}
                        className={`btn ${activeTab === 'long' ? 'btn-primary' : 'btn-outline'}`}
                    >
                        Loto Gan Lâu
                    </button>
                    <button
                        onClick={() => setActiveTab('regular')}
                        className={`btn ${activeTab === 'regular' ? 'btn-primary' : 'btn-outline'}`}
                    >
                        Xuất Hiện Đều
                    </button>
                    <button
                        onClick={() => setActiveTab('consecutive')}
                        className={`btn ${activeTab === 'consecutive' ? 'btn-primary' : 'btn-outline'}`}
                    >
                        Xuất Hiện Liên Tiếp
                    </button>
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-outline'}`}
                    >
                        Tất Cả (00-99)
                    </button>
                    <button
                        onClick={exportToCSV}
                        className="btn btn-outline ml-auto"
                    >
                        📥 Xuất CSV
                    </button>
                </div>

                {/* Numbers Grid for Top Predictions */}
                {activeTab === 'top' && (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
                        {currentData.map((prediction) => (
                            <div
                                key={prediction.number}
                                className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg p-6 text-white text-center shadow-lg hover:shadow-xl transition-shadow"
                            >
                                <div className="text-4xl font-bold mb-2">{prediction.number}</div>
                                <div className="text-sm opacity-90">Điểm: {prediction.score.toFixed(2)}</div>
                                <div className={`mt-2 inline-block px-2 py-1 rounded text-xs ${getLikelihoodBadge(prediction.likelihood)}`}>
                                    {prediction.likelihood}
                                </div>
                                <div className="text-xs mt-2 opacity-75">
                                    Gan: {prediction.daysSinceLastAppearance || 'N/A'} ngày
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Table for All Data */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-lottery-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-lottery-gray-700">Số</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-lottery-gray-700">Lần xuất hiện</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-lottery-gray-700">Tần suất</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-lottery-gray-700">Chu kỳ TB</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-lottery-gray-700">Số ngày gan</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-lottery-gray-700">Điểm</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-lottery-gray-700">Khả năng</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-lottery-gray-700">Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.map((prediction, index) => (
                                <>
                                    <tr
                                        key={prediction.number}
                                        className={`border-b border-lottery-gray-200 hover:bg-lottery-gray-50 cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-lottery-gray-50'
                                            }`}
                                        onClick={() => toggleRow(prediction.number)}
                                    >
                                        <td className="px-4 py-3">
                                            <span className="stats-number text-lg font-bold">{prediction.number}</span>
                                        </td>
                                        <td className="px-4 py-3">{prediction.appearances}</td>
                                        <td className="px-4 py-3">{(prediction.frequency * 100).toFixed(1)}%</td>
                                        <td className="px-4 py-3">{prediction.averageCycle?.toFixed(1) || 'N/A'}</td>
                                        <td className="px-4 py-3 font-semibold text-lottery-red-600">
                                            {prediction.daysSinceLastAppearance !== null ? `${prediction.daysSinceLastAppearance} ngày` : 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 font-bold text-purple-600">{prediction.score.toFixed(2)}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getLikelihoodBadge(prediction.likelihood)}`}>
                                                {prediction.likelihood}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button className="text-purple-600 hover:text-purple-800">
                                                {expandedRows.has(prediction.number) ? '▼' : '▶'}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedRows.has(prediction.number) && (
                                        <tr key={`${prediction.number}-detail`} className="bg-purple-50">
                                            <td colSpan={8} className="px-4 py-3">
                                                <div className="text-sm">
                                                    <div className="mb-2">
                                                        <strong>Lần xuất hiện gần nhất:</strong>{' '}
                                                        {prediction.lastAppearanceDate
                                                            ? new Date(prediction.lastAppearanceDate).toLocaleDateString('vi-VN')
                                                            : 'Chưa xuất hiện'}
                                                    </div>
                                                    <div>
                                                        <strong>Lịch sử khoảng cách (ngày):</strong>{' '}
                                                        {prediction.historicalIntervals.length > 0
                                                            ? prediction.historicalIntervals.join('N, ') + 'N'
                                                            : 'Chưa đủ dữ liệu'}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Info */}
            <div className="card bg-purple-50 border-l-4 border-purple-500">
                <div className="flex items-start space-x-3">
                    <svg className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                        <h4 className="font-bold text-purple-900 mb-2">Giải thích thuật toán:</h4>
                        <ul className="text-sm text-purple-800 space-y-1">
                            <li><strong>Điểm (Score):</strong> (Số ngày gan / Chu kỳ TB) × Tần suất</li>
                            <li><strong>RẤT CAO:</strong> Số ngày gan {'>'} 1.3 × Chu kỳ trung bình</li>
                            <li><strong>CAO:</strong> Số ngày gan ≈ Chu kỳ trung bình</li>
                            <li><strong>Lịch sử khoảng cách:</strong> Số ngày giữa các lần xuất hiện liên tiếp (ví dụ: 8N, 7N, 4N)</li>
                            <li><strong>Lưu ý:</strong> Đây là phân tích thống kê, không đảm bảo kết quả chính xác</li>
                        </ul>
                    </div>
                </div>
            </div>
            {/* SEO Content */}
            <div className="mt-10 p-6 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-700 leading-relaxed text-justify shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Giới thiệu về Dự Đoán Xổ Số</h2>
                <p>
                    Chuyên mục <strong>Dự Đoán Xổ Số</strong> là điểm đến tin cậy của cộng đồng người chơi đam mê những con số.
                    Hàng ngày, đội ngũ chuyên gia giàu kinh nghiệm của chúng tôi tổng hợp, phân tích và đưa ra những nhận định sắc bén về cầu lô đẹp, bạch thủ, song thủ, và dàn đề có khả năng nổ cao.
                    Không chỉ dừng lại ở ý kiến cá nhân, chuyên mục còn là nơi hội tụ trí tuệ của cộng đồng, nơi các cao thủ chia sẻ cầu kèo, kinh nghiệm xương máu.
                    Hãy tham khảo các bài viết soi cầu chi tiết, được cập nhật liên tục vào khung giờ vàng buổi sáng để có thêm dữ liệu quan trọng cho quyết định chốt số của bạn.
                </p>
            </div>
        </div>
    );
}
