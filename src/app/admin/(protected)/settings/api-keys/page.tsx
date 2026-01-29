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
    provider: string; // 'gemini' | 'claude'
}

export default function ApiKeyManager() {
    const [keys, setKeys] = useState<APIKey[]>([]);
    const [newKey, setNewKey] = useState('');
    const [provider, setProvider] = useState('gemini');
    const [loading, setLoading] = useState(true);

    const fetchKeys = async () => {
        try {
            const res = await fetch('/api/admin/api-keys');
            const data = await res.json();
            if (data.success) {
                setKeys(data.data);
            }
        } catch (error) {
            toast.error('Failed to load keys');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKeys();
    }, []);

    const handleAddKey = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKey.trim()) return;

        try {
            const res = await fetch('/api/admin/api-keys', {
                method: 'POST',
                body: JSON.stringify({ key: newKey.trim(), provider }),
            });
            const data = await res.json();

            if (data.success) {
                toast.success('Key added successfully');
                setNewKey('');
                fetchKeys();
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            toast.error('Failed to add key');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure?')) return;

        try {
            const res = await fetch(`/api/admin/api-keys?id=${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                toast.success('Key deleted');
                fetchKeys();
            }
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Quản lý API Key (Gemini)</h2>
                <span className="text-sm text-gray-500">
                    Sử dụng nhiều key để tránh bị giới hạn (Rate Limit)
                </span>
            </div>

            {/* Add Key Form */}
            <form onSubmit={handleAddKey} className="flex gap-2">
                <input
                    type="text"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="Nhập API Key mới..."
                    className="flex-1 input input-bordered"
                />
                <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="select select-bordered w-32"
                >
                    <option value="gemini">Gemini</option>
                    <option value="claude">Claude</option>
                </select>
                <button type="submit" className="btn btn-primary">
                    Thêm Key
                </button>
            </form>

            {/* Key List */}
            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th>Key (Masked)</th>
                            <th>Provider</th>
                            <th>Status</th>
                            <th>Usage</th>
                            <th>Errors</th>
                            <th>Last Used</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {keys.map((k) => (
                            <tr key={k.id}>
                                <td className="font-mono text-sm">
                                    {k.key.substring(0, 8)}...{k.key.substring(k.key.length - 4)}
                                </td>
                                <td>
                                    <span className={`badge ${k.provider === 'claude' ? 'badge-secondary' : 'badge-primary'}`}>
                                        {k.provider || 'gemini'}
                                    </span>
                                </td>
                                <td>
                                    <span className={`badge ${k.status === 'active' ? 'badge-success' :
                                        k.status === 'rate_limited' ? 'badge-warning' : 'badge-error'
                                        }`}>
                                        {k.status}
                                    </span>
                                </td>
                                <td>{k.usage_count}</td>
                                <td className="text-red-500">{k.error_count}</td>
                                <td className="text-xs text-gray-500">
                                    {k.last_used ? new Date(k.last_used).toLocaleString('vi-VN') : 'Never'}
                                </td>
                                <td>
                                    <button
                                        onClick={() => handleDelete(k.id)}
                                        className="btn btn-sm btn-ghost text-red-600"
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {keys.length === 0 && !loading && (
                            <tr>
                                <td colSpan={6} className="text-center py-4 text-gray-500">
                                    Chưa có key nào. Hãy thêm key để kích hoạt AI.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
