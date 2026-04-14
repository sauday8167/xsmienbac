import React from 'react';
import { SpinningNumber } from '../../../components/SpinningNumber';
import '../../../styles/lottery-animation.css';

interface TrialBoardProps {
    results: string[]; // Flat array of 27 numbers
    statusArray: ('waiting' | 'rolling' | 'done')[];
    winningNumbers?: string[]; // Numbers predicted by AI
}

// Helper for Section Headers
const PrizeHeader = ({ title }: { title: string }) => (
    <div className="flex justify-center mb-2 mt-4 relative">
        <div className="bg-red-600 text-white text-xs md:text-sm font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-sm z-10">
            {title}
        </div>
        <div className="absolute top-1/2 left-0 w-full h-px bg-red-100 -z-0"></div>
    </div>
);

export default function TrialBoard({ results, statusArray, winningNumbers = [] }: TrialBoardProps) {
    const getVal = (idx: number) => results[idx] || '';

    // Render helper for single SpinningNumber
    const renderNumber = (idx: number, digits: number, className: string = "", colorMode: 'base' | 'red' = 'base') => {
        const value = getVal(idx);
        const loto = value.slice(-2);
        const isWinning = winningNumbers.includes(loto);

        return (
            <SpinningNumber
                key={idx}
                finalValue={value}
                isRevealed={statusArray[idx] === 'done'} // Keeps compatibility if internal use
                forceStatus={statusArray[idx]} // This overrides internal logic
                digitCount={digits}
                colorMode={colorMode}
                variant="text"
                className={className}
                isWinning={isWinning}
            />
        );
    };

    return (
        <div className="bg-white max-w-3xl mx-auto font-sans mb-8">
            <div className="border border-red-700 rounded-t-lg overflow-hidden shadow-sm">
                {/* Header */}
                <div className="bg-[#b91c1c] text-white text-center py-3">
                    <h3 className="text-xl md:text-2xl font-bold uppercase">
                        Bảng Kết Quả Quay Thử
                    </h3>
                </div>

                {/* Table */}
                <table className="w-full text-center border-collapse border-b border-gray-300">
                    <tbody>
                        {/* Special Prize */}
                        <tr className="border-b border-gray-200">
                            <td className="w-24 md:w-32 py-3 md:py-4 font-bold text-gray-700 bg-gray-50 border-r border-gray-200 text-sm md:text-base">
                                Đặc biệt
                            </td>
                            <td className="py-3 md:py-4">
                                <div className="flex justify-center">
                                    {renderNumber(0, 5, "text-3xl md:text-4xl font-bold text-red-600 tracking-wider", 'red')}
                                </div>
                            </td>
                        </tr>

                        {/* Prize 1 */}
                        <tr className="border-b border-gray-200">
                            <td className="py-3 font-bold text-gray-700 bg-gray-50 border-r border-gray-200 text-sm md:text-base">
                                Giải nhất
                            </td>
                            <td className="py-3">
                                <div className="flex justify-center">
                                    {renderNumber(1, 5, "text-xl md:text-2xl font-bold text-gray-900 tracking-wide")}
                                </div>
                            </td>
                        </tr>

                        {/* Prize 2 */}
                        <tr className="border-b border-gray-200">
                            <td className="py-3 font-bold text-gray-700 bg-gray-50 border-r border-gray-200 text-sm md:text-base">
                                Giải nhì
                            </td>
                            <td className="py-3">
                                <div className="flex justify-center gap-8 md:gap-16">
                                    {[2, 3].map(idx => renderNumber(idx, 5, "text-xl md:text-2xl font-bold text-gray-900 tracking-wide"))}
                                </div>
                            </td>
                        </tr>

                        {/* Prize 3 */}
                        <tr className="border-b border-gray-200">
                            <td className="py-3 font-bold text-gray-700 bg-gray-50 border-r border-gray-200 text-sm md:text-base">
                                Giải ba
                            </td>
                            <td className="py-3">
                                <div className="grid grid-cols-3 gap-y-2 gap-x-4 max-w-lg mx-auto justify-items-center">
                                    {[4, 5, 6, 7, 8, 9].map(idx => renderNumber(idx, 5, "text-lg md:text-xl font-bold text-gray-900 tracking-wide"))}
                                </div>
                            </td>
                        </tr>

                        {/* Prize 4 */}
                        <tr className="border-b border-gray-200">
                            <td className="py-3 font-bold text-gray-700 bg-gray-50 border-r border-gray-200 text-sm md:text-base">
                                Giải tư
                            </td>
                            <td className="py-3">
                                <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                                    {[10, 11, 12, 13].map(idx => renderNumber(idx, 4, "text-lg md:text-xl font-bold text-gray-900 tracking-wide"))}
                                </div>
                            </td>
                        </tr>

                        {/* Prize 5 */}
                        <tr className="border-b border-gray-200">
                            <td className="py-3 font-bold text-gray-700 bg-gray-50 border-r border-gray-200 text-sm md:text-base">
                                Giải năm
                            </td>
                            <td className="py-3">
                                <div className="grid grid-cols-3 gap-y-2 gap-x-4 max-w-lg mx-auto justify-items-center">
                                    {[14, 15, 16, 17, 18, 19].map(idx => renderNumber(idx, 4, "text-lg md:text-xl font-bold text-gray-900 tracking-wide"))}
                                </div>
                            </td>
                        </tr>

                        {/* Prize 6 */}
                        <tr className="border-b border-gray-200">
                            <td className="py-3 font-bold text-gray-700 bg-gray-50 border-r border-gray-200 text-sm md:text-base">
                                Giải sáu
                            </td>
                            <td className="py-3">
                                <div className="flex justify-center gap-8 md:gap-16">
                                    {[20, 21, 22].map(idx => renderNumber(idx, 3, "text-lg md:text-xl font-bold text-gray-900 tracking-wide"))}
                                </div>
                            </td>
                        </tr>

                        {/* Prize 7 - Red Text */}
                        <tr>
                            <td className="py-3 font-bold text-gray-700 bg-gray-50 border-r border-gray-200 text-sm md:text-base">
                                Giải bảy
                            </td>
                            <td className="py-3">
                                <div className="flex justify-center gap-8 md:gap-16">
                                    {[23, 24, 25, 26].map(idx => renderNumber(idx, 2, "text-xl md:text-2xl font-bold text-red-600 tracking-wide"))}
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
