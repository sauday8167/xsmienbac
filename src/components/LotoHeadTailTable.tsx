import React from 'react';

interface LotteryResult {
    special_prize: string | null;
    prize_1: string | null;
    prize_2: string[] | null;
    prize_3: string[] | null;
    prize_4: string[] | null;
    prize_5: string[] | null;
    prize_6: string[] | null;
    prize_7: string[] | null;
}

interface LotoHeadTailTableProps {
    result: LotteryResult;
}

export default function LotoHeadTailTable({ result }: LotoHeadTailTableProps) {
    // 1. Extract all numbers (keeping duplicates)
    const allLotos: string[] = [];

    const add = (val: string | null | undefined) => {
        if (!val) return;
        const str = String(val).trim();
        if (str.length >= 2) {
            allLotos.push(str.slice(-2));
        }
    };

    add(result.special_prize);
    add(result.prize_1);
    result.prize_2?.forEach(add);
    result.prize_3?.forEach(add);
    result.prize_4?.forEach(add);
    result.prize_5?.forEach(add);
    result.prize_6?.forEach(add);
    result.prize_7?.forEach(add);

    // 2. Buckets
    const heads: string[][] = Array.from({ length: 10 }, () => []);
    const tails: string[][] = Array.from({ length: 10 }, () => []);

    allLotos.forEach(loto => {
        const head = parseInt(loto[0]);
        const tail = parseInt(loto[1]);

        if (!isNaN(head)) heads[head].push(loto);
        if (!isNaN(tail)) tails[tail].push(loto);
    });

    // Sort buckets
    heads.forEach(bucket => bucket.sort());
    tails.forEach(bucket => bucket.sort());

    // Find max length for highlighting
    const maxHeadLen = Math.max(...heads.map(h => h.length));
    const maxTailLen = Math.max(...tails.map(t => t.length));

    const renderTable = (title: string, data: string[][], type: 'head' | 'tail', maxLen: number) => {
        return (
            <div className="w-full bg-white border border-red-700 rounded-t-lg overflow-hidden shadow-sm font-sans">
                <div className="bg-[#b91c1c] text-white text-center py-2 font-bold uppercase">
                    Thống kê {title}
                </div>
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-gray-100 text-gray-700">
                            <th className="px-3 py-2 text-center w-14 font-bold border-r border-b border-gray-300">
                                {title}
                            </th>
                            <th className="px-3 py-2 text-left font-bold border-b border-gray-300">
                                Lô tô
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((lotos, digit) => {
                            const isHighlight = lotos.length > 0 && lotos.length === maxLen;
                            const isEmpty = lotos.length === 0;

                            return (
                                <tr
                                    key={digit}
                                    className={`${isHighlight ? 'bg-orange-50' : 'bg-white'}`}
                                >
                                    <td className={`
                                        px-3 py-2 font-bold text-center border-r border-b border-gray-300
                                        ${isHighlight ? 'text-red-600' : 'text-gray-600'}
                                    `}>
                                        {digit}
                                    </td>
                                    <td className="px-3 py-2 border-b border-gray-300">
                                        {lotos.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {lotos.map((loto, idx) => (
                                                    <span
                                                        key={`${digit}-${idx}`}
                                                        className={`
                                                            font-bold
                                                            ${isHighlight ? 'text-gray-900' : 'text-gray-800'}
                                                        `}
                                                    >
                                                        {loto}{idx < lotos.length - 1 ? ';' : <span className="text-gray-400 font-normal ml-0.5">;</span>}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-transparent">.</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderTable('Đầu', heads, 'head', maxHeadLen)}
            <div className="hidden md:block">
                {renderTable('Đuôi', tails, 'tail', maxTailLen)}
            </div>
        </div>
    );
}
