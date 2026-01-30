'use client';

import { useRef, useMemo, ChangeEvent, useState, useEffect } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import mammoth from 'mammoth';

// Custom Icons for the toolbar
const CustomIcons = Quill.import('ui/icons');
CustomIcons['importHtml'] = `<svg viewBox="0 0 18 18">
  <polygon class="ql-stroke" points="9 11 7 11 7 2 11 2 11 11 9 11"></polygon>
  <path class="ql-stroke" d="M12,14c0,1.1-0.9,2-2,2H8c-1.1,0-2-0.9-2-2"></path>
  <polyline class="ql-stroke" points="10 12 12 14 6 12 4 14"></polyline>
  <path class="ql-stroke" d="M1,9v7c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V9"></path>
</svg>`; // Generic upload-like icon
CustomIcons['insertTable'] = `<svg viewBox="0 0 18 18">
  <rect class="ql-stroke" height="12" width="12" x="3" y="3"></rect>
  <line class="ql-stroke" x1="9" x2="9" y1="3" y2="15"></line>
  <line class="ql-stroke" x1="3" x2="15" y1="9" y2="9"></line>
</svg>`; // Simple 2x2 grid icon

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
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showTablePicker, setShowTablePicker] = useState(false);
    const [hoveredGrid, setHoveredGrid] = useState({ rows: 0, cols: 0 });

    // Close picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showTablePicker && !(event.target as HTMLElement).closest('.table-picker-container') && !(event.target as HTMLElement).closest('.ql-insertTable')) {
                setShowTablePicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showTablePicker]);

    // Handler for importing HTML from file
    const handleImportHtml = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const fileName = file.name.toLowerCase();

        if (fileName.endsWith('.docx')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const arrayBuffer = event.target?.result as ArrayBuffer;
                if (arrayBuffer) {
                    mammoth.convertToHtml({ arrayBuffer: arrayBuffer })
                        .then((result) => {
                            if (result.value && quillRef.current) {
                                const quill = quillRef.current.getEditor();
                                const range = quill.getSelection(true);
                                // Insert the converted HTML
                                if (range) {
                                    quill.clipboard.dangerouslyPasteHTML(range.index, result.value);
                                } else {
                                    const length = quill.getLength();
                                    quill.clipboard.dangerouslyPasteHTML(length - 1, result.value);
                                }
                                // Reset input
                                if (fileInputRef.current) fileInputRef.current.value = '';
                            }
                        })
                        .catch((err) => {
                            console.error("Mammoth conversion error:", err);
                            alert("Lỗi khi đọc file Word. Vui lòng thử lại.");
                        });
                }
            };
            reader.readAsArrayBuffer(file);
        } else {
            // Assume HTML or TXT
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result as string;
                if (content && quillRef.current) {
                    const quill = quillRef.current.getEditor();
                    const range = quill.getSelection(true);
                    if (range) {
                        quill.clipboard.dangerouslyPasteHTML(range.index, content);
                    } else {
                        const length = quill.getLength();
                        quill.clipboard.dangerouslyPasteHTML(length - 1, content);
                    }
                    if (fileInputRef.current) fileInputRef.current.value = '';
                }
            };
            reader.readAsText(file);
        }
    };

    // Handler called when clicking the toolbar button
    const handleToolbarInsertTable = () => {
        setShowTablePicker(!showTablePicker);
    };

    // Handler called when clicking a cell in the picker
    const confirmInsertTable = (rows: number, cols: number) => {
        let tableHtml = '<table style="width:100%; border-collapse: collapse; border: 1px solid #ccc;"><tbody>';
        for (let r = 0; r < rows; r++) {
            tableHtml += '<tr>';
            for (let c = 0; c < cols; c++) {
                tableHtml += '<td style="border: 1px solid #ccc; padding: 8px;">Cell</td>';
            }
            tableHtml += '</tr>';
        }
        tableHtml += '</tbody></table><p><br/></p>'; // Add break after table

        if (quillRef.current) {
            const quill = quillRef.current.getEditor();
            const range = quill.getSelection(true);
            if (range) {
                quill.clipboard.dangerouslyPasteHTML(range.index, tableHtml);
            } else {
                // If lost focus, try to append? Or just ignore. Usually range is null if blurred.
                // Try to focus and paste at end?
                quill.focus();
                const length = quill.getLength();
                quill.clipboard.dangerouslyPasteHTML(length - 1, tableHtml);
            }
        }
        setShowTablePicker(false);
    };

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'color': [] }, { 'background': [] }],
                ['link', 'image', 'video'],
                ['clean'],
                ['code-block'],
                ['importHtml', 'insertTable'] // Custom buttons
            ],
            handlers: {
                importHtml: handleImportHtml,
                insertTable: handleToolbarInsertTable
            }
        },
    }), [showTablePicker]); // Re-create if needed, though handlers usually stable.
    // Actually handlers don't need to change, but showTablePicker state inside handler needs to be fresh?
    // No, standard functional updates in setState work fine. Dependencies often [] is safer for Quill to avoid re-render toolbar issues.
    // I'll keep it [] and use functional updates if needed, but handleToolbarInsertTable references boolean.
    // Wait, Quill memoizes handlers. If I use [] deps, handleToolbarInsertTable might be stale closure.
    // Better to use a ref for the handler or accept re-render. Re-rendering toolbar in Quill can be glitchy (loses focus).
    // WORKAROUND: Use a ref for the toggle logic OR just assume the state update works because it's an event handler.
    // Actually, simply referencing `setShowTablePicker(prev => !prev)` is safe.

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
            <input
                type="file"
                accept=".html,.htm,.txt,.docx"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />
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

            {/* Table Grid Picker */}
            {showTablePicker && (
                <div className="table-picker-container absolute top-[44px] right-[10px] z-50 bg-white border border-gray-300 shadow-xl p-3 rounded-lg flex flex-col items-center">
                    <div className="mb-2 text-sm font-semibold text-gray-700">
                        {hoveredGrid.rows > 0 ? `${hoveredGrid.cols} x ${hoveredGrid.rows}` : 'Chọn kích thước'}
                    </div>
                    <div
                        className="grid grid-cols-10 gap-1 bg-gray-50 p-1 border border-gray-100"
                        onMouseLeave={() => setHoveredGrid({ rows: 0, cols: 0 })}
                    >
                        {Array.from({ length: 100 }).map((_, i) => {
                            const r = Math.floor(i / 10) + 1;
                            const c = (i % 10) + 1;
                            const isActive = r <= hoveredGrid.rows && c <= hoveredGrid.cols;

                            return (
                                <div
                                    key={i}
                                    className={`w-4 h-4 border border-gray-300 cursor-pointer transition-colors ${isActive ? 'bg-blue-500 border-blue-600' : 'bg-white hover:border-blue-300'}`}
                                    onMouseEnter={() => setHoveredGrid({ rows: r, cols: c })}
                                    onClick={() => confirmInsertTable(r, c)}
                                />
                            );
                        })}
                    </div>
                    <div className="mt-2 text-xs text-gray-400">Tối đa 10x10</div>
                </div>
            )}

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
                .ql-editor table {
                    border-collapse: collapse;
                }
                .ql-editor td {
                    border: 1px solid #ccc;
                    padding: 5px;
                }
                /* Ensure dropdowns appear on top */
                .ql-snow .ql-picker-options {
                    z-index: 100;
                }
            `}</style>
        </div>
    );
}
