'use client';

import { useEffect, useRef } from 'react';

interface Props {
    html: string;
    id: string;
}

export default function CustomCodeInjector({ html, id }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const hasRun = useRef(false);

    useEffect(() => {
        if (!html || !containerRef.current || hasRun.current) return;

        // Use createContextualFragment to verify and compile scripts
        try {
            const range = document.createRange();
            range.selectNode(containerRef.current);
            const fragment = range.createContextualFragment(html);

            // Clear current content just in case
            containerRef.current.innerHTML = '';
            containerRef.current.appendChild(fragment);

            hasRun.current = true;
        } catch (e) {
            console.error('Failed to inject custom code:', e);
        }
    }, [html]);

    return <div id={id} ref={containerRef} />;
}
