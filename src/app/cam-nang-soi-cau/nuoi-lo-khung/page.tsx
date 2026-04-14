import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, Hash, ShieldCheck, Wallet, Info, Trophy } from 'lucide-react';
import JsonLd from '@/components/seo/JsonLd';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

export const metadata: Metadata = {
    title: 'Cách Nuôi Lô Khung 3 Ngày VIP 2026 - Chiến Thuật Quản Lý Vốn',
    description: 'Hướng dẫn nuôi lô khung 2 ngày, 3 ngày hiệu quả cao năm 2026. Cách vào tiền, chọn số và bí quyết giữ lãi ổn định mỗi chu kỳ xổ số miền Bắc.',
    alternates: {
        canonical: `${siteUrl}/cam-nang-soi-cau/nuoi-lo-khung`,
    }
};

export default function NuoiLoKhungGuide() {
    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': 'Chiến Thuật Nuôi Lô Khung 3 Ngày: Chậm Mà Chắc 2026',
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
                        Nuôi Lô Khung 3 Ngày <span className="text-lottery-red-600">VIP & An Toàn 2026</span>
                    </h1>
                    <div className="flex items-center gap-2 text-slate-500 italic">
                        <ShieldCheck className="w-5 h-5 text-blue-500" /> Chiến thuật quản lý vốn bền vững 2026
                    </div>
                </header>

                <section>
                    <h2>1. Nuôi lô khung là gì?</h2>
                    <p>
                        <strong>Nuôi lô khung</strong> là cách chơi bạn chọn một hoặc một cặp số và đánh liên tiếp trong nhiều ngày (thường là 2-3 ngày) thay vì chỉ đánh 1 ngày. 
                        Phương pháp này giúp giảm thiểu rủi ro khi cầu số bị "lệch" nhịp 1-2 ngày.
                    </p>
                </section>

                <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200 my-8 not-prose">
                    <h3 className="text-slate-800 font-bold flex items-center gap-2 mb-4">
                        <Wallet className="w-5 h-5 text-emerald-600" /> Tỷ lệ vào tiền "Kinh điển":
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
                            <div className="text-slate-400 text-xs mb-1">Ngày 1</div>
                            <div className="text-2xl font-black text-slate-800">1</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
                            <div className="text-slate-400 text-xs mb-1">Ngày 2</div>
                            <div className="text-2xl font-black text-lottery-red-600">2</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
                            <div className="text-slate-400 text-xs mb-1">Ngày 3</div>
                            <div className="text-2xl font-black text-lottery-red-700">4 hoặc 8</div>
                        </div>
                    </div>
                    <p className="mt-4 text-sm text-slate-500 text-center italic">Ví dụ: 10đ - 20đ - 40đ/80đ tùy theo ngân sách của bạn.</p>
                </section>

                <section>
                    <h2>2. Tại sao nên nuôi khung 3 ngày?</h2>
                    <ul>
                        <li><strong>Độ an toàn cao:</strong> Một cặp số đẹp rất hiếm khi gan quá 3 ngày trong chu kỳ rơi.</li>
                        <li><strong>Dễ kiểm soát vốn:</strong> Bạn biết trước mình sẽ mất tối đa bao nhiêu nếu "đứt khung".</li>
                        <li><strong>Thâm nhập sâu thống kê:</strong> Phù hợp với các phương pháp <Link href="/cam-nang-soi-cau/bac-nho" className="text-blue-600 underline">soi cầu bạc nhớ</Link>.</li>
                    </ul>
                </section>

                <section className="bg-amber-100 p-8 rounded-3xl my-10 not-prose shadow-xl border-l-8 border-lottery-red-600">
                    <h3 className="text-lottery-red-800 font-black text-xl mb-4 flex items-center gap-2">
                        <Trophy className="w-6 h-6" /> Chốt số Nuôi Khung
                    </h3>
                    <p className="text-amber-900 leading-relaxed font-medium">
                        Để chốt số nuôi khung chuẩn, hãy tìm những con số đang ở nhịp rơi đều đặn (2-3 ngày về một lần) hoặc các cặp số vừa hết chu kỳ gan cực đại.
                    </p>
                </section>
            </article>
        </div>
    );
}
