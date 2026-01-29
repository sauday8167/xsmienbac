'use client';

import { useState } from 'react';
import type { LotteryResult } from '@/types';

export default function CheckTicketPage() {
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

            // Fetch latest result or result by date
            const url = selectedDate
                ? `/api/results?date=${selectedDate}`
                : '/api/results?limit=1';

            const response = await fetch(url);
            const data = await response.json();

            if (data.success && data.data) {
                const resultData = Array.isArray(data.data) ? data.data[0] : data.data;
                setResult(resultData);

                // Check if ticket matches any prize
                const matchResult = checkTicketMatches(ticketNumber, resultData);
                setCheckResult(matchResult);
            } else {
                alert('Không tìm thấy kết quả xổ số');
            }
        } catch (error) {
            console.error('Error checking ticket:', error);
            alert('Lỗi khi kiểm tra vé số');
        } finally {
            setLoading(false);
        }
    };

    const checkTicketMatches = (ticket: string, resultData: LotteryResult) => {
        const ticketLast2 = ticket.slice(-2);
        const ticketLast3 = ticket.length >= 3 ? ticket.slice(-3) : '';
        const ticketLast4 = ticket.length >= 4 ? ticket.slice(-4) : '';
        const ticketLast5 = ticket.length >= 5 ? ticket.slice(-5) : '';

        // Check special prize (match last 5 digits)
        if (ticketLast5 === resultData.special_prize) {
            return { matched: true, prize: 'Giải đặc biệt', matchedNumber: resultData.special_prize };
        }

        // Check first prize
        if (ticketLast5 === resultData.prize_1) {
            return { matched: true, prize: 'Giải nhất', matchedNumber: resultData.prize_1 };
        }

        // Check prize 2
        for (const num of resultData.prize_2 || []) {
            if (ticketLast5 === num) {
                return { matched: true, prize: 'Giải nhì', matchedNumber: num };
            }
        }

        // Check prize 3
        for (const num of resultData.prize_3 || []) {
            if (ticketLast5 === num) {
                return { matched: true, prize: 'Giải ba', matchedNumber: num };
            }
        }

        // Check prize 4
        for (const num of resultData.prize_4 || []) {
            if (ticketLast4 === num) {
                return { matched: true, prize: 'Giải tư', matchedNumber: num };
            }
        }

        // Check prize 5
        for (const num of resultData.prize_5 || []) {
            if (ticketLast4 === num) {
                return { matched: true, prize: 'Giải năm', matchedNumber: num };
            }
        }

        // Check prize 6
        for (const num of resultData.prize_6 || []) {
            if (ticketLast3 === num) {
                return { matched: true, prize: 'Giải sáu', matchedNumber: num };
            }
        }

        // Check prize 7
        for (const num of resultData.prize_7 || []) {
            if (ticketLast2 === num) {
                return { matched: true, prize: 'Giải bảy', matchedNumber: num };
            }
        }

        return { matched: false, prize: null, matchedNumber: '' };
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-lottery-gray-800 mb-2">
                    Dò Vé Số Online
                </h1>
                <p className="text-lottery-gray-600">Kiểm tra vé số trúng thưởng nhanh chóng</p>
                <div className="w-24 h-1 bg-lottery-red-600 mx-auto rounded-full mt-4"></div>
            </div>

            {/* Input Form */}
            <div className="card">
                <h2 className="text-xl font-bold text-lottery-gray-800 mb-4">
                    Nhập thông tin vé số
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-lottery-gray-700 mb-2">
                            Số vé (nhập 2-6 chữ số cuối):
                        </label>
                        <input
                            type="text"
                            value={ticketNumber}
                            onChange={(e) => setTicketNumber(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="Ví dụ: 12345"
                            className="input text-2xl font-bold text-center tracking-wider"
                            maxLength={6}
                        />
                        <p className="text-xs text-lottery-gray-500 mt-1">
                            Nhập từ 2 đến 6 chữ số cuối trên vé số của bạn
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-lottery-gray-700 mb-2">
                            Ngày quay (để trống để kiểm tra kết quả mới nhất):
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className="input"
                        />
                    </div>

                    <button
                        onClick={handleCheck}
                        disabled={loading || !ticketNumber}
                        className="btn btn-primary w-full text-lg"
                    >
                        {loading ? (
                            <>
                                <div className="spinner w-5 h-5 border-2 mr-2"></div>
                                Đang kiểm tra...
                            </>
                        ) : (
                            <>
                                <svg className="w-6 h-6 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Kiểm tra vé số
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Check Result */}
            {checkResult && (
                <div className={`card ${checkResult.matched ? 'bg-green-50 border-2 border-green-500' : 'bg-lottery-gray-50'}`}>
                    <div className="text-center">
                        {checkResult.matched ? (
                            <>
                                <div className="mb-4">
                                    <svg className="w-20 h-20 text-green-600 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <h3 className="text-3xl font-bold text-green-700 mb-2">
                                    🎉 Chúc mừng! Vé trúng thưởng! 🎉
                                </h3>
                                <p className="text-xl text-green-600 mb-4">
                                    <strong>{checkResult.prize}</strong>
                                </p>
                                <div className="bg-white rounded-lg p-4 inline-block">
                                    <p className="text-sm text-lottery-gray-600 mb-1">Số trúng</p>
                                    <p className="text-4xl font-bold text-lottery-red-600">
                                        {checkResult.matchedNumber}
                                    </p>
                                </div>
                                <p className="text-sm text-green-700 mt-4">
                                    Vui lòng mang vé số đến điểm bán để nhận thưởng
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="mb-4">
                                    <svg className="w-20 h-20 text-lottery-gray-400 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-lottery-gray-700 mb-2">
                                    Vé không trúng thưởng
                                </h3>
                                <p className="text-lottery-gray-600">
                                    Số <strong className="text-xl">{ticketNumber}</strong> không khớp với bất kỳ giải nào
                                </p>
                                <p className="text-sm text-lottery-gray-500 mt-3">
                                    Chúc bạn may mắn lần sau!
                                </p>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="card bg-blue-50 border-l-4 border-blue-500">
                <h3 className="font-bold text-blue-900 mb-3">Hướng dẫn dò vé:</h3>
                <ol className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start">
                        <span className="font-bold mr-2">1.</span>
                        <span>Nhập 2-6 chữ số cuối trên vé số của bạn vào ô nhập liệu</span>
                    </li>
                    <li className="flex items-start">
                        <span className="font-bold mr-2">2.</span>
                        <span>Chọn ngày quay nếu muốn kiểm tra kết quả quá khứ (hoặc để trống để kiểm tra kết quả mới nhất)</span>
                    </li>
                    <li className="flex items-start">
                        <span className="font-bold mr-2">3.</span>
                        <span>Nhấn nút "Kiểm tra vé số" để xem kết quả</span>
                    </li>
                    <li className="flex items-start">
                        <span className="font-bold mr-2">4.</span>
                        <span>Hệ thống sẽ tự động so sánh số của bạn với tất cả các giải thưởng</span>
                    </li>
                </ol>
                <p className="text-xs text-blue-700 mt-4 font-semibold">
                    * Lưu ý: Kết quả chỉ mang tính chất tham khảo. Vui lòng đối chiếu trực tiếp với vé số để chắc chắn.
                </p>
            </div>
        </div>
    );
}
