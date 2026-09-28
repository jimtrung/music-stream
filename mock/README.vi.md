# Trình tạo dữ liệu giả cho Music Streaming

*Đọc bằng [Tiếng Anh](README.md)*

Đây là phiên bản nâng cấp của công cụ tạo dữ liệu giả lập (mock data) cho nền tảng Music Streaming, được thiết kế bám sát tài liệu API và các best practices.

## Tính năng nổi bật

1. **Xuất file JSON**: Tạo dữ liệu giả dưới dạng file JSON có cấu trúc.
2. **Kiểm tra (Validate) Lược đồ**: Xác thực dữ liệu mock thông qua JSON schema.
3. **Cấu trúc mã nguồn tốt hơn**: Tách biệt rõ ràng các thành phần và xử lý lỗi tốt hơn.
4. **Nhiều định dạng xuất**: Xuất ra JSON cho test API/tài liệu và SQL cho việc seed database.
5. **Các cấu hình bộ dữ liệu có sẵn**:
   - **Minimal**: 10 user, 3 artist, 10 track (để test nhanh)
   - **Standard**: 50 user, 15 artist, 100 track (dùng cho phát triển)
   - **Stress**: 500 user, 100 artist, 1000 track (test hiệu năng)
   - **E2E**: 30 user, 10 artist, 75 track (test tích hợp)

## Cài đặt

```bash
cd music-streaming/mock-data

# Tải dependencies (nếu cần)
go mod download

# Build trình tạo
go build -o mock-data-generator

# Chạy trình tạo
./mock-data-generator
```

## Sử dụng

Sau khi chạy lệnh `./mock-data-generator`, bạn sẽ thấy một Menu tương tác:

1. **Mock users**: Tạo tài khoản người dùng
2. **Mock profiles**: Tạo hồ sơ người dùng
3. **Mock artists**: Tạo hồ sơ nghệ sĩ
4. **Mock tracks**: Tạo dữ liệu các bài hát
5. **Mock playlists**: Tạo danh sách phát
6. **Export as JSON**: Xuất toàn bộ dữ liệu ra JSON
7. **Validate data**: Kiểm tra cấu trúc JSON
8. **View dataset info**: Xem thông tin về bộ dữ liệu đã tạo

## Ví dụ sử dụng

### Xuất dữ liệu ra JSON
1. Chọn "6. Export as JSON"
2. Nhập tên bộ dữ liệu: "development"
✓ Dữ liệu JSON được xuất ra tại: `output/json/mock_data_development_YYYY-MM-DD.json`
