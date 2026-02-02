'use client';

import { useState, useEffect } from 'react';
import GoogleAd from './GoogleAd';

export default function MobileStickyAd() {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:hidden">
            <div className="relative">
                {/* Close Button */}
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute -top-6 right-2 bg-gray-200 text-gray-600 rounded-full p-1 shadow-sm hover:bg-gray-300"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="flex justify-center items-center h-[60px] overflow-hidden">
                    <GoogleAd position="mobile_anchor" style={{ width: '100%', height: '50px' }} />
                </div>
            </div>
        </div>
    );
}
