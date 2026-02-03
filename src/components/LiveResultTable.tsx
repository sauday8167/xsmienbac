'use client';
import { useState, useEffect, useMemo } from 'react';
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

// ----------------------------------------------------------------------
// CONSTANTS & HELPERS
// ----------------------------------------------------------------------

// Definition of a Slot
type SlotDef = {
    key: keyof LotteryResult;
    index: number; // Index within the array (0 for scalar)
    label: string;
};

// Strict Sequence: G1 -> G2(2) -> G3(6) -> G4(4) -> G5(6) -> G6(3) -> G7(4) -> Special
const SLOT_ORDER: SlotDef[] = [
    // Giải Nhất (1)
    { key: 'prize_1', index: 0, label: 'Giải Nhất' },
    // Giải Nhì (2)
    { key: 'prize_2', index: 0, label: 'Giải Nhì 1' },
    { key: 'prize_2', index: 1, label: 'Giải Nhì 2' },
    // Giải Ba (6)
    { key: 'prize_3', index: 0, label: 'Giải Ba 1' },
    { key: 'prize_3', index: 1, label: 'Giải Ba 2' },
    { key: 'prize_3', index: 2, label: 'Giải Ba 3' },
    { key: 'prize_3', index: 3, label: 'Giải Ba 4' },
    { key: 'prize_3', index: 4, label: 'Giải Ba 5' },
    { key: 'prize_3', index: 5, label: 'Giải Ba 6' },
    // Giải Tư (4)
    { key: 'prize_4', index: 0, label: 'Giải Tư 1' },
    { key: 'prize_4', index: 1, label: 'Giải Tư 2' },
    { key: 'prize_4', index: 2, label: 'Giải Tư 3' },
    { key: 'prize_4', index: 3, label: 'Giải Tư 4' },
    // Giải Năm (6)
    { key: 'prize_5', index: 0, label: 'Giải Năm 1' },
    { key: 'prize_5', index: 1, label: 'Giải Năm 2' },
    { key: 'prize_5', index: 2, label: 'Giải Năm 3' },
    { key: 'prize_5', index: 3, label: 'Giải Năm 4' },
    { key: 'prize_5', index: 4, label: 'Giải Năm 5' },
    { key: 'prize_5', index: 5, label: 'Giải Năm 6' },
    // Giải Sáu (3)
    { key: 'prize_6', index: 0, label: 'Giải Sáu 1' },
    { key: 'prize_6', index: 1, label: 'Giải Sáu 2' },
    { key: 'prize_6', index: 2, label: 'Giải Sáu 3' },
    // Giải Bảy (4)
    { key: 'prize_7', index: 0, label: 'Giải Bảy 1' },
    { key: 'prize_7', index: 1, label: 'Giải Bảy 2' },
    { key: 'prize_7', index: 2, label: 'Giải Bảy 3' },
    { key: 'prize_7', index: 3, label: 'Giải Bảy 4' },
    // Đặc Biệt (Last)
    { key: 'special_prize', index: 0, label: 'Đặc Biệt' },
];

const padArray = (arr: string[] | null, length: number) => {
    const newArr = arr ? [...arr] : [];
    while (newArr.length < length) {
        newArr.push('');
    }
    return newArr;
};

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------

