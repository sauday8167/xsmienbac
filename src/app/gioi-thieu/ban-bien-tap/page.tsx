import JsonLd from '@/components/seo/JsonLd';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Ban Biên Tập & Chuyên Gia - XSMB 24h',
    description: 'Đội ngũ chuyên gia soi cầu, phân tích toán học và biên tập viên giàu kinh nghiệm tại XSMB 24h. Cam kết mang đến thông tin chính xác và chuyên sâu nhất.',
    alternates: {
        canonical: 'https://xosomienbac24h.com/gioi-thieu/ban-bien-tap',
    },
    openGraph: {
        title: 'Ban Biên Tập & Chuyên Gia - XSMB 24h',
        description: 'Đội ngũ chuyên gia soi cầu, phân tích toán học và biên tập viên giàu kinh nghiệm tại XSMB 24h.',
        url: 'https://xosomienbac24h.com/gioi-thieu/ban-bien-tap',
    }
};

export default function EditorialBoardPage() {
    // Schema for AboutPage and Person (Experts)
    const schema = {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "mainEntity": {
            "@type": "Organization",
            "name": "XSMB 24h Editorial Board",
            "member": [
                {
                    "@type": "Person",
                    "name": "Nguyên Phong",
                    "jobTitle": "Chuyên Gia Soi Cầu",
                    "description": "10 năm kinh nghiệm phân tích xổ số kiến thiết miền Bắc. Sáng lập phương pháp Bạc Nhớ 24h.",
                    "image": "https://xosomienbac24h.com/experts/nguyen-phong.jpg"
                },
                {
                    "@type": "Person",
                    "name": "Tiến Sĩ Toán Học Lê Minh",
                    "jobTitle": "Cố Vấn Thuật Toán",
                    "description": "Tiến sĩ Toán Thống Kê, chịu trách nhiệm xây dựng thuật toán dự đoán AI và loại bỏ sai số.",
                    "image": "https://xosomienbac24h.com/experts/le-minh.jpg"
                }
            ]
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <JsonLd data={schema} />

            <div className="max-w-4xl mx-auto">
                <nav className="text-sm text-gray-500 mb-6">
                    <Link href="/" className="hover:text-red-600">Trang chủ</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900">Ban Biên Tập</span>
                </nav>

                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Ban Biên Tập & Chuyên Gia
                    </h1>
                    <div className="w-24 h-1 bg-red-600 mx-auto rounded-full"></div>
                    <p className="mt-4 text-gray-600 text-lg">
                        Đội ngũ đằng sau sự chính xác và uy tín của XSMB 24h
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* Expert 1 */}
                    <div className="card hover:shadow-lg transition-shadow border-t-4 border-red-600">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-32 h-32 rounded-full bg-gray-200 mb-4 overflow-hidden border-4 border-white shadow-md relative">
                                <span className="absolute inset-0 flex items-center justify-center text-4xl">👨‍💻</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Nguyên Phong</h3>
                            <p className="text-red-600 font-medium mb-3">Chuyên Gia Soi Cầu</p>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                "Xổ số không chỉ là may mắn, đó là khoa học của xác suất. Với 10 năm nghiên cứu, tôi cam kết mang đến những nhận định khách quan và bộ số được sàng lọc kỹ càng nhất cho cộng đồng."
                            </p>
                        </div>
                    </div>

                    {/* Expert 2 */}
                    <div className="card hover:shadow-lg transition-shadow border-t-4 border-blue-600">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-32 h-32 rounded-full bg-gray-200 mb-4 overflow-hidden border-4 border-white shadow-md relative">
                                <span className="absolute inset-0 flex items-center justify-center text-4xl">🎓</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">TS. Lê Minh</h3>
                            <p className="text-blue-600 font-medium mb-3">Cố Vấn Thuật Toán</p>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                "Nhiệm vụ của tôi là biến những con số vô tri thành dữ liệu biết nói. Hệ thống AI của XSMB 24h được xây dựng trên nền tảng Big Data và Machine Learning tiên tiến nhất hiện nay."
                            </p>
                        </div>
                    </div>
                </div>

                {/* Mission Statement */}
                <div className="bg-gray-50 rounded-2xl p-8 mb-12">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Sứ Mệnh & Trách Nhiệm</h3>
                    <div className="space-y-4 text-gray-700 leading-relaxed text-justify">
                        <p>
                            <strong>Tính Chính Xác:</strong> Mọi thông tin đăng tải trên website đều trải qua quy trình kiểm duyệt 2 lớp: Đối chiếu dữ liệu gốc từ trường quay và Phân tích lại bởi chuyên gia.
                        </p>
                        <p>
                            <strong>Tính Minh Bạch:</strong> Chúng tôi hoạt động độc lập, không chịu sự chi phối của bất kỳ tổ chức cá cược nào. Mục tiêu duy nhất là cung cấp thông tin hữu ích cho người chơi xổ số kiến thiết.
                        </p>
                        <p>
                            <strong>Trách Nhiệm Xã Hội:</strong> XSMB 24h luôn khuyến cáo người dùng tham gia giải trí lành mạnh, tuân thủ pháp luật và chơi xổ số "Ích nước Lợi nhà".
                        </p>
                    </div>
                </div>

                {/* Editorial Criteria */}
                <section>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Quy Trình Biên Tập</h3>
                    <ol className="relative border-l border-gray-200 ml-3 space-y-8">
                        <li className="mb-10 ml-6">
                            <span className="absolute flex items-center justify-center w-8 h-8 bg-red-100 rounded-full -left-4 ring-4 ring-white">
                                1
                            </span>
                            <h4 className="flex items-center mb-1 text-lg font-semibold text-gray-900">Thu Thập Dữ Liệu</h4>
                            <p className="text-gray-500 text-sm">Kết nối trực tiếp API từ trường quay số để đảm bảo tốc độ và độ chính xác.</p>
                        </li>
                        <li className="mb-10 ml-6">
                            <span className="absolute flex items-center justify-center w-8 h-8 bg-red-100 rounded-full -left-4 ring-4 ring-white">
                                2
                            </span>
                            <h4 className="flex items-center mb-1 text-lg font-semibold text-gray-900">Phân Tích Chuyên Sâu</h4>
                            <p className="text-gray-500 text-sm">Chạy thuật toán và họp bàn chuyên gia để đưa ra nhận định xu hướng.</p>
                        </li>
                        <li className="mb-10 ml-6">
                            <span className="absolute flex items-center justify-center w-8 h-8 bg-red-100 rounded-full -left-4 ring-4 ring-white">
                                3
                            </span>
                            <h4 className="flex items-center mb-1 text-lg font-semibold text-gray-900">Kiểm Duyệt Nội Dung</h4>
                            <p className="text-gray-500 text-sm">Rà soát lỗi văn bản, đảm bảo ngôn từ trung lập, khách quan trước khi xuất bản.</p>
                        </li>
                    </ol>
                </section>
            </div>
        </div>
    );
}
