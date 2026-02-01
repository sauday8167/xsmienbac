'use client';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { SpinningNumber } from './SpinningNumber';
import LotoHeadTailTable from './LotoHeadTailTable';
import '../styles/lottery-animation.css';

interface LotteryResult {
    draw_date: string;
    special_prize: string | null;
    prize_1: string | null;
    prize_2: string[] | null;
    prize_3: string[] | null;
    prize_4: string[] | null;
    prize_5: string[] | null;
    prize_6: string[] | null;
    prize_7: string[] | null;
}

interface LiveResultTableProps {
    result: LotteryResult;
    revealedPrizes: Set<string>;
    isLive?: boolean;
    phase?: string;
}

const padArray = (arr: string[] | null, length: number) => {
    const newArr = arr ? [...arr] : [];
    while (newArr.length < length) {
        newArr.push('');
    }
    return newArr;
};

// Define strict draw order: Prize 1 -> ... -> Prize 7 -> Special Prize
const PRIZE_ORDER: (keyof LotteryResult)[] = [
    'prize_1',
    'prize_2',
    'prize_3',
    'prize_4',
    'prize_5',
    'prize_6',
    'prize_7',
    'special_prize'
];

export default function LiveResultTable({
    result,
    revealedPrizes,
    isLive = false,
    phase = 'IDLE'
}: LiveResultTableProps) {
    if (!result) return null;

    // Helper to determine status based on Waterfall logic
    const getForceStatus = (key: keyof LotteryResult, index: number = 0): 'waiting' | 'rolling' | 'done' | 'drum' | undefined => {
        if (!isLive) return undefined;

        let foundFrontier = false;
        let isCurrentSlot = false;
        let isPastFrontier = false;

        for (const k of PRIZE_ORDER) {
            const val = result[k];
            // Determine expected length for this prize key
            const length = k === 'special_prize' || k === 'prize_1' ? 1
                : k === 'prize_2' || k === 'prize_7' ? (k === 'prize_7' ? 4 : 2)
                    : k === 'prize_3' || k === 'prize_5' ? 6
                        : k === 'prize_4' ? 4 // Prize 4 has 4 slots
                            : 3; // Prize 6 has 3 slots

            for (let i = 0; i < length; i++) {
                const hasValue = Array.isArray(val) ? !!val[i] : (i === 0 ? !!val : false);

                if (!foundFrontier) {
                    if (!hasValue) {
                        foundFrontier = true;
                        if (k === key && i === index) {
                            isCurrentSlot = true;
                        }
                    }
                } else {
                    if (k === key && i === index) {
                        isPastFrontier = true;
                    }
                }
            }
        }

        if (isCurrentSlot) return 'drum';
        if (isPastFrontier) return 'waiting';
        return undefined; // Already filled
    };

    const renderNum = (key: keyof LotteryResult, index: number, digitCount: number, className: string, isRed = false) => {
        const valRaw = result[key];
        const val = Array.isArray(valRaw) ? valRaw[index] : (valRaw as string);
        const safeVal = val || '';

        return (
            <SpinningNumber
                key={`${key}-${index}`}
                finalValue={safeVal}
                isRevealed={!!safeVal}
                forceStatus={getForceStatus(key, index)}
                digitCount={digitCount}
                variant="text"
                colorMode={isRed ? 'red' : 'base'}
                className={className}
            />
        );
    };

    return (
        <div className="max-w-4xl mx-auto mb-8 font-sans">
            {/* Live Badge */}
            {isLive && (
                <div className="mb-2 text-center animate-pulse">
                    <span className="inline-block bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        🔴 LIVE - Đang quay thưởng
                    </span>
                </div>
            )}

            <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-300">
                {/* Header */}
                <div className="bg-[#b91c1c] text-white text-center py-4 border-b border-gray-300">
                    <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wide">
                        Xổ Số Miền Bắc
                    </h2>
                    <p className="text-red-100 text-sm mt-1">
                        {format(parseISO(result.draw_date), 'EEEE, dd/MM/yyyy', { locale: vi })}
                    </p>
                </div>

                {/* Main Result Table */}
                <table className="w-full text-center border-collapse">
                    <tbody>
                        {/* Special Prize */}
                        <tr className="bg-red-50/30 border-b border-gray-200">
                            <td className="w-16 md:w-32 py-2 md:py-4 font-bold text-gray-700 bg-gray-50 border-r border-gray-200 text-sm md:text-base">
                                <span className="md:hidden">ĐB</span>
                                <span className="hidden md:inline">Đặc biệt</span>
                            </td>
                            <td className="py-2 md:py-4">
                                <div className="flex justify-center">
                                    {renderNum('special_prize', 0, 5, "text-3xl md:text-4xl font-bold text-red-600 tracking-wider", true)}
                                </div>
                            </td>
                        </tr>

                        {/* Prize 1 */}
                        <tr className="border-b border-gray-200">
                            <td className="py-2 md:py-3 font-bold text-gray-700 bg-gray-50 border-r border-gray-200 text-sm md:text-base">
                                <span className="md:hidden">G.1</span>
                                <span className="hidden md:inline">Giải nhất</span>
                            </td>
                            <td className="py-2 md:py-3">
                                <div className="flex justify-center">
                                    {renderNum('prize_1', 0, 5, "text-xl md:text-2xl font-bold text-gray-900 tracking-wide")}
                                </div>
                            </td>
                        </tr>

                        {/* Prize 2 */}
                        <tr className="bg-red-50/30 border-b border-gray-200">
                            <td className="py-2 md:py-3 font-bold text-gray-700 bg-gray-50 border-r border-gray-200 text-sm md:text-base">
                                <span className="md:hidden">G.2</span>
                                <span className="hidden md:inline">Giải nhì</span>
                            </td>
                            <td className="py-2 md:py-3">
                                <div className="flex flex-wrap justify-around md:justify-center md:gap-16">
                                    {padArray(result.prize_2, 2).map((_, i) => renderNum('prize_2', i, 5, "text-xl md:text-2xl font-bold text-gray-900 tracking-wide"))}
                                </div>
                            </td>
                        </tr>

                        {/* Prize 3 */}
                        <tr className="border-b border-gray-200">
                            <td className="py-2 md:py-3 font-bold text-gray-700 bg-gray-50 border-r border-gray-200 text-sm md:text-base">
                                <span className="md:hidden">G.3</span>
                                <span className="hidden md:inline">Giải ba</span>
                            </td>
                            <td className="py-2 md:py-3">
                                <div className="grid grid-cols-3 gap-y-1 gap-x-1 md:gap-y-2 md:gap-x-12 max-w-2xl mx-auto items-center justify-items-center">
                                    {padArray(result.prize_3, 6).map((_, i) => renderNum('prize_3', i, 5, "text-lg md:text-xl font-bold text-gray-900 tracking-wide"))}
                                </div>
                            </td>
                        </tr>

                        {/* Prize 4 */}
                        <tr className="bg-red-50/30 border-b border-gray-200">
                            <td className="py-2 md:py-3 font-bold text-gray-700 bg-gray-50 border-r border-gray-200 text-sm md:text-base">
                                <span className="md:hidden">G.4</span>
                                <span className="hidden md:inline">Giải tư</span>
                            </td>
                            <td className="py-2 md:py-3">
                                <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                                    {padArray(result.prize_4, 4).map((_, i) => renderNum('prize_4', i, 4, "text-lg md:text-xl font-bold text-gray-900 tracking-wide"))}
                                </div>
                            </td>
                        </tr>

                        {/* Prize 5 */}
                        <tr className="border-b border-gray-200">
                            <td className="py-2 md:py-3 font-bold text-gray-700 bg-gray-50 border-r border-gray-200 text-sm md:text-base">
                                <span className="md:hidden">G.5</span>
                                <span className="hidden md:inline">Giải năm</span>
                            </td>
                            <td className="py-2 md:py-3">
                                <div className="grid grid-cols-3 gap-y-1 gap-x-2 md:gap-y-2 md:gap-x-16 max-w-lg mx-auto justify-items-center">
                                    {padArray(result.prize_5, 6).map((_, i) => renderNum('prize_5', i, 4, "text-lg md:text-xl font-bold text-gray-900 tracking-wide"))}
                                </div>
                            </td>
                        </tr>

                        {/* Prize 6 */}
                        <tr className="bg-red-50/30 border-b border-gray-200">
                            <td className="py-2 md:py-3 font-bold text-gray-700 bg-gray-50 border-r border-gray-200 text-sm md:text-base">
                                <span className="md:hidden">G.6</span>
                                <span className="hidden md:inline">Giải sáu</span>
                            </td>
                            <td className="py-2 md:py-3">
                                <div className="flex justify-around md:justify-center md:gap-24">
                                    {padArray(result.prize_6, 3).map((_, i) => renderNum('prize_6', i, 3, "text-lg md:text-xl font-bold text-gray-900 tracking-wide"))}
                                </div>
                            </td>
                        </tr>

                        {/* Prize 7 */}
                        <tr>
                            <td className="py-2 md:py-3 font-bold text-gray-700 bg-gray-50 border-r border-gray-200 text-sm md:text-base">
                                <span className="md:hidden">G.7</span>
                                <span className="hidden md:inline">Giải bảy</span>
                            </td>
                            <td className="py-2 md:py-3">
                                <div className="flex justify-around md:justify-center md:gap-24">
                                    {padArray(result.prize_7, 4).map((_, i) => renderNum('prize_7', i, 2, "text-xl md:text-2xl font-bold text-red-600 tracking-wide", true))}
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Head/Tail Analysis */}
            <div className="mt-6">
                <LotoHeadTailTable result={result as any} />
            </div>
        </div>
    );
}
