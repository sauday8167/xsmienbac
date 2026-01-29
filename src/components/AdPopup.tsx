'use client';

import { useState, useEffect } from 'react';

interface Banner {
    id: string;
    title: string;
    image: string;
    link: string;
    position: string;
    status: string;
}

export default function AdPopup() {
    const [popupBanner, setPopupBanner] = useState<Banner | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user already closed a popup in this session
        const isClosed = sessionStorage.getItem('ad_popup_closed');
        if (isClosed) return;

        fetch('/api/admin/banners')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    const popup = data.data.find((b: Banner) => b.position === 'popup' && b.status === 'active');
                    if (popup) {
                        setPopupBanner(popup);
                        // Delay showing the popup for better UX
                        setTimeout(() => setIsVisible(true), 2000);
                    }
                }
            })
            .catch(err => console.error('Error fetching popup banner:', err));
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        sessionStorage.setItem('ad_popup_closed', 'true');
    };

    if (!isVisible || !popupBanner) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 animate-fade-in backdrop-blur-sm">
            <div className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl animate-scale-in">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <a href={popupBanner.link} target="_blank" rel="noopener noreferrer" className="block">
                    <img
                        src={popupBanner.image}
                        alt={popupBanner.title}
                        className="w-full h-auto object-contain max-h-[70vh] md:max-h-[80vh]"
                    />
                </a>
            </div>
        </div>
    );
}
