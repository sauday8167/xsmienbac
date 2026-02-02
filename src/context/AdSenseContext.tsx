'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface AdSenseConfig {
    publisherId: string;
    slots: {
        header_top: string;
        sidebar_top: string;
        sidebar_sticky: string;
        article_below_title: string;
        article_middle: string;
        article_bottom_multiplex: string;
        mobile_anchor: string;
    };
    showTestPlaceholders: boolean;
}

interface AdSenseContextType {
    config: AdSenseConfig | null;
    isLoading: boolean;
}

const AdSenseContext = createContext<AdSenseContextType | undefined>(undefined);

export function AdSenseProvider({ children, initialConfig }: { children: React.ReactNode, initialConfig?: AdSenseConfig }) {
    const [config, setConfig] = useState<AdSenseConfig | null>(initialConfig || null);
    const [isLoading, setIsLoading] = useState(!initialConfig);

    useEffect(() => {
        if (!initialConfig) {
            fetch('/api/admin/adsense')
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setConfig(data.data);
                    }
                })
                .catch(err => console.error('Failed to load AdSense config:', err))
                .finally(() => setIsLoading(false));
        }
    }, [initialConfig]);

    return (
        <AdSenseContext.Provider value={{ config, isLoading }}>
            {children}
        </AdSenseContext.Provider>
    );
}

export function useAdSense() {
    const context = useContext(AdSenseContext);
    if (context === undefined) {
        throw new Error('useAdSense must be used within an AdSenseProvider');
    }
    return context;
}
