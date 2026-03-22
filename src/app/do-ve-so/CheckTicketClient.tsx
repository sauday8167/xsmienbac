'use client';

import { useState } from 'react';
import type { LotteryResult } from '@/types';

export default function CheckTicketClient() {
    const [ticketNumber, setTicketNumber] = useState('');
    const [result, setResult] = useState<LotteryResult | null>(null);
    const [checkResult, setCheckResult] = useState<{
        matched: boolean;
        prize: string | null;
        matchedNumber: string;
    } | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');

    const handleCheck = async () => {
        if (!ticketNumber || ticketNumber.length < 2) {
            alert('Vui lòng nhập số vé hợp lệ (ít nhất 2 chữ số)');
            return;
        }

        try {
            setLoading(true);
            setCheckResult(null);

            const url = selectedDate ? `/api/results?date=${selectedDate}` : '/api/results?limit=1';
            const response = await fetch(url);
            const data = await response.json();

            if (data.success && data.data) {
                const resultData = Array.isArray(data.data) ? data.data[0] : data.data;
                setResult(resultData);
                const matchResult = checkTicketMatches(ticketNumber, resultData);
                setCheckResult(matchResult);
            } else {
                alert('Không tìm thấy kết quả xổ số');
            }
        } catch (error) {
            console.error('Error checking ticket:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkTicketMatches = (ticket: string, resultData: LotteryResult) => {
        const ticketLast2 = ticket.slice(-2);
        const ticketLast3 = ticket.length >= 3 ? ticket.slice(-3) : '';
        const ticketLast4 = ticket.length >= 4 ? ticket.slice(-4) : '';
        const ticketLast5 = ticket.length >= 5 ? ticket.slice(-5) : '';

        if (ticketLast5 === resultData.special_prize) return { matched: true, prize: 'Giải đặc biệt', matchedNumber: resultData.special_prize };
        if (ticketLast5 === resultData.prize_1) return { matched: true, prize: 'Giải nhất', matchedNumber: resultData.prize_1 };
        for (const num of resultData.prize_2 || []) if (ticketLast5 === num) return { matched: true, prize: 'Giải nhì', matchedNumber: num };
        for (const num of resultData.prize_3 || []) if (ticketLast5 === num) return { matched: true, prize: 'Giải ba', matchedNumber: num };
        for (const num of resultData.prize_4 || []) if (ticketLast4 === num) return { matched: true, prize: 'Giải tư', matchedNumber: num };
        for (const num of resultData.prize_5 || []) if (ticketLast4 === num) return { matched: true, prize: 'Giải năm', matchedNumber: num };
        for (const num of resultData.prize_6 || []) if (ticketLast3 === num) return { matched: true, prize: 'Giải sáu', matchedNumber: num };
        for (const num of resultData.prize_7 || []) if (ticketLast2 === num) return { matched: true, prize: 'Giải bảy', matchedNumber: num };

        return { matched: false, prize: null, matchedNumber: '' };
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-lottery-gray-800 mb-2">Dò Vé Số Online</h1>
                <p className="text-lottery-gray-600">Kiểm tra vé số trúng thưởng nhanh chóng</p>
                <div className="w-24 h-1 bg-lottery-red-600 mx-auto rounded-full mt-4"></div>
            </div>

            <div className="card">
                <h2 className="text-xl font-bold text-lottery-gray-800 mb-4">Nhập thông tin vé số</h2>
                <div className="space-y-4">
                    <input type="text" value={ticketNumber} onChange={(e) => setTicketNumber(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Ví dụ: 12345" className="input text-2xl font-bold text-center tracking-wider" maxLength={6} />
                    <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="input" />
                    <button onClick={handleCheck} disabled={loading || !ticketNumber} className="btn btn-primary w-full text-lg">
                        {loading ? 'Đang kiểm tra...' : 'Kiểm tra vé số'}
                    </button>
                </div>
            </div>

            {checkResult && (
                <div className={`card ${checkResult.matched ? 'bg-green-50 border-2 border-green-500' : 'bg-lottery-gray-50'}`}>
                    <div className="text-center">
                        {checkResult.matched ? (
                            <h3 className="text-3xl font-bold text-green-700">🎉 Chúc mừng! Vé trúng {checkResult.prize}! 🎉</h3>
                        ) : (
                            <h3 className="text-2xl font-bold text-lottery-gray-700">Vé không trúng thưởng</h3>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
