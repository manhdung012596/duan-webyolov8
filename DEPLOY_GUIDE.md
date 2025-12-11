# Hướng Dẫn Triển Khai (Deployment Guide)

Dự án này bao gồm 2 phần: **Frontend** (React/Vite) và **Backend** (Python/FastAPI). Để website hoạt động online, bạn cần triển khai cả hai phần này.

Dưới đây là phương pháp đơn giản và tốt nhất sử dụng **Render** cho Backend và **Vercel** cho Frontend.

## 1. Chuẩn Bị
Đảm bảo mã nguồn của bạn đã được đẩy lên **GitHub** (Bạn đã làm việc này rồi).

Tôi đã cập nhật code frontend (`config.js`) để tự động nhận diện biến môi trường.

## 2. Triển Khai Backend (Trên Render.com)
Backend chạy xử lý AI nên cần môi trường Python mạnh mẽ. Render hỗ trợ tốt việc này.

1.  Đăng ký/Đăng nhập tại [render.com](https://render.com/).
2.  Chọn **New +** -> **Web Service**.
3.  Kết nối với tài khoản GitHub và chọn repo `duan-webyolov8` của bạn.
4.  Cấu hình như sau:
    *   **Name**: `duan-webyolov8-backend` (hoặc tên tùy ý)
    *   **Root Directory**: `backend` (Rất quan trọng, vì code python nằm trong thư mục này)
    *   **Runtime**: `Python 3`
    *   **Build Command**: `pip install -r requirements.txt` (Render sẽ tự động cài đặt `ultralytics`, `opencv`, v.v.)
    *   **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
    *   **Region**: Nên chọn `Singapore` nếu có (để giảm độ trễ về Việt Nam).
    *   **Plan**: Chọn gói **Free** (Lưu ý: gói Free sẽ "ngủ" sau 15p không hoạt động. Nếu muốn nhanh, hãy nâng cấp gói Starter).
5.  Nhấn **Create Web Service**.
6.  Đợi quá trình Build hoàn tất. Khi có dòng chữ "Live", copy địa chỉ URL của backend (ví dụ: `https://duan-webyolov8-backend.onrender.com`).

**Lưu ý:** `opencv-python-headless` trong `requirements.txt` thường hoạt động tốt trên Render mà không cần cài thêm gì.

## 3. Triển Khai Frontend (Trên Vercel)
Frontend là giao diện React, Vercel là nơi tốt nhất để host.

1.  Đăng ký/Đăng nhập tại [vercel.com](https://vercel.com/).
2.  Nhấn **Add New...** -> **Project**.
3.  Import repo `duan-webyolov8`.
4.  Cấu hình như sau:
    *   **Framework Preset**: Vite
    *   **Root Directory**: Nhấn nút `Edit` và chọn thư mục `frontend`.
    *   **Build Command**: `npm run build` (Mặc định)
    *   **Install Command**: `npm install` (Mặc định)
5.  **Environment Variables** (Quan trọng):
    Chúng ta cần chỉ cho Frontend biết Backend nằm ở đâu.
    *   Nhấn mở rộng phần **Environment Variables**.
    *   Key: `VITE_API_URL`
    *   Value: Dán link Backend bạn vừa copy ở bước 2 (ví dụ: `https://duan-webyolov8-backend.onrender.com`).
    *   **Lưu ý quan trọng**: Không có dấu `/` ở cuối link.
6.  Nhấn **Deploy**.

## 4. Kiểm Tra
Sau khi Vercel deploy xong, bạn sẽ có link website (ví dụ: `https://duan-webyolov8.vercel.app`).
1.  Truy cập link trên điện thoại hoặc máy tính.
2.  Cấp quyền Camera.
3.  Chờ khoảng 1-2 phút nếu Backend đang "ngủ" (trên gói Free).
4.  Thử đưa vật thể vào để nhận diện.

## Ghi chú về hiệu năng
Vì đây là ứng dụng nhận diện vật thể Real-time, việc chạy Backend trên server có thể gây độ trễ (latency) mạng + thời gian xử lý AI.
*   **Để tối ưu tốc độ**: Bạn nên dùng gói trả phí của Render hoặc thuê VPS (DigitalOcean/Hetzner) để server luôn hoạt động và có CPU mạnh hơn.
