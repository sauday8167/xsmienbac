import { NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const DATA_DIR = join(process.cwd(), 'src/data');
const FILE_PATH = join(DATA_DIR, 'footer-config.json');

const DEFAULT_CONFIG = {
    about: {
        title: "Về XSMB",
        content: "Website cung cấp kết quả xổ số miền Bắc trực tiếp, nhanh chóng và chính xác nhất. Cập nhật tự động lúc 18:15 hàng ngày."
    },
    socials: { facebook: "", youtube: "", telegram: "", zalo: "" },
    contact: { email: "", phone: "", address: "" },
    quickLinks: {
        title: "Liên kết nhanh",
        links: [
            { label: "Trang chủ", href: "/" },
            { label: "Kết quả theo ngày", href: "/ket-qua-theo-ngay" },
            { label: "Thống kê", href: "/thong-ke" },
            { label: "Tin tức / Soi cầu", href: "/tin-tuc" }
        ]
    },
    disclaimer: {
        title: "Lưu ý",
        content: "Thông tin chỉ mang tính chất tham khảo. Vui lòng đối chiếu với kết quả chính thức từ công ty xổ số.",
        highlight: "Chơi có trách nhiệm - Cảnh giác trò chơi may rủi!"
    },
    copyright: "© 2024 XSMB - Xổ Số Miền Bắc. All rights reserved."
};

async function ensureFile() {
    if (!existsSync(DATA_DIR)) {
        await mkdir(DATA_DIR, { recursive: true });
    }
    if (!existsSync(FILE_PATH)) {
        await writeFile(FILE_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2));
    }
}

export async function GET() {
    await ensureFile();
    try {
        const data = await readFile(FILE_PATH, 'utf8');
        return NextResponse.json({ success: true, data: JSON.parse(data) });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Lỗi khi tải cấu hình footer' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    await ensureFile();
    try {
        const body = await request.json();
        await writeFile(FILE_PATH, JSON.stringify(body, null, 2));
        return NextResponse.json({ success: true, message: 'Lưu cấu hình footer thành công', data: body });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Lỗi khi lưu cấu hình footer' }, { status: 500 });
    }
}
