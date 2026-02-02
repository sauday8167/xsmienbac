'use client';

import React, { useEffect, useRef } from 'react';
import { useAdSense } from '@/context/AdSenseContext';

interface GoogleAdProps {
    slotId?: string; // Optional if position is provided
    position?: 'header_top' | 'sidebar_top' | 'sidebar_sticky' | 'article_below_title' | 'article_middle' | 'article_bottom_multiplex' | 'mobile_anchor';
    format?: 'auto' | 'fluid' | 'rectangle';
    layoutKey?: string;
    style?: React.CSSProperties;
    className?: string;
}

export default function GoogleAd({ slotId, position, format = 'auto', layoutKey, style, className }: GoogleAdProps) {
    const { config, isLoading } = useAdSense();
    const adRef = useRef<HTMLModElement>(null);
    const isLoaded = useRef(false);

    if (isLoading || !config) return null;

    // Determine effective Slot ID
    const effectiveSlotId = slotId || (position ? config.slots[position] : '');
    const publisherId = config.publisherId;

    // Filter out test placeholders if configured to hide them
    const isPlaceholderId = publisherId === 'ca-pub-0000000000000000';
    if (!effectiveSlotId || (isPlaceholderId && !config.showTestPlaceholders)) {
        return null; // Don't render empty or unwanted placeholders
    }

    useEffect(() => {
        // Prevent double loading in strict mode
        if (isLoaded.current) return;

        try {
            if (typeof window !== 'undefined' && !isPlaceholderId) {
                ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
                isLoaded.current = true;
            }
        } catch (e) {
            console.error('AdSense error:', e);
        }
    }, [isPlaceholderId, effectiveSlotId]);

    return (
        <div className={`google-ad-container text-center my-4 ${className || ''}`} style={{ minHeight: '90px', ...style }}>
            <span className="text-[10px] text-gray-400 block mb-1 uppercase tracking-wider">Quảng cáo</span>
            <ins
                ref={adRef}
                className="adsbygoogle"
                style={{ display: 'block', ...style }}
                data-ad-client={publisherId}
                data-ad-slot={effectiveSlotId}
                data-ad-format={format}
                data-full-width-responsive="true"
                {...(layoutKey ? { 'data-ad-layout-key': layoutKey } : {})}
            />
        </div>
    );
}
