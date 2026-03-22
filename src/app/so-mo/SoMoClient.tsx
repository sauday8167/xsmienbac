'use client';

import { useState, useEffect } from 'react';
import { DreamEntry } from '@/lib/dream-service';

export default function SoMoClient() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<DreamEntry[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [viewMode, setViewMode] = useState<'trending' | 'search'>('trending');
    const [hasSearched, setHasSearched] = useState(false);

    // Initial load for trending
    useEffect(() => {
        fetchDreams('');
    }, []);

    const fetchDreams = async (searchQuery: string) => {
        setIsSearching(true);
        try {
            const url = searchQuery
                ? `/api/so-mo?q=${encodeURIComponent(searchQuery)}`
                : '/api/so-mo';

            const res = await fetch(url);
            const data = await res.json();

            if (data.success) {
                setResults(data.data);
                setViewMode(data.mode);
            }
        } catch (error) {
            console.error('Failed to fetch dreams:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setHasSearched(true);
        fetchDreams(query);
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-8 min-h-screen">
            <div className="text-center space-y-4 pt-8">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent pb-2">
                    Tra Cứu Sổ Mơ
                </h1>
                <p className="text-gray-600 max-w-lg mx-auto">
                    Giải mã giấc mơ của bạn để tìm ra những con số may mắn tương ứng theo quan niệm dân gian.
                </p>
                <div className="w-16 h-1 bg-purple-500 mx-auto rounded-full"></div>
            </div>

            {/* Search Box */}
            <div className="card bg-white shadow-xl border border-gray-100 p-6 rounded-2xl md:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 transform -translate-x-1/2 translate-y-1/2"></div>

                <form onSubmit={handleSearch} className="relative z-10 flex gap-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Bạn mơ thấy gì? (ví dụ: thấy rắn, đám cưới, mất tiền...)"
                        className="input input-lg flex-1 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
                    />
                    <button
                        type="submit"
                        disabled={isSearching}
                        className="btn btn-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0 rounded-xl px-8 hover:opacity-90 transition-all font-bold"
                    >
                        {isSearching ? <span className="loading loading-spinner"></span> : '🔍 Tra Cứu'}
                    </button>
                </form>
            </div>

            {/* Results Area */}
            <div className="space-y-6">
                {viewMode === 'trending' ? (
                    <div className="flex items-center gap-2 text-gray-800 font-bold text-lg border-l-4 border-purple-500 pl-3">
                        🔥 Giấc mơ phổ biến
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <div className="text-gray-600">
                            Tìm thấy <strong>{results.length}</strong> kết quả phù hợp cho: "<span className="text-purple-700">{query}</span>"
                        </div>
                        {results.length === 0 && (
                            <button onClick={() => { setQuery(''); fetchDreams(''); }} className="text-sm text-blue-500 hover:underline">
                                Quay lại danh sách phổ biến
                            </button>
                        )}
                    </div>
                )}

                {results.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {results.map((item) => (
                            <div key={item.id} className="card bg-white hover:shadow-lg transition-shadow border border-gray-200 rounded-xl">
                                <div className="card-body p-6">
                                    <h3 className="card-title text-gray-800 flex justify-between items-start">
                                        <span>{item.description}</span>
                                        <span className="badge badge-ghost text-xs font-normal text-gray-500">{item.category}</span>
                                    </h3>
                                    <div className="divider my-2"></div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Bộ số may mắn:</span>
                                        <div className="flex gap-2">
                                            {item.numbers.map((num) => (
                                                <span key={num} className="bg-red-50 text-red-600 border border-red-100 font-bold px-3 py-1 rounded-lg text-lg shadow-sm">
                                                    {num}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    {item.matchDate && (
                                        <div className="mt-4 p-2 bg-green-50 border border-green-100 rounded-lg flex items-center gap-2 text-green-700 text-sm">
                                            <span className="animate-pulse">✨</span>
                                            <span>Vừa xuất hiện vào ngày <strong>{new Date(item.matchDate).toLocaleDateString('vi-VN')}</strong></span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    hasSearched && !isSearching && (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <div className="text-5xl mb-4">🤔</div>
                            <h3 className="text-lg font-bold text-gray-700">Không tìm thấy kết quả</h3>
                            <p className="text-gray-500">Hãy thử từ khóa ngắn hơn hoặc mô tả đơn giản hơn.</p>
                        </div>
                    )
                )}
            </div>

            {/* Disclaimer */}
            <div className="mt-12 text-center">
                <p className="text-xs text-gray-400 max-w-2xl mx-auto italic">
                    ⚠️ <strong>Lưu ý:</strong> Thông tin chỉ mang tính chất giải trí và tham khảo dựa trên quan niệm dân gian.
                    Không có cơ sở khoa học chứng minh.
                </p>
            </div>

            {/* SEO Content / Deep Dive */}
            <div className="mt-16 space-y-12 max-w-3xl mx-auto text-gray-700 leading-relaxed font-sans">
                <div className="text-center">
                    <div className="inline-block p-4 rounded-full bg-purple-50 mb-6">
                        <span className="text-4xl text-purple-600">🌙</span>
                    </div>
                </div>

                <section>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent mb-4">
                        Khám Phá Ý Nghĩa Của Giấc Mơ
                    </h2>
                    <p>
                        Giấc mơ, một thế giới đầy bí ẩn và hấp dẫn, luôn khiến con người tò mò và tìm kiếm ý nghĩa đằng sau những hình ảnh, sự kiện mà họ trải qua khi ngủ...
                    </p>
                </section>
                {/* ... existing static content from original page.tsx ... */}
            </div>
        </div>
    );
}
