'use client';

import { useRef, useMemo, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
    value: string;
    onChange: (content: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export default function RichTextEditor({
    value,
    onChange,
    placeholder = 'Nhập nội dung bài viết...',
    disabled = false
}: RichTextEditorProps) {
    const quillRef = useRef<ReactQuill>(null);

    // Custom Image Handler
    const imageHandler = useCallback(() => {
        // Ask user: Enter URL or Upload?
        const check = window.confirm("Bạn có muốn nhập URL hình ảnh không?\n- OK: Nhập URL để tự động tải về.\n- Cancel: Tải ảnh từ máy tính.");

        if (check) {
            const url = window.prompt("Nhập URL hình ảnh:");
            if (url) {
                // Handle Auto Download from URL
                (async () => {
                    try {
                        const res = await fetch('/api/admin/media/download', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ url })
                        });
                        const data = await res.json();

                        if (data.success && data.data && data.data.url) {
                            const quill = quillRef.current?.getEditor();
                            const range = quill?.getSelection(true);
                            if (quill) {
                                if (range) {
                                    quill.insertEmbed(range.index, 'image', data.data.url);
                                } else {
                                    const len = quill.getLength();
                                    quill.insertEmbed(len, 'image', data.data.url);
                                }
                            }
                        } else {
                            alert(data.error || 'Không thể tải ảnh từ URL này');
                        }
                    } catch (err) {
                        console.error(err);
                        alert('Lỗi khi tải ảnh từ URL');
                    }
                })();
            }
        } else {
            // Handle File Upload
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');
            input.click();

            input.onchange = async () => {
                const file = input.files ? input.files[0] : null;
                if (!file) return;

                const formData = new FormData();
                formData.append('file', file);

                try {
                    const res = await fetch('/api/admin/media/upload', {
                        method: 'POST',
                        body: formData
                    });

                    const data = await res.json();

                    if (data.success && data.data && data.data.url) {
                        const quill = quillRef.current?.getEditor();
                        const range = quill?.getSelection(true);

                        if (quill && range) {
                            quill.insertEmbed(range.index, 'image', data.data.url);
                        } else if (quill) {
                            const len = quill.getLength();
                            quill.insertEmbed(len, 'image', data.data.url);
                        }
                    } else {
                        alert(data.error || 'Upload ảnh thất bại');
                    }
                } catch (error) {
                    console.error('Upload Error:', error);
                    alert('Lỗi khi tải ảnh lên');
                }
            };
        }
    }, []);

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'color': [] }, { 'background': [] }],
                ['link', 'image', 'video'],
                ['clean'],
                ['code-block']
            ],
            handlers: {
                image: imageHandler
            }
        },
    }), [imageHandler]);

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list', 'bullet',
        'color', 'background',
        'link', 'image', 'video',
        'code-block'
    ];

    return (
        <div className="bg-white relative">
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                readOnly={disabled}
                placeholder={placeholder}
                className="h-[500px] mb-12"
            />

            <style jsx global>{`
                .ql-container {
                    font-size: 16px;
                    border-bottom-left-radius: 0.5rem;
                    border-bottom-right-radius: 0.5rem;
                }
                .ql-toolbar {
                    border-top-left-radius: 0.5rem;
                    border-top-right-radius: 0.5rem;
                    background: #f9fafb;
                }
                .ql-editor {
                    min-height: 450px;
                }
                /* Ensure dropdowns appear on top */
                .ql-snow .ql-picker-options {
                    z-index: 100;
                }
            `}</style>
        </div>
    );
}