export default function LiveResultTable({
    result: apiResult,
    isLive = false,
}: LiveResultTableProps) {
    // We strictly follow apiResult.
    // Logic: Look at SLOT_ORDER. Find the first slot that is EMPTY in apiResult.
    // That slot is the "Active Cursor" (Rolling).
    // All slots before it are DONE.
    // All slots after it are WAITING (Hidden).

    // Helper: Get value from result object
    const getValue = (res: LotteryResult, key: keyof LotteryResult, idx: number): string => {
        const val = res[key];
        if (Array.isArray(val)) return val[idx] || '';
        return (val as string) || '';
    };

    // 1. Determine Cursor Position
    const cursorIndex = useMemo(() => {
        if (!isLive) return 999; // If not live, show all

        // Find first empty slot
        const idx = SLOT_ORDER.findIndex(slot => {
            const val = getValue(apiResult, slot.key, slot.index);
            return !val || val === '';
        });

        // Special Start Logic:
        // If NO results at all yet, and it's past 18:14, start rolling first slot.
        // We assume parent handles "isLive" based on time.
        // If idx === 0 (first slot empty), it means we are at start.
        if (idx === -1) return 999; // All full -> Show all
        return idx;

    }, [apiResult, isLive]);

    // 2. Setup Display Helper
    // Returns: { status: 'done' | 'rolling' | 'waiting', value: string }
    const getSlotState = (key: keyof LotteryResult, index: number) => {
        // Find position in SLOT_ORDER
        const globalOrderIndex = SLOT_ORDER.findIndex(s => s.key === key && s.index === index);

        if (globalOrderIndex === -1) return { status: 'waiting', value: '' }; // Should not happen

        if (!isLive) {
            return { status: 'done', value: getValue(apiResult, key, index) };
        }

        if (globalOrderIndex < cursorIndex) {
            return { status: 'done', value: getValue(apiResult, key, index) };
        } else if (globalOrderIndex === cursorIndex) {
            return { status: 'rolling', value: '' }; // The Cursor!
        } else {
            return { status: 'waiting', value: '' };
        }
    };


    // ----------------------------------------------------------------------
    // 3. RENDER HELPERS
    // ----------------------------------------------------------------------
    const renderNum = (key: keyof LotteryResult, index: number, digitCount: number, className: string, isRed = false) => {
        const { status, value } = getSlotState(key, index);
        const uniqueId = `${key}-${index}`;

        // WAITING: Render NOTHING (Blank) as requested
        if (status === 'waiting') {
            return (
                <div className={`flex justify-center items-center h-8 md:h-10 w-full`}>
                    {/* Empty Space - No text */}
                </div>
            );
        }

        // DONE or ROLLING: Use SpinningNumber
        // For 'rolling', SpinningNumber with forceStatus='rolling' will spin indefinitely

        return (
            <SpinningNumber
                key={uniqueId}
                finalValue={value}
                isRevealed={status === 'done'}
                forceStatus={status === 'rolling' ? 'rolling' : undefined}
                digitCount={digitCount}
                variant="text"
                colorMode={isRed ? 'red' : 'base'}
                className={className}
            />
        );
    };

    if (!apiResult) return null;

    return (
        <div className="max-w-4xl mx-auto mb-8 font-sans">
            {/* Live Badge */}
            {isLive && (
                <div className="mb-2 text-center animate-pulse">
                    <span className="inline-flex items-center gap-2 bg-red-600/90 backdrop-blur-sm text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                        LIVE - Đang quay thưởng
                    </span>
                </div>
            )}

            <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-300">
                {/* Header */}
                <div className="bg-[#b91c1c] text-white text-center py-4 border-b border-gray-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10 mix-blend-overlay"></div>
                    <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wide relative z-10">
                        Xổ Số Miền Bắc
                    </h2>
                    <p className="text-red-100 text-sm mt-1 relative z-10 font-medium">
                        {format(parseISO(apiResult.draw_date), 'EEEE, dd/MM/yyyy', { locale: vi })}
                    </p>
                </div>

                {/* Main Result Table */}
                <table className="w-full text-center border-collapse">
                    <tbody>
                        {/* Special Prize - TOP (Fixed Position) */}
                        <tr className="bg-red-50/50 border-b-2 border-red-200">
                            <td className="w-16 md:w-32 py-2 md:py-3 font-bold text-red-700 bg-red-100/50 border-r border-red-200 text-sm md:text-base">
                                <span className="md:hidden">ĐB</span>
                                <span className="hidden md:inline">Đặc biệt</span>
                            </td>
                            <td className="py-2 md:py-3">
                                <div className="flex justify-center">
                                    {renderNum('special_prize', 0, 5, "text-2xl md:text-3xl font-black text-red-600 tracking-wider dropshadow-sm", true)}
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
                                    {renderNum('prize_1', 0, 5, "text-lg md:text-xl font-bold text-gray-900 tracking-wide")}
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
                                    {padArray(apiResult.prize_2, 2).map((_, i) => renderNum('prize_2', i, 5, "text-lg md:text-xl font-bold text-gray-900 tracking-wide"))}
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
                                    {padArray(apiResult.prize_3, 6).map((_, i) => renderNum('prize_3', i, 5, "text-base md:text-lg font-bold text-gray-900 tracking-wide"))}
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
                                    {padArray(apiResult.prize_4, 4).map((_, i) => renderNum('prize_4', i, 4, "text-base md:text-lg font-bold text-gray-900 tracking-wide"))}
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
                                    {padArray(apiResult.prize_5, 6).map((_, i) => renderNum('prize_5', i, 4, "text-base md:text-lg font-bold text-gray-900 tracking-wide"))}
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
                                    {padArray(apiResult.prize_6, 3).map((_, i) => renderNum('prize_6', i, 3, "text-base md:text-lg font-bold text-gray-900 tracking-wide"))}
                                </div>
                            </td>
                        </tr>

                        {/* Prize 7 - Red Text */}
                        <tr className="border-b border-gray-200">
                            <td className="py-2 md:py-3 font-bold text-gray-700 bg-gray-50 border-r border-gray-200 text-sm md:text-base">
                                <span className="md:hidden">G.7</span>
                                <span className="hidden md:inline">Giải bảy</span>
                            </td>
                            <td className="py-2 md:py-3">
                                <div className="flex justify-around md:justify-center md:gap-24">
                                    {padArray(apiResult.prize_7, 4).map((_, i) => renderNum('prize_7', i, 2, "text-lg md:text-xl font-bold text-red-600 tracking-wide", true))}
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Head/Tail Analysis - Real-time update */}
            <div className="mt-6">
                <LotoHeadTailTable result={apiResult} />
            </div>
        </div>
    );
}


