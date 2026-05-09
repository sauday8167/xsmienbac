'use client';

import { useState } from 'react';

import Cap2Tab from './components/Cap2Tab';
import Cap3Tab from './components/Cap3Tab';
import BacNho2NgayTab from './components/BacNho2NgayTab';
import BacNho3NgayTab from './components/BacNho3NgayTab';

type TabType = 'cap-2' | 'cap-3' | '2-ngay' | '3-ngay';

export default function BacNhoKhung3NgayClient() {
    const [activeTab, setActiveTab] = useState<TabType>('cap-2');

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                    <h1 className="text-4xl font-bold text-lottery-gray-800 mb-2">
                        Bạc Nhớ Khung 3 Ngày
                    </h1>
                    <p className="text-lottery-gray-600">Phân tích số xuất hiện trong 3 kỳ xổ số liên tiếp</p>
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="border-b border-lottery-gray-200 overflow-x-auto scrollbar-hide">
                    <nav className="flex -mb-px min-w-max md:min-w-0">
                        {(['cap-2', 'cap-3', '2-ngay', '3-ngay'] as TabType[]).map(tab => (
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
                        <h4 className="font-bold text-blue-900 mb-2">Hướng dẫn nuôi khung 3 ngày:</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li><strong>Khung 3 Ngày:</strong> Phân tích các số thường về trong 3 ngày sau khi bộ số trigger xuất hiện.</li>
                            <li><strong>Tỷ lệ %:</strong> Độ tin cậy của quy luật dựa trên dữ liệu 1000 ngày gần nhất.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
