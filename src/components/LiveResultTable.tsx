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

// Define strict draw order
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
    const getForceStatus = (key: keyof LotteryResult, index: number = 0): 'waiting' | 'rolling' | 'done' | undefined => {
        if (!isLive) return undefined; // Default behavior if not live

        // Find the "Frontier" (First empty slot in the entire sequence)
        let foundFrontier = false;
        let isCurrentSlot = false;
        let isPastFrontier = false;

        // Traverse the entire structure to find where we are
        for (const k of PRIZE_ORDER) {
            const val = result[k];
            const length = k === 'special_prize' || k === 'prize_1' ? 1
                : k === 'prize_2' || k === 'prize_7' ? (k === 'prize_7' ? 4 : 2) // Prize 7 has 4 slots usually? Wait, let's allow dynamic check or standard
                    : k === 'prize_3' || k === 'prize_5' ? 6
                        : k === 'prize_4' ? 4
                            : 3; // Prize 6

            // We only care about iterating enough items. padArray handles the visual count, 
            // but here we just need to know if *this* specific slot (k, index) is the frontier.

            // Simple loop for standard counts
            const count = length;

            for (let i = 0; i < count; i++) {
                // Check if this slot has a value in the result object
                const hasValue = Array.isArray(val) ? !!val[i] : (i === 0 ? !!val : false);

                if (!foundFrontier) {
                    if (!hasValue) {
                        foundFrontier = true;
                        // This is the first empty slot -> This is the Rolling one
                        if (k === key && i === index) {
                            isCurrentSlot = true;
                        }
                    }
                } else {
                    // We already found the frontier, so this slot is "Waiting"
                    if (k === key && i === index) {
                        isPastFrontier = true;
                    }
                }
            }
        }

        if (isCurrentSlot) return 'rolling';
        if (isPastFrontier) return 'waiting';

        // If we are here, it means we are BEFORE the frontier (so we have a value), 
        // OR we are the frontier itself (handled above), OR we are somehow lost.
        // Actually, if we have a value, SpinningNumber handles it as 'done' automatically.
        // So strict return 'rolling' or 'waiting' is enough.
        return undefined;
    };

    // Render helper
    const renderNum = (key: keyof LotteryResult, index: number, digitCount: number, className: string, isRed = false) => {
        const valRaw = result[key];
        const val = Array.isArray(valRaw) ? valRaw[index] : (valRaw as string);

        // Pad strictly? 
        // The display maps use padArray, so here we assume we are inside that map loop or singular call.
        // We pass the SAFE value (empty string if undefined).
        const safeVal = val || '';

        return (
            <SpinningNumber
                key={`${key}-${index}`}
                finalValue={safeVal}
                isRevealed={!!safeVal} // If it has value, it's revealed/done
                forceStatus={getForceStatus(key, index)}
                digitCount={digitCount}
                variant="text"
                colorMode={isRed ? 'red' : 'base'}
                className={className}
            />
        );
    };

    return (
        <div className="max-w-3xl mx-auto mb-8 font-sans">
            {/* Live Badge */}
            {isLive && (
                <div className="mb-2 text-center animate-pulse">
                    <span className="inline-block bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        🔴 LIVE - Đang quay thưởng
                    </span>
                </div>
            )}

            <div className="border border-red-700 rounded-t-lg overflow-hidden shadow-sm">
                {/* Header */}
                <div className="bg-[#b91c1c] text-white text-center py-3">
                    <h2 className="text-xl md:text-2xl font-bold uppercase">
                        Xổ Số Miền Bắc
                    </h2>
                    <p className="text-red-100 text-sm mt-1">
                        {format(parseISO(result.draw_date), 'EEEE, dd/MM/yyyy', { locale: vi })}
                    </p>
                </div>

                {/* Main Result Table */}
                <div className="bg-white">
                    <table className="w-full text-center border-collapse border-b border-gray-300">
                        <tbody>
                            {/* Special Prize - Moved to Bottom in Render? No, XSMB usually shows DB at top (or bottom?). 
                                Wait, standard sites show DB at top or bottom? 
                                TrialBoard shows DB at top. 
                                Let's keep DB at TOP visually as per previous Live layout, 
                                BUT the LOGIC (PRIZE_ORDER) treats it as LAST drawn.
                                This is fine: The UI shows it at top, but 'getForceStatus' thinks it is the last to receive data.
                                Correct. 
                            */}

                            {/* Special Prize */}
                            <tr className="border-b border-gray-200">
                                <td className="w-24 md:w-32 py-3 md:py-4 font-bold text-gray-700 bg-gray-50 border-r border-gray-200 text-sm md:text-base">
                                    Đặc biệt
                                </td>
                                <td className="py-3 md:py-4">
                                    <div className="flex justify-center">
                                        {renderNum('special_prize', 0, 5, "text-3xl md:text-4xl font-bold text-red-600 tracking-wider", true)}
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
                                        {renderNum('prize_1', 0, 5, "text-xl md:text-2xl font-bold text-gray-900 tracking-wide")}
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
                                        {padArray(result.prize_2, 2).map((_, i) => renderNum('prize_2', i, 5, "text-xl md:text-2xl font-bold text-gray-900 tracking-wide"))}
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
                                        {padArray(result.prize_3, 6).map((_, i) => renderNum('prize_3', i, 5, "text-lg md:text-xl font-bold text-gray-900 tracking-wide"))}
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
                                        {padArray(result.prize_4, 4).map((_, i) => renderNum('prize_4', i, 4, "text-lg md:text-xl font-bold text-gray-900 tracking-wide"))}
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
                                        {padArray(result.prize_5, 6).map((_, i) => renderNum('prize_5', i, 4, "text-lg md:text-xl font-bold text-gray-900 tracking-wide"))}
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
                                        {padArray(result.prize_6, 3).map((_, i) => renderNum('prize_6', i, 3, "text-lg md:text-xl font-bold text-gray-900 tracking-wide"))}
                                    </div>
                                </td>
                            </tr>

                            {/* Prize 7 */}
                            <tr>
                                <td className="py-3 font-bold text-gray-700 bg-gray-50 border-r border-gray-200 text-sm md:text-base">
                                    Giải bảy
                                </td>
                                <td className="py-3">
                                    <div className="flex justify-center gap-8 md:gap-16">
                                        {padArray(result.prize_7, 4).map((_, i) => renderNum('prize_7', i, 2, "text-xl md:text-2xl font-bold text-red-600 tracking-wide", true))}
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Head/Tail Analysis - Always visible for live updates */}
            <div className="mt-6">
                <LotoHeadTailTable result={result as any} />
            </div>
        </div>
    );
}
