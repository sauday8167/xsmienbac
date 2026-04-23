import { Metadata } from 'next';
import ResultTable from '@/components/ResultTable';
import StatisticsPanel from '@/components/StatisticsPanel';
import FAQSection from '@/components/FAQSection';
import JsonLd from '@/components/seo/JsonLd';
import { getLatestResult } from '@/lib/lottery-data';
import HomeClient from './HomeClient';
import { generateLotteryResultSchema } from '@/lib/schema-generator';
import type { LotteryResult } from '@/types';

import { unstable_noStore as noStore } from 'next/cache';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xosomienbac24h.com';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
    title: 'Xổ Số Miền Bắc (XSMB) - Trực Tiếp Kết Quả SXMB Hôm Nay Nhanh Số 1',
    description: 'Xem trực tiếp kết quả Xổ Số Miền Bắc (KQXSMB) hôm nay chính xác nhất từ trường quay. Cập nhật bảng kết quả, soi cầu loto, thống kê lô gan bạch thủ lô VIP liên tục 24h.',
    alternates: {
        canonical: siteUrl,
    },
    openGraph: {
        title: 'Xổ Số Miền Bắc (XSMB) - Trực Tiếp Kết Quả SXMB Hôm Nay Nhanh Số 1',
        description: 'Xem trực tiếp kết quả Xổ Số Miền Bắc (KQXSMB) hôm nay chính xác nhất từ trường quay. Cập nhật bảng kết quả, soi cầu loto, thống kê lô gan bạch thủ lô VIP liên tục 24h.',
        url: siteUrl,
        type: 'website',
        siteName: 'XSMB 24h',
        locale: 'vi_VN',
        images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630, alt: 'XSMB - Kết Quả Xổ Số Miền Bắc 24h' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'XSMB - Kết Quả Xổ Số Miền Bắc Hôm Nay',
        description: 'Xem kết quả xổ số miền Bắc (XSMB) hôm nay nhanh nhất, chính xác nhất.',
        images: [`${siteUrl}/og-image.png`],
    },
};

/**
 * SERVER COMPONENT — Page chủ được render hoàn toàn trên server.
 * Google Bot sẽ nhìn thấy đầy đủ bảng KQXS, thống kê, FAQ trong HTML đầu tiên.
 * HomeClient chỉ được mount để xử lý live-update trong giờ quay thưởng (18h10-18h40).
 */
