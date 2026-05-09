'use client';

import { useState, useEffect } from 'react';

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

type State = 'idle' | 'subscribed' | 'loading' | 'unsupported' | 'denied';

export default function PushSubscribeButton() {
    const [state, setState] = useState<State>('idle');

    useEffect(() => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            setState('unsupported');
            return;
        }
        if (Notification.permission === 'denied') {
            setState('denied');
            return;
        }
        // Check if already subscribed
        navigator.serviceWorker.ready.then(reg => reg.pushManager.getSubscription()).then(sub => {
            if (sub) setState('subscribed');
        }).catch(() => {});
    }, []);

    const subscribe = async () => {
        if (!VAPID_PUBLIC) return;
        setState('loading');
        try {
            const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
            await navigator.serviceWorker.ready;

            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
            });

            const json = sub.toJSON();
            await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
            });

            setState('subscribed');
        } catch {
            setState('idle');
        }
    };

    const unsubscribe = async () => {
        setState('loading');
        try {
            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.getSubscription();
            if (sub) {
                await fetch('/api/push/subscribe', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ endpoint: sub.endpoint }),
                });
                await sub.unsubscribe();
            }
            setState('idle');
        } catch {
            setState('subscribed');
        }
    };

    if (state === 'unsupported') return null;

    return (
        <button
            onClick={state === 'subscribed' ? unsubscribe : subscribe}
            disabled={state === 'loading' || state === 'denied'}
            title={state === 'denied' ? 'Bạn đã chặn thông báo trong trình duyệt' : undefined}
            className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                state === 'subscribed'
                    ? 'bg-green-100 border-green-300 text-green-700 hover:bg-red-50 hover:border-red-300 hover:text-red-600'
                    : state === 'denied'
                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600'
            }`}
        >
            {state === 'loading' ? (
                <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
            ) : state === 'subscribed' ? (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zm0 16a2 2 0 01-1.732-1h3.464A2 2 0 0110 18z" />
                </svg>
            ) : (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
            )}
            {state === 'subscribed' ? 'Đang bật thông báo' : state === 'denied' ? 'Bị chặn' : 'Nhận thông báo KQ'}
        </button>
    );
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = window.atob(base64);
    const arr = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
    return arr.buffer;
}
