'use client';

import { useState } from 'react';

export default function TaoDanXoSoPage() {
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

    // === Core Algorithms ===

    // Generate all numbers from 00 to 99
    const generateAll = (): string[] => {
        const nums: string[] = [];
        for (let i = 0; i <= 99; i++) {
            nums.push(i.toString().padStart(2, '0'));
        }
        return nums;
    };

    // Filter by touch (contains digit)
    const filterByTouch = (nums: string[], digits: string): string[] => {
        if (!digits) return nums;
        const digitSet = new Set(digits.split('').filter(d => /[0-9]/.test(d)));
        return nums.filter(num => {
            for (const d of digitSet) {
                if (num.includes(d)) return true;
            }
            return false;
        });
    };

    // Filter by sum (mod 10)
    const filterBySum = (nums: string[], digits: string): string[] => {
        if (!digits) return nums;
        const targetSums = new Set(digits.split('').filter(d => /[0-9]/.test(d)).map(d => parseInt(d)));
        return nums.filter(num => {
            const sum = (parseInt(num[0]) + parseInt(num[1])) % 10;
            return targetSums.has(sum);
        });
    };

    // Filter by head (first digit)
    const filterByHead = (nums: string[], digits: string): string[] => {
        if (!digits) return nums;
        const heads = new Set(digits.split('').filter(d => /[0-9]/.test(d)));
        return nums.filter(num => heads.has(num[0]));
    };

    // Filter by tail (last digit)
    const filterByTail = (nums: string[], digits: string): string[] => {
        if (!digits) return nums;
        const tails = new Set(digits.split('').filter(d => /[0-9]/.test(d)));
        return nums.filter(num => tails.has(num[1]));
    };

    // Generate "Bộ" (shadow pairs)
    const generateBo = (number: string): string[] => {
        const num = number.padStart(2, '0');
        const d1 = num[0];
        const d2 = num[1];

        // Shadow mapping: 0↔5, 1↔6, 2↔7, 3↔8, 4↔9
        const shadow = (digit: string): string => {
            const map: { [key: string]: string } = {
                '0': '5', '5': '0',
                '1': '6', '6': '1',
                '2': '7', '7': '2',
                '3': '8', '8': '3',
                '4': '9', '9': '4'
            };
            return map[digit] || digit;
        };

        const s1 = shadow(d1);
        const s2 = shadow(d2);

        const bo = new Set<string>();
        bo.add(d1 + d2);  // Original
        bo.add(d2 + d1);  // Reversed
        bo.add(d1 + s2);  // d1 + shadow(d2)
        bo.add(s2 + d1);  // shadow(d2) + d1
        bo.add(s1 + d2);  // shadow(d1) + d2
        bo.add(d2 + s1);  // d2 + shadow(d1)
        bo.add(s1 + s2);  // shadow(d1) + shadow(d2)
        bo.add(s2 + s1);  // shadow(d2) + shadow(d1)

        return Array.from(bo).sort();
    };

    // Parse number list from string
    const parseNumbers = (str: string): string[] => {
        return str.split(/[,\s]+/).filter(n => n.trim()).map(n => n.trim());
    };

    // Set operations
    const findCommon = (arr1: string[], arr2: string[]): string[] => {
        const set2 = new Set(arr2);
        return Array.from(new Set(arr1.filter(n => set2.has(n)))).sort();
    };

    const mergeSets = (arr1: string[], arr2: string[]): string[] => {
        return Array.from(new Set([...arr1, ...arr2])).sort();
    };

    const subtractSets = (arr1: string[], arr2: string[]): string[] => {
        const set2 = new Set(arr2);
        return arr1.filter(n => !set2.has(n)).sort();
    };

    // Merge with càng (prepend digits)
    const merge3D4D = (cang: string, dan: string[]): string[] => {
        const cangDigits = cang.split('').filter(d => /[0-9]/.test(d));
        const result: string[] = [];
        for (const c of cangDigits) {
            for (const num of dan) {
                result.push(c + num);
            }
        }
        return result;
    };

    // Generate combinations
    const generateCombinations = (arr: string[], k: number): string[][] => {
        if (k === 0) return [[]];
        if (arr.length === 0) return [];

        const [first, ...rest] = arr;
        const combsWithFirst = generateCombinations(rest, k - 1).map(comb => [first, ...comb]);
        const combsWithoutFirst = generateCombinations(rest, k);

        return [...combsWithFirst, ...combsWithoutFirst];
    };

    // === Event Handlers ===

    const handleGenerate2D = () => {
        let nums = generateAll();

        // Apply filters (AND logic)
        if (touchDigits) nums = filterByTouch(nums, touchDigits);
        if (sumDigits) nums = filterBySum(nums, sumDigits);
        if (headDigits) nums = filterByHead(nums, headDigits);
        if (tailDigits) nums = filterByTail(nums, tailDigits);
        if (boNumber) {
            const boNums = generateBo(boNumber);
            nums = nums.filter(n => boNums.includes(n));
        }

        setResult2D(nums);
    };

    const handleQuickAll = () => {
        setResult2D(generateAll());
    };

    const handleFindCommon = () => {
        const arr1 = parseNumbers(dan1);
        const arr2 = parseNumbers(dan2);
        setSetOpResult(findCommon(arr1, arr2));
    };

    const handleMerge = () => {
        const arr1 = parseNumbers(dan1);
        const arr2 = parseNumbers(dan2);
        setSetOpResult(mergeSets(arr1, arr2));
    };

    const handleSubtract = () => {
        const arr1 = parseNumbers(dan1);
        const arr2 = parseNumbers(dan2);
        setSetOpResult(subtractSets(arr1, arr2));
    };

    const handleMerge3D4D = () => {
        const dan = parseNumbers(dan3D);
        setResult3D4D(merge3D4D(cangDigits, dan));
    };

    const handleGenerateXien = () => {
        const nums = parseNumbers(xienNumbers);
        const combs = generateCombinations(nums, xienType);
        setXienResult(combs.map(c => c.join(' ')));
    };

    const copyToClipboard = (text: string, source: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopyNotif(`Đã sao chép ${source}`);
            setTimeout(() => setCopyNotif(''), 2000);
        });
    };

    // === UI Components ===

    const ResultBox = ({ title, data, source, joinStr = ', ' }: { title: string; data: string[]; source: string; joinStr?: string }) => (
        <div className="bg-white border border-gray-300 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg text-gray-700">{title}</h3>
                <button
                    onClick={() => copyToClipboard(data.join(joinStr), source)}
                    className="px-3 py-1 bg-green-600 text-white text-sm font-semibold rounded hover:bg-green-700 transition"
                >
                    📋 SAO CHÉP
                </button>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded p-3 min-h-[80px] max-h-[200px] overflow-y-auto">
                {data.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {data.map((num, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 border border-blue-300 rounded text-sm font-mono">
                                {num}
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400 text-center">Chưa có kết quả</p>
                )}
            </div>
            <p className="text-xs text-gray-500 mt-2">Tổng: {data.length} số</p>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <h1 className="text-3xl font-bold text-center mb-8 text-lottery-red-700">
                🎲 Công Cụ Tạo Dàn Xổ Số
            </h1>

            {copyNotif && (
                <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 animate-bounce">
                    ✅ {copyNotif}
                </div>
            )}

            {/* Section 1: Tạo Dàn 2D */}
            <section className="mb-8 bg-white border border-gray-300 rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">📊 Tạo Dàn 2D (00-99)</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1">Chạm (các chữ số):</label>
                        <input
                            type="text"
                            value={touchDigits}
                            onChange={(e) => setTouchDigits(e.target.value)}
                            placeholder="VD: 123"
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Tổng (các chữ số):</label>
                        <input
                            type="text"
                            value={sumDigits}
                            onChange={(e) => setSumDigits(e.target.value)}
                            placeholder="VD: 159"
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Đầu:</label>
                        <input
                            type="text"
                            value={headDigits}
                            onChange={(e) => setHeadDigits(e.target.value)}
                            placeholder="VD: 024"
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Đuôi:</label>
                        <input
                            type="text"
                            value={tailDigits}
                            onChange={(e) => setTailDigits(e.target.value)}
                            placeholder="VD: 789"
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold mb-1">Tạo theo Bộ (nhập 1 số):</label>
                        <input
                            type="text"
                            value={boNumber}
                            onChange={(e) => setBoNumber(e.target.value)}
                            placeholder="VD: 01 (tạo bộ 01, 10, 06, 60, 51, 15, 56, 65)"
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                    </div>
                </div>

                <div className="flex gap-2 mb-4">
                    <button
                        onClick={handleGenerate2D}
                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
                    >
                        Tạo Dàn
                    </button>
                    <button
                        onClick={handleQuickAll}
                        className="px-6 py-2 bg-gray-600 text-white font-semibold rounded hover:bg-gray-700 transition"
                    >
                        Lấy Nhanh 00-99
                    </button>
                </div>

                <ResultBox title="Kết Quả Dàn 2D" data={result2D} source="Dàn 2D" />
            </section>

            {/* Section 2: Lọc/Ghép Dàn */}
            <section className="mb-8 bg-white border border-gray-300 rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">🔀 Lọc/Ghép Dàn</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1">Dàn 1:</label>
                        <textarea
                            value={dan1}
                            onChange={(e) => setDan1(e.target.value)}
                            placeholder="01, 02, 03, 10, 20"
                            className="w-full border border-gray-300 rounded px-3 py-2 h-24"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Dàn 2:</label>
                        <textarea
                            value={dan2}
                            onChange={(e) => setDan2(e.target.value)}
                            placeholder="02, 03, 05, 20, 30"
                            className="w-full border border-gray-300 rounded px-3 py-2 h-24"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    <button
                        onClick={handleFindCommon}
                        className="px-4 py-2 bg-purple-600 text-white font-semibold rounded hover:bg-purple-700 transition"
                    >
                        Tìm Số Trùng
                    </button>
                    <button
                        onClick={handleMerge}
                        className="px-4 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition"
                    >
                        Ghép Dàn
                    </button>
                    <button
                        onClick={handleSubtract}
                        className="px-4 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700 transition"
                    >
                        Loại Bỏ (Dàn 1 - Dàn 2)
                    </button>
                </div>

                <ResultBox title="Kết Quả Lọc/Ghép" data={setOpResult} source="Lọc/Ghép" />
            </section>

            {/* Section 3: Ghép 3D/4D */}
            <section className="mb-8 bg-white border border-gray-300 rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">🎯 Ghép 3D/4D</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1">Càng (các chữ số):</label>
                        <input
                            type="text"
                            value={cangDigits}
                            onChange={(e) => setCangDigits(e.target.value)}
                            placeholder="VD: 123"
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Dàn 2D/3D:</label>
                        <textarea
                            value={dan3D}
                            onChange={(e) => setDan3D(e.target.value)}
                            placeholder="01, 02, 10, 20"
                            className="w-full border border-gray-300 rounded px-3 py-2 h-20"
                        />
                    </div>
                </div>

                <button
                    onClick={handleMerge3D4D}
                    className="px-6 py-2 bg-orange-600 text-white font-semibold rounded hover:bg-orange-700 transition mb-4"
                >
                    Ghép Càng
                </button>

                <ResultBox title="Kết Quả 3D/4D" data={result3D4D} source="3D/4D" />
            </section>

            {/* Section 4: Ghép Lô Xiên */}
            <section className="bg-white border border-gray-300 rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">🎰 Ghép Xiên Tự Động</h2>

                <div className="mb-4">
                    <label className="block text-sm font-semibold mb-1">Danh sách số (cách nhau bằng dấu phẩy hoặc khoảng trắng):</label>
                    <textarea
                        value={xienNumbers}
                        onChange={(e) => setXienNumbers(e.target.value)}
                        placeholder="01, 05, 10, 20, 25"
                        className="w-full border border-gray-300 rounded px-3 py-2 h-24"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-semibold mb-1">Loại xiên:</label>
                    <div className="flex gap-4">
                        {[2, 3, 4].map(n => (
                            <label key={n} className="flex items-center">
                                <input
                                    type="radio"
                                    name="xien"
                                    value={n}
                                    checked={xienType === n}
                                    onChange={() => setXienType(n)}
                                    className="mr-2"
                                />
                                Xiên {n}
                            </label>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleGenerateXien}
                    className="px-6 py-2 bg-pink-600 text-white font-semibold rounded hover:bg-pink-700 transition mb-4"
                >
                    Tạo Xiên
                </button>

                <ResultBox title={`Kết Quả Xiên ${xienType}`} data={xienResult} source={`Xiên ${xienType}`} joinStr="; " />
            </section>
        </div>
    );
}
