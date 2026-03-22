import React from 'react';

export const metadata = {
    title: 'Chính Sách Bảo Mật - Xổ Số Miền Bắc 24h',
    description: 'Cam kết bảo mật thông tin người dùng tại Xổ Số Miền Bắc 24h.',
    alternates: {
        canonical: 'https://xosomienbac24h.com/chinh-sach-bao-mat',
    },
};

export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl text-gray-800">
            <h1 className="text-2xl md:text-3xl font-bold text-red-700 mb-6 border-b pb-2">
                Chính Sách Bảo Mật
            </h1>

            <div className="prose prose-lg max-w-none text-justify">
                <p className="mb-4">
                    <strong>Xổ Số Miền Bắc 24h</strong> coi trọng sự riêng tư của khách hàng. Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn.
                </p>

                <h3 className="text-xl font-bold mt-6 mb-2">1. Thu Thập Thông Tin</h3>
                <p className="mb-4">
                    Chúng tôi không yêu cầu người dùng đăng ký tài khoản để xem kết quả xổ số. Tuy nhiên, chúng tôi có thể thu thập các thông tin ẩn danh như:
                </p>
                <ul className="list-disc pl-6 mb-4">
                    <li>Địa chỉ IP, loại trình duyệt, thời gian truy cập.</li>
                    <li>Dữ liệu Cookie để cải thiện trải nghiệm người dùng và thống kê lưu lượng truy cập (thông qua Google Analytics).</li>
                </ul>

                <h3 className="text-xl font-bold mt-6 mb-2">2. Sử Dụng Thông Tin</h3>
                <p className="mb-4">
                    Thông tin thu thập được sử dụng để:
                </p>
                <ul className="list-disc pl-6 mb-4">
                    <li>Duy trì và cải thiện chất lượng dịch vụ website.</li>
                    <li>Phân tích xu hướng người dùng để tối ưu hóa nội dung.</li>
                    <li>Hiển thị quảng cáo phù hợp (nếu có).</li>
                </ul>

                <h3 className="text-xl font-bold mt-6 mb-2">3. Chia Sẻ Thông Tin</h3>
                <p className="mb-4">
                    Chúng tôi cam kết <strong>không bán, trao đổi hoặc chuyển giao</strong> thông tin cá nhân của người dùng cho bên thứ ba, trừ khi có yêu cầu từ cơ quan pháp luật có thẩm quyền.
                </p>

                <h3 className="text-xl font-bold mt-6 mb-2">4. Cookie</h3>
                <p className="mb-4">
                    Website sử dụng Cookie để ghi nhớ các tùy chọn của bạn (ví dụ: tỉnh thành yêu thích). Bạn có thể tắt Cookie trong cài đặt trình duyệt, nhưng điều này có thể ảnh hưởng đến trải nghiệm sử dụng website.
                </p>
            </div>
        </div>
    );
}
