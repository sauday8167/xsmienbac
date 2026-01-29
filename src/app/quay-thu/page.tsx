'use client';

import { useState, useEffect, useRef } from 'react';
import TrialBoard from './components/TrialBoard';
import LotoStats from './components/LotoStats';

// Status for each individual number cell
export type NumberStatus = 'waiting' | 'rolling' | 'done';

// Flattened sequence for "One by One" spinning
// Order: G1 -> G2 -> G3 -> G4 -> G5 -> G6 -> G7 -> DB
// Note: Indices match existing TrialBoard layout
const ANIMATION_SEQUENCE = [
    1,                  // G1
    2, 3,               // G2
    4, 5, 6, 7, 8, 9,   // G3
    10, 11, 12, 13,     // G4
    14, 15, 16, 17, 18, 19, // G5
    20, 21, 22,         // G6
    23, 24, 25, 26,     // G7
    0                   // DB (Special Prize last)
];

export default function RandomDrawPage() {
    const [results, setResults] = useState<string[]>(Array(27).fill(''));
    const [statusArray, setStatusArray] = useState<NumberStatus[]>(Array(27).fill('waiting'));
    const [isDrawing, setIsDrawing] = useState(false);

    // Track current step in the ANIMATION_SEQUENCE (0 to 26)
    const [currentStepIndex, setCurrentStepIndex] = useState(-1);

    // Timer refs
    const stepTimerRef = useRef<NodeJS.Timeout | null>(null);

    const generateRandomNumber = (digits: number): string => {
        let max = Math.pow(10, digits);
        let min = 0;
        let num = Math.floor(Math.random() * (max - min) + min);
        return num.toString().padStart(digits, '0');
    };

    const startDraw = () => {
        if (isDrawing) return;
        setIsDrawing(true);
        setCurrentStepIndex(0); // Start from first item in sequence
        setStatusArray(Array(27).fill('waiting')); // Reset

        // 1. Generate ALL results upfront
        const newResults = Array(27).fill('');
        const fill = (start: number, count: number, digits: number) => {
            for (let i = 0; i < count; i++) {
                newResults[start + i] = generateRandomNumber(digits);
            }
        };
        fill(0, 1, 5); // DB
        fill(1, 1, 5); // G1
        fill(2, 2, 5); // G2
        fill(4, 6, 5); // G3
        fill(10, 4, 4); // G4
        fill(14, 6, 4); // G5
        fill(20, 3, 3); // G6
        fill(23, 4, 2); // G7
        setResults(newResults);
    };

    // Effect to handle the Sequential Waterfall
    useEffect(() => {
        if (!isDrawing || currentStepIndex < 0) return;

        if (currentStepIndex >= ANIMATION_SEQUENCE.length) {
            // Finished
            setIsDrawing(false);
            return;
        }

        const targetIndex = ANIMATION_SEQUENCE[currentStepIndex];

        // 1. Set current target to ROLLING
        setStatusArray(prev => {
            const next = [...prev];
            next[targetIndex] = 'rolling';
            return next;
        });

        // 2. Wait, then reveal (DONE) and move to next
        // Use faster duration for single numbers to avoid it taking too long (27 steps)
        // 27 steps * 500ms = ~13.5 seconds total.
        const duration = 500;

        stepTimerRef.current = setTimeout(() => {
            // Set current to DONE
            setStatusArray(prev => {
                const next = [...prev];
                next[targetIndex] = 'done';
                return next;
            });

            // Trigger next step
            setCurrentStepIndex(prev => prev + 1);

        }, duration);

        return () => {
            if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
        };
    }, [currentStepIndex, isDrawing]);

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-lottery-gray-800 mb-2">
                    Quay Thử Số May Mắn
                </h1>
                <p className="text-lottery-gray-600">Tạo bộ số ngẫu nhiên cho giải trí - <span className="text-red-600 font-semibold">Chế độ quay từng giải</span></p>
                <div className="w-24 h-1 bg-lottery-red-600 mx-auto rounded-full mt-4"></div>
            </div>

            {/* Controls */}
            <div className="flex justify-center mb-8">
                <button
                    onClick={startDraw}
                    disabled={isDrawing}
                    className="btn bg-gradient-to-r from-lottery-red-600 to-lottery-red-700 text-white hover:from-lottery-red-700 hover:to-lottery-red-800 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3 text-lg shadow-lg transform hover:-translate-y-0.5 transition-all rounded-full font-bold uppercase tracking-wide flex items-center"
                >
                    {isDrawing ? (
                        <>
                            <div className="spinner w-5 h-5 border-2 mr-2 border-white border-t-transparent animate-spin rounded-full"></div>
                            Đang quay... ({Math.floor((currentStepIndex / 27) * 100)}%)
                        </>
                    ) : (
                        <>
                            <svg className="w-6 h-6 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Bắt đầu quay
                        </>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Board */}
                <div className="lg:col-span-2">
                    <TrialBoard results={results} statusArray={statusArray} />
                </div>

                {/* Statistics */}
                <div className="lg:col-span-1">
                    {/* Filter for ONLY 'done' numbers to show in stats */}
                    <LotoStats numbers={results.map((val, idx) => ({
                        id: idx,
                        value: val,
                        isAnimating: statusArray[idx] !== 'done' // Only consider 'done' as static
                    }))} />
                </div>
            </div>
            {/* Disclaimer */}
            <div className="text-center text-sm text-gray-500 italic mt-8 bg-gray-50 p-4 rounded-lg border border-gray-100">
                Lưu ý: Kết quả quay thử chỉ mang tính chất tham khảo, giải trí và không có giá trị lĩnh thưởng.
                Chúc các bạn may mắn!
            </div>
        </div>
    );
}
