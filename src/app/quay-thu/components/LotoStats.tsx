import React, { useMemo } from 'react';

interface DrawnNumber {
    id: number;
    value: string;
    isAnimating: boolean;
}

interface LotoStatsProps {
    numbers: DrawnNumber[];
}

export default function LotoStats({ numbers }: LotoStatsProps) {
    const stats = useMemo(() => {
        const heads: { [key: number]: string[] } = {};
        const tails: { [key: number]: string[] } = {};

        // Initialize 0-9
        for (let i = 0; i <= 9; i++) {
            heads[i] = [];
            tails[i] = [];
        }

        numbers.forEach((num) => {
            if (num.isAnimating || !num.value) return;

            // Get the last 2 digits primarily for Loto
            // If length < 2 (e.g. single digit prize?), handle gracefully
            const val = num.value;
            if (val.length >= 2) {
                const head = parseInt(val[val.length - 2]);
                const tail = parseInt(val[val.length - 1]);
                const twoDigits = val.slice(-2);

                if (!isNaN(head)) heads[head].push(tail.toString());
                if (!isNaN(tail)) tails[tail].push(head.toString());
            } else if (val.length === 1) {
                // Should not happen for standard XSMB but just in case
                const n = parseInt(val);
                if (!isNaN(n)) {
                    heads[0].push(n.toString());
                    tails[n].push('0');
                }
            }
        });

        // Sort the arrays
        for (let i = 0; i <= 9; i++) {
            heads[i].sort();
            tails[i].sort();
        }

        return { heads, tails };
    }, [numbers]);

    const renderRow = (digit: number) => {
        const headValues = stats.heads[digit];

        return (
            <tr key={digit} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-2 border-r border-gray-200 text-center font-bold text-red-600 w-12 text-lg">
                    {digit}
                </td>
                <td className="p-2 text-left text-gray-800 font-medium tracking-wider">
                    {headValues.length > 0 ? headValues.join(', ') : <span className="text-gray-300">-</span>}
                </td>
            </tr>
        );
    };

    return (
        <div className="bg-white border border-red-700 rounded-t-lg overflow-hidden shadow-sm h-full font-sans">
            <div className="bg-[#b91c1c] text-white text-center py-3">
                <h3 className="text-xl font-bold uppercase">
                    Thống Kê Đầu
                </h3>
            </div>
            <div className="overflow-hidden">
                <table className="w-full text-sm border-collapse">
                    <thead className="bg-gray-100 text-gray-700 font-bold uppercase">
                        <tr>
                            <th className="p-3 border-r border-gray-300 w-16 text-center">Đầu</th>
                            <th className="p-3 text-left">Đuôi (Lô tô)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(renderRow)}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
