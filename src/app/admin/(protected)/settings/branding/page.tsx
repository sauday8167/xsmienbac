'use client';

import { useState, useEffect } from 'react';

export default function BrandingPage() {
    const [formData, setFormData] = useState({
        logo: '',
        favicon: '',
        siteName: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/branding')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setFormData(data.data);
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/branding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                alert('Lưu cài đặt thành công! Hãy tải lại trang chủ để thấy thay đổi.');
            } else {
                alert('Lỗi khi lưu');
            }
        } catch (error) {
            alert('Lỗi kết nối');
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Cài đặt Logo & Thương hiệu</h1>

                {loading ? (
                    <div>Đang tải cài đặt...</div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Logo Section */}
                        <div className="border-b border-gray-100 pb-6">
                            <h2 className="text-lg font-semibold text-gray-700 mb-4">Logo Website</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Đường dẫn Logo (URL)</label>
                                    <input
                                        type="text"
                                        value={formData.logo}
                                        onChange={e => setFormData({ ...formData, logo: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-lottery-red-500"
                                        placeholder="/logo.png"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">Nên dùng ảnh PNG nền trong suốt.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Xem trước</label>
                                    <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 border-dashed p-4">
                                        {formData.logo ? (
                                            <img src={formData.logo} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                                        ) : (
                                            <span className="text-gray-400">Chưa có logo</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Favicon Section */}
                        <div className="border-b border-gray-100 pb-6">
                            <h2 className="text-lg font-semibold text-gray-700 mb-4">Favicon (Icon trên tab trình duyệt)</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Đường dẫn Favicon</label>
                                    <input
                                        type="text"
                                        value={formData.favicon}
                                        onChange={e => setFormData({ ...formData, favicon: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-lottery-red-500"
                                        placeholder="/favicon.ico"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Xem trước</label>
                                    <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 border-dashed">
                                        {formData.favicon ? (
                                            <img src={formData.favicon} alt="Favicon" className="w-8 h-8" />
                                        ) : (
                                            <span className="text-xs text-gray-400">N/A</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Site Name Section */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên Website (Site Name)</label>
                            <input
                                type="text"
                                value={formData.siteName}
                                onChange={e => setFormData({ ...formData, siteName: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-lottery-red-500"
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-gradient-to-r from-lottery-red-600 to-lottery-red-700 text-white font-medium rounded-lg hover:shadow-lg transition-all"
                            >
                                Lưu thay đổi
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
