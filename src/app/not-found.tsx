import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: '404 - Không tìm thấy trang | XSMB 24h',
    description: 'Trang bạn tìm kiếm không tồn tại hoặc đã bị xóa.',
};

export default function NotFound() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
            <h1 className="text-9xl font-black text-gray-200">404</h1>

            <div className="-mt-12 mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                    Ối! Trang này không tồn tại
                </h2>
                <p className="text-gray-600">
                    Đường dẫn bạn truy cập có thể bị sai hoặc nội dung đã được di chuyển.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <Link
                    href="/"
                    className="px-6 py-3 bg-lottery-red-600 text-white font-bold rounded-lg hover:bg-lottery-red-700 transition-colors shadow-lg shadow-lottery-red-200"
                >
                    Về Trang Chủ
                </Link>
                <Link
                    href="/tin-tuc"
                    className="px-6 py-3 bg-white text-gray-700 font-bold border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Xem Tin Tức Mới
                </Link>
            </div>

            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
                <Link href="/soi-cau-bac-nho" className="p-4 bg-blue-50 rounded-xl text-blue-700 font-medium hover:bg-blue-100 transition-colors">
                    Soi Cầu
                </Link>
                <Link href="/thong-ke" className="p-4 bg-green-50 rounded-xl text-green-700 font-medium hover:bg-green-100 transition-colors">
                    Thống Kê
                </Link>
                <Link href="/quay-thu" className="p-4 bg-purple-50 rounded-xl text-purple-700 font-medium hover:bg-purple-100 transition-colors">
                    Quay Thử
                </Link>
                <Link href="/do-ve-so" className="p-4 bg-orange-50 rounded-xl text-orange-700 font-medium hover:bg-orange-100 transition-colors">
                    Dò Vé Số
                </Link>
            </div>
        </div>
    );
}
