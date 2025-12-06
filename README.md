# Hướng Dẫn Chạy Dự Án YOLOv8 Real-time Detection

Dự án này gồm 2 phần: Backend (Python FastAPI) và Frontend (React Vite).

## Yêu cầu cài đặt
- Python 3.8+
- Node.js & npm

## Bước 1: Cài đặt & Chạy Backend
Mở terminal và chạy các lệnh sau từ thư mục gốc `d:\duan-webyolov8`:

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
 Backend sẽ chạy tại: `http://localhost:8000`

## Bước 2: Cài đặt & Chạy Frontend
Mở một terminal **mới** (không tắt terminal backend) và chạy:

```bash
cd frontend
npm install
npm run dev
```
 Frontend sẽ chạy tại: `http://localhost:5173`

## Sử dụng
1. Truy cập `http://localhost:5173`.
2. Cho phép trình duyệt truy cập Camera.
3. Đưa vật thể (điện thoại, cốc, người...) ra trước camera.
4. Hệ thống sẽ nhận diện và đọc tên vật thể bằng tiếng Việt.
