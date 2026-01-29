# XSMB - Xổ Số Miền Bắc Website

Website xổ số miền Bắc chuyên nghiệp với tính năng cập nhật kết quả tự động, thống kê lô tô, dò vé số và quản trị nội dung.

## 🎯 Tính Năng Chính

### Người Dùng
- ✅ **Kết quả trực tiếp**: Hiển thị kết quả XSMB mới nhất với giao diện đẹp mắt
- ✅ Tra cứu kết quả theo ngày với date picker
- ✅ **Thống kê lô tô**: Phân tích tần suất đầu/đuôi với nhiều khoảng thời gian
- ✅ **Dò vé số online**: Kiểm tra vé trúng thưởng tự động
- ✅ **Quay thử số may mắn**: Tạo số ngẫu nhiên với hiệu ứng animation
- ✅ **Tin tức & Soi cầu**: Hệ thống quản lý bài viết với phân loại
- ✅ **In kết quả**: Chức năng in kết quả tiện lợi
- ✅ **Responsive**: Tối ưu cho mọi thiết bị

### Quản Trị Viên
- ✅ Nhập kết quả thủ công (dự phòng khi API lỗi)
- ✅ Quản lý bài viết (CRUD)
- ✅ Dashboard thống kê

### Tự Động Hóa
- ✅ **Cron Job**: Tự động lấy kết quả từ API lúc 18:15-18:35 hàng ngày
- ✅ Lưu trữ lịch sử kết quả
- ✅ Cache thống kê để tối ưu hiệu suất

## 🛠️ Tech Stack

- **Frontend**: Next.js 14+ với TypeScript
- **Styling**: Tailwind CSS (theme đỏ-trắng-xám)
- **Backend**: Next.js API Routes
- **Database**: MySQL với mysql2
- **Cron**: node-cron
- **Authentication**: JWT + bcrypt
- **Date Handling**: date-fns (hỗ trợ tiếng Việt)

## 📁 Cấu Trúc Thư Mục

```
vide_xoso01/
├── database/
│   └── schema.sql           # MySQL database schema
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── results/     # API lấy kết quả
│   │   │   │   └── stats/   # API thống kê
│   │   │   └── posts/       # API bài viết
│   │   ├── do-ve-so/        # Trang dò vé số
│   │   ├── ket-qua/         # Trang kết quả theo ngày
│   │   ├── quay-thu/        # Trang quay thử
│   │   ├── thong-ke/        # Trang thống kê
│   │   ├── tin-tuc/         # Trang tin tức
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Homepage
│   ├── components/
│   │   ├── Header.tsx       # Header navigation
│   │   ├── Footer.tsx       # Footer
│   │   └── ResultTable.tsx  # Lottery result table
│   ├── lib/
│   │   ├── db.ts            # MySQL connection
│   │   └── cron.ts          # Cron job logic
│   └── types/
│       └── index.ts         # TypeScript types
├── .env.local.example       # Environment variables template
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 🚀 Cài Đặt & Chạy

### 1. Cài đặt Dependencies

```bash
npm install
```

### 2. Cấu hình Database

Tạo database MySQL:

```bash
mysql -u root -p < database/schema.sql
```

Hoặc import thủ công file `database/schema.sql` vào MySQL.

### 3. Cấu hình Environment Variables

Copy file `.env.local.example` thành `.env.local`:

```bash
cp .env.local.example .env.local
```

Chỉnh sửa `.env.local` với thông tin của bạn:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=xsmb_lottery

# API (nếu có)
LOTTERY_API_URL=https://api-provider.com/xsmb
LOTTERY_API_KEY=your_api_key

# JWT Secret
JWT_SECRET=your_super_secret_key

# Cron Job
ENABLE_CRON=true
CRON_SCHEDULE=15,20,25,30,35 18 * * *
```

### 4. Chạy Development Server

```bash
npm run dev
```

Website sẽ chạy tại: `http://localhost:3000`

### 5. Build Production

```bash
npm run build
npm start
```

## 📊 Database Schema

### Bảng `xsmb_results`
Lưu trữ kết quả xổ số:
- `draw_date`: Ngày quay (UNIQUE)
- `special_prize`: Giải đặc biệt
- `prize_1` đến `prize_7`: Các giải từ nhất đến bảy (JSON array)

### Bảng `posts`
Quản lý tin tức/soi cầu:
- `title`, `slug`, `content`: Nội dung bài viết
- `category`: news, soi-cau, tips, analysis
- `status`: draft, published, archived

### Bảng `admins`
Quản lý tài khoản admin:
- `username`, `password_hash`
- `role`: super_admin, admin, editor

### Bảng `statistics_cache`
Cache thống kê để tối ưu hiệu suất

## 🔧 Tính Năng Kỹ Thuật

### Cron Job Tự Động
- Chạy vào 18:15, 18:20, 18:25, 18:30, 18:35 hàng ngày
- Tự động lấy kết quả từ API
- Fallback sang mock data nếu API không khả dụng
- Tự động insert/update database

### SEO Optimization
- Server-side rendering với Next.js
- Meta tags đầy đủ cho mọi trang
- Semantic HTML
- Fast page load

### Mobile-First Design
- Responsive breakpoints
- Touch-friendly interface
- Optimized for mobile viewing

## 🎨 Theme & Design

- **Màu chủ đạo**: Đỏ (#dc2626) - truyền thống xổ số Việt Nam
- **Màu phụ**: Trắng, Xám, Vàng gold
- **Font**: Inter (Google Fonts) với tiếng Việt
- **Animations**: Smooth transitions, rolling numbers effect

## 📝 Tài Khoản Admin Mặc Định

```
Username: admin
Password: admin123
```

**⚠️ Lưu ý**: Thay đổi mật khẩu ngay sau khi cài đặt!

## 🔐 Bảo Mật

- Password được hash với bcrypt (rounds=10)
- JWT cho authentication
- SQL injection prevention với prepared statements
- XSS protection với Next.js built-in
- HTTPS khuyến nghị cho production

## 📱 Trình Duyệt Hỗ Trợ

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Đóng Góp

Dự án này được phát triển cho mục đích học tập và thương mại.

## 📄 License

All rights reserved.

## ⚠️ Lưu Ý Quan Trọng

1. **API Configuration**: Nếu không có API thật, hệ thống sẽ tự động tạo dữ liệu giả để test
2. **Database**: Đảm bảo MySQL đang chạy trước khi start server
3. **Timezone**: Cron job sử dụng timezone `Asia/Ho_Chi_Minh`
4. **Trách nhiệm**: Website chỉ mang tính chất tham khảo, không chịu trách nhiệm cho các quyết định dựa trên thông tin hiển thị

## 🆘 Hỗ Trợ

Nếu gặp vấn đề, kiểm tra:
1. MySQL server đang chạy
2. File `.env.local` đã được cấu hình đúng
3. Dependencies đã được cài đặt đầy đủ
4. Port 3000 không bị conflict

---

**Phát triển bởi**: Senior Full-stack Developer Team
**Version**: 1.0.0
**Ngày cập nhật**: 2026-01-08