export default async function HomePage({ searchParams }: { searchParams: any }) {
    // Force dynamic rendering - strictly no cache
    noStore();

    // Fetch kết quả mới nhất từ DB trực tiếp — không qua API
    const latestResult = await getLatestResult();

    const faqItems = [
        { question: 'Xổ số miền Bắc quay thưởng lúc mấy giờ?', answer: 'Quay thưởng trực tiếp vào lúc 18:15 hàng ngày, thứ 2 đến Chủ Nhật.' },
        { question: 'Cơ cấu giải thưởng XSMB như thế nào?', answer: 'Bao gồm 27 giải thưởng: Giải Đặc Biệt (1 giải), Giải Nhất (1), Giải Nhì (2), Giải Ba (6), Giải Tư (4), Giải Năm (6), Giải Sáu (3), Giải Bảy (4).' },
        { question: 'Làm sao dò kết quả xổ số miền Bắc?', answer: 'Bạn có thể tra cứu kết quả tại trang Dò Vé Số của chúng tôi, hoặc xem bảng kết quả cập nhật mỗi ngày lúc 18h15.' },
        { question: 'Soi cầu bạch thủ lô là gì?', answer: 'Bạch thủ lô là phương pháp chọn 1 con số duy nhất để đánh trong ngày, dựa trên phân tích thống kê tần suất và bạc nhớ XSMB.' },
        { question: 'Lô gan là gì?', answer: 'Lô gan là những con số chưa xuất hiện trong nhiều kỳ liên tiếp. Nhiều người chú ý đến lô gan để xem xét việc chọn số đánh.' },
        { question: 'Website có cập nhật kết quả trực tiếp không?', answer: 'Có! Trong giờ quay thưởng (18h10-18h40), trang chủ tự động refresh mỗi 3 giây để hiển thị kết quả trực tiếp từ trường quay.' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {latestResult && (
                <JsonLd data={generateLotteryResultSchema(latestResult.draw_date, {
                    special: latestResult.special_prize,
                    p1: latestResult.prize_1,
                    p2: latestResult.prize_2.join(', '),
                    p3: latestResult.prize_3.join(', '),
                    p4: latestResult.prize_4.join(', '),
                    p5: latestResult.prize_5.join(', '),
                    p6: latestResult.prize_6.join(', '),
                    p7: latestResult.prize_7.join(', '),
                })} />
            )}
            {/* H1 - Tối ưu SEO & Hiển thị thẩm mỹ */}
            <header className="text-center py-4 md:py-6">
                <h1 className="text-2xl md:text-4xl font-extrabold uppercase tracking-tight text-white mb-2 py-4 bg-gradient-to-r from-lottery-red-700 via-lottery-red-600 to-lottery-red-800 shadow-inner rounded-xl border-x-4 border-amber-400">
                    Xổ Số Miền Bắc - KQXS Miền Bắc Hôm Nay Chính Xác Nhất
                </h1>
                <div className="flex items-center justify-center gap-4 mt-2">
                    <div className="h-px bg-slate-200 flex-1"></div>
                    <p className="text-slate-500 font-medium text-sm md:text-base italic px-4">
                        Cập nhật trực tiếp nhanh số 1 Việt Nam
                    </p>
                    <div className="h-px bg-slate-200 flex-1"></div>
                </div>
            </header>

            {/* SERVER-RENDERED: Bảng kết quả xổ số — Google Bot đọc được ngay */}
            {latestResult ? (
                <section className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 md:p-8 overflow-hidden">
                    <ResultTable result={latestResult} />
                </section>
            ) : (
                <section className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
                    <p className="text-slate-500">Chưa có kết quả xổ số hôm nay. Quay lúc 18:15.</p>
                </section>
            )}

            {/* CLIENT COMPONENT: Live-update trong giờ quay thưởng + Thống kê + các section khác */}
            <HomeClient initialResult={latestResult} />

            {/* SERVER-RENDERED: FAQ Schema — Google hiển thị Rich Snippets */}
            <FAQSection
                title="Câu Hỏi Thường Gặp Về Xổ Số Miền Bắc"
                items={faqItems}
            />

            {/* SEO Text Block */}
            <div className="mt-10 p-6 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-700 leading-relaxed text-justify shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Giới thiệu về Trang Chủ Xổ Số Miền Bắc 24h</h2>
                <p className="mb-2">
                    <strong>Xổ Số Miền Bắc 24h (XSMB24h)</strong> là trang web tra cứu kết quả xổ số miền Bắc nhanh nhất,
                    chính xác tuyệt đối. Dữ liệu được cập nhật trực tiếp từ trường quay mỗi ngày lúc 18h15.
                </p>
                <p className="mb-2">
                    Ngoài bảng <strong>KQXSMB</strong> mỗi ngày, chúng tôi cung cấp hệ thống phân tích chuyên sâu:
                    <a href="/soi-cau-bac-nho" className="text-red-600 hover:underline mx-1">soi cầu bạc nhớ</a>,
                    <a href="/thong-ke" className="text-red-600 hover:underline mx-1">thống kê lô gan</a>,
                    <a href="/du-doan-ai" className="text-red-600 hover:underline mx-1">dự đoán AI</a> và
                    <a href="/so-mo" className="text-red-600 hover:underline mx-1">sổ mơ giải mộng</a>.
                </p>
                <p className="text-xs text-gray-500 italic">
                    ⚠️ Mọi thông tin chỉ mang tính chất tham khảo và nghiên cứu thống kê. 
                    Không khuyến khích đánh bạc trái pháp luật.
                </p>
            </div>
        </div>
    );
}

