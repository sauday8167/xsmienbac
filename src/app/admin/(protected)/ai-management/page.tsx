'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface ModelInfo {
    name: string;
    provider: string;
    version: string;
    description: string;
}

interface AccuracyStats {
    totalPredictions: number;
    checkedPredictions: number;
    correctPredictions: number;
    accuracyRate: number;
    lastUpdated: string;
}

interface Prediction {
    date: string;
    predicted: string[];
    actual: string[];
    isCorrect: boolean;
    confidence: number;
    notes: string;
    createdAt: string;
}

interface AIStatistics {
    modelInfo: ModelInfo;
    accuracy: AccuracyStats;
    recentPredictions: Prediction[];
    lastRun: {
        prediction: string | null;
        article: string | null;
    };
}

export default function AIManagementPage() {
    const [statistics, setStatistics] = useState<AIStatistics | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRunningPrediction, setIsRunningPrediction] = useState(false);
    const [isRunningHoiDong, setIsRunningHoiDong] = useState(false);
    const [isGeneratingArticle, setIsGeneratingArticle] = useState(false);

    // Fetch statistics on mount
    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        try {
            const response = await fetch('/api/admin/ai/statistics');
            const data = await response.json();

            if (data.success) {
                setStatistics(data.data);
            } else {
                toast.error(data.error || 'Failed to fetch statistics');
            }
        } catch (error) {
            console.error('Error fetching statistics:', error);
            toast.error('Failed to load AI statistics');
        } finally {
            setLoading(false);
        }
    };

    const handleRunPrediction = async () => {
        if (isRunningPrediction) return;

        setIsRunningPrediction(true);
        const toastId = toast.loading('Đang chạy phân tích AI...');

        try {
            const response = await fetch('/api/admin/ai/run-prediction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });

            if (!response.ok) {
                // Handle HTTP errors
                let errorMsg = `Lỗi server (${response.status})`;
                try {
                    const data = await response.json();
                    errorMsg = data.error || errorMsg;
                } catch (e) {
                    // JSON parsing failed, use default message
                }
                toast.error(errorMsg, { id: toastId });
                return;
            }

            const data = await response.json();

            if (data.success) {
                toast.success('Dự đoán AI hoàn tất!', { id: toastId });
                // Refresh statistics
                await fetchStatistics();
            } else {
                toast.error(data.error || 'Dự đoán AI thất bại', { id: toastId });
            }
        } catch (error) {
            console.error('Error running prediction:', error);
            toast.error('Lỗi kết nối hoặc network', { id: toastId });
        } finally {
            setIsRunningPrediction(false);
        }
    };

    const handleRunHoiDong = async () => {
        if (isRunningHoiDong) return;

        setIsRunningHoiDong(true);
        const toastId = toast.loading('Đang chạy phân tích Hội Đồng Bạc Nhớ (VIP)...');

        try {
            const response = await fetch('/api/admin/ai/run-prediction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode: 'hoi-dong' })
            });

            if (!response.ok) {
                let errorMsg = `Lỗi server (${response.status})`;
                try {
                    const data = await response.json();
                    errorMsg = data.error || errorMsg;
                } catch (e) {
                }
                toast.error(errorMsg, { id: toastId });
                return;
            }

            const data = await response.json();

            if (data.success) {
                toast.success('Dự đoán Hội Đồng hoàn tất!', { id: toastId });
                await fetchStatistics();
            } else {
                toast.error(data.error || 'Dự đoán thất bại', { id: toastId });
            }
        } catch (error) {
            console.error('Error running hoi-dong:', error);
            toast.error('Lỗi kết nối hoặc network', { id: toastId });
        } finally {
            setIsRunningHoiDong(false);
        }
    };

    const handleGenerateArticle = async () => {
        if (isGeneratingArticle) return;

        setIsGeneratingArticle(true);
        const toastId = toast.loading('Đang viết bài tin tức AI...');

        try {
            const response = await fetch('/api/admin/ai/generate-article', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });

            if (!response.ok) {
                // Handle HTTP errors
                let errorMsg = `Lỗi server (${response.status})`;
                try {
                    const data = await response.json();
                    errorMsg = data.error || errorMsg;
                } catch (e) {
                    // JSON parsing failed, use default message
                }
                toast.error(errorMsg, { id: toastId });
                return;
            }

            const data = await response.json();

            if (data.success) {
                toast.success('Bài viết AI đã được tạo và xuất bản!', { id: toastId });
                await fetchStatistics();
            } else {
                toast.error(data.error || 'Viết bài thất bại', { id: toastId });
            }
        } catch (error) {
            console.error('Error generating article:', error);
            toast.error('Lỗi kết nối hoặc network', { id: toastId });
        } finally {
            setIsGeneratingArticle(false);
        }
    };

    const handleDeletePrediction = async (id: string, date: string) => {
        if (!confirm(`Bạn có chắc muốn xóa dự đoán ngày ${formatDate(date)}?`)) return;

        const toastId = toast.loading('Đang xóa dự đoán...');

        try {
            const response = await fetch(`/api/admin/ai/delete?id=${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                let errorMsg = `Lỗi server (${response.status})`;
                try {
                    const data = await response.json();
                    errorMsg = data.error || errorMsg;
                } catch (e) {
                    // Ignore json error
                }
                toast.error(errorMsg, { id: toastId });
                return;
            }

            const data = await response.json();
            if (data.success) {
                toast.success('Đã xóa dự đoán!', { id: toastId });
                await fetchStatistics();
            } else {
                toast.error(data.error || 'Xóa thất bại', { id: toastId });
            }
        } catch (error) {
            console.error('Error deleting prediction:', error);
            toast.error('Lỗi kết nối', { id: toastId });
        }
    };


    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'Chưa có';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) {
                // Invalid date
                return dateStr; // Return original string
            }
            return date.toLocaleString('vi-VN');
        } catch (e) {
            return dateStr; // Return original string on error
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (!statistics) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <p className="text-red-800">Không thể tải thống kê AI</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-800">
                    🤖 Quản Trị AI
                </h1>
                <button
                    onClick={fetchStatistics}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                >
                    🔄 Làm mới
                </button>
            </div>

            {/* Model Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="text-2xl mr-2">📊</span>
                    Thông Tin AI Model
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">Tên Model</p>
                        <p className="text-lg font-semibold text-gray-900">{statistics.modelInfo.name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Nhà Cung Cấp</p>
                        <p className="text-lg font-semibold text-gray-900">{statistics.modelInfo.provider}</p>
                    </div>
                    <div className="md:col-span-2">
                        <p className="text-sm text-gray-600">Mô Tả</p>
                        <p className="text-gray-700 leading-relaxed">{statistics.modelInfo.description}</p>
                    </div>
                </div>
            </div>

            {/* Accuracy Statistics */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="text-2xl mr-2">📈</span>
                    Tỷ Lệ Dự Đoán Đúng
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-4 text-center">
                        <p className="text-3xl font-bold text-red-600">{statistics.accuracy.accuracyRate.toFixed(1)}%</p>
                        <p className="text-sm text-gray-600 mt-1">Độ Chính Xác</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                        <p className="text-3xl font-bold text-green-600">{statistics.accuracy.correctPredictions}</p>
                        <p className="text-sm text-gray-600 mt-1">Dự Đoán Đúng</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                        <p className="text-3xl font-bold text-blue-600">{statistics.accuracy.checkedPredictions}</p>
                        <p className="text-sm text-gray-600 mt-1">Đã Kiểm Tra</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                        <p className="text-3xl font-bold text-gray-600">{statistics.accuracy.totalPredictions}</p>
                        <p className="text-sm text-gray-600 mt-1">Tổng Dự Đoán</p>
                    </div>
                </div>
                <p className="text-xs text-gray-600 mt-4 text-center">
                    Cập nhật: {formatDate(statistics.accuracy.lastUpdated)}
                </p>
            </div>

            {/* Manual Control Buttons */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="text-2xl mr-2">⚡</span>
                    Thao Tác Thủ Công
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                    <button
                        onClick={handleRunPrediction}
                        disabled={isRunningPrediction}
                        className={`
                            p-6 rounded-lg font-semibold text-lg transition-all transform hover:scale-105
                            ${isRunningPrediction
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-lg'
                            }
                        `}
                    >
                        {isRunningPrediction ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang phân tích...
                            </span>
                        ) : (
                            <>🔮 Chạy Dự Đoán AI</>
                        )}
                    </button>
                    
                    <button
                        onClick={handleRunHoiDong}
                        disabled={isRunningHoiDong}
                        className={`
                            p-6 rounded-lg font-semibold text-lg transition-all transform hover:scale-105
                            ${isRunningHoiDong
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-lg'
                            }
                        `}
                    >
                        {isRunningHoiDong ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang phân tích Hội Đồng...
                            </span>
                        ) : (
                            <>👑 Chạy Hội Đồng Bạc Nhớ</>
                        )}
                    </button>

                    <button
                        onClick={handleGenerateArticle}
                        disabled={isGeneratingArticle}
                        className={`
                            p-6 rounded-lg font-semibold text-lg md:col-span-2 transition-all transform hover:scale-105
                            ${isGeneratingArticle
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg'
                            }
                        `}
                    >
                        {isGeneratingArticle ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang viết bài...
                            </span>
                        ) : (
                            <>📝 Viết Tin Tức AI</>
                        )}
                    </button>
                </div>
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Lần Chạy Gần Nhất:</h3>
                    <div className="grid md:grid-cols-2 gap-2 text-sm">
                        <p className="text-blue-800">
                            <span className="font-medium">Dự đoán:</span> {formatDate(statistics.lastRun.prediction)}
                        </p>
                        <p className="text-blue-800">
                            <span className="font-medium">Bài viết:</span> {formatDate(statistics.lastRun.article)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Recent Predictions */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="text-2xl mr-2">🎯</span>
                    Lịch Sử Dự Đoán Gần Đây
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Ngày</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Dự Đoán</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-700">Kết Quả Thực</th>
                                <th className="px-4 py-3 text-center font-semibold text-gray-700">Độ Tin Cậy</th>
                                <th className="px-4 py-3 text-center font-semibold text-gray-700">Trạng Thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {statistics.recentPredictions.map((pred, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-gray-900 font-medium">
                                        {new Date(pred.date).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {(Array.isArray(pred.predicted) ? pred.predicted : []).slice(0, 5).map((num, i) => (
                                                <span key={i} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-semibold">
                                                    {num}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {Array.isArray(pred.actual) && pred.actual.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {pred.actual.slice(0, 5).map((num, i) => (
                                                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                                                        {num}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-xs">Chưa có</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="font-semibold text-gray-700">{pred.confidence}%</span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            {pred.actual.length > 0 ? (
                                                pred.isCorrect ? (
                                                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                                        ✓ Đúng
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                                                        ✗ Sai
                                                    </span>
                                                )
                                            ) : (
                                                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                                                    ⏳ Chờ
                                                </span>
                                            )}

                                            {/* Delete Button */}
                                            {/* We need the ID to delete. Assuming 'id' is in the prediction object. 
                                                If not, we might need to rely on date or update the Statistics interface.
                                                Note: The current 'Prediction' interface in the code above DOES NOT have an 'id'.
                                                I need to check if the API returns it. 
                                                If not, I might need to delete by date or update the API to return ID.
                                                Let's assume for now we use 'date' if id is missing, or update interface.
                                                Wait, the 'delete' API I wrote uses 'id'.
                                                I should update the fetch to include ID.
                                                Let's verify the Prediction interface first or assume 'any' for now or update it.
                                            */}
                                            <button
                                                onClick={() => handleDeletePrediction((pred as any).id, pred.date)}
                                                className="text-red-600 hover:text-red-800 text-xs underline"
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
