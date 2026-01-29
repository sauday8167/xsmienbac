'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function ExcelImportButton() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const router = useRouter();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.xlsx')) {
            alert('Vui lòng chọn file Excel (.xlsx)');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/admin/results/import', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (data.success) {
                alert(data.message);
                router.refresh();
                // Optionally reload window to force table refresh if router.refresh is subtle
                window.location.reload();
            } else {
                alert('Lỗi import: ' + data.error);
                if (data.errors) {
                    console.error(data.errors);
                }
            }
        } catch (error) {
            alert('Lỗi kết nối khi upload');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="inline-block">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx"
                className="hidden"
            />
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
                {uploading ? (
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                )}
                <span>{uploading ? 'Đang nhập...' : 'Nhập Excel'}</span>
            </button>
            <div className="mt-2 text-center">
                <a
                    href="/sample_import_xsmb.xlsx"
                    download
                    className="text-xs text-lottery-red-600 hover:text-lottery-red-700 hover:underline inline-flex items-center"
                >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Tải file mẫu
                </a>
            </div>
        </div>
    );
}
