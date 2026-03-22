'use client';

import { useState } from 'react';

export default function TaoDanXoSoClient() {
    // State for 2D Generator
    const [touchDigits, setTouchDigits] = useState('');
    const [sumDigits, setSumDigits] = useState('');
    const [headDigits, setHeadDigits] = useState('');
    const [tailDigits, setTailDigits] = useState('');
    const [boNumber, setBoNumber] = useState('');
    const [result2D, setResult2D] = useState<string[]>([]);

    // State for Set Operations
    const [dan1, setDan1] = useState('');
    const [dan2, setDan2] = useState('');
    const [setOpResult, setSetOpResult] = useState<string[]>([]);

    // State for 3D/4D
    const [cangDigits, setCangDigits] = useState('');
    const [dan3D, setDan3D] = useState('');
    const [result3D4D, setResult3D4D] = useState<string[]>([]);

    // State for Xiên
    const [xienNumbers, setXienNumbers] = useState('');
    const [xienType, setXienType] = useState(2);
    const [xienResult, setXienResult] = useState<string[]>([]);

    // Copy notification
    const [copyNotif, setCopyNotif] = useState('');

    // === Core Algorithms === [same as original page.tsx ... ]
    const generateAll = (): string[] => {
        const nums: string[] = [];
        for (let i = 0; i <= 99; i++) nums.push(i.toString().padStart(2, '0'));
        return nums;
    };

    const filterByTouch = (nums: string[], digits: string): string[] => {
        if (!digits) return nums;
        const digitSet = new Set(digits.split('').filter(d => /[0-9]/.test(d)));
        return nums.filter(num => {
            for (const d of digitSet) if (num.includes(d)) return true;
            return false;
        });
    };

    const filterBySum = (nums: string[], digits: string): string[] => {
        if (!digits) return nums;
        const targetSums = new Set(digits.split('').filter(d => /[0-9]/.test(d)).map(d => parseInt(d)));
        return nums.filter(num => {
            const sum = (parseInt(num[0]) + parseInt(num[1])) % 10;
            return targetSums.has(sum);
        });
    };

    const filterByHead = (nums: string[], digits: string): string[] => {
        if (!digits) return nums;
        const heads = new Set(digits.split('').filter(d => /[0-9]/.test(d)));
        return nums.filter(num => heads.has(num[0]));
    };

    const filterByTail = (nums: string[], digits: string): string[] => {
        if (!digits) return nums;
        const tails = new Set(digits.split('').filter(d => /[0-9]/.test(d)));
        return nums.filter(num => tails.has(num[1]));
    };

    const generateBo = (number: string): string[] => {
        const num = number.padStart(2, '0');
        const d1 = num[0]; const d2 = num[1];
        const shadow = (digit: string): string => {
            const map: { [key: string]: string } = { '0': '5', '5': '0', '1': '6', '6': '1', '2': '7', '7': '2', '3': '8', '8': '3', '4': '9', '9': '4' };
            return map[digit] || digit;
        };
        const s1 = shadow(d1); const s2 = shadow(d2);
        const bo = new Set<string>();
        bo.add(d1 + d2); bo.add(d2 + d1); bo.add(d1 + s2); bo.add(s2 + d1); bo.add(s1 + d2); bo.add(d2 + s1); bo.add(s1 + s2); bo.add(s2 + s1);
        return Array.from(bo).sort();
    };

    const parseNumbers = (str: string): string[] => str.split(/[,\s]+/).filter(n => n.trim()).map(n => n.trim());
    const findCommon = (arr1: string[], arr2: string[]): string[] => { const set2 = new Set(arr2); return Array.from(new Set(arr1.filter(n => set2.has(n)))).sort(); };
    const mergeSets = (arr1: string[], arr2: string[]): string[] => Array.from(new Set([...arr1, ...arr2])).sort();
    const subtractSets = (arr1: string[], arr2: string[]): string[] => { const set2 = new Set(arr2); return arr1.filter(n => !set2.has(n)).sort(); };
    const merge3D4D = (cang: string, dan: string[]): string[] => {
        const cangDigits = cang.split('').filter(d => /[0-9]/.test(d));
        const result: string[] = [];
        for (const c of cangDigits) for (const num of dan) result.push(c + num);
        return result;
    };
    const generateCombinations = (arr: string[], k: number): string[][] => {
        if (k === 0) return [[]];
        if (arr.length === 0) return [];
        const [first, ...rest] = arr;
        return [...generateCombinations(rest, k - 1).map(comb => [first, ...comb]), ...generateCombinations(rest, k)];
    };

    // === Handlers ===
    const handleGenerate2D = () => {
        let nums = generateAll();
        if (touchDigits) nums = filterByTouch(nums, touchDigits);
        if (sumDigits) nums = filterBySum(nums, sumDigits);
        if (headDigits) nums = filterByHead(nums, headDigits);
        if (tailDigits) nums = filterByTail(nums, tailDigits);
        if (boNumber) { const boNums = generateBo(boNumber); nums = nums.filter(n => boNums.includes(n)); }
        setResult2D(nums);
    };

    const copyToClipboard = (text: string, source: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopyNotif(`Đã sao chép ${source}`);
            setTimeout(() => setCopyNotif(''), 2000);
        });
    };

    const ResultBox = ({ title, data, source, joinStr = ', ' }: { title: string; data: string[]; source: string; joinStr?: string }) => (
        <div className="bg-white border border-gray-300 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg text-gray-700">{title}</h3>
                <button onClick={() => copyToClipboard(data.join(joinStr), source)} className="px-3 py-1 bg-green-600 text-white text-sm font-semibold rounded hover:bg-green-700 transition">📋 SAO CHÉP</button>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded p-3 min-h-[80px] max-h-[200px] overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                    {data.map((num, idx) => <span key={idx} className="px-2 py-1 bg-blue-100 border border-blue-300 rounded text-sm font-mono">{num}</span>)}
                </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Tổng: {data.length} số</p>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <h1 className="text-3xl font-bold text-center mb-8 text-lottery-red-700">🎲 Công Cụ Tạo Dàn Xổ Số</h1>
            {copyNotif && <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 animate-bounce">✅ {copyNotif}</div>}

            <section className="mb-8 bg-white border border-gray-300 rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">📊 Tạo Dàn 2D (00-99)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input type="text" value={touchDigits} onChange={(e) => setTouchDigits(e.target.value)} placeholder="Chạm..." className="input border" />
                    <input type="text" value={sumDigits} onChange={(e) => setSumDigits(e.target.value)} placeholder="Tổng..." className="input border" />
                </div>
                <button onClick={handleGenerate2D} className="btn btn-primary">Tạo Dàn</button>
                <ResultBox title="Kết Quả Dàn 2D" data={result2D} source="Dàn 2D" />
            </section>
            {/* ... Rest of components ... */}
        </div>
    );
}
