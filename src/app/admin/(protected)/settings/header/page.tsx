'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface BrandingConfig {
    logo: string;
    siteName: string;
    favicon?: string;
}

export default function HeaderSettingsPage() {
    const [loading, setLoading] = useState(false); // Start false to show UI immediately
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState<BrandingConfig>({ logo: '', siteName: 'XSMB', favicon: '' });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                console.log('Fetching branding config...');
                const res = await fetch('/api/admin/branding');
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                console.log('Branding config loaded:', data);
                if (data.success && data.data) {
                    setConfig({
                        logo: data.data.logo || '',
                        siteName: data.data.siteName || '',
                        favicon: data.data.favicon || ''
                    });
                }
            } catch (error) {
                console.error('Failed to load branding config:', error);
                toast.error('Không tải được cấu hình hiện tại');
            }
        };

        fetchConfig();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/admin/branding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            const result = await res.json();
            if (result.success) {
                toast.success('Lưu cấu hình thành công!');
            } else {
                toast.error('Lỗi: ' + result.error);
            }
        } catch (error) {
            toast.error('Lỗi kết nối server');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Cấu hình Header</h1>

            <form onSubmit={handleSave} className="space-y-8">
                {/* Branding Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Thông tin thương hiệu</h2>

                    <div className="space-y-6">
                        {/* Logo Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                            <input
                                type="text"
                                value={config.logo || ''}
                                onChange={(e) => setConfig({ ...config, logo: e.target.value })}
                                placeholder="https://example.com/logo.png"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lottery-red-500 outline-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">Nhập đường dẫn ảnh logo (khuyên dùng ảnh .png nền trong suốt)</p>

                            {/* Logo Preview */}
                            {config.logo && (
                                <div className="mt-4 p-4 bg-lottery-red-600 rounded-lg inline-block">
                                    <p className="text-white text-xs mb-2 opacity-80">Xem trước trên nền đỏ:</p>
                                    <img
                                        src={config.logo}
                                        alt="Logo Preview"
                                        style={{ maxHeight: '80px', width: 'auto' }}
                                        className="h-12 w-auto object-contain bg-white rounded-lg p-1"
                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Site Name Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên trang web (Site Name)</label>
                            <input
                                type="text"
                                value={config.siteName || ''}
                                onChange={(e) => setConfig({ ...config, siteName: e.target.value })}
                                placeholder="XSMB - Xổ Số Miền Bắc"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lottery-red-500 outline-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">Tên hiển thị bên cạnh logo.</p>
                        </div>

                        {/* Favicon Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Favicon URL</label>
                            <input
                                type="text"
                                value={config.favicon || ''}
                                onChange={(e) => setConfig({ ...config, favicon: e.target.value })}
                                placeholder="https://example.com/favicon.ico"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lottery-red-500 outline-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">Đường dẫn icon hiển thị trên tab trình duyệt (nên dùng ảnh vuông nhỏ, .ico hoặc .png)</p>

                            {/* Favicon Preview */}
                            {config.favicon && (
                                <div className="mt-4 p-4 bg-gray-100 rounded-lg inline-block">
                                    <p className="text-gray-500 text-xs mb-2">Xem trước:</p>
                                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded border border-gray-300 shadow-sm w-48">
                                        <img
                                            src={config.favicon}
                                            alt="Favicon"
                                            className="w-4 h-4 object-contain"
                                            onError={(e) => (e.currentTarget.style.display = 'none')}
                                        />
                                        <span className="text-xs text-gray-600 truncate">Tiêu đề trang web...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4 pb-20">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 bg-lottery-red-600 text-white font-bold rounded-lg hover:bg-lottery-red-700 transition-colors shadow-lg disabled:opacity-70"
                    >
                        {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </div>
            </form>
        </div>
    );
}
