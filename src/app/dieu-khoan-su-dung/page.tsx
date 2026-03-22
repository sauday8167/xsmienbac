import React from 'react';

export const metadata = {
    title: 'Điều Khoản Sử Dụng - Xổ Số Miền Bắc 24h',
    description: 'Các điều khoản sử dụng khi truy cập website Xổ Số Miền Bắc 24h.',
    alternates: {
        canonical: 'https://xosomienbac24h.com/dieu-khoan-su-dung',
    },
};

export default function TermsPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl text-gray-800">
            <h1 className="text-2xl md:text-3xl font-bold text-red-700 mb-6 border-b pb-2">
                Điều Khoản Sử Dụng
            </h1>

            <div className="prose prose-lg max-w-none text-justify">
                <p className="mb-4">
                    Bằng việc truy cập vào <strong>Xổ Số Miền Bắc 24h</strong>, bạn đồng ý tuân thủ các Điều Khoản Sử Dụng sau đây. Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng ngừng sử dụng website.
                </p>

                <h3 className="text-xl font-bold mt-6 mb-2">1. Quyền Sở Hữu Trí Tuệ</h3>
                <p className="mb-4">
                    Mọi nội dung trên website bao gồm văn bản, hình ảnh, mã nguồn, thuật toán thống kê đều thuộc quyền sở hữu của Xổ Số Miền Bắc 24h hoặc các bên cấp phép. Nghiêm cấm sao chép, tái bản hoặc sử dụng cho mục đích thương mại mà không có sự đồng ý bằng văn bản.
                </p>

                <h3 className="text-xl font-bold mt-6 mb-2">2. Trách Nhiệm Người Dùng</h3>
                <p className="mb-4">
                    Khi sử dụng website, bạn cam kết:
                </p>
                <ul className="list-disc pl-6 mb-4">
                    <li>Không sử dụng website vào mục đích vi phạm pháp luật, đặc biệt là các hành vi đánh bạc trái phép.</li>
                    <li>Không tấn công, phá hoại hoặc làm gián đoạn hoạt động của website.</li>
                    <li>Không sử dụng tool/bot để cào dữ liệu (crawler) với tần suất lớn gây ảnh hưởng đến hệ thống.</li>
                </ul>

                <h3 className="text-xl font-bold mt-6 mb-2">3. Giới Hạn Trách Nhiệm</h3>
                <p className="mb-4">
                    Chúng tôi không chịu trách nhiệm về bất kỳ tổn thất trực tiếp hoặc gián tiếp nào phát sinh từ việc sử dụng hoặc không thể sử dụng website này. Mọi quyết định dựa trên thông tin từ website là hoàn toàn thuộc về trách nhiệm của người dùng.
                </p>
            </div>
        </div>
    );
}
