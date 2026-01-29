'use client';

import { useState, useEffect } from 'react';
import { DreamEntry } from '@/lib/dream-service';

export default function SoMoPage() {
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
                        Giấc mơ, một thế giới đầy bí ẩn và hấp dẫn, luôn khiến con người tò mò và tìm kiếm ý nghĩa đằng sau những hình ảnh, sự kiện mà họ trải qua khi ngủ. Đa dạng quan điểm về giấc mơ từ các triết gia, nhà tâm lý học cho đến các nhà chiêm tinh đã tạo ra nhiều cách tiếp cận khác nhau để hiểu và giải mã những thông điệp tiềm ẩn trong thế giới tâm linh này.
                    </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                            Triết lý của Friedrich Nietzsche
                        </h3>
                        <p className="text-sm text-gray-600">
                            Theo triết lý của Friedrich Wilhelm Nietzsche, giấc mơ được coi là một sự thể hiện của những niềm vui và mỹ cảm mà con người không thể trải nghiệm được trong thế giới hiện thực. Những hình ảnh, cảm xúc trong giấc mơ có thể là những ước mơ, khát vọng mà chúng ta không thể thực hiện vào ban ngày. Đó là một phần của tâm trí con người, nơi mà sự sáng tạo và tưởng tượng bay bổng.
                        </p>
                    </section>

                    <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                            Sigmund Freud và Tâm lý học
                        </h3>
                        <p className="text-sm text-gray-600">
                            Trái lại, Sigmund Freud, nhà tâm lý học nổi tiếng, định nghĩa giấc mơ như một cách cho tâm thức thể hiện những nguyện vọng tiềm ẩn và sự giải tỏa tâm lý. Theo quan điểm này, giấc mơ là cửa sổ vào tiềm thức của con người, nơi mà những ẩn ý, sự lo âu hay những điều chúng ta không chú ý vào ban ngày được thể hiện một cách không rõ ràng qua những hình ảnh và biểu cảm trong giấc mơ.
                        </p>
                    </section>

                    <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                            Khoa học về Tử vi và Tướng số
                        </h3>
                        <p className="text-sm text-gray-600">
                            Một góc nhìn khác lại đến từ Khoa học về Tử vi và tướng số, lĩnh vực tìm kiếm mối liên kết giữa sự kiện trong thế giới hiện thực và những hiện tượng tâm linh như giấc mơ. Theo quan điểm này, mỗi giấc mơ mang theo một thông điệp riêng biệt, và sự lặp lại của một giấc mơ có thể là dấu hiệu của một sự kiện sắp xảy ra trong tương lai gần.
                        </p>
                    </section>

                    <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                            Sổ Mơ và Cách Tiếp Cận Tâm Linh
                        </h3>
                        <p className="text-sm text-gray-600">
                            Việc tra cứu giấc mơ qua các sổ mơ giải mộng số đẹp không chỉ là một phần của văn hóa tâm linh mà còn là cách mà con người tìm kiếm sự giải thích cho những trải nghiệm tâm linh không thể lý giải bằng lý trí. Điều quan trọng là mỗi người có thể có cách tiếp cận và hiểu biết riêng về giấc mơ, tạo ra một phong cách sống và quan điểm cá nhân độc đáo.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
