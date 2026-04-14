
'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Bell, BellOff, Info } from 'lucide-react';

export default function NotificationManager() {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [lastNotifiedDate, setLastNotifiedDate] = useState<string | null>(null);

    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }

        // Check every 30 seconds
        const timer = setInterval(checkTimeAndNotify, 30000);
        return () => clearInterval(timer);
    }, [lastNotifiedDate]);

    const requestPermission = async () => {
        if (!('Notification' in window)) {
            toast.error('Trình duyệt của bạn không hỗ trợ thông báo đẩy.');
            return;
        }

        const result = await Notification.requestPermission();
        setPermission(result);
        
        if (result === 'granted') {
            toast.success('Tuyệt vời! Bạn sẽ nhận được thông báo khi có kết quả XSMB.');
            // Send a test notification
            new Notification('XSMB 24h', {
                body: 'Thông báo đã được kích hoạt thành công!',
                icon: '/favicon.png'
            });
        }
    };

    const checkTimeAndNotify = () => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const today = now.toISOString().split('T')[0];

        // Result time: 18:30 to 18:45
        if (hours === 18 && minutes >= 30 && minutes <= 45 && lastNotifiedDate !== today) {
            if (permission === 'granted') {
                sendResultNotification();
                setLastNotifiedDate(today);
            } else if (permission === 'default') {
                // Show a toast reminder to enable notifications
                toast('Kết quả XSMB đang được quay! Bật thông báo để không bỏ lỡ.', {
                    icon: '🔔',
                    duration: 10000
                });
            }
        }
    };

    const sendResultNotification = () => {
        const n = new Notification('Đã có kết quả XSMB!', {
            body: 'Nhấn vào đây để xem kết quả giải Đặc biệt và bộ số may mắn ngay hôm nay.',
            icon: '/favicon.png',
            tag: 'xsmb-result'
        });

        n.onclick = () => {
            window.focus();
            window.location.href = '/';
        };
    };

    // Don't show anything if permission is already granted, 
    // or show a small floating button to enable if not.
    if (permission === 'granted') return null;

    return (
        <div className="fixed bottom-20 right-4 z-[100] md:bottom-8">
            <div className="group relative">
                <button
                    onClick={requestPermission}
                    className="flex items-center justify-center w-12 h-12 bg-white text-lottery-red-600 rounded-full shadow-2xl border border-red-100 hover:bg-lottery-red-50 transition-all animate-bounce"
                    title="Bật thông báo kết quả"
                >
                    <Bell className="w-6 h-6" />
                </button>
                
                <div className="absolute bottom-full right-0 mb-4 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none md:pointer-events-auto">
                    <div className="flex items-start gap-3">
                        <div className="bg-red-100 p-2 rounded-lg text-red-600 flex-shrink-0">
                            <Info className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800 mb-1">Đừng bỏ lỡ kết quả!</p>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Nhấp vào chuông để nhận thông báo trực tiếp khi có kết quả quay thưởng lúc 18h30.
                            </p>
                            <button 
                                onClick={(e) => { e.stopPropagation(); requestPermission(); }}
                                className="mt-3 text-xs font-black text-lottery-red-600 hover:underline"
                            >
                                KÍCH HOẠT NGAY →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
