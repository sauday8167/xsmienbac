import React from 'react';

export const metadata = {
    title: 'Liên Hệ - Xổ Số Miền Bắc 24h',
    description: 'Thông tin liên hệ Ban quản trị Xổ Số Miền Bắc 24h.',
};

export default function ContactPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl text-gray-800">
            <h1 className="text-2xl md:text-3xl font-bold text-red-700 mb-6 border-b pb-2">
                Liên Hệ
            </h1>

            <div className="bg-white shadow-lg rounded-xl p-6 md:p-8 space-y-6">
                <p className="text-lg">
                    Mọi ý kiến đóng góp, báo lỗi hoặc thắc mắc về quảng cáo, xin vui lòng liên hệ với chúng tôi qua các kênh sau:
                </p>

                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                        <span className="text-3xl">📧</span>
                        <div>
                            <h3 className="font-bold">Email</h3>
                            <a href="mailto:contact@xosomienbac24h.com" className="text-blue-600 hover:underline">contact@xosomienbac24h.com</a>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                        <span className="text-3xl">🌐</span>
                        <div>
                            <h3 className="font-bold">Website</h3>
                            <a href="https://xosomienbac24h.com" className="text-blue-600 hover:underline">https://xosomienbac24h.com</a>
                        </div>
                    </div>
                </div>

                <div className="mt-8 border-t pt-6">
                    <h3 className="font-bold mb-4">Gửi tin nhắn trực tiếp:</h3>
                    {/* Simple Form Placeholder - Non-functional for now */}
                    <form className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder="Họ tên của bạn" className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-red-500" />
                            <input type="email" placeholder="Email của bạn" className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-red-500" />
                        </div>
                        <textarea rows={5} placeholder="Nội dung tin nhắn..." className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-red-500"></textarea>
                        <button type="button" className="bg-red-600 text-white px-6 py-3 rounded font-bold hover:bg-red-700 transition-colors pointer-events-none opacity-60">
                            Gửi Liên Hệ (Đang bảo trì)
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
