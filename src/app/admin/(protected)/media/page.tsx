'use client';

import { useState, useEffect, useRef } from 'react';

interface MediaFile {
    name: string;
    url: string;
    size: number;
    created_at: string;
}

export default function MediaPage() {
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [deleteFilename, setDeleteFilename] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchFiles = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/media');
            const data = await res.json();
            if (data.success) {
                setFiles(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch media:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = e.target.files;
        if (!fileList || fileList.length === 0) return;

        setUploading(true);
        const file = fileList[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/admin/media/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (data.success) {
                // Reload page to show new image
                window.location.reload();
            } else {
                alert(data.error || 'Upload thất bại');
            }
        } catch (error) {
            alert('Lỗi kết nối');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDelete = async (filename: string) => {
        setDeleteFilename(filename);
    };

    const confirmDelete = async () => {
        if (!deleteFilename) return;

        try {
            setIsDeleting(true);
            console.log(`[Admin Media] Sending DELETE request for: ${deleteFilename}`);
            const res = await fetch(`/api/admin/media?filename=${deleteFilename}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            console.log('[Admin Media] Delete response:', data);

            if (data.success) {
                setFiles(files.filter(f => f.name !== deleteFilename));
                setDeleteFilename(null);
            } else {
                alert(data.error || 'Xóa thất bại');
            }
        } catch (error) {
            console.error('[Admin Media] Deletion error:', error);
            alert('Lỗi kết nối');
        } finally {
            setIsDeleting(false);
        }
    };

    const copyToClipboard = (url: string) => {
        const fullUrl = window.location.origin + url;
        navigator.clipboard.writeText(fullUrl);
        alert('Đã sao chép link ảnh: ' + fullUrl);
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h1 className="text-2xl font-bold text-gray-800">Thư viện Media</h1>
                <div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleUpload}
                        className="hidden"
                        accept="image/*"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center px-4 py-2 bg-gradient-to-r from-lottery-red-600 to-lottery-red-700 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                    >
                        {uploading ? (
                            <div className="spinner border-2 border-white border-t-transparent w-5 h-5 rounded-full animate-spin mr-2"></div>
                        ) : (
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                        )}
                        {uploading ? 'Đang tải lên...' : 'Tải lên ảnh mới'}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="spinner border-4 border-lottery-red-600 border-t-transparent w-10 h-10 rounded-full animate-spin"></div>
                </div>
            ) : files.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500 text-lg">Chưa có hình ảnh nào</p>
                    <p className="text-gray-400 mt-2">Tải lên hình ảnh để sử dụng trong bài viết</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {files.map((file) => (
                        <div key={file.name} className="group relative bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="aspect-square bg-gray-100 relative">
                                <img
                                    src={file.url}
                                    alt={file.name}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => copyToClipboard(file.url)}
                                        className="p-2 bg-white text-gray-800 rounded-full hover:bg-gray-100"
                                        title="Sao chép Link"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(file.name)}
                                        className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50"
                                        title="Xóa"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div className="p-3">
                                <p className="text-sm font-medium text-gray-700 truncate" title={file.name}>
                                    {file.name.substring(14)} {/* Trim timestamp */}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{formatSize(file.size)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Custom Delete Confirmation Modal */}
            {deleteFilename && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận xóa</h3>
                            <p className="text-gray-500 mb-6">Bạn có chắc chắn muốn xóa ảnh này? Hành động này không thể hoàn tác.</p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteFilename(null)}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all disabled:opacity-50 flex items-center justify-center"
                                >
                                    {isDeleting ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        'Xóa ngay'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
