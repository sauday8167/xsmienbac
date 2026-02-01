'use client';
import { useState, useEffect, useRef } from 'react';
import '../styles/lottery-animation.css';

interface SpinningNumberProps {
    finalValue: string | null;
    isRevealed: boolean;
    className?: string;
    digitCount?: number;
    colorMode?: 'red' | 'base'; // 'red' for Special Prize, 'base' for others
    variant?: 'ball' | 'text';
    forceStatus?: 'waiting' | 'drum' | 'rolling' | 'done';
}

export function SpinningNumber({
    finalValue,
    isRevealed,
    className = '',
    digitCount = 5,
    colorMode = 'base',
    variant = 'ball',
    forceStatus
}: SpinningNumberProps) {
    // Sanitize input: If value contains "đang cập nhật" or similar text, treat as waiting
    const isInvalidValue = finalValue && (
        finalValue.toString().toLowerCase().includes('đang') ||
        finalValue.toString().toLowerCase().includes('update') ||
        finalValue.toString().toLowerCase().includes('waiting')
    );

    const safeFinalValue = isInvalidValue ? null : finalValue;
    const safeIsRevealed = isInvalidValue ? false : isRevealed;

    const [displayValue, setDisplayValue] = useState(safeFinalValue || generateRandomString(digitCount));
    const [internalStatus, setInternalStatus] = useState<'waiting' | 'drum' | 'rolling' | 'done'>('waiting');
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Determines CSS classes
    const isBall = variant === 'ball';
    const baseClass = isBall
        ? (colorMode === 'red' ? 'loto-ball red' : 'loto-ball base')
        : 'inline-block mx-0.5'; // Text mode spacing

    const status = isInvalidValue ? 'waiting' : (forceStatus || internalStatus);

    function generateRandomString(length: number) {
        let result = '';
        const characters = '0123456789';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    useEffect(() => {
        // If forceStatus is provided, we just manage displayValue based on it
        if (forceStatus) {
            if (forceStatus === 'rolling') {
                // Start rolling interval if not already running (or just always restart for simplicity)
                if (intervalRef.current) clearInterval(intervalRef.current);
                intervalRef.current = setInterval(() => {
                    setDisplayValue(generateRandomString(digitCount));
                }, 80);
            } else if (forceStatus === 'done') {
                if (intervalRef.current) clearInterval(intervalRef.current);
                if (safeFinalValue) setDisplayValue(safeFinalValue);
            } else {
                if (intervalRef.current) clearInterval(intervalRef.current);
                // Waiting/drum -> maybe static hyphen or random depending on logic.
                // For this specific 'text' + 'waiting' request, we want hyphen handled in render.
            }
            return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
        }

        // --- Original Internal Logic (fallback) ---
        if (safeFinalValue && safeIsRevealed) {
            if (internalStatus !== 'done') {
                if (internalStatus === 'waiting') {
                    setInternalStatus('done');
                    setDisplayValue(safeFinalValue);
                } else {
                    clearInterval(intervalRef.current!);
                    setInternalStatus('rolling');
                    let count = 0;
                    intervalRef.current = setInterval(() => {
                        setDisplayValue(generateRandomString(safeFinalValue.length));
                        count++;
                        if (count > 5) {
                            clearInterval(intervalRef.current!);
                            setDisplayValue(safeFinalValue);
                            setInternalStatus('done');
                        }
                    }, 80);
                }
            }
        }
        // REMOVED: Auto-drum logic for waiting state

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [safeFinalValue, safeIsRevealed, digitCount, forceStatus, internalStatus, isInvalidValue]);

    // Render logic
    const renderDigits = (val: string, extraClass: string = '') => (
        <div className={`flex ${className}`}>
            {val.split('').map((char, i) => (
                <span key={i} className={`${baseClass} ${extraClass}`}>
                    {char}
                </span>
            ))}
        </div>
    );

    // Explicit idle/waiting state
    if (status === 'waiting') {
        // Text mode: Return empty or hyphen? User said "không hiển thị...". Let's return empty space to keep layout.
        if (!isBall) {
            return <div className={`text-transparent select-none font-bold ${className}`}>-</div>;
        }
        // Ball mode: Return empty placeholder ball
        return (
            <div className={`flex ${className}`}>
                {Array.from({ length: digitCount }).map((_, i) => (
                    <span key={i} className={`loto-ball bg-gray-50 border border-gray-100`}></span>
                ))}
            </div>
        );
    }

    if (status === 'drum') {
        if (isBall) {
            return (
                <div className={`flex gap-1 ${className}`}>
                    {displayValue.split('').map((_, i) => (
                        <span key={i} className={`${baseClass} spinning-drum`}>8</span>
                    ))}
                </div>
            );
        } else {
            return renderDigits(displayValue, 'opacity-70');
        }
    }

    if (status === 'rolling') {
        return renderDigits(displayValue, isBall ? 'opacity-80' : '');
    }

    // Done
    const valToShow = status === 'done' ? (safeFinalValue || displayValue) : displayValue;
    return renderDigits(valToShow, status === 'done' && isBall ? 'animate-pop-in' : '');
}

interface SpinningNumberArrayProps {
    finalValues: string[];
    isRevealed: boolean;
    className?: string;
    digitCount?: number;
    variant?: 'ball' | 'text';
}

export function SpinningNumberArray({
    finalValues,
    isRevealed,
    className = '',
    digitCount = 5,
    variant = 'ball'
}: SpinningNumberArrayProps) {
    if (!finalValues || finalValues.length === 0) return null;

    return (
        <div className={`flex flex-wrap gap-4 justify-center ${className}`}>
            {finalValues.map((value, index) => (
                <SpinningNumber
                    key={index}
                    finalValue={value}
                    isRevealed={isRevealed && !!value}
                    digitCount={digitCount}
                    colorMode="base"
                    variant={variant}
                />
            ))}
        </div>
    );
}
