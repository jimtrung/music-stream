# Nền tảng Nghe Nhạc (Music Streaming)

*Đọc bằng [Tiếng Anh](README.md)*

Một nền tảng phát nhạc trực tuyến toàn diện được xây dựng bằng ASP.NET Core, React và Go.

## Kiến trúc

Dự án này được chia thành ba thành phần chính:
- **[Backend](./backend/README.vi.md)**: ASP.NET Core Web API cung cấp các endpoint RESTful, Chat thời gian thực qua SignalR, cơ sở dữ liệu PostgreSQL và MinIO để lưu trữ file.
- **[Frontend](./frontend/README.vi.md)**: Ứng dụng Single Page React 19 sử dụng Vite, quản lý state bằng Redux.
- **[Trình tạo dữ liệu giả (Mock)](./mock/README.vi.md)**: Công cụ bằng Go mạnh mẽ để tạo dữ liệu giả lập cho người dùng, nghệ sĩ và bài hát.

## Yêu cầu hệ thống

- .NET 10.0 SDK
- Node.js (v18+)
- Go (1.20+)
- PostgreSQL
- MinIO (Local hoặc Docker)

## Bắt đầu nhanh

1. **Backend**: Đi đến thư mục `backend/` và làm theo [Backend README](./backend/README.vi.md) để chạy migration và khởi động server.
2. **Frontend**: Đi đến thư mục `frontend/` và làm theo [Frontend README](./frontend/README.vi.md) để cài đặt thư viện và chạy server phát triển.
3. **Mock Data**: Sử dụng [công cụ Mock](./mock/README.vi.md) để tạo dữ liệu mẫu ban đầu vào database.
