import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, Info, Zap, Calculator, Trophy, HelpCircle } from 'lucide-react';
import PascalCalculator from '@/components/tools/PascalCalculator';
import JsonLd from '@/components/seo/JsonLd';
import { getLatestResult } from '@/lib/lottery-data';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

export const metadata: Metadata = {
    title: 'Cách Tính Cầu Pascal XSMB 2026 - Soi Cầu Tam Giác Thần Thánh',
    description: 'Hướng dẫn chi tiết cách tính cầu Pascal xổ số miền Bắc năm 2026. Công cụ tính toán tự động tìm cặp song thủ lô VIP dựa trên giải Đặc biệt và giải Nhất.',
    alternates: {
        canonical: `${siteUrl}/cam-nang-soi-cau/cau-pascal`,
    },
    openGraph: {
        title: 'Cầu Pascal XSMB - Thuật Toán Cho Song Thủ Lô VIP',
        description: 'Tự tính cầu Pascal XSMB chuẩn xác với công cụ thông minh. Bí mật đằng sau những con số trúng thưởng.',
        url: `${siteUrl}/cam-nang-soi-cau/cau-pascal`,
        images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630 }],
    }
};

export default async function PascalGuide() {
    const latestResult = await getLatestResult();
    const today = format(new Date(), 'dd/MM/yyyy');
    
    // Default values if no result found
    const num1 = latestResult?.special_prize || '02855';
    const num2 = latestResult?.prize_1 || '71740';

    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': `Cách Tính Cầu Pascal XSMB Ngày ${today} Chính Xác Nhất`,
        'image': [`${siteUrl}/og-image.png`],
        'datePublished': '2026-04-06T08:00:00+07:00',
        'dateModified': new Date().toISOString(),
        'author': { '@type': 'Organization', 'name': 'XSMB 24h' }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 font-sans">
            <JsonLd data={articleSchema} />
            
            <nav className="mb-6">
                <Link 
                    href="/cam-nang-soi-cau" 
                    className="inline-flex items-center text-slate-500 hover:text-lottery-red-600 transition-colors text-sm font-medium"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Quay lại Cẩm nang
                </Link>
            </nav>

            <header className="mb-10 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-4 leading-tight uppercase">
                    Cách Tính <span className="text-lottery-red-600">Cầu Pascal XSMB</span> {today}
                </h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-500 italic">
                    <span className="flex items-center gap-1"><Zap className="w-4 h-4 text-amber-500" /> Phương pháp hiện đại</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span className="flex items-center gap-1"><Calculator className="w-4 h-4 text-blue-500" /> Tích hợp công cụ tự động</span>
                </div>
            </header>

            {/* Intro Section */}
            <section className="prose prose-slate max-w-none mb-12">
                <p className="text-base md:text-lg leading-relaxed text-slate-600 first-letter:text-5xl first-letter:font-bold first-letter:text-lottery-red-600 first-letter:mr-3 first-letter:float-left">
                    Soi cầu Pascal là một trong những phương pháp soi cầu XSMB kinh điển được giới cao thủ ưa chuộng nhất hiện nay. 
                    Phương pháp này dựa trên thuật toán tam giác của nhà toán học Pascal, áp dụng vào dãy số giải Đặc biệt và giải Nhất 
                    để tìm ra cặp song thủ lô có xác suất về cực cao trong kỳ quay tiếp theo.
                </p>
                
                <div className="bg-lottery-red-50 border-l-4 border-lottery-red-600 p-6 rounded-r-2xl my-8">
                    <h3 className="text-lottery-red-800 font-bold flex items-center gap-2 mt-0">
                        <Info className="w-5 h-5" /> Nguyên lý hoạt động:
                    </h3>
                    <p className="mb-0 text-lottery-red-900">
                        Ghép dãy số giải Đặc biệt và giải Nhất thành một hàng ngang. Tiến hành cộng 2 số liền kề lại với nhau, lấy chữ số hàng đơn vị. 
                        Lặp lại quy trình này cho đến khi chỉ còn lại 2 chữ số cuối cùng - đó chính là cặp số tài lộc bạn đang tìm kiếm.
                    </p>
                </div>
            </section>

            {/* THE TOOL */}
            <section className="mb-16 scroll-mt-20" id="tool">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 uppercase">
                        <Calculator className="w-6 h-6 text-lottery-red-600" /> Cầu Pascal Hôm Nay {today}
                    </h2>
                </div>
                <PascalCalculator initialNum1={num1} initialNum2={num2} />
            </section>

            {/* Steps Section */}
            <section className="prose prose-slate max-w-none mb-12">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 uppercase">
                    <Trophy className="w-6 h-6 text-amber-500" /> 3 Bước Soi Cầu Pascal Thành Công
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
                    <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex flex-col items-center text-center group hover:bg-lottery-red-600 transition-all duration-300">
                        <div className="w-12 h-12 bg-lottery-red-100 text-lottery-red-600 rounded-full flex items-center justify-center font-bold text-xl mb-4 group-hover:bg-white transition-colors">1</div>
                        <h4 className="font-bold mb-2 group-hover:text-white transition-colors">Lấy Dữ Liệu</h4>
                        <p className="text-sm text-slate-500 group-hover:text-red-100 transition-colors">Lấy kết quả giải Đặc biệt (5 số) và giải Nhất (5 số) của kỳ quay gần nhất.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex flex-col items-center text-center group hover:bg-lottery-red-600 transition-all duration-300">
                        <div className="w-12 h-12 bg-lottery-red-100 text-lottery-red-600 rounded-full flex items-center justify-center font-bold text-xl mb-4 group-hover:bg-white transition-colors">2</div>
                        <h4 className="font-bold mb-2 group-hover:text-white transition-colors">Cộng Dồn</h4>
                        <p className="text-sm text-slate-500 group-hover:text-red-100 transition-colors">Cộng dồn các con số theo hình tam giác cho đến khi còn lại 2 số cuối.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex flex-col items-center text-center group hover:bg-lottery-red-600 transition-all duration-300">
                        <div className="w-12 h-12 bg-lottery-red-100 text-lottery-red-600 rounded-full flex items-center justify-center font-bold text-xl mb-4 group-hover:bg-white transition-colors">3</div>
                        <h4 className="font-bold mb-2 group-hover:text-white transition-colors">Chốt Số</h4>
                        <p className="text-sm text-slate-500 group-hover:text-red-100 transition-colors">Sử dụng cặp số nhận được và số đảo của nó để đánh song thủ lô cho ngày mai.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="bg-slate-50 rounded-3xl p-8 mb-12">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-6 uppercase">
                    <HelpCircle className="w-6 h-6 text-lottery-red-600" /> Thắc mắc thường gặp
                </h2>
                <div className="space-y-6">
                    <div>
                        <h4 className="font-bold text-slate-800 text-lg mb-2">Cầu Pascal có chính xác không?</h4>
                        <p className="text-slate-600">Đây là phương pháp dựa trên thống kê xác suất. Không có phương pháp nào chính xác 100%, nhưng Pascal giúp bạn thu hẹp phạm vi chọn số một cách khoa học nhất.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800 text-lg mb-2">Nên theo cầu trong mấy ngày?</h4>
                        <p className="text-slate-600">Thông thường, cầu Pascal có chu kỳ về trong vòng 1-2 ngày sau khi tính. Nếu sau 3 ngày không về, bạn nên đổi sang cầu khác.</p>
                    </div>
                </div>
            </section>

            <footer className="border-t pt-8 text-center text-slate-400 text-sm">
                <p>© 2026 XSMB 24h - Trang web tra cứu kết quả và soi cầu uy tín hàng đầu Việt Nam.</p>
            </footer>
        </div>
    );
}
