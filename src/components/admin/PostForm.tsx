'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('./RichTextEditor'), { ssr: false });

interface PostFormProps {
    initialData?: {
        title: string;
        slug: string;
        excerpt: string;
        content: string;
        category: string;
        thumbnail: string;
        meta_title?: string;
        meta_description?: string;
        status?: string;
    };
    onSubmit: (data: any) => Promise<void>;
    isEditing?: boolean;
}

export default function PostForm({ initialData, onSubmit, isEditing = false }: PostFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        slug: initialData?.slug || '',
        excerpt: initialData?.excerpt || '',
        content: initialData?.content || '',
        category: initialData?.category || 'news',
        thumbnail: initialData?.thumbnail || '',
        meta_title: initialData?.meta_title || '',
        meta_description: initialData?.meta_description || '',
        status: initialData?.status || 'published',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [imageError, setImageError] = useState(false);

    // Semantic slug generation
    const generateSlug = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .normalize('NFD') // Decompose combined characters
            .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
            .replace(/\s+/g, '-') // Replace spaces with -
            .replace(/[^\w\-]+/g, '') // Remove all non-word chars
            .replace(/\-\-+/g, '-') // Replace multiple - with single -
            .replace(/^-+/, '') // Trim - from start of text
            .replace(/-+$/, ''); // Trim - from end of text
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setFormData(prev => ({
            ...prev,
            title,
            slug: isEditing ? prev.slug : generateSlug(title)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await onSubmit(formData);
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
                    <div className="flex">
                        <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <p className="ml-3 text-sm text-red-700">{error}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content (Left Column) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Nội dung bài viết</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={handleTitleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lottery-red-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Nhập tiêu đề bài viết"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                                <div className="flex items-center">
                                    <span className="text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg px-3 py-2 text-sm">
                                        /tin-tuc/
                                    </span>
                                    <input
                                        type="text"
                                        required
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-lottery-red-500 focus:border-transparent outline-none transition-all"
                                        placeholder="url-bai-viet"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn</label>
                                <textarea
                                    rows={3}
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lottery-red-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Mô tả ngắn gọn về nội dung bài viết..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
                                <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-lottery-red-500 focus-within:border-transparent">
                                    <RichTextEditor
                                        value={formData.content}
                                        onChange={(content) => setFormData({ ...formData, content })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Cấu hình SEO</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.meta_title}
                                        onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                                        maxLength={60}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lottery-red-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Tiêu đề hiển thị trên Google (Mặc định: Tiêu đề bài viết)"
                                    />
                                    <div className="absolute right-3 top-2.5 text-xs text-gray-400">
                                        {formData.meta_title.length}/60
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                                <div className="relative">
                                    <textarea
                                        rows={3}
                                        value={formData.meta_description}
                                        onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                        maxLength={160}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lottery-red-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Mô tả hiển thị trên Google (Mặc định: Mô tả ngắn)"
                                    />
                                    <div className="absolute right-3 bottom-2.5 text-xs text-gray-400">
                                        {formData.meta_description.length}/160
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar (Right Column) */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Đăng bài</h3>
                        <div className="space-y-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-4 bg-gradient-to-r from-lottery-red-600 to-lottery-red-700 hover:from-lottery-red-700 hover:to-lottery-red-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <div className="spinner border-2 border-white border-t-transparent w-5 h-5 rounded-full animate-spin mr-2"></div>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                        </svg>
                                        {isEditing ? 'Cập nhật bài viết' : 'Đăng bài viết'}
                                    </>
                                )}
                            </button>

                            <Link
                                href="/admin/posts"
                                className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors flex justify-center items-center"
                            >
                                Hủy bỏ
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Phân loại & Trạng thái</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lottery-red-500 focus:border-transparent outline-none transition-all"
                                >
                                    <option value="news">Tin tức</option>
                                    <option value="soi-cau">Soi cầu</option>
                                    <option value="analysis">Phân tích</option>
                                    <option value="tips">Kinh nghiệm</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                                <select
                                    value={formData.status || 'published'}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lottery-red-500 focus:border-transparent outline-none transition-all"
                                >
                                    <option value="published">Công khai (Hiển thị trên web)</option>
                                    <option value="draft">Bản nháp (Ẩn)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Hình ảnh</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh đại diện (URL)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={formData.thumbnail}
                                        onChange={(e) => {
                                            setFormData({ ...formData, thumbnail: e.target.value });
                                            setImageError(false);
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lottery-red-500 focus:border-transparent outline-none transition-all"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    <label className="cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center whitespace-nowrap">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                        Tải ảnh
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;

                                                const formDataUpload = new FormData();
                                                formDataUpload.append('file', file);

                                                try {
                                                    const res = await fetch('/api/admin/media/upload', {
                                                        method: 'POST',
                                                        body: formDataUpload
                                                    });
                                                    const data = await res.json();
                                                    if (data.success) {
                                                        setFormData(prev => ({ ...prev, thumbnail: data.data.url }));
                                                        setImageError(false);
                                                    } else {
                                                        alert(data.error || 'Upload thất bại');
                                                    }
                                                } catch (err) {
                                                    console.error(err);
                                                    alert('Lỗi upload ảnh');
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                                {formData.thumbnail && (
                                    <div className="mt-2 relative aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                        {!imageError ? (
                                            <img
                                                src={formData.thumbnail}
                                                alt="Thumbnail preview"
                                                className="absolute inset-0 w-full h-full object-cover"
                                                onError={() => setImageError(true)}
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 flex-col">
                                                <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-sm">Không thể tải hình ảnh</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
