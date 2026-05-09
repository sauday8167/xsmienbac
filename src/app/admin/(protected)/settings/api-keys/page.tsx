'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface APIKey {
    id: number;
    key: string;
    status: string;
    usage_count: number;
    last_used: string;
    error_count: number;
    provider: string;
}

const PROVIDERS = [
    { value: 'claude', label: 'Claude (Anthropic)' },
    { value: 'openrouter', label: 'OpenRouter' },
    { value: 'gemini', label: 'Gemini (Google)' },
];

const STATUS_COLORS: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    rate_limited: 'bg-yellow-100 text-yellow-800',
    quota_exceeded: 'bg-orange-100 text-orange-800',
    disabled: 'bg-gray-100 text-gray-600',
};

const PROVIDER_COLORS: Record<string, string> = {
    claude: 'bg-purple-100 text-purple-800',
    openrouter: 'bg-blue-100 text-blue-800',
    gemini: 'bg-teal-100 text-teal-800',
};

export default function ApiKeyManager() {
    const [keys, setKeys] = useState<APIKey[]>([]);
    const [newKey, setNewKey] = useState('');
    const [provider, setProvider] = useState('claude');
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    const fetchKeys = async () => {
        try {
            const res = await fetch('/api/admin/api-keys');
            const data = await res.json();
            if (data.success) setKeys(data.data);
        } catch {
            toast.error('Không tải được danh sách key');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchKeys(); }, []);

    const handleAddKey = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKey.trim()) return;
        setAdding(true);
        try {
            const res = await fetch('/api/admin/api-keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: newKey.trim(), provider }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Đã thêm API key thành công');
                setNewKey('');
                fetchKeys();
            } else {
                toast.error(data.error || 'Thêm key thất bại');
            }
        } catch {
            toast.error('Lỗi kết nối');
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bạn có chắc muốn xóa key này?')) return;
        try {
            const res = await fetch(`/api/admin/api-keys?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Đã xóa key');
                fetchKeys();
            } else {
                toast.error('Xóa thất bại');
            }
        } catch {
            toast.error('Lỗi kết nối');
        }
    };

    const handleReEnable = async (id: number) => {
        try {
            const res = await fetch(`/api/admin/api-keys/enable?id=${id}`, { method: 'POST' });
            if (res.ok) {
                toast.success('Đã kích hoạt lại key');
                fetchKeys();
            } else {
                toast.error('Kích hoạt thất bại');
            }
        } catch {
            toast.error('Lỗi kết nối');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Quản lý API Keys</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Ưu tiên sử dụng: Claude (viết bài + dự đoán) → OpenRouter (Gemini/Grok fallback)
                </p>
            </div>

            {/* Add Key Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Thêm API Key mới</h2>
                <form onSubmit={handleAddKey} className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        value={newKey}
                        onChange={(e) => setNewKey(e.target.value)}
                        placeholder="Dán API Key vào đây..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-lottery-red-500 font-mono text-sm"
                    />
                    <select
                        value={provider}
                        onChange={(e) => setProvider(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-lottery-red-500 bg-white"
                    >
                        {PROVIDERS.map(p => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                    </select>
                    <button
                        type="submit"
                        disabled={adding || !newKey.trim()}
                        className="px-6 py-2 bg-lottery-red-600 hover:bg-lottery-red-700 text-white font-medium rounded-lg transition disabled:opacity-50 whitespace-nowrap"
                    >
                        {adding ? 'Đang thêm...' : 'Thêm Key'}
                    </button>
                </form>
                <div className="mt-3 text-xs text-gray-500 space-y-0.5">
                    <p>• Claude: lấy tại <strong>console.anthropic.com</strong> → API Keys</p>
                    <p>• OpenRouter: lấy tại <strong>openrouter.ai</strong> → Keys (cần nạp credits để dùng Gemini/Grok)</p>
                    <p>• Gemini: lấy tại <strong>aistudio.google.com/apikey</strong></p>
                </div>
            </div>

            {/* Key List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Key (Ẩn)</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Provider</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Trạng thái</th>
                            <th className="px-4 py-3 text-center font-semibold text-gray-700">Lần dùng</th>
                            <th className="px-4 py-3 text-center font-semibold text-gray-700">Lỗi</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Dùng lần cuối</th>
                            <th className="px-4 py-3 text-center font-semibold text-gray-700">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">Đang tải...</td>
                            </tr>
                        ) : keys.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                                    Chưa có key nào. Thêm key để kích hoạt AI.
                                </td>
                            </tr>
                        ) : keys.map((k) => (
                            <tr key={k.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-mono text-xs text-gray-700">
                                    {k.key.substring(0, 10)}...{k.key.substring(k.key.length - 4)}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${PROVIDER_COLORS[k.provider] || 'bg-gray-100 text-gray-700'}`}>
                                        {k.provider || 'gemini'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[k.status] || 'bg-gray-100 text-gray-600'}`}>
                                        {k.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center text-gray-700">{k.usage_count}</td>
                                <td className="px-4 py-3 text-center font-medium text-red-600">{k.error_count}</td>
                                <td className="px-4 py-3 text-xs text-gray-500">
                                    {k.last_used ? new Date(k.last_used).toLocaleString('vi-VN') : '—'}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        {k.status === 'disabled' && (
                                            <button
                                                onClick={() => handleReEnable(k.id)}
                                                className="px-2 py-1 text-xs bg-green-50 text-green-700 hover:bg-green-100 rounded transition"
                                            >
                                                Bật lại
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(k.id)}
                                            className="px-2 py-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded transition"
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
    );
}
