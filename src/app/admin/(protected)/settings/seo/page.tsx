'use client';

import { useState, useEffect } from 'react';

export default function SeoSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        siteName: '',
        homeTitle: '',
        homeDescription: '',
        keywords: '',
        ogImage: '',
        siteUrl: '',
        googleAnalyticsId: '',
        social: {
            facebook: '',
            youtube: '',
            zalo: ''
        }
    });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await fetch('/api/admin/settings/seo');
                const data = await res.json();
                if (data.success) {
                    setFormData(prev => ({ ...prev, ...data.data }));
                }
            } catch (error) {
                console.error('Failed to load settings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('social.')) {
            const socialKey = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                social: { ...prev.social, [socialKey]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/admin/settings/seo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                alert('Lưu cấu hình thành công!');
            } else {
                alert('Lưu thất bại: ' + data.error);
            }
        } catch (error) {
            alert('Lỗi kết nối');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Đang tải...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Cấu hình SEO Tổng quan</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin cơ bản</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên Website</label>
                            <input
                                type="text"
                                name="siteName"
                                value={formData.siteName}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lottery-red-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề Trang chủ</label>
                            <input
                                type="text"
                                name="homeTitle"
                                value={formData.homeTitle}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lottery-red-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả Trang chủ (Meta Description)</label>
                            <textarea
                                name="homeDescription"
                                rows={3}
                                value={formData.homeDescription}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lottery-red-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Keywords (Từ khóa chính)</label>
                            <input
                                type="text"
                                name="keywords"
                                value={formData.keywords}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lottery-red-500 outline-none"
                                placeholder="tu khoa 1, tu khoa 2..."
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">URL Website (Có https://)</label>
                                <input
                                    type="text"
                                    name="siteUrl"
                                    value={formData.siteUrl}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lottery-red-500 outline-none"
                                    placeholder="https://yourdomain.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh chia sẻ (OG Image URL)</label>
                                <input
                                    type="text"
                                    name="ogImage"
                                    value={formData.ogImage}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lottery-red-500 outline-none"
                                    placeholder="/logo-v5.png hoặc URL tuyệt đối"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Mạng xã hội & Analytics</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Google Analytics ID</label>
                            <input
                                type="text"
                                name="googleAnalyticsId"
                                value={formData.googleAnalyticsId}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lottery-red-500 outline-none"
                                placeholder="G-XXXXXXXXXX"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
                                <input
                                    type="text"
                                    name="social.facebook"
                                    value={formData.social?.facebook || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lottery-red-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Youtube URL</label>
                                <input
                                    type="text"
                                    name="social.youtube"
                                    value={formData.social?.youtube || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lottery-red-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2 bg-gradient-to-r from-lottery-red-600 to-lottery-red-700 text-white font-medium rounded-lg hover:shadow-lg transition-all disabled:opacity-70"
                    >
                        {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </div>
            </form>
        </div>
    );
}
