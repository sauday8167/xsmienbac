'use client';

import { useState, useEffect } from 'react';
import ResultTable from '@/components/ResultTable';
import type { LotteryResult } from '@/types';

export default function RandomDrawClient() {
    const [isDrawing, setIsDrawing] = useState(false);
    const [result, setResult] = useState<LotteryResult | null>(null);
    const [progress, setProgress] = useState(0);

    const startDraw = () => {
        setIsDrawing(true);
        setProgress(0);
        setResult(null);

        const interval = setInterval(() => {
            setProgress(p => {
                if (p >= 100) {
                    clearInterval(interval);
                    generateRandomResult();
                    setIsDrawing(false);
                    return 100;
                }
                return p + 2;
            });
        }, 50);
    };

    const generateRandomResult = () => {
        const gen = (len: number) => Math.floor(Math.random() * Math.pow(10, len)).toString().padStart(len, '0');
        const res: LotteryResult = {
            draw_date: new Date().toISOString(),
            special_prize: gen(5),
            prize_1: gen(5),
            prize_2: [gen(5), gen(5)],
            prize_3: [gen(5), gen(5), gen(5), gen(5), gen(5), gen(5)],
            prize_4: [gen(4), gen(4), gen(4), gen(4)],
            prize_5: [gen(4), gen(4), gen(4), gen(4), gen(4), gen(4)],
            prize_6: [gen(3), gen(3), gen(3)],
            prize_7: [gen(2), gen(2), gen(2), gen(2)]
        };
        setResult(res);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-lottery-red-700 mb-2">Quay Thử XSMB</h1>
                <p className="text-gray-600 italic">Dựa trên thuật toán ngẫu nhiên để tìm con số may mắn</p>
                <div className="w-24 h-1 bg-lottery-red-600 mx-auto rounded-full mt-4"></div>
            </div>

            <div className="flex flex-col items-center gap-6 py-8">
                <button
                    onClick={startDraw}
                    disabled={isDrawing}
                    className={`btn btn-lg ${isDrawing ? 'btn-disabled' : 'bg-red-600 hover:bg-red-700 text-white'} rounded-full px-12 shadow-xl border-0 text-xl font-bold h-16 transition-all transform hover:scale-105 active:scale-95`}
                >
                    {isDrawing ? '🌀 Đang Quay Số...' : '⚡ Bắt Đầu Quay Thử'}
                </button>

                {isDrawing && (
                    <div className="w-full max-w-md bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                        <div className="bg-gradient-to-r from-red-500 to-red-600 h-full transition-all duration-300 shadow-md" style={{ width: `${progress}%` }}></div>
                    </div>
                )}
            </div>

            {result && (
                <div className="animate-in fade-in zoom-in duration-500">
                    <ResultTable result={result} />
                    <div className="mt-8 p-4 bg-yellow-50 border border-yellow-100 rounded-xl text-yellow-800 text-sm text-center">
                        ⚠️ Kết quả quay thử chỉ mang tính chất tham khảo, không có giá trị trúng thưởng thật.
                    </div>
                </div>
            )}
        </div>
    );
}
