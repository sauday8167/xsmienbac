import React from 'react';

export const metadata = {
    title: 'Miễn Trừ Trách Nhiệm - Xổ Số Miền Bắc 24h',
    description: 'Thông tin miễn trừ trách nhiệm về kết quả xổ số và dịch vụ tại Xổ Số Miền Bắc 24h.',
    alternates: {
        canonical: 'https://xosomienbac24h.com/mien-tru-trach-nhiem',
    },
};

export default function DisclaimerPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl text-gray-800">
            <h1 className="text-2xl md:text-3xl font-bold text-red-700 mb-6 border-b pb-2">
                Miễn Trừ Trách Nhiệm
            </h1>

            <div className="prose prose-lg max-w-none text-justify">
                <p className="mb-4">
                    Chào mừng bạn đến với <strong>Xổ Số Miền Bắc 24h</strong>. Khi truy cập và sử dụng website này, bạn đồng ý với các điều khoản miễn trừ trách nhiệm dưới đây:
                </p>

                <h3 className="text-xl font-bold mt-6 mb-2">1. Tính Chính Xác Của Thông Tin</h3>
                <p className="mb-4">
                    Website cam kết nỗ lực hết sức để cung cấp kết quả xổ số trực tiếp và các dữ liệu thống kê một cách nhanh chóng và chính xác nhất từ trường quay. Tuy nhiên, do yếu tố kỹ thuật hoặc đường truyền, sai sót có thể xảy ra.
                </p>
                <p className="mb-4">
                    Chúng tôi khuyến nghị người chơi luôn <strong>đối chiếu lại với biên bản kết quả chính thức</strong> từ Hội đồng Xổ số Kiến thiết (hoặc đại lý vé số) trước khi thực hiện các thủ tục lĩnh thưởng hoặc tiêu hủy vé. Chúng tôi không chịu trách nhiệm cho bất kỳ thiệt hại nào phát sinh từ việc sử dụng thông tin trên website này.
                </p>

                <h3 className="text-xl font-bold mt-6 mb-2">2. Mục Đích Sử Dụng</h3>
                <p className="mb-4">
                    Toàn bộ thông tin, thống kê, phân tích và dự đoán trên website chỉ mang tính chất <strong>tham khảo</strong>. Chúng tôi không cổ súy, khuyến khích hay chịu trách nhiệm về việc sử dụng các thông tin này vào mục đích cá cược bất hợp pháp (lô đề).
                </p>
                <p className="mb-4 font-semibold text-red-600">
                    Chơi xổ số kiến thiết là "Ích Nước - Lợi Nhà". Chúng tôi kêu gọi người dùng chỉ tham gia mua vé số do Nhà nước phát hành.
                </p>

                <h3 className="text-xl font-bold mt-6 mb-2">3. Liên Kết Bên Thứ Ba</h3>
                <p className="mb-4">
                    Website có thể chứa các liên kết đến các trang web khác. Chúng tôi không kiểm soát và không chịu trách nhiệm về nội dung, chính sách bảo mật hoặc hoạt động của các trang web bên thứ ba này.
                </p>

                <h3 className="text-xl font-bold mt-6 mb-2">4. Thay Đổi Nội Dung</h3>
                <p className="mb-4">
                    Chúng tôi có quyền thay đổi, chỉnh sửa hoặc xóa bỏ bất kỳ nội dung nào trên website vào bất kỳ lúc nào mà không cần báo trước.
                </p>
            </div>
        </div>
    );
}
