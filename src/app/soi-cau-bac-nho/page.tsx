'use client';

import { useState } from 'react';
import SoDonTab from './components/SoDonTab';
import Cap2Tab from './components/Cap2Tab';
import Cap3Tab from './components/Cap3Tab';
import BacNho2NgayTab from './components/BacNho2NgayTab';

type TabType = 'so-don' | 'cap-2' | 'cap-3' | '2-ngay';

import JsonLd from '@/components/seo/JsonLd';
import { generateManualArticleSchema, generateBreadcrumbSchema, generateFAQSchema } from '@/lib/schema-generator';
import TopicHub from '@/components/TopicHub';

export default function SoiCauBacNhoPage() {
    const [activeTab, setActiveTab] = useState<TabType>('so-don');

    const breadcrumbs = [
        { name: 'Trang chủ', item: '/' },
        { name: 'Soi Cầu Bạc Nhớ', item: '/soi-cau-bac-nho' }
    ];

    const schemaArgs = {
        title: 'Soi Cầu Bạc Nhớ - Dự Đoán KQXS Chính Xác',
        description: 'Phương pháp soi cầu bạc nhớ lô đề miền Bắc chính xác nhất. Phân tích thống kê bạc nhớ theo giải đặc biệt, lô tô ra theo lô tô.'
    };

    return (
        <div className="space-y-6">
            <JsonLd data={generateManualArticleSchema(schemaArgs.title, schemaArgs.description, '/soi-cau-bac-nho')} />
            <JsonLd data={generateBreadcrumbSchema(breadcrumbs)} />
            <JsonLd data={generateFAQSchema([
                { question: 'Bạc nhớ xổ số là gì?', answer: 'Bạc nhớ xổ số là phương pháp thống kê dựa trên xu hướng lặp lại của các cặp số trong lịch sử kết quả XSMB. Khi một số xuất hiện hôm nay, phương pháp này xác định các số nào thường xuất hiện vào ngày hôm sau dựa trên dữ liệu quá khứ.' },
                { question: 'Bạc nhớ cặp 2 và cặp 3 khác gì nhau?', answer: 'Bạc nhớ Cặp 2 phân tích khi 2 số cùng xuất hiện một ngày. Cặp 3 yêu cầu 3 số cùng xuất hiện, điều kiện chặt hơn nên trigger ít hơn nhưng kết quả có độ tin cậy cao hơn.' },
                { question: 'Nên dùng bạc nhớ loại nào để chốt số?', answer: 'Nên kết hợp nhiều loại: dùng Số Đơn để có danh sách rộng, Cặp 2 để lọc bớt, và Cặp 3 hoặc 2 Ngày để chốt con số cuối cùng. Sự kết hợp đa phương pháp giúp tăng độ chính xác tổng thể.' },
                { question: 'Bạc nhớ khung 3 ngày là gì?', answer: 'Bạc Nhớ Khung 3 Ngày là biến thể phân tích trong chu kỳ 3 ngày ngắn hạn, giúp bắt được các quy luật xuất hiện gần đây hơn và phản ánh trạng thái nóng/lạnh của số trong thời gian gần.' },
            ])} />
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                    <h1 className="text-4xl font-bold text-lottery-gray-800 mb-2">
                        Soi Cầu Bạc Nhớ
                    </h1>
                    <p className="text-lottery-gray-600">Phân tích tương quan số dựa trên lịch sử tối đa 1000 ngày</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="card overflow-hidden">
                <div className="border-b border-lottery-gray-200 overflow-x-auto scrollbar-hide">
                    <nav className="flex -mb-px min-w-max md:min-w-0">
                        <button
                            onClick={() => setActiveTab('so-don')}
                            className={`
                                px-6 py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap
                                ${activeTab === 'so-don'
                                    ? 'border-lottery-red-600 text-lottery-red-600 bg-lottery-red-50/50'
                                    : 'border-transparent text-lottery-gray-600 hover:text-lottery-red-600 hover:border-lottery-gray-300'
                                }
                            `}
                        >
                            <span className="flex items-center gap-2">
                                <span className="text-lg">🔢</span>
                                Bạc Nhớ Số Đơn
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('cap-2')}
                            className={`
                                px-6 py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap
                                ${activeTab === 'cap-2'
                                    ? 'border-lottery-red-600 text-lottery-red-600 bg-lottery-red-50/50'
                                    : 'border-transparent text-lottery-gray-600 hover:text-lottery-red-600 hover:border-lottery-gray-300'
                                }
                            `}
                        >
                            <span className="flex items-center gap-2">
                                <span className="text-lg">🎲</span>
                                Bạc Nhớ Cặp 2
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('cap-3')}
                            className={`
                                px-6 py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap
                                ${activeTab === 'cap-3'
                                    ? 'border-lottery-red-600 text-lottery-red-600 bg-lottery-red-50/50'
                                    : 'border-transparent text-lottery-gray-600 hover:text-lottery-red-600 hover:border-lottery-gray-300'
                                }
                            `}
                        >
                            <span className="flex items-center gap-2">
                                <span className="text-lg">🎰</span>
                                Bạc Nhớ Cặp 3
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('2-ngay')}
                            className={`
                                px-6 py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap
                                ${activeTab === '2-ngay'
                                    ? 'border-lottery-red-600 text-lottery-red-600 bg-lottery-red-50/50'
                                    : 'border-transparent text-lottery-gray-600 hover:text-lottery-red-600 hover:border-lottery-gray-300'
                                }
                            `}
                        >
                            <span className="flex items-center gap-2">
                                <span className="text-lg">📅</span>
                                Bạc Nhớ 2 Ngày
                            </span>
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'so-don' && <SoDonTab />}
                    {activeTab === 'cap-2' && <Cap2Tab />}
                    {activeTab === 'cap-3' && <Cap3Tab />}
                    {activeTab === '2-ngay' && <BacNho2NgayTab />}
                </div>
            </div>

            {/* Info Section */}
            <div className="card bg-blue-50 border-l-4 border-blue-500">
                <div className="flex items-start space-x-3">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                        <h4 className="font-bold text-blue-900 mb-2">Hướng dẫn sử dụng:</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li><strong>Bạc Nhớ Số Đơn:</strong> Phân tích khi số A xuất hiện ở ngày D, số B nào sẽ xuất hiện ở ngày D+1</li>
                            <li><strong>Bạc Nhớ Cặp 2:</strong> Phân tích khi cặp A+B cùng xuất hiện ở ngày D, số C nào sẽ xuất hiện ở ngày D+1</li>
                            <li><strong>Bạc Nhớ Cặp 3:</strong> Phân tích khi cặp A+B+C cùng xuất hiện ở ngày D, số D nào sẽ xuất hiện ở ngày D+1</li>
                            <li><strong>Bạc Nhớ 2 Ngày:</strong> Phân tích khi số A xuất hiện ở ngày D-1 VÀ số B xuất hiện ở ngày D, số nào sẽ xuất hiện ở ngày D+1</li>
                            <li><strong>Tỷ lệ %:</strong> Tính bằng (Số lần xuất hiện / Tổng số lần trigger) × 100%</li>
                            <li className="text-red-600 font-bold uppercase mt-2">Miễn trừ trách nhiệm:</li>
                            <li className="text-red-600 italic">Đây là phân tích thuật toán dựa trên dữ liệu quá khứ, không có giá trị cam kết hoặc đảm bảo kết quả trúng thưởng trong tương lai.</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Topic Cluster Hub */}
            <div className="my-8">
                <TopicHub title="Công Cụ Soi Cầu Liên Quan" />
            </div>

            {/* SEO Content */}
            <div className="mt-10 p-6 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-700 leading-relaxed text-justify shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-gray-900">Soi Cầu Bạc Nhớ XSMB — Phương Pháp Phân Tích Khoa Học</h2>
                <p>
                    Phương pháp <strong>Soi Cầu Bạc Nhớ</strong> (hay còn gọi là <strong>Bạc Nhớ Xổ Số Miền Bắc</strong>) là phương pháp phân tích dữ liệu thống kê dựa trên quy luật "bộ nhớ số" — tức là xu hướng lặp lại của các cặp số trong lịch sử kết quả XSMB.
                    Chúng tôi phân tích toàn bộ dữ liệu lịch sử để tìm ra chu kỳ lặp lại: <em>"Hôm nay về con này, ngày mai thường ra con gì?"</em>
                </p>
                <p>
                    Hệ thống cung cấp <strong>4 dạng phân tích bạc nhớ</strong> chuyên sâu:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Bạc Nhớ Số Đơn:</strong> Khi số A xuất hiện hôm nay, các số nào hay xuất hiện ngày hôm sau? Xếp hạng theo tỷ lệ % xuất hiện.</li>
                    <li><strong>Bạc Nhớ Cặp 2:</strong> Phân tích khi 2 số A+B cùng xuất hiện trong một ngày, số nào sẽ ra ngày tiếp theo. Độ chính xác cao hơn Số Đơn.</li>
                    <li><strong>Bạc Nhớ Cặp 3:</strong> Phân tích 3 số xuất hiện cùng ngày — đây là dạng phân tích chặt chẽ nhất, tỷ lệ trigger ít hơn nhưng độ tin cậy cao.</li>
                    <li><strong>Bạc Nhớ 2 Ngày:</strong> Phân tích khi số A xuất hiện ngày D-1 VÀ số B xuất hiện ngày D, số nào sẽ ra ngày D+1. Kết hợp xu hướng 2 ngày liên tiếp.</li>
                </ul>
                <p>
                    Công cụ này giúp người chơi nắm bắt các <strong>quy luật bạc nhớ XSMB theo giải đặc biệt</strong>, <strong>bạc nhớ đầu đuôi câm</strong>, hay <strong>bạc nhớ theo các cặp lô hay đi cùng nhau</strong>.
                    Thay vì đoán mò cảm tính, hãy để dữ liệu lịch sử dẫn đường. Đây là phương pháp được cộng đồng cao thủ lô đề sử dụng để chốt số an toàn mỗi ngày.
                    <em>Lưu ý: Mọi thông tin chỉ mang tính tham khảo thống kê, không đảm bảo kết quả trúng thưởng.</em>
                </p>

                {/* FAQ Section */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="text-base font-bold text-gray-800 mb-3">Câu Hỏi Thường Gặp về Bạc Nhớ XSMB</h3>
                    <div className="space-y-3">
                        <div>
                            <p className="font-semibold text-gray-800">Bạc nhớ xổ số là gì?</p>
                            <p className="text-gray-600">Bạc nhớ xổ số là phương pháp thống kê dựa trên xu hướng lặp lại của các cặp số trong lịch sử kết quả XSMB. Khi một số xuất hiện hôm nay, phương pháp này xác định các số nào thường xuất hiện vào ngày hôm sau dựa trên dữ liệu quá khứ.</p>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800">Bạc nhớ cặp 2 và cặp 3 khác gì nhau?</p>
                            <p className="text-gray-600">Bạc nhớ Cặp 2 phân tích khi 2 số cùng xuất hiện một ngày — thường cho ra số ứng viên ngày hôm sau. Cặp 3 yêu cầu 3 số cùng xuất hiện, điều kiện chặt hơn nên trigger ít hơn nhưng kết quả có độ tin cậy cao hơn.</p>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800">Nên dùng bạc nhớ loại nào để chốt số?</p>
                            <p className="text-gray-600">Nên kết hợp nhiều loại: dùng Số Đơn để có danh sách rộng, Cặp 2 để lọc bớt, và Cặp 3 hoặc 2 Ngày để chốt con số cuối cùng nếu có đủ trigger. Sự kết hợp đa phương pháp giúp tăng độ chính xác tổng thể.</p>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800">Bạc nhớ khung 3 ngày là gì?</p>
                            <p className="text-gray-600">Bạc Nhớ Khung 3 Ngày là biến thể phân tích trong chu kỳ 3 ngày ngắn hạn, giúp bắt được các quy luật xuất hiện gần đây hơn và phản ánh trạng thái &quot;nóng/lạnh&quot; của số trong thời gian gần.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
