# Backend - Music Streaming

*Đọc bằng [Tiếng Anh](README.md)*

Đây là dịch vụ backend cho nền tảng phát nhạc trực tuyến, được xây dựng bằng ASP.NET Core 10.0.

## Chức năng chính

- **RESTful API**: Quản lý người dùng, nghệ sĩ, bài hát và danh sách phát (playlist).
- **Chat thời gian thực**: Sử dụng SignalR để nhắn tin thời gian thực.
- **Lưu trữ file**: Tích hợp MinIO để lưu trữ file âm thanh và hình ảnh.
- **Cơ sở dữ liệu**: PostgreSQL với Entity Framework Core (EF Core).
- **Xác thực**: Hỗ trợ JWT Bearer Auth và đăng nhập bằng Google OAuth.

## Công nghệ sử dụng

- **Framework**: .NET 10.0 ASP.NET Core Web API
- **Database**: PostgreSQL
- **ORM**: Entity Framework Core
- **Object Storage**: MinIO
- **Real-time**: SignalR
- **Testing**: xUnit / custom test-runner

## Hướng dẫn cài đặt

1. Đảm bảo PostgreSQL và MinIO đang chạy.
2. Cập nhật chuỗi kết nối database và thông tin MinIO trong file `appsettings.json`.
3. Tải các gói thư viện:
   ```bash
   make restore
   ```
4. Chạy migration để cập nhật database:
   ```bash
   dotnet ef database update
   ```
5. Chạy ứng dụng:
   ```bash
   make run
   ```

## Chạy Test

Sử dụng Makefile đi kèm để chạy test:
- `make test` (Output định dạng đẹp)
- `make test-api` (Chạy Integration tests)
- `make test-unit` (Chạy Unit tests)
