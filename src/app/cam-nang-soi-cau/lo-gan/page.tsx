import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, Target, TrendingDown, Info, AlertTriangle, Lightbulb } from 'lucide-react';
import JsonLd from '@/components/seo/JsonLd';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

export const metadata: Metadata = {
    title: 'Lô Gan Là Gì? Kinh Nghiệm Soi Lô Gan XSMB 2026 Mới Nhất',
    description: 'Thấu hiểu về lô gan (lô khan) xổ số miền Bắc năm 2026. Cách xem thống kê lô gan cực đại, nhịp lô gan và chiến thuật vào tiền an toàn nhất.',
    alternates: {
        canonical: `${siteUrl}/cam-nang-soi-cau/lo-gan`,
    }
};

export default function LoGanGuide() {
    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': 'Lô Gan XSMB 2026: Những Điều Cần Biết Để Tránh Rủi Ro',
        'image': [`${siteUrl}/og-image.png`],
        'author': { '@type': 'Organization', 'name': 'XSMB 24h' }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 font-sans">
            <JsonLd data={articleSchema} />
            
            <nav className="mb-6">
                <Link href="/cam-nang-soi-cau" className="inline-flex items-center text-slate-500 hover:text-lottery-red-600 transition-colors text-sm font-medium">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Quay lại Cẩm nang
                </Link>
            </nav>

            <article className="prose prose-slate max-w-none">
                <header className="mb-10 text-center md:text-left not-prose">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-4 leading-tight uppercase">
                        Bí Quyết <span className="text-lottery-red-600">Soi Lô Gan</span> XSMB Cực Chuẩn 2026
                    </h1>
                    <div className="flex items-center gap-2 text-slate-500 italic">
                        <TrendingDown className="w-5 h-5 text-emerald-500" /> Bắt nhịp loto gan chính xác 2026
                    </div>
                </header>

                <section>
                    <h2>1. Lô gan là gì?</h2>
                    <p>
                        <strong>Lô gan</strong> (còn gọi là lô khan) là những con số đã một thời gian dài không xuất hiện trong bảng kết quả XSMB. 
                        Thông thường, một con số được coi là lô gan khi nó không về trong khoảng <strong>10 ngày liên tiếp trở lên</strong>. 
                        Có những con số đạt mức <i>gan cực đại</i> lên tới 30-40 ngày.
                    </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8 not-prose">
                    <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex items-start gap-4 shadow-sm">
                        <div className="p-3 bg-white rounded-xl shadow-sm text-emerald-600">
                            <Lightbulb className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-emerald-900 mb-1">Dấu hiệu sắp về 2026</h3>
                            <p className="text-xs text-emerald-800">Lô rơi liên tục ở các đầu số lân cận hoặc xuất hiện lô kép cùng đầu.</p>
                        </div>
                    </div>
                    <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex items-start gap-4 shadow-sm">
                        <div className="p-3 bg-white rounded-xl shadow-sm text-red-600">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-red-900 mb-1">Rủi ro cần tránh</h3>
                            <p className="text-xs text-red-800">Tuyệt đối không nên "nuôi lô gan" nếu không có chiến thuật quản lý vốn rõ ràng.</p>
                        </div>
                    </div>
                </div>

                <section>
                    <h2>2. Cách bắt lô gan hiệu quả nhất 2026</h2>
                    <ul>
                        <li><strong>Thống kê cực đại:</strong> Xem lịch sử con số đó từng gan bao nhiêu ngày lâu nhất trong quá khứ.</li>
                        <li><strong>Chiến thuật vượt khung:</strong> Chỉ bắt đầu nuôi khi loto đã gan được khoảng 15-20 ngày và có dấu hiệu "nổ".</li>
                        <li><strong>Kết hợp thống kê:</strong> Luôn kiểm tra <Link href="/thong-ke" className="text-blue-600 underline">Thống kê lô gan</Link> của chúng tôi hằng ngày.</li>
                    </ul>
                </section>

                <section className="bg-slate-900 p-8 rounded-3xl text-white my-10 not-prose shadow-xl border-t-4 border-amber-400">
                    <h3 className="text-amber-400 font-black text-xl mb-4 flex items-center gap-2">
                        <Target className="w-6 h-6" /> Mẹo từ Chuyên Gia
                    </h3>
                    <p className="text-slate-300 leading-relaxed italic border-l-2 border-slate-700 pl-4">
                        "Nếu bạn là người mới, hãy TRÁNH xa lô gan. Nhưng nếu bạn là cao thủ, lô gan chính là 'mỏ vàng' khi nó bước vào giai đoạn nhịp rơi chuẩn xác nhất."
                    </p>
                </section>
            </article>
        </div>
    );
}
