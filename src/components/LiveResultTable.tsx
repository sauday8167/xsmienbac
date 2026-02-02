'use client';
import { useState, useEffect, useRef } from 'react';
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

// Strict Waterfall Order: G1 -> G2 -> ... -> G7 -> Special Prize
const ANIMATION_ORDER: { key: keyof LotteryResult; label: string }[] = [
    { key: 'prize_1', label: 'Giải Nhất' },
    { key: 'prize_2', label: 'Giải Nhì' },
    { key: 'prize_3', label: 'Giải Ba' },
    { key: 'prize_4', label: 'Giải Tư' },
    { key: 'prize_5', label: 'Giải Năm' },
    { key: 'prize_6', label: 'Giải Sáu' },
    { key: 'prize_7', label: 'Giải Bảy' },
    { key: 'special_prize', label: 'Đặc Biệt' },
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
    result: apiResult, // The raw result from API (source of truth)
    isLive = false,
}: LiveResultTableProps) {
    // displayedResult is what the user SEES. It starts empty and fills up via animation.
    const [displayedResult, setDisplayedResult] = useState<LotteryResult>(() => ({
        ...apiResult,
        special_prize: '',
        prize_1: '',
        prize_2: [],
        prize_3: [],
        prize_4: [],
        prize_5: [],
        prize_6: [],
        prize_7: [],
    }));

    // Status map for each individual number slot: 'waiting' | 'rolling' | 'done'
    // key format: "prizeKey-index", e.g. "prize_1-0", "prize_3-4"
    const [statusMap, setStatusMap] = useState<Record<string, 'waiting' | 'rolling' | 'done'>>({});

    // Queue of items to animate: { key, index, value }
    const queueRef = useRef<{ key: keyof LotteryResult; index: number; value: string }[]>([]);
    const isAnimatingRef = useRef(false);
    const mountedRef = useRef(false);
    const processedMapRef = useRef<Set<string>>(new Set()); // To avoid re-adding same items

    // ----------------------------------------------------------------------
    // 1. SYNC API RESULT TO QUEUE
    // ----------------------------------------------------------------------
    useEffect(() => {
        if (!apiResult) return;

        // If NOT live, show everything immediately (no animation)
        if (!isLive) {
            setDisplayedResult(apiResult);
            // Mark all as done
            const allDone: Record<string, 'done'> = {};
            // (Simulate filling allDone for static display if needed, but SpinningNumber handles finalValue=str + status=undefined as DONE usually.
            // However, to be safe, we can leave statusMap empty or set all to done.)
            return;
        }

        // If LIVE, diff against what we have processed to build the queue STRICTLY in order
        const newItems: { key: keyof LotteryResult; index: number; value: string }[] = [];

        // Iterate through our STRICT ORDER
        for (const { key } of ANIMATION_ORDER) {
            const apiVal = apiResult[key];
            if (!apiVal) continue;

            const values = Array.isArray(apiVal) ? apiVal : [apiVal];

            values.forEach((val, idx) => {
                if (!val) return;

                const uniqueId = `${key}-${idx}`;
                // If we haven't processed this specific slot yet...
                if (!processedMapRef.current.has(uniqueId)) {
                    // check if it's already in queue? No need if we rely on processedMapRef.
                    // But wait, if we crash/reload, we might want to re-animate? 
                    // For now, assume fresh load = start from scratch or catch up.

                    // Add to local list, then we will sort/append to queue
                    newItems.push({ key, index: idx, value: val });
                    processedMapRef.current.add(uniqueId);
                }
            });
        }

        if (newItems.length > 0) {
            // Because we iterated in ANIMATION_ORDER, newItems is ALREADY roughly ordered by prize type.
            // But within a prize (e.g. Prize 3 has 6 numbers), we extracted them in index order 0->5.
            // This is exactly what we want: Left-to-Right within a prize, and Prize 1 -> ... -> Special.

            // Push to queue
            queueRef.current.push(...newItems);

            // Trigger animation loop if not running
            processQueue();
        }

    }, [apiResult, isLive]);

    // ----------------------------------------------------------------------
    // 2. ANIMATION LOOP
    // ----------------------------------------------------------------------
    const processQueue = async () => {
        if (isAnimatingRef.current) return;
        isAnimatingRef.current = true;

        while (queueRef.current.length > 0) {
            if (!mountedRef.current) break;

            const item = queueRef.current.shift(); // Get next item
            if (!item) break;

            const { key, index, value } = item;
            const uniqueId = `${key}-${index}`;

            // A. Start ROLLING
            setStatusMap(prev => ({ ...prev, [uniqueId]: 'rolling' }));

            // Rolling duration (drum effect)
            await new Promise(r => setTimeout(r, 400)); // 400ms rolling

            // B. Reveal (DONE) & Update Displayed Data
            // We update state synchronously so visuals match
            setStatusMap(prev => ({ ...prev, [uniqueId]: 'done' }));

            setDisplayedResult(prev => {
                const next = { ...prev };
                const prevVal = next[key];

                if (Array.isArray(prevVal)) {
                    // Copy array
                    const newArr = [...(prevVal || [])];
                    // Ensure size
                    while (newArr.length <= index) newArr.push('');
                    newArr[index] = value;
                    (next as any)[key] = newArr;
                } else {
                    (next as any)[key] = value;
                }
                return next;
            });

            // Short pause between numbers
            await new Promise(r => setTimeout(r, 100));
        }

        isAnimatingRef.current = false;
    };

    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);


    // ----------------------------------------------------------------------
    // 3. RENDER HELPERS
    // ----------------------------------------------------------------------
    const renderNum = (key: keyof LotteryResult, index: number, digitCount: number, className: string, isRed = false) => {
        const uniqueId = `${key}-${index}`;

        // Data from DISPLAYED result (what is currently revealed)
        const valRaw = displayedResult[key];
        const val = Array.isArray(valRaw) ? valRaw[index] : (valRaw as string);

        // If not in displayedResult yet, IT IS EMPTY (waiting).
        // Unless it is 'rolling' in statusMap? 
        // Logic: 
        // - status='waiting' -> show nothing/placeholder
        // - status='rolling' -> show random rolling numbers (SpinningNumber handles this via forceStatus='rolling')
        // - status='done' -> show final value

        const status = statusMap[uniqueId] || 'waiting';
        // Note: 'waiting' is default if not yet touched.

        return (
            <SpinningNumber
                key={uniqueId}
                finalValue={val || ''}
                isRevealed={status === 'done'}
                forceStatus={status}
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
                        {/* Special Prize - MOVED TO BOTTOM VISUALLY? 
                            Wait, user said "Order of appearance: G1 -> ... -> Special". 
                            But usually the TABLE LAYOUT keeps Special at top or bottom?
                            Traditional XSMB table has Special at TOP. 
                            The user said "Thứ tự xuất hiện" (Animation Order).
                            So we KEEP the layout, but animate G1 first.
                        */}
                        <tr className="bg-red-50/30 border-b border-gray-200">
                            <td className="w-16 md:w-32 py-2 md:py-3 font-bold text-gray-700 bg-gray-50 border-r border-gray-200 text-sm md:text-base">
                                <span className="md:hidden">ĐB</span>
                                <span className="hidden md:inline">Đặc biệt</span>
                            </td>
                            <td className="py-2 md:py-3">
                                <div className="flex justify-center">
                                    {/* Reduced text-3xl */}
                                    {renderNum('special_prize', 0, 5, "text-2xl md:text-3xl font-bold text-red-600 tracking-wider", true)}
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
                                    {/* Reduced text-xl/2xl to lg/xl */}
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
                                    {padArray(displayedResult.prize_2, 2).map((_, i) => renderNum('prize_2', i, 5, "text-lg md:text-xl font-bold text-gray-900 tracking-wide"))}
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
                                    {padArray(displayedResult.prize_3, 6).map((_, i) => renderNum('prize_3', i, 5, "text-base md:text-lg font-bold text-gray-900 tracking-wide"))}
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
                                    {padArray(displayedResult.prize_4, 4).map((_, i) => renderNum('prize_4', i, 4, "text-base md:text-lg font-bold text-gray-900 tracking-wide"))}
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
                                    {padArray(displayedResult.prize_5, 6).map((_, i) => renderNum('prize_5', i, 4, "text-base md:text-lg font-bold text-gray-900 tracking-wide"))}
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
                                    {padArray(displayedResult.prize_6, 3).map((_, i) => renderNum('prize_6', i, 3, "text-base md:text-lg font-bold text-gray-900 tracking-wide"))}
                                </div>
                            </td>
                        </tr>

                        {/* Prize 7 - Red Text */}
                        <tr>
                            <td className="py-2 md:py-3 font-bold text-gray-700 bg-gray-50 border-r border-gray-200 text-sm md:text-base">
                                <span className="md:hidden">G.7</span>
                                <span className="hidden md:inline">Giải bảy</span>
                            </td>
                            <td className="py-2 md:py-3">
                                <div className="flex justify-around md:justify-center md:gap-24">
                                    {padArray(displayedResult.prize_7, 4).map((_, i) => renderNum('prize_7', i, 2, "text-lg md:text-xl font-bold text-red-600 tracking-wide", true))}
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Head/Tail Analysis - Using DISPLAYED result so it updates real-time */}
            <div className="mt-6">
                <LotoHeadTailTable result={displayedResult} />
            </div>
        </div>
    );
}

