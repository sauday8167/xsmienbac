'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, RefreshCw, Info } from 'lucide-react';

interface Props {
    initialNum1?: string;
    initialNum2?: string;
}

export default function PascalCalculator({ initialNum1, initialNum2 }: Props) {
    const [num1, setNum1] = useState(initialNum1 || '02855');
    const [num2, setNum2] = useState(initialNum2 || '71740');
    const [triangle, setTriangle] = useState<string[][]>([]);
    const [result, setResult] = useState('');

    const calculatePascal = (s1: string, s2: string) => {
        let current = (s1 + s2).split('').map(Number);
        const rows: string[][] = [current.map(String)];
        
        while (current.length > 2) {
            const next: number[] = [];
            for (let i = 0; i < current.length - 1; i++) {
                next.push((current[i] + current[i + 1]) % 10);
            }
            current = next;
            rows.push(current.map(String));
        }
        
        setTriangle(rows);
        setResult(current.join(''));
    };

    useEffect(() => {
        if (num1 && num2) {
            calculatePascal(num1, num2);
        }
    }, [num1, num2]);

    const handleRandom = () => {
        const r1 = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
        const r2 = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
        setNum1(r1);
        setNum2(r2);
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-lottery-red-700 to-lottery-red-600 p-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Calculator className="w-6 h-6" />
                    <h3 className="font-bold text-lg uppercase tracking-tight">Công cụ Tính Cầu Pascal</h3>
                </div>
                <button 
                    onClick={handleRandom}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    title="Trộn số ngẫu nhiên"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1 italic">
                            Số giải Đặc biệt (5 hoặc 6 số)
                        </label>
                        <input 
                            type="text" 
                            value={num1}
                            onChange={(e) => setNum1(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-lottery-red-500 focus:border-transparent transition-all font-mono text-xl text-center tracking-[0.5em]"
                            placeholder="VD: 02855"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1 italic">
                            Số giải Nhất (5 số)
                        </label>
                        <input 
                            type="text" 
                            value={num2}
                            onChange={(e) => setNum2(e.target.value.replace(/[^0-9]/g, '').slice(0, 5))}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-lottery-red-500 focus:border-transparent transition-all font-mono text-xl text-center tracking-[0.5em]"
                            placeholder="VD: 71740"
                        />
                    </div>
                </div>

                <div className="relative py-8 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center overflow-x-auto min-h-[300px]">
                    <div className="mb-4 text-xs text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <Info className="w-3 h-3" /> Sơ đồ tam giác cộng dồn
                    </div>
                    
                    <div className="flex flex-col items-center space-y-1">
                        {triangle.map((row, rowIndex) => (
                            <div key={rowIndex} className="flex justify-center gap-1 md:gap-2">
                                {row.map((digit, digitIndex) => {
                                    const isLast = rowIndex === triangle.length - 1;
                                    return (
                                        <div 
                                            key={digitIndex}
                                            className={`
                                                w-7 h-7 md:w-9 md:h-9 flex items-center justify-center rounded-lg text-sm md:text-base font-bold transition-all duration-500
                                                ${isLast 
                                                    ? 'bg-lottery-red-600 text-white shadow-lg scale-110 animate-bounce mt-4' 
                                                    : 'bg-white border border-slate-200 text-slate-700 shadow-sm'
                                                }
                                            `}
                                        >
                                            {digit}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                    <div className="text-amber-800 text-sm font-medium mb-1">Cặp song thủ lô Pascal hôm nay:</div>
                    <div className="text-3xl font-black text-lottery-red-700 tracking-widest">
                        {result} - {result.split('').reverse().join('')}
                    </div>
                </div>
                
                <div className="text-xs text-slate-500 italic leading-relaxed">
                    * Cách tính: Ghép giải Đặc biệt và giải Nhất thành một dãy số. Cộng 2 số liền kề, lấy hàng đơn vị (tổng % 10) cho đến khi còn lại 2 chữ số cuối cùng.
                </div>
            </div>
        </div>
    );
}
