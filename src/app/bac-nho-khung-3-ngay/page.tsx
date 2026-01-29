'use client';

import { useState } from 'react';
import SoDonTab from './components/SoDonTab';
import Cap2Tab from './components/Cap2Tab';
import Cap3Tab from './components/Cap3Tab';
import BacNho2NgayTab from './components/BacNho2NgayTab';

type TabType = 'so-don' | 'cap-2' | 'cap-3' | '2-ngay';

export default function BacNhoKhung3NgayPage() {
    const [activeTab, setActiveTab] = useState<TabType>('so-don');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                    <h1 className="text-4xl font-bold text-lottery-gray-800 mb-2">
                        Bạc Nhớ Khung 3 Ngày
                    </h1>
                    <p className="text-lottery-gray-600">Phân tích số xuất hiện trong 3 kỳ xổ số liên tiếp</p>
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
                        <h4 className="font-bold text-blue-900 mb-2">Hướng dẫn nuôi khung 3 ngày:</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li><strong>Khung 3 Ngày:</strong> Phân tích khi số A về, số B nào sẽ về trong 3 ngày tới (D+1, D+2, hoặc D+3).</li>
                            <li><strong>Tỷ lệ %:</strong> Số lần số B xuất hiện trong khung / Tổng số lần số A xuất hiện.</li>
                            <li><strong>Mặc định lọc &gt; 80%:</strong> Chỉ hiển thị những cặp số có tỷ lệ về trong khung rất cao.</li>
                            <li><strong>Lưu ý:</strong> Bạc nhớ khung 3 ngày có độ tin cậy cao hơn chơi trong ngày, nhưng cần vốn nuôi.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
