'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CustomCodePage() {
    const [header, setHeader] = useState('');
    const [footer, setFooter] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await fetch('/api/admin/custom-code');
            const data = await res.json();
            setHeader(data.header || '');
            setFooter(data.footer || '');
        } catch (error) {
            console.error('Failed to fetch config:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch('/api/admin/custom-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ header, footer }),
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Đã lưu cấu hình thành công!' });
            } else {
                setMessage({ type: 'error', text: 'Có lỗi xảy ra khi lưu.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Lỗi kết nối máy chủ.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lottery-red-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Cấu hình Header & Footer</h1>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`px-6 py-2 rounded-lg font-bold text-white transition-all ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-lottery-red-600 hover:bg-lottery-red-700 shadow-lg hover:shadow-lottery-red-500/30'
                        }`}
                >
                    {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
                </button>
            </div>

            {message.text && (
                <div className={`p-4 rounded-lg mb-6 flex items-center gap-3 ${message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                    {message.type === 'success' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )}
                    <span className="font-medium">{message.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 gap-8">
                {/* Header Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <svg className="w-5 h-5 text-lottery-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                            Header Code
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Mã này sẽ được chèn vào bên trong thẻ <code className="bg-gray-200 px-1 rounded">&lt;head&gt;</code>. Thường dùng cho tracking (GA, Pixel), Meta tags...
                        </p>
                    </div>
                    <div className="p-6">
                        <textarea
                            value={header}
                            onChange={(e) => setHeader(e.target.value)}
                            className="w-full h-64 p-4 font-mono text-sm bg-gray-900 text-gray-100 rounded-xl focus:ring-2 focus:ring-lottery-red-500 border-none resize-y"
                            placeholder="<!-- Ví dụ: Google Analytics Tracking Code -->"
                            spellCheck={false}
                        />
                    </div>
                </div>

                {/* Footer Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <svg className="w-5 h-5 text-lottery-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                            Footer Code
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Mã này sẽ được chèn vào trước thẻ đóng <code className="bg-gray-200 px-1 rounded">&lt;/body&gt;</code>. Thường dùng cho các script hỗ trợ (Chat, Popups)...
                        </p>
                    </div>
                    <div className="p-6">
                        <textarea
                            value={footer}
                            onChange={(e) => setFooter(e.target.value)}
                            className="w-full h-64 p-4 font-mono text-sm bg-gray-900 text-gray-100 rounded-xl focus:ring-2 focus:ring-lottery-red-500 border-none resize-y"
                            placeholder="<!-- Ví dụ: Facebook Chat plugin script -->"
                            spellCheck={false}
                        />
                    </div>
                </div>
            </div>

            <div className="mt-8 bg-amber-50 rounded-xl p-6 border border-amber-200 text-amber-800 flex flex-col gap-2">
                <div className="flex items-center gap-2 font-bold">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Lưu ý về bảo mật
                </div>
                <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Hãy cẩn trọng khi chèn các script lạ từ nguồn không tin cậy.</li>
                    <li>Mã chèn vào sẽ có hiệu lực ngay lập tức cho toàn bộ người dùng truy cập website.</li>
                    <li>Sử dụng đúng các thẻ HTML như <code className="bg-amber-100 px-1 rounded">&lt;script&gt;</code> hoặc <code className="bg-amber-100 px-1 rounded">&lt;style&gt;</code>.</li>
                </ul>
            </div>
        </div>
    );
}
