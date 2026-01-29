'use client';

import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState<{
        site_name: string;
        site_description: string;
        contact_email: string;
        contact_phone: string;
        maintenance_mode: boolean;
        theme_color: string;
        social_facebook: string;
        social_zalo: string;
        social_telegram: string;
        proxies: string[];
        proxy_url?: string; // Legacy
    }>({
        site_name: '',
        site_description: '',
        contact_email: '',
        contact_phone: '',
        maintenance_mode: false,
        theme_color: '#EF4444',
        social_facebook: '',
        social_zalo: '',
        social_telegram: '',
        proxies: []
    });
    const [testingProxy, setTestingProxy] = useState<string | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/admin/settings');
                const data = await res.json();
                if (data.success) {
                    // Migration on frontend load if needed, though backend handles it
                    const loadedSettings = data.data;
                    if (!loadedSettings.proxies) loadedSettings.proxies = [];
                    // Ensure max 3
                    if (loadedSettings.proxies.length > 3) loadedSettings.proxies = loadedSettings.proxies.slice(0, 3);
                    setSettings(loadedSettings);
                }
            } catch (error) {
                console.error('Fetch error:', error);
                toast.error('Lỗi tải cấu hình');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Clean empty proxies
            const cleanSettings = {
                ...settings,
                proxies: settings.proxies.filter(p => p.trim() !== '')
            };

            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cleanSettings)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Lưu cài đặt thành công');
                setSettings(cleanSettings);
            } else {
                toast.error('Lỗi: ' + data.error);
            }
        } catch (error) {
            toast.error('Lỗi kết nối');
        }
    };

    const handleTestProxy = async (proxy: string) => {
        if (!proxy) {
            toast.error('Vui lòng nhập Proxy trước khi kiểm tra');
            return;
        }

        setTestingProxy(proxy);
        try {
            const res = await fetch('/api/admin/settings/test-proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ proxy_url: proxy })
            });
            const data = await res.json();

            if (data.success) {
                toast.success(data.message);
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            toast.error('Lỗi kết nối đến server');
        } finally {
            setTestingProxy(null);
        }
    };

    const handleAddProxy = () => {
        if (settings.proxies.length >= 3) {
            toast.error('Chỉ được thêm tối đa 3 Proxy');
            return;
        }
        setSettings({ ...settings, proxies: [...settings.proxies, ''] });
    };

    const handleUpdateProxy = (index: number, value: string) => {
        const newProxies = [...settings.proxies];
        newProxies[index] = value;
        setSettings({ ...settings, proxies: newProxies });
    };

    const handleRemoveProxy = (index: number) => {
        const newProxies = settings.proxies.filter((_, i) => i !== index);
        setSettings({ ...settings, proxies: newProxies });
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Đang tải...</div>;

    return (
        <div className="space-y-6">
            <Toaster position="top-right" />
            <h1 className="text-2xl font-bold text-gray-800">Cài đặt Hệ thống</h1>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">

                {/* General Info */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Thông tin Chung</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên Website</label>
                            <input
                                type="text"
                                value={settings.site_name}
                                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-lottery-red-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Màu chủ đạo</label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="color"
                                    value={settings.theme_color}
                                    onChange={(e) => setSettings({ ...settings, theme_color: e.target.value })}
                                    className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                                />
                                <span className="text-sm text-gray-600">{settings.theme_color}</span>
                            </div>
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả Website</label>
                            <textarea
                                value={settings.site_description}
                                onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-lottery-red-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Liên hệ & Mạng xã hội</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Liên hệ</label>
                            <input
                                type="email"
                                value={settings.contact_email}
                                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-lottery-red-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                            <input
                                type="text"
                                value={settings.contact_phone}
                                onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-lottery-red-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Link Facebook</label>
                            <input
                                type="text"
                                value={settings.social_facebook}
                                onChange={(e) => setSettings({ ...settings, social_facebook: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-lottery-red-500"
                                placeholder="https://facebook.com/..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Link Zalo / Telegram</label>
                            <input
                                type="text"
                                value={settings.social_zalo}
                                onChange={(e) => setSettings({ ...settings, social_zalo: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-lottery-red-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Crawler & Proxy */}
                <div>
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className="text-lg font-semibold text-gray-800">Cấu hình Proxy (Tối đa 3)</h3>
                        <button
                            type="button"
                            onClick={handleAddProxy}
                            disabled={settings.proxies.length >= 3}
                            className="text-sm px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-50 font-medium"
                        >
                            + Thêm Proxy
                        </button>
                    </div>

                    <div className="space-y-4">
                        {settings.proxies.length === 0 && (
                            <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed text-gray-500 text-sm">
                                Chưa có Proxy nào. Hãy thêm Proxy để chạy Crawler ổn định hơn.
                            </div>
                        )}

                        {settings.proxies.map((proxy, index) => (
                            <div key={index} className="flex gap-2 items-start">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={proxy}
                                        onChange={(e) => handleUpdateProxy(index, e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-lottery-red-500 font-mono text-sm"
                                        placeholder="http://user:pass@host:port"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleTestProxy(proxy)}
                                    disabled={testingProxy === proxy || !proxy}
                                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium whitespace-nowrap min-w-[100px] flex justify-center"
                                    title="Kiểm tra kết nối"
                                >
                                    {testingProxy === proxy ? (
                                        <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        'Test'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveProxy(index)}
                                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                    title="Xóa"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))}

                        <div className="text-xs text-gray-500 mt-2">
                            * Định dạng: protocol://user:pass@host:port (Ví dụ: http://user:pass@1.2.3.4:8080)
                        </div>
                    </div>
                </div>

                {/* System Mode */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Trạng thái</h3>
                    <div className="flex items-center space-x-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.maintenance_mode}
                                onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-700">Chế độ Bảo trì (Chỉ Admin truy cập được)</span>
                        </label>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                    <button
                        type="submit"
                        className="px-8 py-3 bg-gradient-to-r from-lottery-red-600 to-lottery-red-700 text-white font-bold rounded-lg hover:shadow-lg transition-transform hover:-translate-y-0.5"
                    >
                        Lưu Cấu Hình
                    </button>
                </div>
            </form>
        </div>
    );
}
