'use client';

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
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],
            ['link', 'image', 'video'],
            ['clean'],
            ['code-block']
        ],
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list', 'bullet',
        'color', 'background',
        'link', 'image', 'video',
        'code-block'
    ];

    return (
        <div className="bg-white">
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                readOnly={disabled}
                placeholder={placeholder}
                className="h-[500px] mb-12" // mb-12 to accommodate the toolbar and height
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
            `}</style>
        </div>
    );
}
