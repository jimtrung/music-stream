# Frontend - Music Streaming

*Đọc bằng [Tiếng Anh](README.md)*

Đây là ứng dụng frontend cho nền tảng phát nhạc trực tuyến, được xây dựng bằng React 19 và Vite.

## Chức năng chính

- **Giao diện hiện đại**: Giao diện người dùng phản hồi nhanh, mượt mà và tương tác tốt.
- **Quản lý State**: Sử dụng Redux Toolkit để quản lý trạng thái của ứng dụng.
- **Điều hướng**: React Router DOM cho trải nghiệm chuyển trang liền mạch.
- **Đa ngôn ngữ**: Hỗ trợ i18next cho phép thay đổi ngôn ngữ.
- **Thời gian thực**: Tích hợp SignalR cho tính năng cập nhật trực tiếp và chat.

## Công nghệ sử dụng

- **Framework**: React 19
- **Build Tool**: Vite
- **Ngôn ngữ**: TypeScript
- **State**: Redux Toolkit & React-Redux
- **Kết nối API**: Axios
- **Real-time**: @microsoft/signalr
- **Testing**: Vitest, React Testing Library

## Hướng dẫn cài đặt

1. Cài đặt các thư viện:
   ```bash
   npm install
   ```
2. Khởi động server phát triển:
   ```bash
   npm run dev
   ```
3. Mở trình duyệt và truy cập vào địa chỉ hiển thị trong terminal (thường là `http://localhost:5173`).

## Các lệnh có sẵn (Scripts)

- `npm run dev`: Chạy Vite dev server.
- `npm run build`: Kiểm tra kiểu dữ liệu và build ứng dụng cho môi trường production.
- `npm run lint`: Chạy ESLint để kiểm tra code style.
- `npm run test`: Chạy bộ test với Vitest.
- `npm run type-check`: Chạy TypeScript compiler để kiểm tra lỗi type.
