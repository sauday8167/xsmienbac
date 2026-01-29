interface LiveResultHeaderProps {
    isLive: boolean;
    date: string;
}

export default function LiveResultHeader({ isLive, date }: LiveResultHeaderProps) {
    // Calculate target date (Next draw if not live)
    const targetDate = new Date(date);
    if (!isLive) {
        targetDate.setDate(targetDate.getDate() + 1);
    }

    // Format Date: "Thứ ..., dd/mm/yyyy"
    const dateStr = targetDate.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    // Capitalize first letter of Weekday
    const formattedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

    return (
        <div className="bg-[#0f172a] p-4 md:p-6 text-center text-white rounded-2xl shadow-xl overflow-hidden border border-slate-800 mb-6 relative">
            {/* Live Indicator (Only if live) */}
            {isLive && (
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full animate-pulse shadow-lg shadow-red-500/50">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">LIVE</span>
                </div>
            )}

            {/* Main Title */}
            <h1 className="text-2xl md:text-3xl font-black mb-2 tracking-tighter uppercase text-white drop-shadow-md">
                KẾT QUẢ XỔ SỐ MIỀN BẮC
            </h1>

            {/* Subtitle with Date */}
            <p className="text-slate-400 font-medium text-sm md:text-base mb-1">
                Kỳ quay ngày: <span className="text-white font-semibold">{formattedDate}</span>
            </p>
        </div>
    );
}
