'use client';
import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import '../styles/lottery-animation.css';

interface SpinningNumberProps {
    finalValue: string | null;
    isRevealed: boolean;
    className?: string;
    digitCount?: number;
    colorMode?: 'red' | 'base'; // 'red' for Special Prize, 'base' for others
    variant?: 'ball' | 'text';
    forceStatus?: 'waiting' | 'drum' | 'rolling' | 'done';
    isWinning?: boolean;
}

export function SpinningNumber({
    finalValue,
    isRevealed,
    className = '',
    digitCount = 5,
    colorMode = 'base',
    variant = 'ball',
    forceStatus,
    isWinning = false
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

    const fireConfetti = () => {
        const duration = 2 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);
    };

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
                if (isWinning) fireConfetti();
            } else {
                if (intervalRef.current) clearInterval(intervalRef.current);
            }
            return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
        }

        // --- Original Internal Logic (fallback) ---
        if (safeFinalValue && safeIsRevealed) {
            if (internalStatus !== 'done') {
                if (internalStatus === 'waiting') {
                    setInternalStatus('done');
                    setDisplayValue(safeFinalValue);
                    if (isWinning) fireConfetti();
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
                            if (isWinning) fireConfetti();
                        }
                    }, 80);
                }
            }
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [safeFinalValue, safeIsRevealed, digitCount, forceStatus, internalStatus, isInvalidValue, isWinning]);

    // Render logic
    const renderDigits = (val: string, extraClass: string = '') => (
        <div className={`flex ${className}`}>
            {val.split('').map((char, i) => {
                let currentBallClass = baseClass;
                if (status === 'done' && isWinning && isBall) {
                    currentBallClass = 'loto-ball winning-ball';
                }
                return (
                    <span key={i} className={`${currentBallClass} ${extraClass}`}>
                        {char}
                    </span>
                );
            })}
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
