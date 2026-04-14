import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, Info, Zap, BookOpen, Star, AlertCircle } from 'lucide-react';
import JsonLd from '@/components/seo/JsonLd';
import { analyzeBacNho } from '@/lib/bac-nho';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

export const metadata: Metadata = {
    title: 'Soi Cầu Bạc Nhớ XSMB 2026 - Bí Quyết Số Này Ra Kéo Số Kia Về',
    description: 'Hướng dẫn toàn tập về phương pháp soi cầu bạc nhớ XSMB năm 2026. Tổng hợp các bộ số hay đi cùng nhau, bạc nhớ lô đề đầu đuôi câm chính xác nhất.',
    alternates: {
        canonical: `${siteUrl}/cam-nang-soi-cau/bac-nho`,
    }
};

export default async function BacNhoGuide() {
    const bacNhoData = await analyzeBacNho(300);
    const today = format(new Date(), 'dd/MM/yyyy');
    
    // Get top 8 predictions for display
    const predictions = bacNhoData.todayPredictions.slice(0, 8);

    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': `Bạc Nhớ XSMB Toàn Tập Ngày ${today}: Quy Luật Con Số`,
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
                        Bí Quyết <span className="text-lottery-red-600">Soi Cầu Bạc Nhớ</span> XSMB {today}
                    </h1>
                    <p className="text-slate-500 italic flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-500" /> Dữ liệu cập nhật mới nhất ngày {today}
                    </p>
                </header>

                <section>
                    <h2>1. Bạc nhớ là gì?</h2>
                    <p>
                        <strong>Bạc nhớ</strong> là phương pháp dựa trên quy luật lặp lại của các con số trong lịch sử XSMB. 
                        Dân gian có câu "số có chân", có nghĩa là khi một con số hoặc cặp số xuất hiện ở kỳ này, 
                        nó thường kéo theo một con số khác ở các kỳ quay tiếp theo.
                    </p>
                </section>

                <section className="bg-blue-50 p-6 rounded-2xl border border-blue-100 my-8 not-prose">
                    <h3 className="text-blue-800 font-bold flex items-center gap-2 mb-4">
                        <Star className="w-5 h-5 text-amber-500" /> Các dạng Bạc nhớ phổ biến nhất:
                    </h3>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-2">
                            <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">1</span>
                            <div><strong>Bạc nhớ theo lô tô:</strong> Cặp số A ra thì hôm qua thường có cặp B.</div>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">2</span>
                            <div><strong>Bạc nhớ đầu đuôi câm:</strong> Đầu X hoặc Đuôi Y không về thì hôm sau bắt lô gì.</div>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">3</span>
                            <div><strong>Bạc nhớ theo thứ:</strong> Thứ 2 hay về số nào, thứ 7 hay có số nào.</div>
                        </li>
                    </ul>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 uppercase mb-6">
                        <Zap className="w-6 h-6 text-lottery-red-600" /> Dự báo Bạc Nhớ hôm nay {today}
                    </h2>
                    
                    {predictions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {predictions.map((item, idx) => (
                                <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Nếu hôm trước ra</span>
                                        <span className="text-2xl font-black text-slate-700">{item.yesterdayNumber}</span>
                                    </div>
                                    <div className="flex flex-col items-center px-4">
                                        <div className="h-px w-8 bg-slate-200 mb-1"></div>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase italic">Bạc nhớ</span>
                                        <div className="h-px w-8 bg-slate-200 mt-1"></div>
                                    </div>
                                    <div className="flex flex-col text-right">
                                        <span className="text-xs text-lottery-red-500 font-bold uppercase tracking-wider">Hôm nay bắt cặp</span>
                                        <span className="text-2xl font-black text-lottery-red-600">{item.patterns[0].songThuPair.join(' - ')}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 bg-slate-50 rounded-2xl text-center text-slate-500 italic">
                            Đang phân tích dữ liệu bạc nhớ cho ngày hôm nay...
                        </div>
                    )}
                </section>

                <section>
                    <h2>2. Tổng hợp các cặp số hay đi cùng nhau (Thống kê 300 ngày)</h2>
                    <table className="min-w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <thead>
                            <tr className="bg-slate-100 text-slate-700">
                                <th className="p-3 border text-left">Nếu hôm nay có</th>
                                <th className="p-3 border text-left">Hôm sau thường có</th>
                                <th className="p-3 border text-center">Tỷ lệ chính xác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bacNhoData.top10Global.slice(0, 10).map((p, i) => (
                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-3 border font-bold text-slate-800">{p.trigger}</td>
                                    <td className="p-3 border text-lottery-red-600 font-bold">{p.songThuPair.join(' - ')}</td>
                                    <td className="p-3 border text-center">
                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                            {p.correlationRate.toFixed(1)}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                <section>
                    <h2>3. Lưu ý khi chơi Bạc nhớ</h2>
                    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 leading-relaxed">
                        <p className="flex items-center gap-2 font-bold text-amber-800 mb-2">
                            <AlertCircle className="w-5 h-5" /> Cảnh báo quan trọng
                        </p>
                        Bạc nhớ chỉ mang tính chất thống kê tương đối. Quy luật có thể thay đổi theo từng giai đoạn (gan cầu). 
                        Bạn nên kết hợp với phương pháp <Link href="/cam-nang-soi-cau/cau-pascal" className="text-blue-600 underline">soi cầu Pascal</Link> hoặc thống kê loto gan để tăng độ chính xác.
                    </div>
                </section>
            </article>
        </div>
    );
}
