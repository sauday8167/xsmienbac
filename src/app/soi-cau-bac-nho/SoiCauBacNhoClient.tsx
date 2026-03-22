'use client';

import { useState } from 'react';
import SoDonTab from './components/SoDonTab';
import Cap2Tab from './components/Cap2Tab';
import Cap3Tab from './components/Cap3Tab';
import BacNho2NgayTab from './components/BacNho2NgayTab';
import BacNho3NgayTab from './components/BacNho3NgayTab';
import JsonLd from '@/components/seo/JsonLd';
import { generateManualArticleSchema, generateBreadcrumbSchema, generateFAQSchema } from '@/lib/schema-generator';
import TopicHub from '@/components/TopicHub';

type TabType = 'so-don' | 'cap-2' | 'cap-3' | '2-ngay' | '3-ngay';

export default function SoiCauBacNhoClient() {
    const [activeTab, setActiveTab] = useState<TabType>('so-don');

    const breadcrumbs = [
        { name: 'Trang chủ', item: '/' },
        { name: 'Soi Cầu Bạc Nhớ', item: '/soi-cau-bac-nho' }
    ];

    const schemaArgs = {
        title: "Soi Cầu Bạc Nhớ Xổ Số Miền Bắc – Dự Đoán KQXS Chính Xác",
        description: "Bạc Nhớ Xổ Số Miền Bắc chính xác nhất: Phương pháp soi cầu lô đề miền Bắc dựa trên phân tích thống kê bạc nhớ theo giải đặc biệt."
    };

    return (
        <div className="space-y-6">
            <JsonLd data={generateManualArticleSchema(schemaArgs.title, schemaArgs.description, '/soi-cau-bac-nho')} />
            <JsonLd data={generateBreadcrumbSchema(breadcrumbs)} />
            <JsonLd data={generateFAQSchema([
                { question: 'Bạc nhớ xổ số là gì?', answer: 'Bạc nhớ xổ số là phương pháp thống kê dựa trên xu hướng lặp lại của các cặp số trong lịch sử kết quả XSMB.' },
                { question: 'Nên dùng bạc nhớ loại nào để chốt số?', answer: 'Nên kết hợp nhiều loại: dùng Số Đơn để có danh sách rộng, Cặp 2 để lọc bớt, và Cặp 3 để chốt.' },
            ])} />
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                    <h1 className="text-4xl font-bold text-lottery-gray-800 mb-2">
                        Soi Cầu Bạc Nhớ
                    </h1>
                    <p className="text-lottery-gray-600">Phân tích tương quan số dựa trên lịch sử tối đa 1000 ngày</p>
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="border-b border-lottery-gray-200 overflow-x-auto scrollbar-hide">
                    <nav className="flex -mb-px min-w-max md:min-w-0">
                        {(['so-don', 'cap-2', 'cap-3', '2-ngay', '3-ngay'] as TabType[]).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`
                                    px-6 py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap
                                    ${activeTab === tab
                                        ? 'border-lottery-red-600 text-lottery-red-600 bg-lottery-red-50/50'
                                        : 'border-transparent text-lottery-gray-600 hover:text-lottery-red-600 hover:border-lottery-gray-300'
                                    }
                                `}
                            >
                                <span className="flex items-center gap-2">
                                    {tab === 'so-don' && '🔢 Bạc Nhớ Số Đơn'}
                                    {tab === 'cap-2' && '🎲 Bạc Nhớ Cặp 2'}
                                    {tab === 'cap-3' && '🎰 Bạc Nhớ Cặp 3'}
                                    {tab === '2-ngay' && '📅 Bạc Nhớ 2 Ngày'}
                                    {tab === '3-ngay' && '🗓️ Bạc Nhớ 3 Ngày'}
                                </span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'so-don' && <SoDonTab />}
                    {activeTab === 'cap-2' && <Cap2Tab />}
                    {activeTab === 'cap-3' && <Cap3Tab />}
                    {activeTab === '2-ngay' && <BacNho2NgayTab />}
                    {activeTab === '3-ngay' && <BacNho3NgayTab />}
                </div>
            </div>

            <div className="card bg-blue-50 border-l-4 border-blue-500">
                <div className="flex items-start space-x-3">
                    <div className="p-1 text-blue-600">ℹ️</div>
                    <div>
                        <h4 className="font-bold text-blue-900 mb-2">Hướng dẫn sử dụng:</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>Phân tích tương quan số học dựa trên dữ liệu lịch sử Xổ Số Miền Bắc.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="my-8">
                <TopicHub title="Công Cụ Soi Cầu Liên Quan" />
            </div>
        </div>
    );
}
